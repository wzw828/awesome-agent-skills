# Changelog

All notable changes to the claude-code-setting plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-04

### Added
- Initial release of claude-code-setting plugin
- `mcp-config` skill for managing MCP server configurations
- Support for project-level `.mcp.json` configuration
- Best practices guidance for avoiding context pollution
- Troubleshooting documentation for common MCP issues
- Examples for popular MCP servers (Pencil, Excalidraw, Shadcn Studio, Unsplash)
- Diagnostic commands for finding MCP configuration conflicts
- Complete cleanup and reconfiguration workflow

### Features
- Configure MCP servers at user or project scope
- Remove MCP configurations from multiple locations
- Clean up settings.json permissions
- Check current MCP status across all configuration files
- Prevent context pollution by avoiding global MCP configurations

### Documentation
- Comprehensive README with usage examples
- Detailed skill documentation with workflow steps
- Common MCP server configuration templates
- Troubleshooting guide for typical issues
