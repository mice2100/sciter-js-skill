# Graphics API Reference

Complete reference for Sciter's 2D Graphics API.

## Graphics Class

The Graphics class represents a 2D drawing surface. Available in:
- `<canvas>` element: `canvas.getContext('2d')` (standard Web Canvas API)
- Element painting: `element.paintContent = function(g) {...}` (immediate-mode painting)
- Image creation: `new Graphics.Image(width, height, painter(g) {...})`

### Properties

```js
graphics.lineWidth = 2;              // Line width in dips (CSS pixels)
graphics.strokeWidth = 2;            // Alias of lineWidth
graphics.strokeStyle = Color.rgb(1,0,0);  // Color | string | Brush
graphics.fillStyle = Color.rgb(0,0,1);    // Color | string | Brush
graphics.font = "12px system";       // CSS font string
graphics.lineCap = "butt";           // "butt" (default), "round", "square"
graphics.lineJoin = "miter";         // "miter" (default), "round", "bevel"
```

`strokeStyle`/`fillStyle` also accept a plain string with a CSS color or gradient representation, not just `Color`/`Brush` instances.

### Drawing Methods

#### Path Methods

```js
// Create path
graphics.beginPath();
graphics.moveTo(x, y);
graphics.lineTo(x, y);
graphics.quadraticCurveTo(cpx, cpy, x, y);
graphics.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
graphics.arcTo(x1, y1, x2, y2, radius);  // arc using two tangent lines + radius,
                                          // auto-connected to current point with a line
graphics.arc(x, y, radius, startAngle, endAngle, anticlockwise);
graphics.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle);
graphics.rect(x, y, width, height);
graphics.closePath();

// Stroke/Fill
graphics.stroke();                    // Stroke current path
graphics.fill();                      // Fill current path ("nonzero" rule by default)
graphics.stroke(pathObject);          // Stroke Path object
graphics.fill(pathObject, "evenodd"); // Fill with rule: "nonzero" | "evenodd"
```

All coordinate-pair path methods (`moveTo`, `lineTo`, `quadraticCurveTo`, `bezierCurveTo`, `arcTo`) also accept `Graphics.Point` objects in place of `x, y` pairs, e.g. `graphics.moveTo(pt)`, `graphics.quadraticCurveTo(cpPoint, ptPoint)`. `graphics.rect()` also accepts a single `Graphics.Rect` argument: `graphics.rect(rectObj)`.

#### Rectangle Methods

```js
graphics.fillRect(x, y, w, h);        // Fill rectangle, per current fillStyle
graphics.strokeRect(x, y, w, h);      // Stroke rectangle, per current strokeStyle
graphics.clearRect(x, y, w, h);       // Erase to transparent black
```

Each of these also accepts a single `Graphics.Rect` argument instead of `x, y, w, h`: `graphics.fillRect(rectObj)`.

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
graphics.rotate(angle, cx, cy);       // Rotate around cx/cy (cx,cy optional)
graphics.transform(a, b, c, d, e, f); // Multiply current matrix
graphics.setTransform(a, b, c, d, e, f); // Reset then multiply (absolute matrix)
graphics.resetTransform();            // Reset to identity matrix
```

`rotate()`'s `angle` may be a plain number of radians or an [Angle](../JS/units/Angle) unit value (e.g. from CSS, `90deg`).

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
// Rectangular layer with opacity or CSS filter
graphics.pushLayer(x, y, w, h, 0.5);
graphics.pushLayer(x, y, w, h, "blur(4px)");  // CSS filter string instead of opacity
// ... draw content ...
graphics.popLayer();

// Element area clipping (opacity or filter also accepted)
graphics.pushLayer("content-box", 0.8);
// Areas: "background-area" (accounts for border-radius), "border-box",
//        "padding-box", "margin-box", "content-box"

// Path clipping
graphics.pushLayer(pathObject, opacity);

// Image mask
graphics.pushLayer(maskImage, useAlpha, opacity);
// useAlpha: true - use image alpha channel as the mask;
//           false - non-black pixels define the mask
```

`popLayer()` always pops the layer pushed by the most recent `pushLayer()` call — pair every push with a pop (typically in a `try/finally` or right after drawing).

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
// String representation — `type` is documented as a required argument
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
path.moveTo(x, y);                 // also: path.moveTo(Point)
path.lineTo(x, y);                 // also: path.lineTo(Point)
path.quadraticCurveTo(cpx, cpy, x, y);      // also: path.quadraticCurveTo(cpPoint, ptPoint)
path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y); // also: path.bezierCurveTo(cp1Point, cp2Point, ptPoint)
path.arcTo(x1, y1, x2, y2, radius);         // also: path.arcTo(cp1Point, cp2Point, radius)
path.arc(x, y, radius, startAngle, endAngle, anticlockwise);
path.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle);
path.rect(x, y, width, height);    // also: path.rect(Rect)
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
}, Color.RGB(255, 255, 255));  // Optional init color, initializes bitmap bits

// From element (renders DOM to bitmap)
const img = new Graphics.Image(width, height, element, Color.RGB(255,255,255));
```

:::note
The `graphics` passed to the painter function has its resolution set to 1 bitmap pixel (not CSS/device pixel scaled like element painting).
:::

### Loading Images

```js
// Async (returns Promise<Image>)
const img = await Graphics.Image.load("image.png");
const img2 = await Graphics.Image.load(someRequestObject); // Request, see Fetch

// Sync (returns Image or null)
const img3 = Graphics.Image.load("image.png", true);
if (img3) {
    // Image loaded successfully
}

// From bytes (PNG/JPEG/etc.), throws on failure
const img4 = Graphics.Image.fromBytes(arrayBuffer);
```

`Graphics.Image.load(url|request, sync)`: `sync` defaults to `false` (async, returns a Promise you must `await`); pass `true` for a synchronous load returning `Image | null` directly. Since it accepts a [Request](../JS.runtime/Fetch) object, an in-flight load can be cancelled via `request.abort()` (Sciter's `Request`/`Response` fetch API does not use `AbortController`).

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
// Update content: image.update(painter(graphics) [, initColor])
img.update((g) => {
    g.clearRect(0, 0, img.width, img.height);
    // ... draw new content
});

// Export to bytes: image.toBytes(packaging [, compression])
const pngBytes = img.toBytes("png");
const jpegBytes = img.toBytes("jpeg", 85);  // compression 0-100
const rawBytes = img.toBytes("bgra");       // raw pixels, no compression arg
// packaging is one of: "png", "jpeg", "webp", "bgra"

// Read pixel color: image.colorAt(x,y): Color | null
const color = img.colorAt(x, y);

// Image composition: image.compose(src, op [,dstx,dsty[,srcx,srcy,srcw,srch]]): Image
const result = img.compose(srcImage, "src-over");
const partial = img.compose(srcImage, "src-atop", 10, 10, 0, 0, 32, 32);
// Documented operations (Porter-Duff): "src-over", "dst-over", "src-in", "dst-in",
//             "src-out", "dst-out", "src-atop", "dst-atop", "xor", "copy"
```

:::note
The official docs list only the Porter-Duff operations above for `compose()`. Extended CSS-style blend mode names (`"multiply"`, `"screen"`, `"overlay"`, `"darken"`, `"lighten"`, `"difference"`, `"exclusion"`, `"hue"`, `"saturation"`, `"luminosity"`, `"color"`) are NOT documented for `Image.compose()` — don't rely on them; use CSS `mix-blend-mode`/`filter` on elements or `pushLayer(..., filterString)` for those effects instead.
:::

---

## Graphics.Text

A block of text (single- or multi-line) precomputed for efficient/repeated drawing. Prefer this over `graphics.fillText()` when the same string is redrawn often (e.g. every frame or on every paint).

`Graphics.Text` supports the full set of block/text CSS styles (fonts, alignment, borders, background, width, etc.), set either via an inline `.style` string or via a document CSS `.class`.

### Creating Text

```js
// new Graphics.Text(text: String [, cssClassName: String])
const text = new Graphics.Text("Hello World");
const styledByClass = new Graphics.Text("Hello World", "my-text-class"); // uses document CSS class
```

The constructor's second argument is a **CSS class name** (matched against document stylesheet rules), not an inline style string. To set styles directly, use the `.style` property after construction:

```js
const text = new Graphics.Text("Hello World");
text.style = "font: 14pt Roboto, sans-serif; color: red;";
```

### Properties

```js
text.chars;   // string, read/write, the text content
text.style;   // string, read/write, CSS-like style (fonts, alignment, borders, background...)
text.class;   // string, read/write, CSS class name (document styles)
text.lines;   // read-only, number of lines at the current width
```

```js
// Bordered text box example from the docs:
text.style = "border:1px solid red; font: 12pt Roboto, sans-serif; width:max-content";
```

### Methods

```js
// width(): reports [minWidth, maxWidth, usedWidth]
const [minW, maxW, usedW] = text.width();
// width(usedWidth): sets used width, returns the Text (chainable); text.lines may change
text.width(200);

// height(): reports [contentHeight, usedHeight]
const [contentH, usedH] = text.height();
// height(usedHeight): sets used height, returns the Text (chainable)
text.height(100);
// note: vertical-align in text.style may change on-screen glyph position

// lineMetrics(lineNo): [yPos, height, baselineOffset]
const [yPos, lineHeight, baseline] = text.lineMetrics(0);

// lineChars(lineNo): string content of that line
const firstLine = text.lineChars(0);
```

### Drawing Text

```js
graphics.draw(text, {
    x: 100, y: 100,
    alignment: 5,         // 1-9, NUMPAD position: 5=center, 7=top-left, etc.
    fill: Color.rgb(1,0,0) // optional; omit to use current fillStyle
});
```

---

## Graphics.Point

2D point, also known as a 2D vector. `Graphics.Point` (aka `Point` inside the `Graphics` namespace) can be constructed with `new Point(...)` or as a conversion function `Point(...)`.

### Creating Points

```js
const p1 = new Graphics.Point(10, 20);   // from x, y
const p2 = Graphics.Point(100, 200);     // same, "conversion" form
const p3 = Graphics.Point();             // 0,0
const p4 = Graphics.Point(p1);           // copy of another Point
const p5 = Graphics.Point(sizeObj);      // convert from Size (x=width, y=height)
const p6 = Graphics.Point(rectObj);      // origin of the Rect
const p7 = Graphics.Point.make(20, 20);  // static constructor
```

### Properties

```js
p1.x; p1.y;    // numbers
p1.length;     // number, vector length: sqrt(x*x + y*y)
```

### Methods

```js
p1.distance(p2);                    // number, distance between the two points
p1.distanceToLineSegment(lp1, lp2); // [distance:number, closestPoint:Point]
p1.dot(p2);                         // number, dot product
p1.unit();                          // Point, normalized (length == 1) copy
p1.inscribe(rectObj);               // Point, copy moved inside the Rect if needed
```

### Operators

`Point` overloads arithmetic and comparison operators directly (no `.plus()`/`.minus()`/`.scale()` methods in the docs — use these operators instead):

```js
p1 + p2       // point/vector addition
p1 - p2       // point/vector subtraction
p1 * n        // scale by number (or per-component by a Size)
p1 / n        // divide by number (or per-component by a Size)
p1 == p2      // equality (float EPSILON precision)
+p1           // unary plus (copy)
-p1           // unary minus (inversion)
```

---

## Graphics.Size

2D size (dimensions), a width/height pair. Constructed with `new Size(...)` or the conversion form `Size(...)`.

### Creating Sizes

```js
const s1 = new Graphics.Size(100, 50);
const s2 = Graphics.Size(100, 50);       // conversion form
const s3 = Graphics.Size();              // 0,0
const s4 = Graphics.Size(s1);            // copy
const s5 = Graphics.Size(pointObj);      // convert from Point (width=x, height=y)
const s6 = Graphics.Size.make(20, 20);   // static constructor
```

### Properties

```js
s1.x; s1.y;             // numbers (raw component names)
s1.width; s1.height;    // aliases of x, y
s1.length;              // number, vector length: sqrt(x*x + y*y)
```

### Methods

```js
s1.isEmpty();    // bool, true if x <= 0 or y <= 0
s1.normalize();  // Size, copy normalized so x >= 0 and y >= 0
```

### Operators

```js
s1 + s2       // sum
s1 - s2       // subtraction
s1 * n        // per-component scale by number or Size
s1 / n        // per-component divide by number or Size
s1 == s2      // equality (float EPSILON precision)
+s1           // unary plus (copy)
-s1           // unary minus (inversion)
```

---

## Graphics.Rect

2D rectangle. Constructed with `new Rect(...)` or the conversion form `Rect(...)`.

### Creating Rects

```js
const r0 = Graphics.Rect();                     // empty rect
const r1 = new Graphics.Rect(10, 10, 100, 50);  // x, y, width, height
const r2 = Graphics.Rect(point, size);          // origin Point + Size
const r3 = Graphics.Rect(point1, point2);       // origin + corner Points
const r4 = Graphics.Rect(size1, size2);         // origin + corner as Sizes
const r5 = Graphics.Rect(point);                // empty rect with origin = point
const r6 = Graphics.Rect(size);                 // origin [0,0], size = size
const r7 = Graphics.Rect(r1);                   // copy

// Static: corner-based instead of origin+size
const r8 = Graphics.Rect.make(x1, y1, x2, y2);  // from origin(x1,y1) + corner(x2,y2)
const r9 = Graphics.Rect.make(point, size);
const r10 = Graphics.Rect.make(point1, point2);
```

### Properties

```js
r1.x; r1.y;                    // origin.x, origin.y
r1.width; r1.height;           // size
r1.left; r1.top; r1.right; r1.bottom; // origin.x, origin.y, corner.x, corner.y
r1.origin;                     // Point, top-left
r1.corner;                     // Point, bottom-right
r1.size;                       // Size, dimensions
```

### Methods

```js
// pointOf(which): Point — 1-9 NUMPAD position, 7=top-left, 5=center, 3=bottom-right, etc.
const center = r1.pointOf(5);

// moveTo(pos:Point [,which=7]): Rect — copy moved so its `which` point is at `pos`
const moved = r1.moveTo(Graphics.Point(0, 0), 3); // moves bottom-right corner to 0,0

r1.isEmpty();          // bool
r1.overlaps(otherRect); // bool, equivalent to !(r1 & otherRect).isEmpty()
r1.contains(otherRect); // bool, true if otherRect fully inside
r1.contains(pointObj);  // bool, true if point inside
r1.distance(pointObj);  // number, min distance to point (0 if point is inside)
r1.normalize();          // Rect, copy with origin < corner and size >= 0

r1.inflate(sizeObj);                 // Rect, expand outward by size
r1.inflate(topLeftSize, bottomRightSize); // expand asymmetrically
r1.deflate(sizeObj);                 // Rect, shrink inward by size
r1.deflate(topLeftSize, bottomRightSize); // shrink asymmetrically
```

### Operators

```js
r1 * n|size    // scale
r1 / n|size    // scale
r1 + point|size  // move by offset
r1 - point|size  // move by offset
r1 == r2         // equality (float EPSILON precision)
r1 << n|size     // deflate (r1.deflate(size) shorthand)
r1 >> n|size     // inflate (r1.inflate(size) shorthand)
r1 | r2          // union: smallest rect containing both
r1 | pointObj    // union of rect and a point
r1 & r2          // intersection: largest rect contained in both (may be empty)
```

```js
// From the docs:
const intersection = Graphics.Rect(0,0,100,100) & Graphics.Rect(50,50,100,100); // Rect(50,50,50,50)
const union = Graphics.Rect(0,0,100,100) | Graphics.Rect(50,50,100,100); // Rect(0,0,150,150)
```

---

## Common Patterns

### Canvas Drawing

```html
<canvas #mycanvas width="400" height="300"></canvas>
```

```js
const canvas = document.$("canvas");
const g = canvas.getContext('2d');

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
    const [width, height] = this.state.box("dimension", "inner");

    g.fillStyle = Color.rgb(0.2, 0.4, 0.8);
    g.fillRect(0, 0, width, height);

    // Draw centered text
    const text = new Graphics.Text("Hello!");
    text.style = "font: 24px system";
    g.draw(text, {
        x: width / 2,
        y: height / 2,
        alignment: 5  // center
    });

    return true;  // Return true to indicate paint was handled
};

// Trigger redraw
el.requestPaint();
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
