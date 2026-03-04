# Advanced Actions Reference

This document provides detailed information about advanced positioning, layout, and transformation actions in the tldraw Structured API.

## Positioning Actions

### place - Relative Positioning

Position a shape relative to another shape. This is much easier than calculating absolute coordinates manually.

**Format:**
```json
{
  "_type": "place",
  "shapeId": "target_shape",
  "referenceShapeId": "reference_shape",
  "side": "right",
  "align": "center",
  "sideOffset": 20,
  "alignOffset": 0
}
```

**Parameters:**
- `shapeId` (required) - The shape to position
- `referenceShapeId` (required) - The shape to position relative to
- `side` (required) - Which side of the reference: `top`, `bottom`, `left`, `right`
- `align` (required) - Alignment along the perpendicular axis: `start`, `center`, `end`
- `sideOffset` (optional) - Gap from the reference shape (default: 0)
- `alignOffset` (optional) - Adjustment along the alignment axis (default: 0)

**Examples:**

Place a shape to the right of another, centered vertically:
```json
{"_type": "place", "shapeId": "box2", "referenceShapeId": "box1", "side": "right", "align": "center", "sideOffset": 50}
```

Place a shape below another, aligned to the left:
```json
{"_type": "place", "shapeId": "box3", "referenceShapeId": "box1", "side": "bottom", "align": "start", "sideOffset": 30}
```

**Use cases:**
- Flowchart steps (place each step below the previous)
- Architecture layers (place components next to each other)
- Sequential layouts (place items in a row or column)

## Layout Actions

### align - Align Shapes

Align multiple shapes along a common axis.

**Format:**
```json
{
  "_type": "align",
  "shapeIds": ["shape1", "shape2", "shape3"],
  "alignment": "center-horizontal"
}
```

**Alignment options:**
- `top` - Align top edges
- `center-vertical` - Align vertical centers
- `bottom` - Align bottom edges
- `left` - Align left edges
- `center-horizontal` - Align horizontal centers
- `right` - Align right edges

**Examples:**

Align shapes horizontally in the center:
```json
{"_type": "align", "shapeIds": ["box1", "box2", "box3"], "alignment": "center-horizontal"}
```

Align shapes to the left edge:
```json
{"_type": "align", "shapeIds": ["label1", "label2", "label3"], "alignment": "left"}
```

**Use cases:**
- Clean up manually positioned shapes
- Create organized layouts
- Align labels or annotations

### distribute - Even Spacing

Distribute shapes evenly along an axis.

**Format:**
```json
{
  "_type": "distribute",
  "shapeIds": ["shape1", "shape2", "shape3"],
  "direction": "horizontal"
}
```

**Direction options:**
- `horizontal` - Distribute along the x-axis
- `vertical` - Distribute along the y-axis

**Examples:**

Distribute shapes evenly horizontally:
```json
{"_type": "distribute", "shapeIds": ["step1", "step2", "step3"], "direction": "horizontal"}
```

Distribute shapes evenly vertically:
```json
{"_type": "distribute", "shapeIds": ["item1", "item2", "item3", "item4"], "direction": "vertical"}
```

**Use cases:**
- Timeline events
- Process steps
- Menu items or lists

### stack - Stack with Gap

Stack shapes in a sequence with a specific gap between them.

**Format:**
```json
{
  "_type": "stack",
  "shapeIds": ["shape1", "shape2", "shape3"],
  "direction": "vertical",
  "gap": 20
}
```

**Parameters:**
- `shapeIds` (required) - Shapes to stack (order matters)
- `direction` (required) - `horizontal` or `vertical`
- `gap` (required) - Spacing between shapes in pixels

**Examples:**

Stack shapes vertically with 30px gap:
```json
{"_type": "stack", "shapeIds": ["header", "content", "footer"], "direction": "vertical", "gap": 30}
```

Stack shapes horizontally with 50px gap:
```json
{"_type": "stack", "shapeIds": ["col1", "col2", "col3"], "direction": "horizontal", "gap": 50}
```

**Use cases:**
- Vertical lists
- Horizontal sequences
- Organized groups

## Transformation Actions

### resize - Scale Shapes

Scale shapes by a factor from an origin point.

**Format:**
```json
{
  "_type": "resize",
  "shapeIds": ["shape1", "shape2"],
  "scaleX": 2.0,
  "scaleY": 1.5,
  "originX": 100,
  "originY": 100
}
```

**Parameters:**
- `shapeIds` (required) - Shapes to resize
- `scaleX` (required) - Horizontal scale factor (1.0 = no change, 2.0 = double, 0.5 = half)
- `scaleY` (required) - Vertical scale factor
- `originX` (required) - X coordinate of the scaling origin
- `originY` (required) - Y coordinate of the scaling origin

**Examples:**

Double the size of a shape from its center:
```json
{"_type": "resize", "shapeIds": ["box1"], "scaleX": 2, "scaleY": 2, "originX": 200, "originY": 150}
```

Make a shape wider but not taller:
```json
{"_type": "resize", "shapeIds": ["banner"], "scaleX": 1.5, "scaleY": 1, "originX": 100, "originY": 100}
```

**Use cases:**
- Emphasize important elements
- Create size variations
- Adjust proportions

### rotate - Rotate Shapes

Rotate shapes by degrees around an origin point.

**Format:**
```json
{
  "_type": "rotate",
  "shapeIds": ["shape1", "shape2"],
  "degrees": 45,
  "originX": 200,
  "originY": 200
}
```

**Parameters:**
- `shapeIds` (required) - Shapes to rotate
- `degrees` (required) - Rotation angle (positive = clockwise, negative = counter-clockwise)
- `originX` (required) - X coordinate of the rotation center
- `originY` (required) - Y coordinate of the rotation center

**Examples:**

Rotate a shape 45 degrees clockwise:
```json
{"_type": "rotate", "shapeIds": ["arrow1"], "degrees": 45, "originX": 150, "originY": 150}
```

Rotate multiple shapes together:
```json
{"_type": "rotate", "shapeIds": ["box1", "box2", "arrow1"], "degrees": 90, "originX": 200, "originY": 200}
```

**Use cases:**
- Angled connectors
- Dynamic layouts
- Artistic arrangements

## Drawing Actions

### pen - Freehand Drawing

Create freehand paths by specifying points.

**Format:**
```json
{
  "_type": "pen",
  "shapeId": "path1",
  "points": [
    {"x": 100, "y": 100},
    {"x": 150, "y": 80},
    {"x": 200, "y": 120}
  ],
  "color": "red",
  "style": "smooth",
  "closed": false,
  "fill": "none"
}
```

**Parameters:**
- `shapeId` (required) - ID for the new path
- `points` (required) - Array of {x, y} coordinates
- `color` (required) - Line color
- `style` (required) - `smooth` (interpolates points) or `straight` (minimal interpolation)
- `closed` (required) - `true` connects last point to first
- `fill` (optional) - Fill style (only applies if closed=true): `none`, `tint`, `background`, `solid`, `pattern`

**Examples:**

Draw a smooth curve:
```json
{
  "_type": "pen",
  "shapeId": "curve1",
  "points": [{"x":100,"y":100}, {"x":150,"y":50}, {"x":200,"y":100}],
  "color": "blue",
  "style": "smooth",
  "closed": false,
  "fill": "none"
}
```

Draw a closed shape with fill:
```json
{
  "_type": "pen",
  "shapeId": "blob1",
  "points": [{"x":100,"y":100}, {"x":150,"y":80}, {"x":200,"y":120}, {"x":150,"y":140}],
  "color": "green",
  "style": "smooth",
  "closed": true,
  "fill": "solid"
}
```

**Use cases:**
- Custom shapes
- Freehand annotations
- Organic connectors
- Highlighting regions

## Viewport Actions

### setMyView - Navigate Viewport

Set the viewport to show a specific region of the canvas.

**Format:**
```json
{
  "_type": "setMyView",
  "x": 0,
  "y": 0,
  "w": 1000,
  "h": 800
}
```

**Parameters:**
- `x` (required) - Left edge of viewport in page coordinates
- `y` (required) - Top edge of viewport in page coordinates
- `w` (required) - Viewport width
- `h` (required) - Viewport height

**Examples:**

Center viewport on origin:
```json
{"_type": "setMyView", "x": -500, "y": -400, "w": 1000, "h": 800}
```

Focus on a specific region:
```json
{"_type": "setMyView", "x": 200, "y": 100, "w": 800, "h": 600}
```

**Use cases:**
- Focus on specific diagram areas
- Create "camera" movements
- Ensure important content is visible
- Guide user attention

## Z-Order Actions

### bringToFront - Bring to Front

Bring shapes to the front of the z-order.

**Format:**
```json
{"_type": "bringToFront", "shapeIds": ["shape1", "shape2"]}
```

### sendToBack - Send to Back

Send shapes to the back of the z-order.

**Format:**
```json
{"_type": "sendToBack", "shapeIds": ["shape1", "shape2"]}
```

**Use cases:**
- Control layering when shapes overlap
- Place background boxes behind text
- Organize visual hierarchy

## Best Practices

1. **Use `place` instead of manual coordinates** - It's easier and more maintainable
2. **Use `align` and `distribute` to clean up layouts** - Better than manual positioning
3. **Use `stack` for sequential layouts** - Handles spacing automatically
4. **Combine actions** - Multiple actions in one request are grouped as one undo step
5. **Take screenshots after layout actions** - Verify the results visually
6. **Use `setMyView` to guide attention** - Show users the important parts of your diagram

## Example: Complete Workflow

Create a flowchart with proper layout:

```bash
cat > /tmp/flowchart.json << 'EOF'
{
  "actions": [
    {"_type": "clear"},
    {
      "_type": "create",
      "shape": {
        "_type": "ellipse",
        "shapeId": "start",
        "x": 100,
        "y": 100,
        "w": 150,
        "h": 80,
        "color": "green",
        "fill": "solid",
        "note": "",
        "text": "Start"
      }
    },
    {
      "_type": "create",
      "shape": {
        "_type": "rectangle",
        "shapeId": "process1",
        "x": 100,
        "y": 200,
        "w": 200,
        "h": 100,
        "color": "blue",
        "fill": "solid",
        "note": "",
        "text": "Process Data"
      }
    },
    {"_type": "place", "shapeId": "process1", "referenceShapeId": "start", "side": "bottom", "align": "center", "sideOffset": 50},
    {
      "_type": "create",
      "shape": {
        "_type": "ellipse",
        "shapeId": "end",
        "x": 100,
        "y": 350,
        "w": 150,
        "h": 80,
        "color": "red",
        "fill": "solid",
        "note": "",
        "text": "End"
      }
    },
    {"_type": "place", "shapeId": "end", "referenceShapeId": "process1", "side": "bottom", "align": "center", "sideOffset": 50},
    {"_type": "align", "shapeIds": ["start", "process1", "end"], "alignment": "center-horizontal"},
    {"_type": "setMyView", "x": 0, "y": 0, "w": 400, "h": 600}
  ]
}
EOF

curl -X POST "http://localhost:7236/api/doc/$DOC_ID/actions" \
  -H 'Content-Type: application/json' \
  -d @/tmp/flowchart.json
```

This example demonstrates:
- Clearing the canvas
- Creating shapes
- Using `place` for relative positioning
- Using `align` to ensure perfect alignment
- Using `setMyView` to focus on the diagram
