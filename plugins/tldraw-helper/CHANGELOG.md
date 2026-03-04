# Changelog - tldraw-helper Plugin

## Version 1.1.0 (2026-03-03)

### Major Enhancements

#### Structured API Improvements
- Updated to use the official Structured API terminology and patterns
- Added comprehensive documentation for all action types
- Simplified canvas clearing with the `clear` action (replaces complex delete operations)

#### New Action Types

**Positioning Actions:**
- `place` - Position shapes relative to other shapes (easier than manual coordinates)
  - Supports side positioning (top, bottom, left, right)
  - Alignment options (start, center, end)
  - Configurable offsets

**Layout Actions:**
- `align` - Align multiple shapes along common axis
  - Options: top, center-vertical, bottom, left, center-horizontal, right
- `distribute` - Distribute shapes evenly along an axis
  - Horizontal and vertical distribution
- `stack` - Stack shapes with specific gap
  - Configurable direction and spacing

**Transformation Actions:**
- `resize` - Scale shapes by factor from origin point
  - Independent X/Y scaling
  - Configurable origin point
- `rotate` - Rotate shapes by degrees around origin
  - Positive/negative rotation
  - Multi-shape rotation support

**Drawing Actions:**
- `pen` - Create freehand paths and custom shapes
  - Smooth or straight interpolation
  - Closed shapes with fill support
  - Custom point arrays

**Viewport Actions:**
- `setMyView` - Navigate viewport to specific region
  - Focus on diagram areas
  - Camera control
  - Attention guidance

### Documentation Improvements

#### New Reference Documents
- `references/advanced-actions.md` - Comprehensive guide to all advanced actions
  - Detailed parameter documentation
  - Use case examples
  - Best practices
  - Complete workflow examples

#### Updated Core Documentation
- `SKILL.md` - Enhanced with Structured API focus
  - Clearer API usage rules
  - Better error handling guidance
  - Incremental development emphasis
  - Updated troubleshooting section

- `README.md` - Added version history and new features
  - What's new section
  - API reference with all action types
  - Better organization

- `commands/draw.md` - Simplified canvas clearing
  - Uses `clear` action instead of complex delete operations
  - Better workflow documentation

### API Usage Improvements

#### Simplified Patterns
- Canvas clearing now uses single `clear` action
- Better JSON file usage examples with heredoc syntax
- Emphasis on incremental development with screenshots

#### Better Error Prevention
- Added 9th common mistake: "Not using the right action for the job"
- Enhanced troubleshooting with action-specific solutions
- Clearer required field documentation

#### Enhanced Best Practices
- Use `place` instead of manual coordinate calculation
- Use `align` and `distribute` for layout organization
- Use `stack` for sequential layouts
- Combine actions for atomic operations
- Take screenshots after layout actions

### Breaking Changes
None - all changes are backward compatible. Existing code continues to work.

### Migration Guide

#### Old Pattern (Still Works)
```bash
# Delete shapes individually
curl -s "http://localhost:7236/api/doc/$DOC_ID/shapes" | \
  jq -r '{"actions": [.shapes[].id | {"_type": "delete", "shapeId": .}]}' > /tmp/clear.json
```

#### New Pattern (Recommended)
```bash
# Use clear action
cat > /tmp/clear.json << 'EOF'
{"actions": [{"_type": "clear"}]}
EOF
```

#### Old Pattern (Manual Positioning)
```json
{
  "actions": [
    {"_type": "create", "shape": {"_type": "rectangle", "shapeId": "box1", "x": 100, "y": 100, "w": 200, "h": 100, "color": "blue", "fill": "solid", "note": "", "text": "First"}},
    {"_type": "create", "shape": {"_type": "rectangle", "shapeId": "box2", "x": 350, "y": 100, "w": 200, "h": 100, "color": "blue", "fill": "solid", "note": "", "text": "Second"}}
  ]
}
```

#### New Pattern (Relative Positioning)
```json
{
  "actions": [
    {"_type": "create", "shape": {"_type": "rectangle", "shapeId": "box1", "x": 100, "y": 100, "w": 200, "h": 100, "color": "blue", "fill": "solid", "note": "", "text": "First"}},
    {"_type": "create", "shape": {"_type": "rectangle", "shapeId": "box2", "x": 100, "y": 100, "w": 200, "h": 100, "color": "blue", "fill": "solid", "note": "", "text": "Second"}},
    {"_type": "place", "shapeId": "box2", "referenceShapeId": "box1", "side": "right", "align": "center", "sideOffset": 50}
  ]
}
```

### Performance Improvements
- Single `clear` action is faster than deleting shapes individually
- Layout actions handle positioning calculations more efficiently
- Reduced API calls through action batching

### Developer Experience
- Better error messages in troubleshooting section
- More comprehensive examples
- Clearer documentation structure
- Reference documents for deep dives

### Files Changed
- `plugin.json` - Version bump to 1.1.0
- `SKILL.md` - Major documentation update with new actions
- `README.md` - Added what's new section and API reference
- `commands/draw.md` - Simplified canvas clearing
- `references/advanced-actions.md` - New comprehensive reference (NEW FILE)

### Acknowledgments
This update is based on the official tldraw Desktop Canvas API documentation, ensuring compatibility and best practices alignment.

---

## Version 1.0.3 (Previous)
- Initial stable release
- Basic shape creation and manipulation
- Flowchart, architecture, and mind map support
- Screenshot and list commands
- Autonomous diagram-creator agent
