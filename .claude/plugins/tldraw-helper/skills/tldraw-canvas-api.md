---
description: Use this skill when the user wants to create diagrams, flowcharts, illustrations, or any visual content using tldraw Desktop. Trigger on phrases like "draw a diagram", "create a flowchart", "visualize this process", "make an illustration", "draw using tldraw", or when the user mentions tldraw Desktop.
---

# tldraw Desktop Canvas API

You are an expert at creating visual diagrams and illustrations using the tldraw Desktop Local Canvas API.

## Overview

tldraw Desktop runs a local HTTP server (default port 7236) that provides programmatic access to open tldraw documents. You can create, read, update, and delete shapes on the canvas using simple HTTP requests.

## Quick Start Workflow

1. **Check for open documents**
   ```bash
   curl -s http://localhost:7236/api/doc | jq .
   ```

2. **If no documents exist**, ask the user to create a new document in tldraw Desktop (Cmd+N / Ctrl+N)

3. **Get the document ID** from the response (e.g., `"id": "abc123"`)

4. **Create shapes** using the Structured API

5. **Take screenshots** to verify your work

## API Endpoints

### List Documents
```bash
GET http://localhost:7236/api/doc
```

Returns all open documents with their IDs, file paths, and shape counts.

### Get Shapes
```bash
GET http://localhost:7236/api/doc/:id/shapes
```

Returns all shapes on the current page.

### Create/Update/Delete Shapes
```bash
POST http://localhost:7236/api/doc/:id/actions
Content-Type: application/json

{
  "actions": [
    {
      "_type": "create",
      "shape": {
        "_type": "rectangle",
        "shapeId": "box1",
        "x": 100,
        "y": 100,
        "w": 200,
        "h": 150,
        "color": "blue",
        "fill": "solid",
        "text": "Hello",
        "note": ""
      }
    }
  ]
}
```

### Take Screenshot
```bash
GET http://localhost:7236/api/doc/:id/screenshot?size=medium
```

Captures the canvas as a JPEG image. Size options: `small` (768px), `medium` (1536px), `large` (3072px), `full` (5000px).

## Shape Types

### Geometric Shapes
- **rectangle**, **ellipse**, **triangle**, **diamond**, **hexagon**, **pentagon**, **octagon**
- **star**, **heart**, **cloud**, **pill**, **x-box**, **check-box**
- **trapezoid**, **parallelogram-right**, **parallelogram-left**
- **fat-arrow-right**, **fat-arrow-left**, **fat-arrow-up**, **fat-arrow-down**

All geo shapes use: `{ _type, shapeId, x, y, w, h, color, fill, text?, note }`

### Text
```json
{
  "_type": "text",
  "shapeId": "label1",
  "x": 100,
  "y": 100,
  "anchor": "top-left",
  "color": "black",
  "fontSize": 16,
  "maxWidth": null,
  "note": "",
  "text": "Your text here"
}
```

**Anchor options:** top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right

### Arrow
```json
{
  "_type": "arrow",
  "shapeId": "arrow1",
  "x1": 100,
  "y1": 100,
  "x2": 300,
  "y2": 200,
  "color": "black",
  "bend": 0,
  "text": "Label",
  "note": ""
}
```

### Line
```json
{
  "_type": "line",
  "shapeId": "line1",
  "x1": 100,
  "y1": 100,
  "x2": 300,
  "y2": 100,
  "color": "black",
  "note": ""
}
```

### Sticky Note
```json
{
  "_type": "note",
  "shapeId": "note1",
  "x": 100,
  "y": 100,
  "color": "yellow",
  "text": "Sticky note content",
  "note": ""
}
```

## Colors

Available colors: **red**, **light-red**, **green**, **light-green**, **blue**, **light-blue**, **orange**, **yellow**, **black**, **violet**, **light-violet**, **grey**, **white**

## Fill Styles

- **none** - No fill
- **tint** - Light transparent fill
- **background** - Solid background color
- **solid** - Solid fill
- **pattern** - Pattern fill

## Actions

### Create
```json
{
  "_type": "create",
  "shape": { /* shape properties */ }
}
```

### Update
```json
{
  "_type": "update",
  "shape": {
    "shapeId": "box1",
    "color": "red",
    "text": "Updated text"
  }
}
```

### Delete
```json
{
  "_type": "delete",
  "shapeId": "box1"
}
```

### Move
```json
{
  "_type": "move",
  "shapeId": "box1",
  "x": 200,
  "y": 300
}
```

### Align
```json
{
  "_type": "align",
  "shapeIds": ["box1", "box2"],
  "axis": "horizontal",
  "position": "center"
}
```

## Best Practices

1. **Use JSON files for complex requests** to avoid shell escaping issues:
   ```bash
   # Create a JSON file
   cat > /tmp/shapes.json << 'EOF'
   {"actions": [...]}
   EOF

   # Use it in curl
   curl -X POST "http://localhost:7236/api/doc/DOC_ID/actions" \
     -H 'Content-Type: application/json' \
     -d @/tmp/shapes.json
   ```

2. **Make incremental changes** - Create a few shapes, take a screenshot to verify, then continue

3. **Clear old shapes** before creating new diagrams:
   ```json
   {"actions": [
     {"_type": "delete", "shapeId": "shape1"},
     {"_type": "delete", "shapeId": "shape2"}
   ]}
   ```

4. **Use meaningful shape IDs** - Makes it easier to reference and update shapes later

5. **Take screenshots frequently** to verify your work visually

## Common Diagram Patterns

### Flowchart
- Use **rectangles** for processes
- Use **diamonds** for decisions
- Use **arrows** to connect steps
- Use **ellipses** for start/end points

### Architecture Diagram
- Use **rectangles** for components
- Use **clouds** for external services
- Use **arrows** for data flow
- Use **notes** for annotations

### Mind Map
- Use **ellipses** for central ideas
- Use **rectangles** for sub-topics
- Use **arrows** or **lines** to connect
- Use different **colors** for categories

## Example: Creating a Simple Flowchart

```bash
# 1. Get document ID
DOC_ID=$(curl -s http://localhost:7236/api/doc | jq -r '.docs[0].id')

# 2. Create flowchart shapes
curl -X POST "http://localhost:7236/api/doc/$DOC_ID/actions" \
  -H 'Content-Type: application/json' \
  -d @- << 'EOF'
{
  "actions": [
    {
      "_type": "create",
      "shape": {
        "_type": "ellipse",
        "shapeId": "start",
        "x": 200,
        "y": 100,
        "w": 120,
        "h": 80,
        "color": "green",
        "fill": "solid",
        "text": "Start"
      }
    },
    {
      "_type": "create",
      "shape": {
        "_type": "rectangle",
        "shapeId": "process1",
        "x": 180,
        "y": 250,
        "w": 160,
        "h": 100,
        "color": "blue",
        "fill": "solid",
        "text": "Process Data"
      }
    },
    {
      "_type": "create",
      "shape": {
        "_type": "diamond",
        "shapeId": "decision",
        "x": 190,
        "y": 420,
        "w": 140,
        "h": 100,
        "color": "orange",
        "fill": "solid",
        "text": "Valid?"
      }
    },
    {
      "_type": "create",
      "shape": {
        "_type": "arrow",
        "shapeId": "arrow1",
        "x1": 260,
        "y1": 180,
        "x2": 260,
        "y2": 250,
        "color": "black"
      }
    },
    {
      "_type": "create",
      "shape": {
        "_type": "arrow",
        "shapeId": "arrow2",
        "x1": 260,
        "y1": 350,
        "x2": 260,
        "y2": 420,
        "color": "black"
      }
    }
  ]
}
EOF

# 3. Take screenshot
curl -s "http://localhost:7236/api/doc/$DOC_ID/screenshot?size=medium" \
  -o /tmp/flowchart.jpg
```

## Troubleshooting

### No documents found
- Ask the user to create a new document in tldraw Desktop (Cmd+N / Ctrl+N)
- Or ask them to open an existing .tldr file

### Connection refused
- Verify tldraw Desktop is running
- Check if the server is on port 7236: `cat ~/Library/Application\ Support/tldraw/server.json`

### JSON parsing errors
- Use JSON files instead of inline JSON to avoid shell escaping issues
- Validate JSON syntax before sending

### Shapes not appearing
- Check the response for error messages
- Verify shape coordinates are within reasonable bounds
- Take a screenshot to see the current canvas state

## Advanced: Exec API

For advanced operations, you can execute arbitrary JavaScript against the tldraw Editor instance:

```bash
curl -X POST "http://localhost:7236/api/doc/$DOC_ID/exec" \
  -H 'Content-Type: application/json' \
  -d '{"code": "return editor.getCurrentPageShapes().length"}'
```

This gives you full access to the tldraw SDK, but requires knowledge of the tldraw API.

---

Remember: Always start by checking for open documents, create shapes incrementally, and verify your work with screenshots!
