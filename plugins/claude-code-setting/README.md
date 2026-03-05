# Claude Code Setting Plugin

Manage Claude Code settings and MCP (Model Context Protocol) server configurations with best practices to avoid context pollution.

## Features

- **MCP Configuration Management**: Properly configure MCP servers at user or project scope
- **Context Pollution Prevention**: Avoid loading unnecessary MCPs in all sessions
- **Best Practices Guidance**: Follow recommended patterns for MCP configuration
- **Troubleshooting Support**: Diagnose and fix common MCP configuration issues

## Installation

```bash
claude plugin install claude-code-setting
```

## Skills

### mcp-config

Configure and manage MCP servers for Claude Code projects.

**Triggers on:**
- "添加 MCP 到当前项目"
- "配置 MCP 服务器"
- "移除 MCP 配置"
- "检查 MCP 配置"
- "清理全局 MCP"

**Key Concepts:**
- Use project-level `.mcp.json` for project-specific MCPs
- Avoid global `mcpServers` in `~/.claude.json` to prevent context pollution
- Don't configure MCPs in `settings.json` - use it only for permissions if needed

**Quick Examples:**

```bash
# Add MCP to current project
"添加 pencil MCP 到当前项目"

# Remove MCP from all projects
"从所有项目中移除 shadcn-studio-mcp"

# Check current MCP configuration
"检查当前的 MCP 配置"
```

## Configuration Locations

### Valid Locations

1. **Project-level** (Recommended): `.mcp.json` in project root
2. **User-level**: `~/.claude.json` (use sparingly)

### Invalid Locations

- ❌ `~/.claude/settings.json` - Don't use for MCP configuration
- ❌ Global `mcpServers` in `~/.claude.json` - Causes context pollution

## Best Practices

1. ✅ Always use project-level `.mcp.json` for project-specific MCPs
2. ✅ Keep `~/.claude.json` global `mcpServers` empty
3. ✅ Commit `.mcp.json` to source control
4. ✅ Restart Claude Code after configuration changes
5. ❌ Never use `disabled: true` - Remove the MCP configuration entirely
6. ❌ Don't mix configuration locations

## Common MCP Servers

### Pencil (Design Tool)

```json
{
  "mcpServers": {
    "pencil": {
      "command": "/path/to/pencil/mcp-server",
      "args": ["--app", "visual_studio_code"],
      "type": "stdio"
    }
  }
}
```

### Excalidraw (Diagram Tool)

```json
{
  "mcpServers": {
    "excalidraw": {
      "type": "http",
      "url": "https://mcp.excalidraw.com/mcp"
    }
  }
}
```

## Troubleshooting

### MCP loads in all sessions

**Cause**: MCP is configured in `~/.claude.json` global `mcpServers`

**Solution**:
1. Remove from `~/.claude.json` global config
2. Add to project-level `.mcp.json` instead
3. Restart Claude Code

### MCP won't disable

**Cause**: `permissions.allow` in `settings.json` overrides disabled setting

**Solution**:
1. Remove MCP from `settings.json` permissions
2. Remove the entire `permissions` block if empty
3. Restart Claude Code

## Version History

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT
