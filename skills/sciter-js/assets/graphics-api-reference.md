# Graphics API Reference

Complete reference for Sciter's 2D Graphics API.

## Graphics Class

The Graphics class represents a 2D drawing surface. Available in:
- `<canvas>` element: `canvas.toPixels(g => {...})` or via `this.$("canvas").paintXXX()`
- Element painting: `element.paintContent(g => {...})`
- Image creation: `new Image(width, height, painter(g => {...}))`

### Properties

```js
graphics.lineWidth = 2;              // Line width in dips
graphics.strokeStyle = Color.rgb(1,0,0);  // Stroke color/brush
graphics.fillStyle = Color.rgb(0,0,1);    // Fill color/brush
graphics.font = "12px system";       // CSS font string
graphics.lineCap = "butt";           // "butt", "round", "square"
graphics.lineJoin = "miter";         // "miter", "round", "bevel"
```

### Drawing Methods

#### Path Methods

```js
// Create path
graphics.beginPath();
graphics.moveTo(x, y);
graphics.lineTo(x, y);
graphics.quadraticCurveTo(cpx, cpy, x, y);
graphics.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
graphics.arc(x, y, radius, startAngle, endAngle, anticlockwise);
graphics.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle);
graphics.rect(x, y, width, height);
graphics.closePath();

// Stroke/Fill
graphics.stroke();                    // Stroke current path
graphics.fill();                      // Fill current path
graphics.stroke(pathObject);          // Stroke Path object
graphics.fill(pathObject, "evenodd"); // Fill with rule
```

#### Rectangle Methods

```js
graphics.fillRect(x, y, w, h);        // Fill rectangle
graphics.strokeRect(x, y, w, h);      // Stroke rectangle
graphics.clearRect(x, y, w, h);       // Clear to transparent
```

#### Text Methods

```js
graphics.fillText(text, x, y, maxWidth);
graphics.strokeText(text, x, y, maxWidth);
```

For frequent text updates, use `Graphics.Text` class instead.

### State Management

```js
graphics.save();                      // Push state to stack
graphics.restore();                   // Pop state from stack
```

### Transformations

```js
graphics.translate(x, y);             // Translate origin
graphics.scale(sx, sy);               // Scale
graphics.rotate(angle, [cx, cy]);     // Rotate (radians)
graphics.transform(a, b, c, d, e, f); // Multiply matrix
graphics.setTransform(a, b, c, d, e, f); // Set matrix
graphics.resetTransform();            // Reset to identity
```

### Sciter-Specific Methods

#### `draw()` - Universal draw method

```js
// Draw Path
graphics.draw(path, { x, y, stroke: true, fill: "evenodd" });

// Draw Image
graphics.draw(image, {
    x, y, width, height,              // Destination
    srcX, srcY, srcWidth, srcHeight,  // Source (sprite)
    opacity: 0.5                      // 0.0 - 1.0
});

// Draw Text (Graphics.Text object)
graphics.draw(text, {
    x, y,
    alignment: 5,                     // 1-9, numpad position (5=center)
    fill: Color.rgb(1,0,0)
});
```

#### Layer/Clipping

```js
// Rectangular layer with opacity
graphics.pushLayer(x, y, w, h, 0.5);
// ... draw content ...
graphics.popLayer();

// Element area clipping
graphics.pushLayer("content-box", 0.8);
// Areas: "background-area", "border-box", "padding-box",
//        "margin-box", "content-box"

// Path clipping
graphics.pushLayer(pathObject, opacity);

// Image mask
graphics.pushLayer(maskImage, useAlpha, opacity);
```

### Line Dashing

```js
graphics.setLineDash(5, 3, 2, 3);  // dash, gap, dash, gap, ...
```

---

## Graphics.Color

Color representation with RGBA channels.

### Creating Colors

```js
// From floats (0.0 - 1.0)
const c1 = Color.rgb(1.0, 0.0, 0.0);      // Red
const c2 = Color.rgb(1.0, 0.0, 0.0, 0.5); // Red with alpha

// From integers (0 - 255)
const c3 = Color.RGB(255, 0, 0);          // Red
const c4 = Color.RGB(255, 0, 0, 128);     // Red with alpha

// From HSV (h: 0-360, s,v,a: 0.0-1.0)
const c5 = Color.hsv(0, 1.0, 1.0);        // Red

// From HSL (h: 0-360, s,l,a: 0.0-1.0)
const c6 = Color.hsl(0, 1.0, 0.5);        // Red

// Color morphing
const between = Color.morph(Color.RGB(255,0,0), Color.RGB(0,0,255), 0.5);
```

### Color Properties

```js
const c = Color.RGB(128, 64, 32, 200);

// Float channels (0.0 - 1.0)
c.r; c.g; c.b; c.a;    // 0.50, 0.25, 0.13, 0.78

// Int channels (0 - 255)
c.R; c.G; c.B; c.A;    // 128, 64, 32, 200

// HSV
const [h, s, v, a] = c.hsv;  // [25, 0.75, 0.50, 0.78]

// HSL
const [h, s, l, a] = c.hsl;  // [25, 0.60, 0.38, 0.78]
```

### Color Methods

```js
// String representation
c.toString();           // "#804020"
c.toString("RGB");      // "#804020"
c.toString("RGBA");     // "#804020C8"
c.toString("rgb");      // "rgb(128,64,32)"
c.toString("rgba");     // "rgba(128,64,32,0.784)"

// Integer value
c.valueOf();            // 0xC8204080 (A<<24 | B<<16 | G<<8 | R)
```

---

## Graphics.Path

2D path object (similar to Path2D in browsers).

### Creating Paths

```js
const path = new Graphics.Path();

// Or from SVG path data
const path = new Graphics.Path("M 10 10 L 100 100");
```

### Path Methods

```js
path.moveTo(x, y);
path.lineTo(x, y);
path.quadraticCurveTo(cpx, cpy, x, y);
path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
path.arc(x, y, radius, startAngle, endAngle, anticlockwise);
path.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle);
path.rect(x, y, width, height);
path.closePath();

// Point testing
path.isPointInside(x, y);          // Is point inside closed path?
path.isPointOnStroke(distance, x, y);  // Is point near stroke?

// Bounds
const rect = path.box();           // -> Rect object
const [x1, y1, x2, y2] = path.bounds();

// Path combination
const union = path.combine("union", otherPath);
const intersect = path.combine("intersect", otherPath);
const xor = path.combine("xor", otherPath);
const exclude = path.combine("exclude", otherPath);
```

### Drawing Paths

```js
// Direct method
graphics.stroke(path);
graphics.fill(path);
graphics.fill(path, "evenodd");

// Using draw()
graphics.draw(path, {
    x: 100, y: 100,
    stroke: true,
    fill: "evenodd"
});
```

---

## Graphics.Brush

Paint brushes for fill and stroke operations.

### Creating Brushes

```js
// Linear gradient
const brush = Graphics.Brush.createLinearGradient(x1, y1, x2, y2);
brush.addColorStop(0.0, Color.RGB(255, 0, 0));
brush.addColorStop(1.0, Color.RGB(0, 0, 255));

// Radial gradient
const brush = Graphics.Brush.createRadialGradient(x, y, r);
brush.addColorStop(0.0, Color.RGB(255, 255, 255));
brush.addColorStop(1.0, Color.RGB(0, 0, 0));

// Tiled image
const brush = Graphics.Brush.createTile(image);

// Solid color
const brush = Graphics.Brush.createSolid(Color.RGB(255, 0, 0));
```

### Using Brushes

```js
graphics.fillStyle = brush;
graphics.strokeStyle = brush;
```

### Brush Types

```js
brush.type;  // Graphics.Brush.SOLID, LINEAR, RADIAL, TILE, EXPAND, HOLLOW
```

---

## Graphics.Image

Image representation.

### Creating Images

```js
// From painter function
const img = new Graphics.Image(width, height, (g) => {
    g.fillStyle = Color.RGB(255, 0, 0);
    g.fillRect(0, 0, width, height);
}, Color.RGB(255, 255, 255));  // Optional init color

// From element (renders DOM to bitmap)
const img = new Graphics.Image(width, height, element);
```

### Loading Images

```js
// Async
const img = await Graphics.Image.load("image.png");

// Sync
const img = Graphics.Image.load("image.png", true);
if (img) {
    // Image loaded successfully
}

// From bytes
const img = Graphics.Image.fromBytes(arrayBuffer);
```

### Image Properties

```js
img.width;       // Integer width
img.height;      // Integer height
img.size;        // Size object
img.src;         // Source URL
img.packaging;   // "png", "webp", etc.
```

### Image Methods

```js
// Update content
img.update((g) => {
    g.clearRect(0, 0, img.width, img.height);
    // ... draw new content
});

// Export to bytes
const pngBytes = img.toBytes("png");
const jpegBytes = img.toBytes("jpeg", 85);  // compression 0-100

// Read pixel color
const color = img.colorAt(x, y);

// Image composition
const result = img.compose(srcImage, "src-over");
// Operations: "src-over", "dst-over", "src-in", "dst-in",
//             "src-out", "dst-out", "src-atop", "dst-atop",
//             "xor", "copy", "multiply", "screen", "overlay",
//             "darken", "lighten", "difference", "exclusion",
//             "hue", "saturation", "luminosity", "color"
```

---

## Graphics.Text

Optimized text object for frequent drawing.

### Creating Text

```js
const text = new Graphics.Text("Hello World", "font: 14px system");
```

### Drawing Text

```js
// Simple
graphics.drawText(text, x, y);

// With options
graphics.draw(text, {
    x: 100, y: 100,
    alignment: 5,         // Numpad alignment (1-9, 5=center)
    fill: Color.rgb(1,0,0)
});
```

---

## Graphics.Point

2D point/vector.

```js
const p1 = new Graphics.Point(10, 20);
const p2 = Graphics.Point(100, 200);

// Properties
p1.x; p1.y;

// Operations
p1.plus(p2);     // Point addition
p1.minus(p2);    // Point subtraction
p1.scale(2);     // Scalar multiplication
p1.distance(p2); // Distance between points
```

---

## Graphics.Size

Width/height pair.

```js
const s = new Graphics.Size(100, 50);

// Properties
s.width; s.height;  // or s.w, s.h
```

---

## Graphics.Rect

Rectangle with origin and size.

```js
// From x, y, w, h
const r1 = new Graphics.Rect(10, 10, 100, 50);

// From Point and Size
const r2 = new Graphics.Rect(point, size);

// Properties
r1.x; r1.y; r1.width; r1.height;  // or r1.x, r1.y, r1.w, r1.h

// Methods
r1.containsPoint(x, y);
r1.intersect(otherRect);
r1.union(otherRect);
r1.isEmpty();
r1.normalize();  // Ensure positive width/height
```

---

## Common Patterns

### Canvas Drawing

```html
<canvas #mycanvas width="400" height="300"></canvas>
```

```js
const canvas = document.$("canvas");
const g = canvas.toPixels();

g.fillStyle = Color.rgb(0.2, 0.4, 0.8);
g.fillRect(0, 0, canvas.width, canvas.height);

g.fillStyle = Color.rgb(1, 1, 1);
g.fillText("Hello Sciter!", 50, 50);
```

### Element Painting (Immediate Mode)

```html
<div #painter class="paint-box"></div>
```

```css
.paint-box {
    size: *;
    background: transparent;
}
```

```js
const el = document.$("#painter");

el.paintContent = function(g) {
    const { width, height } = this.box("dimension");

    g.fillStyle = Color.rgb(0.2, 0.4, 0.8);
    g.fillRect(0, 0, width, height);

    // Draw centered text
    const text = new Graphics.Text("Hello!", "font: 24px system");
    g.draw(text, {
        x: width / 2,
        y: height / 2,
        alignment: 5  // center
    });

    return true;  // Return true to indicate paint was handled
};

// Trigger redraw
el.refresh();
```

### C++ Graphics (in Behavior)

```cpp
virtual bool handle_draw(HELEMENT he, DRAW_PARAMS& params) {
    if (params.cmd != DRAW_CONTENT) return false;

    sciter::graphics gfx(params.gfx);

    // Draw
    gfx.state_save();
    gfx.line_color(0);
    gfx.fill_color(Color.rgb(1.0, 0.0, 0.0));
    gfx.ellipse(100, 100, 50, 50);
    gfx.state_restore();

    return false;
}
```

### Offscreen Rendering

```js
// Create offscreen image
const offscreen = new Graphics.Image(200, 100, (g) => {
    g.fillStyle = Color.rgb(0.1, 0.1, 0.1);
    g.fillRect(0, 0, 200, 100);

    g.fillStyle = Color.rgb(0, 1, 0);
    g.beginPath();
    g.arc(100, 50, 30, 0, Math.PI * 2);
    g.fill();
});

// Use in main graphics
graphics.draw(offscreen, { x: 50, y: 50 });
```

### Sprite/Tile Sheet

```js
// Load sprite sheet
const sheet = await Graphics.Image.load("sprites.png");

// Draw specific sprite (x,y,w,h from sheet)
graphics.draw(sheet, {
    x: 100, y: 100,           // Destination
    width: 32, height: 32,     // Destination size
    srcX: 0, srcY: 0,         // Source position
    srcWidth: 32, srcHeight: 32  // Source size
});
```

### Rounded Rectangle Clip

```js
const path = new Graphics.Path();
// Draw rounded rect path...
graphics.pushLayer(path, 1.0);
// ... draw content inside clip ...
graphics.popLayer();
```

### Gradient Fill

```js
const grad = Graphics.Brush.createLinearGradient(0, 0, 100, 100);
grad.addColorStop(0.0, Color.rgb(1, 0, 0));
grad.addColorStop(0.5, Color.rgb(0, 1, 0));
grad.addColorStop(1.0, Color.rgb(0, 0, 1));

graphics.fillStyle = grad;
graphics.fillRect(0, 0, 100, 100);
```
