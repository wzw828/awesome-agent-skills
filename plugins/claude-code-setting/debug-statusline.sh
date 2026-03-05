#!/bin/bash
# 调试脚本：捕获 Claude Code 传递给状态栏的数据

# 读取标准输入
input=$(cat)

# 保存到日志文件
echo "=== $(date) ===" >> ~/.claude/statusline-debug.log
echo "$input" >> ~/.claude/statusline-debug.log
echo "" >> ~/.claude/statusline-debug.log

# 传递给实际的状态栏工具
echo "$input" | npx claude-code-statusline-pro-aicodeditor@latest --preset MBTS --theme capsule
