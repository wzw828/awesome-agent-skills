import type { CdpConnection } from './x-utils.js';

interface CodeBlockInfo {
  placeholder: string;
  language: string;
  code: string;
  blockIndex: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 在 X Articles 编辑器中插入单个代码块
 */
async function insertSingleCodeBlock(
  cdp: CdpConnection,
  sessionId: string,
  language: string,
  code: string,
): Promise<void> {
  // 1. 点击 Add Media 按钮
  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('button[aria-label="Add Media"]')?.click()`,
  }, { sessionId });
  await sleep(300);

  // 2. 点击 Code 菜单项
  await cdp.send('Runtime.evaluate', {
    expression: `Array.from(document.querySelectorAll('[role="menuitem"]')).find(el => el.textContent.trim() === 'Code')?.click()`,
  }, { sessionId });
  await sleep(300);

  // 3. 聚焦语言输入框
  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('input')?.focus()`,
  }, { sessionId });
  await sleep(100);

  // 4. 输入语言名称（首字母大写）
  const capitalizedLanguage = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
  await cdp.send('Input.insertText', {
    text: capitalizedLanguage,
  }, { sessionId });
  await sleep(300);

  // 5. 按 ArrowDown 选中第一个选项
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'ArrowDown',
    code: 'ArrowDown',
    windowsVirtualKeyCode: 40,
  }, { sessionId });
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'ArrowDown',
    code: 'ArrowDown',
    windowsVirtualKeyCode: 40,
  }, { sessionId });

  // 6. 按 Enter 确认选择
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Enter',
    code: 'Enter',
    windowsVirtualKeyCode: 13,
  }, { sessionId });
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Enter',
    code: 'Enter',
    windowsVirtualKeyCode: 13,
  }, { sessionId });
  await sleep(200);

  // 7. 聚焦代码输入框
  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('textarea')?.focus()`,
  }, { sessionId });
  await sleep(100);

  // 8. 输入代码内容
  await cdp.send('Input.insertText', {
    text: code,
  }, { sessionId });
  await sleep(200);

  // 9. 点击 Insert 按钮
  await cdp.send('Runtime.evaluate', {
    expression: `Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.trim() === 'Insert')?.click()`,
  }, { sessionId });
  await sleep(500);
}

/**
 * 插入所有代码块（替换占位符）
 */
export async function insertCodeBlocks(
  cdp: CdpConnection,
  sessionId: string,
  codeBlocks: CodeBlockInfo[],
): Promise<void> {
  if (codeBlocks.length === 0) {
    return;
  }

  console.log(`[insert-code] Inserting ${codeBlocks.length} code blocks...`);

  // 检查编辑器中的占位符
  const editorContent = await cdp.send<{ result: { value: string } }>('Runtime.evaluate', {
    expression: `document.querySelector('.DraftEditor-editorContainer [data-contents="true"]')?.innerText || ''`,
    returnByValue: true,
  }, { sessionId });

  console.log('[insert-code] Checking for code placeholders in content...');
  for (const block of codeBlocks) {
    const regex = new RegExp(block.placeholder + '(?!\\d)');
    if (regex.test(editorContent.result.value)) {
      console.log(`[insert-code] Found: ${block.placeholder}`);
    } else {
      console.log(`[insert-code] NOT found: ${block.placeholder}`);
    }
  }

  // 按占位符顺序处理代码块
  const getPlaceholderIndex = (placeholder: string): number => {
    const match = placeholder.match(/XCODEPH_(\d+)/);
    return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
  };
  const sortedCodeBlocks = [...codeBlocks].sort(
    (a, b) => getPlaceholderIndex(a.placeholder) - getPlaceholderIndex(b.placeholder),
  );

  for (let i = 0; i < sortedCodeBlocks.length; i++) {
    const block = sortedCodeBlocks[i]!;
    console.log(`[insert-code] [${i + 1}/${sortedCodeBlocks.length}] Inserting code at placeholder: ${block.placeholder}`);

    // 选择占位符
    const selectPlaceholder = async (maxRetries = 3): Promise<boolean> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const editor = document.querySelector('.DraftEditor-editorContainer [data-contents="true"]');
            if (!editor) return false;

            const placeholder = ${JSON.stringify(block.placeholder)};
            const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
            let node;

            while ((node = walker.nextNode())) {
              const text = node.textContent || '';
              let searchStart = 0;
              let idx;

              while ((idx = text.indexOf(placeholder, searchStart)) !== -1) {
                const afterIdx = idx + placeholder.length;
                const charAfter = text[afterIdx];

                if (charAfter === undefined || !/\\d/.test(charAfter)) {
                  const parentElement = node.parentElement;
                  if (parentElement) {
                    parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }

                  const range = document.createRange();
                  range.setStart(node, idx);
                  range.setEnd(node, idx + placeholder.length);
                  const sel = window.getSelection();
                  sel.removeAllRanges();
                  sel.addRange(range);
                  return true;
                }
                searchStart = afterIdx;
              }
            }
            return false;
          })()`,
        }, { sessionId });

        await sleep(800);

        // 验证选择
        const selectionCheck = await cdp.send<{ result: { value: string } }>('Runtime.evaluate', {
          expression: `window.getSelection()?.toString() || ''`,
          returnByValue: true,
        }, { sessionId });

        const selectedText = selectionCheck.result.value.trim();
        if (selectedText === block.placeholder) {
          console.log(`[insert-code] Selection verified: "${selectedText}"`);
          return true;
        }

        if (attempt < maxRetries) {
          console.log(`[insert-code] Selection attempt ${attempt} got "${selectedText}", retrying...`);
          await sleep(500);
        } else {
          console.warn(`[insert-code] Selection failed after ${maxRetries} attempts, got: "${selectedText}"`);
        }
      }
      return false;
    };

    const selected = await selectPlaceholder(3);
    if (!selected) {
      console.warn(`[insert-code] Skipping code block - could not select placeholder: ${block.placeholder}`);
      continue;
    }

    console.log(`[insert-code] Inserting ${block.language} code (${block.code.length} chars)`);

    // 删除占位符（使用 execCommand，比键盘事件更可靠）
    console.log(`[insert-code] Deleting placeholder...`);
    const deleteResult = await cdp.send<{ result: { value: boolean } }>('Runtime.evaluate', {
      expression: `(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return false;
        // Try execCommand delete first
        if (document.execCommand('delete', false)) return true;
        // Fallback: replace selection with empty using insertText
        document.execCommand('insertText', false, '');
        return true;
      })()`,
      returnByValue: true,
    }, { sessionId });

    await sleep(500);

    // 验证占位符已删除
    const afterDelete = await cdp.send<{ result: { value: boolean } }>('Runtime.evaluate', {
      expression: `(() => {
        const editor = document.querySelector('.DraftEditor-editorContainer [data-contents="true"]');
        if (!editor) return true;
        const text = editor.innerText;
        const placeholder = ${JSON.stringify(block.placeholder)};
        const regex = new RegExp(placeholder + '(?!\\\\d)');
        return !regex.test(text);
      })()`,
      returnByValue: true,
    }, { sessionId });

    if (!afterDelete.result.value) {
      console.warn(`[insert-code] Placeholder still exists, retrying deletion...`);
      // 重试：重新选择并使用多种方法删除
      const reselected = await selectPlaceholder(2);
      if (reselected) {
        await sleep(300);
        // 尝试多种删除方法
        await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed) return false;

            // 方法1: execCommand delete
            if (document.execCommand('delete', false)) {
              return true;
            }

            // 方法2: insertText 空字符串
            if (document.execCommand('insertText', false, '')) {
              return true;
            }

            // 方法3: 直接操作 DOM (最后手段)
            try {
              const range = sel.getRangeAt(0);
              range.deleteContents();
              return true;
            } catch (e) {
              return false;
            }
          })()`,
        }, { sessionId });
        await sleep(800);

        // 再次验证
        const finalCheck = await cdp.send<{ result: { value: boolean } }>('Runtime.evaluate', {
          expression: `(() => {
            const editor = document.querySelector('.DraftEditor-editorContainer [data-contents="true"]');
            if (!editor) return true;
            const text = editor.innerText;
            const placeholder = ${JSON.stringify(block.placeholder)};
            const regex = new RegExp(placeholder + '(?!\\\\\\\\d)');
            return !regex.test(text);
          })()`,
          returnByValue: true,
        }, { sessionId });

        if (!finalCheck.result.value) {
          console.error(`[insert-code] ❌ Failed to delete placeholder after retry: ${block.placeholder}`);
          console.error(`[insert-code] Skipping this code block to avoid duplication`);
          continue;
        } else {
          console.log(`[insert-code] ✓ Placeholder deleted successfully on retry`);
        }
      } else {
        console.error(`[insert-code] ❌ Could not reselect placeholder, skipping: ${block.placeholder}`);
        continue;
      }
    }

    // 插入代码块
    await insertSingleCodeBlock(cdp, sessionId, block.language, block.code);

    console.log(`[insert-code] Code block ${i + 1}/${sortedCodeBlocks.length} inserted`);
  }

  console.log('[insert-code] All code blocks inserted successfully');
}
