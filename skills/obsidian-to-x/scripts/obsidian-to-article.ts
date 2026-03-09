#!/usr/bin/env bun
/**
 * Convert Obsidian Markdown to X Article format
 *
 * Usage:
 *   bun obsidian-to-x.ts <input.md> [output.md]
 *   bun obsidian-to-x.ts Articles/my-article.md
 *   bun obsidian-to-x.ts Articles/my-article.md Temp/converted.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, basename, join } from 'node:path';
import process from 'node:process';

interface ConversionOptions {
  inputFile: string;
  outputFile?: string;
  projectRoot?: string;
}

/**
 * Read Obsidian app.json configuration
 */
function readObsidianConfig(projectRoot: string): { attachmentFolderPath?: string } {
  const configPath = join(projectRoot, '.obsidian', 'app.json');
  try {
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      return config;
    }
  } catch (error) {
    console.error('[config] Failed to read .obsidian/app.json:', error);
  }
  return {};
}

/**
 * Resolve image path with Obsidian attachment folder configuration
 */
function resolveImagePath(imagePath: string, projectRoot: string, attachmentFolder?: string): string {
  // Extract filename from path
  const filename = basename(imagePath);

  // If already absolute path, check if it exists
  if (imagePath.startsWith('/')) {
    if (existsSync(imagePath)) {
      return imagePath;
    }
    // If absolute path doesn't exist, try to find the file by filename
  }

  // Try configured attachment folder first
  if (attachmentFolder) {
    const pathInAttachmentFolder = join(projectRoot, attachmentFolder, filename);
    if (existsSync(pathInAttachmentFolder)) {
      return pathInAttachmentFolder;
    }
  }

  // Try Attachments/ directory
  const pathInAttachments = join(projectRoot, 'Attachments', filename);
  if (existsSync(pathInAttachments)) {
    return pathInAttachments;
  }

  // Try with Attachments/ prefix if path already contains it
  if (imagePath.startsWith('Attachments/')) {
    const fullPath = join(projectRoot, imagePath);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Fallback: return original path or path in Attachments/
  return imagePath.startsWith('/') ? imagePath : join(projectRoot, 'Attachments', filename);
}

function convertObsidianToX(options: ConversionOptions): string {
  const { inputFile, projectRoot = process.cwd() } = options;

  // Read Obsidian configuration
  const config = readObsidianConfig(projectRoot);
  const attachmentFolder = config.attachmentFolderPath;

  if (attachmentFolder) {
    console.log(`[config] Using attachment folder: ${attachmentFolder}`);
  }

  // Read input file
  let content = readFileSync(inputFile, 'utf-8');

  // Step 1: Convert title field (标题: → title:)
  content = content.replace(/^标题:/gm, 'title:');

  // Step 1.5: Convert cover image field (封面: → cover_image:) BEFORE image syntax conversion
  // Support both formats: "![[path]]" and "[#123] ![[path]]"
  const coverMatch = content.match(/^封面:\s*"?(?:\[#\d+\]\s*)?!\[\[([^\]]+)\]\]"?/m);
  if (coverMatch) {
    const coverPath = coverMatch[1];
    const absoluteCoverPath = resolveImagePath(coverPath, projectRoot, attachmentFolder);
    content = content.replace(
      /^封面:.*$/m,
      `cover_image: ${absoluteCoverPath}`
    );
  }

  // Step 2: Convert Obsidian image syntax to standard Markdown
  // ![[Attachments/image.png]] → ![](absolute/path/image.png)
  // ![[image.png]] → ![](absolute/path/image.png)
  // ![[Attachments/image.png|alt text]] → ![](absolute/path/image.png)

  // First, handle images WITH Attachments/ prefix
  content = content.replace(
    /!\[\[Attachments\/([^\]|]+)(?:\|[^\]]*)?\]\]/g,
    (match, imageName) => {
      const resolvedPath = resolveImagePath(imageName, projectRoot, attachmentFolder);
      return `![](${resolvedPath})`;
    }
  );

  // Then, handle images WITHOUT Attachments/ prefix (assume they're in attachment folder)
  content = content.replace(
    /!\[\[([^\]|\/]+\.(?:png|jpg|jpeg|gif|webp|svg))(?:\|[^\]]*)?\]\]/gi,
    (match, imageName) => {
      const resolvedPath = resolveImagePath(imageName, projectRoot, attachmentFolder);
      return `![](${resolvedPath})`;
    }
  );

  // Step 2.5: Fix existing standard Markdown image paths
  // ![](path) → ![](resolved/path) if the path doesn't exist
  content = content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, imagePath) => {
      // Skip URLs
      if (/^https?:\/\//i.test(imagePath)) {
        return match;
      }
      // Resolve the path
      const resolvedPath = resolveImagePath(imagePath, projectRoot, attachmentFolder);
      return `![${alt}](${resolvedPath})`;
    }
  );

  // Step 3: Remove Obsidian-specific placeholders
  content = content.replace(/^!\[\[wechatAccountCard\]\]\s*$/gm, '');

  // Step 4: Remove [#number] prefix lines from blockquotes
  // Simply delete the entire line with [#number] prefix, keep the rest of the blockquote
  // Pattern: > [#6178] Title\n
  content = content.replace(/^> \[#\d+\] .+\n/gm, '');

  // Step 4.5: Remove Obsidian callout syntax lines from blockquotes
  // Pattern: > [!type] Title\n (e.g., [!question], [!note], [!tip], [!warning])
  // Simply delete the entire line with callout syntax, keep the rest of the blockquote
  content = content.replace(/^> \[![a-z]+\] .+\n/gm, '');

  // Step 5: Extract and add English title if not present
  const titleMatch = content.match(/^标题:\s*(.+)$/m);
  const hasTitleField = /^title:/m.test(content);
  if (titleMatch && !hasTitleField) {
    const title = titleMatch[1].trim();
    // Insert title field after the first line (after opening ---)
    content = content.replace(/^(---\s*\n)/, `$1title: ${title}\n`);
  }

  return content;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: bun obsidian-to-x.ts <input.md> [output.md]

Convert Obsidian Markdown to X Article format.

Arguments:
  input.md   Input Obsidian Markdown file
  output.md  Output file (default: Temp/converted.md)

Examples:
  bun obsidian-to-x.ts Articles/my-article.md
  bun obsidian-to-x.ts Articles/my-article.md Temp/output.md

Conversions:
  - 标题: → title:
  - ![[Attachments/img.png]] → ![](absolute/path/img.png)
  - ![[wechatAccountCard]] → (removed)
  - > [#6178] Title → (removed)
  - > [!question] Title → (removed, Obsidian callout syntax)
  - 封面: → cover_image: (with absolute path)
`);
    process.exit(0);
  }

  const inputFile = args[0];
  const projectRoot = process.cwd();

  // Generate output filename based on input filename
  // Output to skill's temp directory: .claude/skills/obsidian-to-x/temp/
  // Articles/my-article.md → .claude/skills/obsidian-to-x/temp/my-article-x.md
  const inputBasename = basename(inputFile, '.md');
  const skillTempDir = resolve(__dirname, '..', 'temp');
  const defaultOutput = resolve(skillTempDir, `${inputBasename}-x.md`);
  const outputFile = args[1] ? resolve(projectRoot, args[1]) : defaultOutput;

  try {
    // Ensure output directory exists
    mkdirSync(dirname(outputFile), { recursive: true });

    // Convert
    console.log(`Converting: ${inputFile}`);
    console.log(`Project root: ${projectRoot}`);

    const converted = convertObsidianToX({
      inputFile: resolve(projectRoot, inputFile),
      projectRoot,
    });

    // Write output
    writeFileSync(outputFile, converted, 'utf-8');
    console.log(`✅ Converted file saved to: ${outputFile}`);
    console.log(`\nNext step: Publish to X Article`);
    console.log(`  bun ${__dirname}/x-article.ts "${outputFile}"`);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
