---
description: Use this skill whenever users need visual diagrams, flowcharts, architecture diagrams, mind maps, or any kind of illustration - even if they don't explicitly mention "tldraw" or "diagram". This skill enables programmatic creation of professional visualizations using tldraw Desktop's Structured API. Trigger on: "draw", "visualize", "create a diagram", "show me", "illustrate", "flowchart", "architecture", "mind map", "sketch", "design a layout", or any request that would benefit from a visual representation. Also trigger when users describe a process, system, or concept that would be clearer with a diagram, even if they don't ask for one directly.
---

# tldraw Desktop Canvas API - Structured API

**⚠️ CRITICAL: READ THIS ENTIRE SKILL DOCUMENT BEFORE USING THE API**

This skill uses the **Structured API** - a self-contained interface for reading and modifying the canvas using simple JSON objects. Shapes use plain string IDs (e.g. `"box1"`) - no `shape:` prefix needed. You can assign your own IDs when creating shapes.

When users need to understand complex information, visualize processes, or communicate ideas, diagrams are often more effective than text alone. This skill enables you to create professional diagrams programmatically using tldraw Desktop's Local Canvas API.

## Why Use This Skill

Visual diagrams help users:
- **Understand complex systems** - Architecture diagrams make system relationships clear
- **Follow processes** - Flowcharts show decision points and workflows
- **Organize ideas** - Mind maps structure brainstorming and planning
- **Communicate effectively** - Visuals convey information faster than text

Use this skill proactively when you notice the user describing something that would benefit from visualization, even if they haven't explicitly asked for a diagram.

## Core Workflow

The key to success with tldraw is following this workflow:

1. **Verify tldraw is running** - Check for open documents first
2. **Clear the canvas** - Always start with a fresh workspace
3. **Plan before creating** - Think about layout, colors, and structure
4. **Build incrementally** - Create shapes in logical groups
5. **🚨 VERIFY VISUALLY (MANDATORY)** - Take screenshots and ANALYZE them carefully for overlaps, crowding, readability issues
6. **Iterate if needed** - Fix any visual problems found in the screenshot

**🚨 CRITICAL:** Step 5 (visual verification) is MANDATORY and NOT optional. The API will return success even if your diagram is completely unusable (text overlapping, arrows crossing through labels, elements off-screen). You MUST take a screenshot and carefully analyze it to verify the diagram actually looks good. If you skip this step or don't carefully analyze the screenshot, you will create broken diagrams.

This workflow matters because tldraw is a visual tool - you need to see the results to know if they're correct. Don't create all shapes at once and hope for the best; build incrementally and verify.

## Quick Start

### Step 1: Check for Open Documents

```bash
curl -s http://localhost:7236/api/doc | jq .
```

**Why this matters:** The API only works with open documents. If no documents exist, you must ask the user to create one (Cmd+N / Ctrl+N) before proceeding. Don't try to create shapes without a document - it will fail.

**What to look for:**
- `"docs": []` means no documents - ask user to create one
- `"docs": [{"id": "abc123", ...}]` means you're ready - extract the ID

### Step 2: Get the Document ID and Clear Canvas

```bash
# Get document ID
DOC_ID=$(curl -s http://localhost:7236/api/doc | jq -r '.docs[0].id')

# Clear canvas using the clear action (simpler than deleting individual shapes)
cat > /tmp/clear.json << 'EOF'
{
  "actions": [
    {"_type": "clear"}
  ]
}
EOF

curl -X POST "http://localhost:7236/api/doc/$DOC_ID/actions" \
  -H 'Content-Type: application/json' \
  -d @/tmp/clear.json
```

Save this ID - you'll use it in every API call. If you lose it, just run the command again.

**Why clear first:** Existing shapes can interfere with new diagrams. Always start with a clean canvas. The `clear` action is simpler and more efficient than deleting shapes individually.

### Step 3: Plan Your Diagram

Before creating shapes, think about:
- **Layout strategy** - Top-to-bottom flow? Left-to-right? Radial?
- **Spacing** - Use multiples of 50 for clean alignment (100, 150, 200, etc.)
- **Color coding** - Consistent colors convey meaning (blue=process, red=error, green=success)
- **Shape selection** - Rectangles for components, diamonds for decisions, ellipses for start/end

**Why planning matters:** Random placement creates messy diagrams. A 30-second mental plan saves minutes of repositioning.

### Step 4: Create Shapes Incrementally

**⚠️ IMPORTANT API USAGE RULES:**
1. **Always use JSON files** - Never use inline JSON in curl commands due to escaping issues
2. **Use the correct endpoint** - `POST /api/doc/:id/actions` for all shape operations
3. **Include all required fields** - Every shape needs `_type`, `shapeId`, position, size, `color`, `fill`, and `note: ""`
4. **Use heredoc syntax** - `cat > /tmp/file.json << 'EOF'` to avoid variable expansion
5. **Reference with @filename** - `curl -d @/tmp/file.json` to send the file content
6. **Prefer small, incremental changes** - Make a few changes, take a screenshot to check, then continue

Use JSON files to avoid shell escaping issues:

```bash
cat > /tmp/shapes.json << 'EOF'
{
  "actions": [
    {
      "_type": "create",
      "shape": {
        "_type": "rectangle",
        "shapeId": "process1",
        "x": 100,
        "y": 100,
        "w": 200,
        "h": 100,
        "color": "blue",
        "fill": "solid",
        "note": "",
        "text": "Process Data"
      }
    }
  ]
}
EOF

curl -X POST "http://localhost:7236/api/doc/$DOC_ID/actions" \
  -H 'Content-Type: application/json' \
  -d @/tmp/shapes.json
```

**Why JSON files:** Inline JSON in bash requires complex escaping. Files are cleaner and easier to debug.

**Why incremental:** Making small changes and verifying catches mistakes early and avoids compounding errors.

### Step 5: Take Screenshots to Verify (MANDATORY)

```bash
curl -s "http://localhost:7236/api/doc/$DOC_ID/screenshot?size=medium" \
  -o /tmp/diagram.jpg
```

**🚨 CRITICAL - THIS IS A MANDATORY STEP:**
- **ALWAYS take screenshots after creating shapes** - This is NOT optional
- **ALWAYS analyze the screenshot carefully** - Look for overlapping text, crowded areas, misaligned elements, arrows crossing through important content
- **The API returns success even if the diagram is unusable** - Success response does NOT mean the diagram looks good
- **Visual verification is the ONLY way to know if your diagram is correct**

**What to check in the screenshot:**
- ✅ All text is readable and not overlapping
- ✅ Arrows don't cross through important labels or shapes
- ✅ Layout is clean and organized
- ✅ No elements are off-screen or cut off
- ✅ Colors and spacing look professional
- ❌ If ANY of these fail, you MUST fix the issues before considering the task complete

**If you see problems in the screenshot:**
1. Identify the specific issues (overlapping text, crowded center, etc.)
2. Plan how to fix them (move elements, reduce arrows, adjust bend, etc.)
3. Make the fixes incrementally
4. Take another screenshot to verify
5. Repeat until the diagram is clean and professional

## API Endpoints

### List Documents
```bash
GET http://localhost:7236/api/doc
```
Returns all open documents with IDs, file paths, and shape counts.

### Get Shapes
```bash
GET http://localhost:7236/api/doc/:id/shapes
```
Returns all shapes on the current page. Use this to see what's already on the canvas before adding more.

### Create/Update/Delete Shapes
```bash
POST http://localhost:7236/api/doc/:id/actions
Content-Type: application/json

{"actions": [...]}
```
Execute multiple actions in one request. All actions succeed or fail together.

### Take Screenshot
```bash
GET http://localhost:7236/api/doc/:id/screenshot?size=medium
```
Captures the canvas as JPEG. Sizes: `small` (768px), `medium` (1536px), `large` (3072px), `full` (5000px).

## Shape Types

For complete shape specifications, see [references/shape-types.md](references/shape-types.md).

### Shape Categories

**Geo shapes** (geometric primitives with optional text):
- `rectangle`, `ellipse`, `triangle`, `diamond`, `hexagon`, `pentagon`, `octagon`
- `pill`, `cloud`, `star`, `heart`
- `x-box`, `check-box`
- `trapezoid`, `parallelogram-right`, `parallelogram-left`
- `fat-arrow-right`, `fat-arrow-left`, `fat-arrow-up`, `fat-arrow-down`

**Connectors:**
- `arrow` - Directional connector with optional text and bindings
- `line` - Simple line connector

**Content:**
- `text` - Standalone text with anchor positioning
- `note` - Sticky note with colored background

**Read-only** (can read but not create via Structured API):
- `pen` - Freehand drawing (use `pen` action to create)
- `image` - Embedded images
- `unknown` - Unsupported shape types

### Common Shape Formats

**Geo shapes:** `{ _type, shapeId, x, y, w, h, color, fill, note, text?, textAlign? }`

**Text:** `{ _type: "text", shapeId, x, y, anchor, color, fontSize?, maxWidth, note, text }`

**Arrow:** `{ _type: "arrow", shapeId, x1, y1, x2, y2, color, fromId?, toId?, bend?, text?, note }`

**Line:** `{ _type: "line", shapeId, x1, y1, x2, y2, color, note }`

**Note:** `{ _type: "note", shapeId, x, y, color, text?, note }` – sticky note

### Quick Reference

**Rectangle:**
```json
{"_type": "rectangle", "shapeId": "box1", "x": 100, "y": 100, "w": 200, "h": 150, "color": "blue", "fill": "solid", "note": "", "text": "Hello"}
```

**Text:**
```json
{"_type": "text", "shapeId": "label1", "x": 100, "y": 100, "anchor": "top-center", "color": "black", "maxWidth": null, "note": "", "text": "Label"}
```
**Anchor options:** top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right

**Arrow:**
```json
{"_type": "arrow", "shapeId": "arrow1", "x1": 100, "y1": 100, "x2": 300, "y2": 200, "color": "black", "note": ""}
```
**Optional:** `fromId`, `toId` (bind to shapes), `bend` (curve amount), `text` (label on arrow)

**Sticky Note:**
```json
{"_type": "note", "shapeId": "note1", "x": 100, "y": 100, "color": "yellow", "note": "", "text": "Note content"}
```

## Colors and Fills

For complete reference, see [references/colors-and-fills.md](references/colors-and-fills.md).

**Colors:** red, green, blue, orange, yellow, violet, grey, black, white (and light- variants)
**Fills:** none, tint, background, solid, pattern

**Color coding best practices:**
- Blue - Primary processes/components
- Green - Success states, databases
- Red - Errors, critical items
- Orange - Warnings, decisions
- Yellow - Notes, highlights
- Violet - Special components, APIs

## Actions

All actions are sent to `POST /api/doc/:id/actions` with a JSON body containing an `actions` array. Multiple actions in a single request are grouped as one undo step.

**For detailed documentation of all actions, see [references/advanced-actions.md](references/advanced-actions.md).**

### Basic Actions

#### create – Create a new shape
```json
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
    "note": "",
    "text": "Label"
  }
}
```

#### update – Update an existing shape
```json
{"_type": "update", "shape": {"shapeId": "box1", "_type": "rectangle", "color": "red", "text": "Updated"}}
```
Provide `shapeId` and `_type` to identify the shape. Only changed properties are required.

#### delete – Delete a shape
```json
{"_type": "delete", "shapeId": "box1"}
```

#### clear – Delete all shapes on the current page
```json
{"_type": "clear"}
```
**Use this instead of deleting shapes individually** - it's simpler and more efficient.

#### label – Change a shape's text
```json
{"_type": "label", "shapeId": "box1", "text": "New label"}
```

### Positioning Actions

#### move – Move a shape to an absolute position
```json
{"_type": "move", "shapeId": "box1", "x": 300, "y": 200, "anchor": "center"}
```
**Anchor options:** top-left (default), top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right

**Use case:** Reposition shapes after creation or adjust layout.

#### place – Position a shape relative to another
```json
{"_type": "place", "shapeId": "box2", "referenceShapeId": "box1", "side": "right", "align": "center", "sideOffset": 20}
```
**Side:** top, bottom, left, right
**Align:** start, center, end
**Optional:** sideOffset (gap from reference), alignOffset (adjustment along alignment axis)

**Use case:** Create layouts where shapes are positioned relative to each other (e.g., flowchart steps, architecture layers).

### Alignment and Distribution Actions

#### align – Align shapes
```json
{"_type": "align", "shapeIds": ["box1", "box2", "box3"], "alignment": "center-horizontal"}
```
**Alignment options:** top, center-vertical, bottom, left, center-horizontal, right

**Use case:** Clean up manually positioned shapes or create organized layouts.

#### distribute – Distribute shapes evenly
```json
{"_type": "distribute", "shapeIds": ["a", "b", "c"], "direction": "horizontal"}
```
**Direction:** horizontal, vertical

**Use case:** Space shapes evenly (e.g., timeline events, process steps).

#### stack – Stack shapes with a gap
```json
{"_type": "stack", "shapeIds": ["a", "b", "c"], "direction": "vertical", "gap": 20}
```
**Direction:** horizontal, vertical
**Gap:** spacing between shapes in pixels

**Use case:** Create vertical lists, horizontal sequences, or organized groups.

### Z-Order Actions

#### bringToFront – Bring shapes to front
```json
{"_type": "bringToFront", "shapeIds": ["box1"]}
```

#### sendToBack – Send shapes to back
```json
{"_type": "sendToBack", "shapeIds": ["box1"]}
```

**Use case:** Control layering when shapes overlap (e.g., background boxes behind text).

### Transformation Actions

#### resize – Scale shapes
```json
{"_type": "resize", "shapeIds": ["box1"], "scaleX": 2, "scaleY": 1.5, "originX": 100, "originY": 100}
```
**scaleX/scaleY:** scale factors (1.0 = no change, 2.0 = double size, 0.5 = half size)
**originX/originY:** point to scale from (typically the shape's center or corner)

**Use case:** Adjust shape sizes proportionally or create emphasis through size variation.

#### rotate – Rotate shapes
```json
{"_type": "rotate", "shapeIds": ["box1", "box2"], "degrees": 45, "originX": 200, "originY": 200}
```
**degrees:** rotation angle (positive = clockwise, negative = counter-clockwise)
**originX/originY:** rotation center point

**Use case:** Create dynamic layouts, angled connectors, or artistic arrangements.

### Drawing Actions

#### pen – Draw a freehand path
```json
{
  "_type": "pen",
  "shapeId": "path1",
  "points": [{"x":100,"y":100}, {"x":150,"y":80}, {"x":200,"y":120}],
  "color": "red",
  "style": "smooth",
  "closed": false,
  "fill": "none"
}
```
**style:** smooth (interpolates points), straight (minimal interpolation)
**closed:** true connects last point to first
**fill:** none, tint, background, solid, pattern (only applies if closed=true)

**Use case:** Create custom shapes, freehand annotations, or organic connectors.

### Viewport Actions

#### setMyView – Navigate the viewport
```json
{"_type": "setMyView", "x": 0, "y": 0, "w": 1000, "h": 800}
```
**x/y:** top-left corner of viewport in page coordinates
**w/h:** viewport width and height

**Use case:** Focus on specific diagram areas, create "camera" movements, or ensure important content is visible.

## Common Patterns

### Flowchart
- **Ellipses** for start/end points (green for start, red for end)
- **Rectangles** for processes (blue)
- **Diamonds** for decisions (orange)
- **Arrows** to connect steps
- **Spacing:** 150-200px between nodes vertically

**Why this works:** These conventions are universally recognized, making your flowcharts immediately understandable.

### Architecture Diagram
- **Rectangles** for components (blue for frontend, violet for backend)
- **Clouds** for external services (orange)
- **Rectangles with tint fill** for databases (green)
- **Arrows** for data flow
- **Notes** for annotations

**Layout tip:** Group related components together, use layers (frontend top, backend middle, data bottom).

### Mind Map
- **Ellipse** for central idea (violet, larger size)
- **Rectangles** for main branches (different colors per category)
- **Smaller rectangles** for sub-topics
- **Lines** to connect (not arrows - mind maps show relationships, not flow)

**Layout tip:** Radial layout with central node in the middle, branches radiating outward.

## Examples

Complete working examples are available in the `examples/` directory:

- **[examples/simple-flowchart.sh](examples/simple-flowchart.sh)** - Basic flowchart with decision points
- **[examples/architecture-diagram.sh](examples/architecture-diagram.sh)** - Microservices architecture diagram

### Quick Example: Create a Rectangle

```bash
# Get document ID
DOC_ID=$(curl -s http://localhost:7236/api/doc | jq -r '.docs[0].id')

# Create a blue rectangle
curl -X POST "http://localhost:7236/api/doc/$DOC_ID/actions" \
  -H 'Content-Type: application/json' \
  -d '{\"actions\":[{\"_type\":\"create\",\"shape\":{\"_type\":\"rectangle\",\"shapeId\":\"box1\",\"x\":100,\"y\":100,\"w\":200,\"h\":150,\"color\":\"blue\",\"fill\":\"solid\",\"text\":\"Hello\"}}]}'

# Take screenshot
curl -s "http://localhost:7236/api/doc/$DOC_ID/screenshot?size=medium\" -o /tmp/result.jpg
```

## Common Mistakes to Avoid

**⚠️ READ THIS SECTION CAREFULLY - These are the most common errors:**

1. **🚨 NOT ANALYZING SCREENSHOTS AFTER TAKING THEM (MOST CRITICAL ERROR)**
   - Taking a screenshot is NOT enough - you MUST carefully analyze it
   - Look for: overlapping text, arrows crossing labels, crowded center areas, misaligned elements
   - **Why it matters:** The API returns success even if the diagram is completely unusable
   - **What to do:** After every screenshot, explicitly check for visual problems and fix them before continuing

2. **Not clearing the canvas before creating new shapes**
   - Always use the `clear` action before creating a new diagram
   - Use: `{"actions": [{"_type": "clear"}]}`
   - **Why it matters:** Old shapes can overlap with new ones, creating messy diagrams

3. **Creating shapes without checking for documents first**
   - Always run `GET /api/doc` before creating shapes
   - If no documents exist, ask the user to create one
   - **Why it fails:** API returns "Not found" if no document is open

4. **Not taking screenshots to verify**
   - The API returns success even if shapes are off-screen
   - Always take a screenshot after creating shapes
   - **Why it matters:** Visual verification catches positioning issues immediately

5. **Using inline JSON in bash (CRITICAL ERROR)**
   - Shell escaping is error-prone and causes API failures
   - **ALWAYS use JSON files** with `cat > /tmp/file.json << 'EOF'` and `curl -d @/tmp/file.json`
   - **Never use:** `-d '{"actions": [...]}'` with inline JSON
   - **Why it fails:** Special characters, quotes, and emojis break shell escaping

6. **Missing required fields in shape definitions**
   - Every shape MUST include: `_type`, `shapeId`, position/size, `color`, `fill`, `note: ""`
   - Arrows need: `x1, y1, x2, y2` (NOT `start/end` objects)
   - Text shapes need: `anchor`, `maxWidth`, `note`
   - **Why it fails:** API rejects incomplete shape definitions

7. **Random positioning**
   - Use multiples of 50 for x/y coordinates (100, 150, 200, etc.)
   - This creates clean alignment and professional-looking diagrams
   - **Why it matters:** Consistent spacing makes diagrams readable

8. **Forgetting to save the document ID**
   - Extract and save `DOC_ID` at the start: `DOC_ID=$(curl -s http://localhost:7236/api/doc | jq -r '.docs[0].id')`
   - Reuse it for all subsequent API calls
   - **Why it fails:** Using wrong or missing ID causes "Not found" errors

9. **Creating all shapes at once without verification**
   - Build incrementally: create a few shapes, verify with screenshot, continue
   - This catches layout issues early
   - **Why it matters:** Easier to debug and adjust when working in small batches

10. **Not using the right action for the job**
   - Use `place` for relative positioning instead of calculating coordinates manually
   - Use `align` and `distribute` for organizing shapes instead of manual positioning
   - Use `stack` for sequential layouts instead of calculating gaps
   - **Why it matters:** These actions handle the math for you and produce cleaner results

## Troubleshooting

### No documents found
**Symptom:** `{"docs": []}`
**Solution:** Ask the user to create a new document in tldraw Desktop (Cmd+N / Ctrl+N)
**Why:** The API requires an open document to work with

### Canvas has existing shapes
**Symptom:** New diagram appears messy or overlaps with old content
**Solution:** Always clear the canvas before creating a new diagram
```bash
DOC_ID=$(curl -s http://localhost:7236/api/doc | jq -r '.docs[0].id')
cat > /tmp/clear.json << 'EOF'
{"actions": [{"_type": "clear"}]}
EOF
curl -X POST "http://localhost:7236/api/doc/$DOC_ID/actions" \
  -H 'Content-Type: application/json' \
  -d @/tmp/clear.json
```
**Why:** A clean canvas ensures proper positioning and prevents visual clutter

### Connection refused
**Symptom:** `curl: (7) Failed to connect to localhost port 7236`
**Solution:** Verify tldraw Desktop is running
**Check:** `cat ~/Library/Application\ Support/tldraw/server.json`
**Why:** The API server only runs when tldraw Desktop is open

### JSON parsing errors
**Symptom:** `Bad escaped character in JSON`
**Solution:** Use JSON files instead of inline JSON
**Why:** Bash escaping is complex and error-prone

### Shapes not appearing
**Symptom:** API returns success but shapes aren't visible
**Solution:** Take a screenshot to see the current canvas state
**Common causes:**
- Shapes are off-screen (coordinates too large or negative)
- Shapes are overlapping (same x/y coordinates)
- Wrong document ID (using ID from a closed document)
- Missing required fields (color, fill, note)

### Shapes in wrong positions
**Symptom:** Diagram looks messy or crowded
**Solution:** Use grid-based positioning (multiples of 50) and layout actions
**Better approach:** Use `place`, `align`, `distribute`, or `stack` actions instead of manual positioning
**Why:** These actions handle spacing and alignment automatically

## Advanced: Exec API

**⚠️ Use the Structured API (actions) for most tasks.** The Exec API is only needed for advanced operations not covered by the Structured API.

For advanced operations, execute arbitrary JavaScript against the tldraw Editor instance:

```bash
cat > /tmp/exec.json << 'EOF'
{"code": "return editor.getCurrentPageShapes().length"}
EOF

curl -X POST "http://localhost:7236/api/doc/$DOC_ID/exec" \
  -H 'Content-Type: application/json' \
  -d @/tmp/exec.json
```

**When to use Exec API:**
- Complex queries not available in Structured API
- Custom logic requiring JavaScript
- Grouping shapes (not yet in Structured API)
- Page management (creating/switching pages)
- Export operations (SVG, images)
- Camera control beyond `setMyView`

**Available helpers in Exec context:**
- `editor` – the tldraw Editor instance
- `toRichText(plainText)` – convert string to TLRichText
- `renderPlaintextFromRichText(editor, richText)` – extract plain text
- `createShapeId(id?)` – create a TLShapeId
- `createBindingId(id?)` – create a TLBindingId
- `createArrowBetweenShapes(fromId, toId, opts?)` – create bound arrow
- `Box`, `Vec`, `Mat` – geometry classes
- Math helpers: `clamp()`, `degreesToRadians()`, `radiansToDegrees()`

**Important:** In Exec API, shapes use `richText` (not `text`) for text properties. Use `toRichText('your text')` to set and `renderPlaintextFromRichText(editor, shape.props.richText)` to read.

**For full SDK documentation:** `curl http://localhost:7236/api/llms`

This gives you full access to the tldraw SDK, but requires knowledge of the tldraw API. Use the Structured API (create/update/delete actions) for most tasks - it's simpler and more reliable.

---

## Key Takeaways

1. **Always check for documents first** - The API requires an open document
2. **Clear the canvas before starting** - Use the `clear` action for a fresh workspace
3. **Plan before creating** - Think about layout, colors, and structure
4. **Build incrementally** - Create a few shapes, verify with screenshot, continue
5. **🚨 TAKE SCREENSHOTS AND ANALYZE THEM (MANDATORY)** - This is the MOST IMPORTANT step. The API returns success even if your diagram is broken. You MUST take screenshots and carefully check for overlapping text, crowded areas, arrows crossing labels, and other visual problems. Fix any issues before considering the task complete.
6. **Use JSON files** - Avoid shell escaping headaches with heredoc syntax
7. **Use the right actions** - `place`, `align`, `distribute`, `stack` handle positioning better than manual coordinates
8. **Follow conventions** - Standard patterns make diagrams understandable
9. **Prefer small changes** - Make a few changes, check your work, then continue

Remember: The goal is to create clear, professional diagrams that help users understand complex information. Take your time, plan the layout, **verify your work visually by analyzing screenshots**, and iterate based on what you see. Never assume a diagram is correct just because the API returned success - you MUST verify visually.
