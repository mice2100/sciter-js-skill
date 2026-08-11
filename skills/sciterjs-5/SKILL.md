---
name: sciterjs-5
description: Sciter.js 5.0.3.11 desktop application development. Use for: Sciter.js, Sciter, SciterJS, scapp, usciter, sciter-js-sdk, Sciter UI, Sciter desktop apps, HTML/CSS/JS apps with scapp, Sciter C++ integration, Sciter components, Sciter Graphics, Reactor, JSX, Signals reactive state, flow layout, flex units, element painting, custom drawing. Features: richtext editor, @storage database, tray icon, lottie animations, terminal emulator, BJSON, Zip archives, CSS @const/@mixin, C++/JS bridging. Supports both pure JS development (with scapp) and C++ integration modes.
---

# Sciter.js Skill

Professional Sciter.js desktop application development. Supports **two development modes**:

1. **scapp Mode** - Pure HTML/CSS/JS apps without C++ (faster prototyping, simpler deployment)
2. **C++ Integration Mode** - Native backend with Sciter UI (full system access, custom behaviors)

## Development Modes

### scapp Mode (Pure JS - No C++ Required)

Use scapp as the application host. Ideal for:
- Rapid prototyping
- Web developers transitioning to desktop
- Apps that don't need native system access
- Cross-platform deployment without recompilation

**Running with scapp:**
```bash
# Run directly
scapp main.htm

# With debug mode
scapp main.htm --debug
```

Standalone packaging (bundling resources into a monolithic executable) is not a `scapp` CLI flag — it's done by the separate [Sciter.Quark](https://quark.sciter.com/) assembly tool, which appends your resources to `scapp.exe`.

**Project structure (scapp mode):**
```
myapp/
├── main.htm           # Entry point
├── css/
│   └── styles.css     # Sciter CSS (flow, flex units)
├── js/
│   └── app.js         # Application logic
└── resources/         # Images, assets
```

### C++ Integration Mode

Use when you need:
- Native system access
- Custom C++ behaviors
- Performance-critical operations
- Integration with existing C++ codebase

**Requires:** C++17, CMake, Sciter SDK

**Choose mode based on user request:**
- User says "create a Sciter app" → Ask: "Do you need C++ native features or just HTML/CSS/JS?"
- User says "scapp app" or "pure JS" → Use scapp mode
- User says "C++ integration" or "native backend" → Use C++ mode

## Quick Start

### scapp Mode (Pure JS)

When user requests scapp-based app:
1. Create HTML entry point (`main.htm`)
2. Add Sciter CSS with `flow` layout
3. Add JavaScript with Reactor/JSX components
4. Test with `scapp main.htm --debug`
5. Package with `scapp -p myapp main.htm`

### C++ Mode

When user requests C++ integration:
1. Generate project structure from `assets/template/`
2. Customize CMakeLists.txt with project name
3. Update mainWnd.h with app-specific asset interface
4. Create UI files in `ui/` directory

## Architecture Pattern

### C++ Entry Point (uimain)

Always use `uimain()` as entry point - never `main()` or `WinMain()`:

```cpp
int uimain(std::function<int()> run) {
    // 1. Configure script runtime options
    UINT script_options = ALLOW_FILE_IO | ALLOW_SOCKET_IO | ALLOW_SYSINFO;
    SciterSetOption(nullptr, SCITER_SET_SCRIPT_RUNTIME_FEATURES, script_options);

    // 2. Load resources (archive or local file)
    sciter::string appBaseUrl;
#ifdef LOCAL_MODE
    appBaseUrl = Path2Url(GetAppPath() + L"/ui/main.htm");
#else
    sciter::archive::instance().open(aux::elements_of(resources));
    appBaseUrl = WSTR("this://app/main.htm");
#endif

    // 3. Create window and set as global asset
    sciter::om::hasset<mainWnd> pMainWnd = new mainWnd();
    SciterSetGlobalAsset(pMainWnd);

    // 4. Load UI
    pMainWnd->load(appBaseUrl.c_str());

    return run();
}
```

### Window Class Pattern

All window classes must:

1. Extend `sciter::window`
2. Use constructor with window flags: `SW_TITLEBAR | SW_RESIZEABLE | SW_CONTROLS | SW_MAIN | SW_ENABLE_DEBUG`
3. Define asset interface via `SOM_PASSPORT`

```cpp
class mainWnd : public sciter::window {
public:
    mainWnd() : window(SW_TITLEBAR | SW_RESIZEABLE | SW_CONTROLS | SW_MAIN | SW_ENABLE_DEBUG) {}

    // Native functions exposed to JS
    std::string stringSum(const std::string a, const std::string b) { return a + "+" + b; }

    // Virtual properties
    int get_windowHandle() { return (int)(intptr_t)get_hwnd(); }

    // Asset interface - call as Window.this.assetInterface.functionName()
    SOM_PASSPORT_BEGIN_EX(assetInterface, mainWnd)
        SOM_FUNCS(SOM_FUNC(stringSum))
        SOM_PROPS(SOM_RO_VIRTUAL_PROP(windowHandle, get_windowHandle))
    SOM_PASSPORT_END

    // Alternative: named call handler
    BEGIN_FUNCTION_MAP
    FUNCTION_1("xcallTest", xcallTest);
    END_FUNCTION_MAP

    sciter::value xcallTest(sciter::value data) {
        return data.get<int>() * 2;
    }
};
```

## CSS Constraints (Sciter vs Web)

**Sciter implements CSS 2.1 in full, but CSS3 only for a specific, limited set of modules**
(2D `transform`, `transition`/`animation`, most CSS3 selectors, `border-radius`,
`box-shadow`, `opacity`, `rgba()`/`hsl()`, `@font-face`, `@media`, `var()`, `filter()`,
`backdrop-filter()`, gradients). **Do not assume any other modern/CSS3+ feature works
(Flexbox, Grid, `clip-path`, `mask`, `object-fit`, `aspect-ratio`, `:has()`,
`:focus-within`, `gap`, `cubic-bezier()`, 3D transforms, container queries, CSS nesting,
etc.) just because it isn't in the table below** — before using any CSS property/value/
selector not covered in this file, check `assets/css-reference.md`'s "Compatibility
Baseline" and "Value Enumerations for High-Risk Properties" sections, which enumerate what's
actually confirmed vs. merely legacy/unconfirmed.

### PROHIBITED - Use Sciter Equivalents Instead

| Web Standard | Sciter Equivalent |
|--------------|-------------------|
| `display: flex` | `flow: horizontal`, `flow: vertical`, etc. |
| `display: grid` | `flow: grid(...)` |
| `flex-grow`, `flex-shrink` | Flex units: `width: *`, `width: 0.5*` |

### Required Sciter CSS Properties

**Flow Layout System:**
```css
/* Single row */
container { flow: horizontal; }

/* Single column */
container { flow: vertical; }

/* Multiple rows */
container { flow: horizontal-wrap; }

/* Multiple columns */
container { flow: vertical-wrap; }

/* Stacked elements */
container { flow: stack; }

/* Grid layout */
container { flow: grid(1 1 1, 2 5 3, 4 4 4); }

/* Automatic rows */
container { flow: row(label, input select); }
```

**Flex Units:**
```css
/* Fill available space */
child { width: *; }
child { size: *; } /* width and height */

/* Ratio-based */
child { width: 0.7*; }  /* 70% of free space */
child { margin: 0.3* 0.7*; } /* flexible margins */
child { border-spacing: *; } /* equal spacing */
```

### Sciter-Specific Features

**Style Sets:**
```css
@set name {
    .button { background: blue; }
    .button:hover { background: darkblue; }
}
```

**Behaviors (Class Controllers):**
```css
user-card {
    prototype: UserCard url(users-ui.js);
}
```

**Aspects (Functional Controllers):**
```css
*[onclick] {
    aspect: OnClickAspect url(ui-helpers.js);
}
```

## C++ to JS Communication

### SOM_PASSPORT Pattern (Recommended)

Expose methods via `SOM_PASSPORT` - call from JS as `Window.this.assetInterface.methodName()`:

```cpp
SOM_PASSPORT_BEGIN_EX(assetInterface, mainWnd)
    SOM_FUNCS(
        SOM_FUNC(method1)
        SOM_FUNC(method2)
    )
    SOM_PROPS(
        SOM_RO_VIRTUAL_PROP(propName, get_propName)
    )
SOM_PASSPORT_END
```

### BEGIN_FUNCTION_MAP Pattern

For named calls via `Window.this.xcall("name", args...)`:

```cpp
BEGIN_FUNCTION_MAP
    FUNCTION_1("functionName", cppFunction)
END_FUNCTION_MAP
```

### Value Conversion

**Primitives:**
```cpp
sciter::value val_int(42);
sciter::value val_str(L"Hello");
sciter::value val_bool(true);
```

**Objects:**
```cpp
sciter::value obj;
obj.set_item("key", value);
```

**Arrays:**
```cpp
std::vector<sciter::value> vec;
sciter::value arr = sciter::value::from_list(vec);
```

## Global Window Methods

**Tray Icon (System Tray):**
```js
// Set tray icon
Window.this.trayIcon({
    image: await Graphics.Image.load("icon.svg"),
    text: "Tooltip text"
});

// Update tooltip
Window.this.trayIcon({ text: "Updated" });

// Remove icon
Window.this.trayIcon("remove");

// Get icon position
const [x, y, w, h] = Window.this.trayIcon("place");
```

**Tray Icon Events:**
```js
Window.this.on("trayiconclick", (evt) => {
    // Single click on tray icon
    const { screenX, screenY, buttons } = evt.data;
});

Window.this.on("trayicondoubleclick", (evt) => {
    // Double click on tray icon
});
```

## JS to C++ Communication

### Calling Native Functions

```javascript
// SOM_PASSPORT exposed
let result = Window.this.assetInterface.stringSum("a", "b");

// BEGIN_FUNCTION_MAP
let result = Window.this.xcall("xcallTest", 42);

// Access virtual properties
let handle = Window.this.assetInterface.windowHandle;
```

### Global Events

```javascript
// Send event (synchronous)
Window.send("app-event", data);

// Post event (asynchronous)
Window.post("app-event", data);
```

### C++ Event Handlers

```cpp
// Override in window class
virtual bool handle_event(HELEMENT he, BEHAVIOR_EVENT_PARAMS& params) {
    if (params.cmd == SUBMIT) {
        // Handle form submission
    }
    return false;
}
```

## Built-in Behaviors Overview

Sciter provides built-in behaviors for common UI components. See `assets/behaviors-reference.md` for complete documentation of all behaviors.

### Key Behaviors

| Element | Behavior | Description |
|---------|----------|-------------|
| `<htmlarea>` | `behavior:richtext` | Rich text editor (NEW in 5.0) |
| `<frame>` | `behavior:frame` | Document container |
| `<input type="text">` | `behavior:edit` | Text editing |
| `<select>` | `behavior:select` | Dropdown |
| `<widget virtual-list>` | `behavior:virtual-list` | Virtual list |
| `<button>` | `behavior:button` | Button |

### Window Methods and Events

**Tray Icon (System Tray):**
```js
// Set tray icon
Window.this.trayIcon({
    image: await Graphics.Image.load("icon.svg"),
    text: "My App - " + new Date()
});

// Update
Window.this.trayIcon({ text: "Updated text" });

// Remove
Window.this.trayIcon("remove");

// Get position
const [x, y, w, h] = Window.this.trayIcon("place");

// Events
Window.this.on("trayiconclick", (evt) => {
    const { screenX, screenY, buttons } = evt.data;
    // Show popup menu
    new Window({
        type: Window.POPUP_WINDOW,
        url: "tray-popup.htm",
        x: screenX,
        y: screenY
    });
});

Window.this.on("trayicondoubleclick", (evt) => {
    Window.this.state = Window.WINDOW_SHOWN;
});
```

## File System Components

### FolderView Component

Sample-provided (not a Sciter built-in) file browser component for navigating directories — attached via CSS `prototype:`, not JS import, and used as `<folder>` (not `<folder-view>`):

```css
/* folder-view.css */
@set folder-view {
  :root { prototype: FolderView url(folder-view.js); }
  /* ... */
}
/* this allows it to be used in HTML as <folder /> */
folder { style-set: folder-view; }
```

```html
<style>@import url(folder-view.css);</style>
<folder filter="*.htm;*.html;*.png;*.jpg" />
```

```js
document.on("file-activate", function(evt) {
  console.log("file-activate", evt.data);
});
```

**Features:**
- Directory navigation with path breadcrumbs
- File filtering
- Keyboard navigation (Enter, Escape, Arrow keys)
- Events: `folder-change`, `file-activate`

## Storage Module (`@storage`)

Persistent key-value storage with indexing for local data persistence:

```js
import * as Storage from "@storage";
import * as env from "@env";

// Open database
const storage = Storage.open(env.path("documents") + "/app.db");

// Initialize with indexes
function initDb(storage) {
    storage.root = {
        usersByName: storage.createIndex("string", true),  // unique
        logsByDate: storage.createIndex("date", false)     // non-unique
    };
    return storage.root;
}

var root = storage.root || initDb(storage);

// Use indexes
root.usersByName.set("John", { name: "John", age: 30 });
const user = root.usersByName.get("John");

// Register classes for prototype restoration
storage.registerClass(User);
storage.commit();
```

## CSS Enhancements (Version 5.0)

### Grid Layout

```css
.container {
    flow: grid(
        1 1 1,
        2 5 3,
        4 4 4
    );
    /* 3x3 template, cells span multiple grid cells */
}
```

### Flex Units Update

Flex units now work seamlessly with all layout modes:

```css
.child {
    width: *;        /* Fill remaining space */
    width: 0.7*;     /* 70% of free space */
    size: *;         /* Both width and height */
}
```

## Asset References

Core API references (distilled from official docs — read these for authoritative syntax/API detail beyond what's summarized in this file):

- **DOM & HTML**: See `assets/dom-html-reference.md` for Document/Node/Element/Event/Window DOM API, CSS-from-JS, Selection, out-of-canvas elements (tooltips/popups/context menus/airborn), supported HTML elements & window chrome roles
- **CSS Reference**: See `assets/css-reference.md` for complete Sciter CSS syntax (flow layout, flex units, selectors, full properties table, units, style sets, behaviors/aspects, scrollbars, markers/shadows, image maps, paths/vector images, variables, conditionals)
- **Behaviors**: See `assets/behaviors-reference.md` for all built-in behaviors (richtext, frame, edit, select, etc.)
- **Runtime API**: See `assets/runtime-api-reference.md` for `@sciter`, `@sys`, `@env`, `@debug`, `@storage` modules, Clipboard, Fetch extensions, Intl/i18n, JS unit types (Length/Angle/Duration)
- **Graphics API**: See `assets/graphics-api-reference.md` for Graphics, Color, Path, Image, Brush, Rect, Point, Size, Text
- **Component & Painting**: See `assets/component-painting-reference.md` for Element extension, custom painting, and custom aspect functions
- **Reactor/JSX**: See `assets/reactor-component-reference.md` for Reactor components, JSX, and the full Reactor top-level API
- **SOM Patterns**: See `assets/som-patterns.md` for advanced SOM_PASSPORT usage
- **Project Template**: See `assets/template/` for complete scaffolding template

Patterns mined from the official samples (real-world idioms, gotchas, and undocumented-but-working APIs not found in the prose docs — check these when the reference docs above don't cover a scenario):

- **Windows & Layout**: `assets/samples-layout-windows.md` — tray icon flows, custom popups/dialogs, native drag-resize/dock loops, tooltips, menus
- **Input & Forms**: `assets/samples-input-forms.md` — drag & drop (in-app and system), gestures, file dialogs, plaintext/richtext editors, virtual-list data providers
- **Graphics & Media**: `assets/samples-graphics-media.md` — SVG, video/audio/lottie wiring, immediate-mode painting, procedural image generation, printing, terminal, and an undocumented syntax-highlighting (Tokenizer/`Range.highlight()`) API
- **Runtime & System**: `assets/samples-runtime-system.md` — child processes, clipboard, storage in practice, zip archives, an undocumented unit-test framework, module resolution
- **Components & Advanced**: `assets/samples-components-advanced.md` — component libraries, data tables, a runtime i18n resource-file convention, theming, a from-scratch modal dialog pattern (no built-in `showModal`), toast notifications
- **CSS in Practice**: `assets/samples-css.md` — icon fonts, gradients, the full stock-icon (`icon:name`) list, scrollbar part anatomy, flow-vs-flexbox rosetta stone

> **Known naming discrepancies** (flagged during distillation, unresolved against a live SDK — verify at runtime if something doesn't fire): the pager behavior's `paginationstart` event may actually be named `paginationready` in practice (see `dom-html-reference.md`); `sys.fs` sync methods may use a `$`-prefix (`fs.$open`, `file.$read`) rather than `Sync`-suffixed names (see `runtime-api-reference.md`).

## Sciter JS Runtime Modules

Sciter provides special modules NOT available in standard JS or Node.js:

### Module `@sciter`

Core Sciter functions - import as `import * as sciter from "@sciter"`:

```js
// Event handling (jQuery-style)
sciter.on("click", "button", handler);
sciter.off("click");
sciter.once("click", handler);

// Global events (cross-window)
sciter.onGlobalEvent("custom-event", handler);

// DOM queries
sciter.$("selector");   // First match
sciter.$$("selector");  // All matches

// Synchronous module import
const module = sciter.import("module.js");

// Value parsing (JSON++)
const val = sciter.parseValue("12px");  // Length object

// Encoding/Hashing
sciter.encode(text, "utf-8");
sciter.decode(bytes, "utf-8");
sciter.toBase64(buffer);
sciter.md5(buffer);

// Utilities
sciter.uuid();  // Generate UUID
sciter.devicePixels(100);  // CSS to device pixels
```

### Module `@sys`

Node.js-style runtime functions built on libuv:

```js
import * as sys from "@sys";

// File operations
await sys.fs.readFile("path.txt");     // -> ArrayBuffer
const file = await sys.fs.open("path", "w");  // no sys.fs.writeFile() — open + File#write() instead
await file.write(data);
await file.close();
await sys.fs.copyfile("src", "dst");
await sys.fs.readdir("folder");        // -> [{name,type}]
await sys.fs.stat("path");             // File info

// File watching
const watch = sys.fs.watch("path", (path, events) => { });
watch.close();

// TCP socket (method calls below are documented; the constructor itself is unconfirmed
// anywhere in docs/samples — no AF_INET/SOCK_STREAM constants exist in ground truth)
const socket = new sys.Socket(/* constructor unconfirmed */);
await socket.connect({ ip: "127.0.0.1", port: 8080 });
await socket.write(data);
const data = await socket.read();

// Environment
sys.cwd();           // Current directory
sys.homedir();       // User home
sys.getenv("PATH");  // Environment variable
sys.uname();         // OS info
```

### Module `@env`

OS and environment information:

```js
import * as env from "@env";

// Constants
env.PLATFORM;  // "Windows", "OSX", "Linux", "Android"
env.DEVICE;    // "desktop" or "mobile"

// Functions
env.language();       // "en", "zh", etc.
env.country();        // "US", "CN", etc.
env.userName();       // Current user
env.machineName();    // Computer name
env.arguments();      // Command line args

// Launch applications
env.launch("https://sciter.com");
env.launch("/path/to/file.pdf");

// Well-known folders
env.path("desktop");     // Desktop folder
env.path("documents");   // Documents folder
env.path("downloads");   // Downloads folder
env.path("appdata");     // App data folder
```

### Module `@storage` (NEW in 5.0)

Persistent key-value storage with indexing:

```js
import * as Storage from "@storage";

// Open database
const storage = Storage.open(env.path("documents") + "/app.db");

// Initialize with indexes
storage.root = {
    usersByName: storage.createIndex("string", true),  // unique
    logsByDate: storage.createIndex("date", false)     // non-unique
};

// Use indexes
storage.root.usersByName.set("John", { name: "John" });
const user = storage.root.usersByName.get("John");

// Register classes for prototype restoration
storage.registerClass(User);
storage.commit();
```

### Module `@debug`

Debugging for Inspector integration:

```js
import * as debug from "@debug";

// Exception handling
debug.setUnhandledExceptionHandler((err) => {
    console.error(err.stack);
});

// Console redirection
debug.setConsoleOutputHandler((subsystem, severity, msg) => {
    log(subsystem, severity, msg);
    return true;
});

// Call stack inspection
const frame = debug.callStackAt(0);
// { functionName, fileName, lineNo, isNative }

// Element inspection
const uid = debug.getUIDofElement(el);
debug.highlightElement(el);
debug.getStyleRulesOfElement(el);
```

## Global Functions

Standard Web API globals available in Sciter:

### Timers

```js
// One-shot timer
const timerId = setTimeout(() => {
  console.log("Executed after delay");
}, 1000);

// Clear timeout
clearTimeout(timerId);

// Repeating interval
const intervalId = setInterval(() => {
  console.log("Executed every second");
}, 1000);

// Clear interval
clearInterval(intervalId);

// Animation frame (synced with display refresh, ~60fps)
const animId = requestAnimationFrame(() => {
  console.log("Next paint frame");
});

// Cancel animation frame
cancelAnimationFrame(animId);
```

### Console

```js
console.log("Basic log");
console.log("Formatted: %s = %d", "answer", 42);

// For a global exception handler, use @debug's setUnhandledExceptionHandler
// (see "Module @debug" below) — no console.reportException override exists.
import * as debug from "@debug";
debug.setUnhandledExceptionHandler((err) => {
  Window.this.modal(<alert>{err.toString()}</alert>);
});

console.warn("Warning message");
console.error("Error message");
```

### HTTP Client

```js
// Basic fetch
const response = await fetch("https://api.example.com/data");
const data = await response.json();

// With options
const response = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "value" })
});
```

### Sciter-Specific Globals

```js
// printf formatting (C-style, with %v and %V extensions)
const formatted = printf("Value: %v", { a: 1 });  // JSON output

// scanf parsing
const values = scanf("%d %s", "42 hello");  // [42, "hello"]

// Module evaluation
const module = evalModule("export const x = 42;", "inline:module");
// module.x === 42

// Load script synchronously
loadScript("utils.js");

// Load script module synchronously
const exports = loadScriptModule("mymodule.js");
```

### Global Properties

```js
// Global namespace (aliased as `window`)
globalThis.someValue = 123;
window.someValue;  // 123

// Device pixel ratio (HiDPI/Retina support)
const dpr = devicePixelRatio;  // e.g., 2.0 on Retina
```

## Graphics API

Sciter's 2D Graphics API for canvas, element painting, and offscreen rendering.

### Graphics Class

```js
// Get graphics context (standard Web Canvas API)
const g = canvas.getContext('2d');
// OR inside a class component's paintContent(gfx) method

// State
g.save(); g.restore();
g.translate(x, y); g.scale(sx, sy); g.rotate(angle);

// Drawing
g.beginPath(); g.moveTo(x,y); g.lineTo(x,y); g.stroke(); g.fill();
g.fillRect(x, y, w, h);
g.fillText(text, x, y);

// Sciter-specific draw()
g.draw(path, { x, y, stroke: true, fill: "evenodd" });
g.draw(image, { x, y, width, height, opacity: 0.5 });
g.draw(text, { x, y, alignment: 5 });  // 5 = center

// Layer/clipping
g.pushLayer(x, y, w, h, opacity);
g.pushLayer(path);
g.pushLayer(maskImage, useAlpha);
g.popLayer();
```

### Graphics.Color

```js
// Create colors
const c1 = Color.rgb(1.0, 0.0, 0.0);      // Float 0-1
const c2 = Color.RGB(255, 0, 0);          // Int 0-255
const c3 = Color.hsv(0, 1.0, 1.0);        // HSV
const c4 = Color.hsl(0, 1.0, 0.5);        // HSL

// Properties
c1.r, c1.g, c1.b, c1.a;   // Float channels
c1.R, c1.G, c1.B, c1.A;   // Int channels
const [h,s,v] = c1.hsv;   // HSV array
const [h,s,l] = c1.hsl;   // HSL array

// Morphing
const mid = Color.morph(Color.RGB(255,0,0), Color.RGB(0,0,255), 0.5);
```

### Graphics.Path

```js
const path = new Graphics.Path();
path.moveTo(x, y); path.lineTo(x, y);
path.arc(x, y, r, start, end);
path.rect(x, y, w, h);
path.closePath();

// Test point
path.isPointInside(x, y);

// Bounds
const rect = path.box();
const [x1,y1,x2,y2] = path.bounds();

// Combine paths
const union = path.combine("union", otherPath);
```

### Graphics.Image

```js
// Load
const img = await Graphics.Image.load("image.png");
const img = Graphics.Image.load("image.png", true);  // Sync

// Create from painter
const img = new Graphics.Image(w, h, (g) => {
    g.fillStyle = Color.rgb(1,0,0);
    g.fillRect(0, 0, w, h);
});

// Export
const png = img.toBytes("png");
const jpeg = img.toBytes("jpeg", 85);

// Read pixel
const color = img.colorAt(x, y);
```

### Graphics.Brush

```js
// Linear gradient
const brush = Graphics.Brush.createLinearGradient(x1, y1, x2, y2);
brush.addColorStop(0.0, Color.RGB(255,0,0));
brush.addColorStop(1.0, Color.RGB(0,0,255));

// Radial gradient
const brush = Graphics.Brush.createRadialGradient(x, y, r);

// Tile
const brush = Graphics.Brush.createTile(image);

// Use
g.fillStyle = brush;
g.strokeStyle = brush;
```

## Element Extension & Reactor Components

Sciter provides two ways to create custom UI components: extending Element class (DOM Components) and Reactor (JSX) components.

### Extending Element Class

Create reusable UI components by extending the built-in Element class:

**Module with Export (Recommended):**
```js
// my-widget.js
export class MyWidget extends Element {
  // Constructor (optional)
  constructor() {
    super();  // Always call super()
    this.value = 0;
  }

  // Called when attached to DOM
  componentDidMount() {
    // Setup timers, subscriptions
    // DOM methods are available here
  }

  // Called before removal from DOM
  componentWillUnmount() {
    // Cleanup resources (clear timers, etc.)
  }

  // Event handlers (special syntax)
  ["on click at button"]() {
    this.value++;
    this.componentUpdate({ value: this.value });
    this.requestPaint();  // Trigger paintContent repaint
  }
}

// Usage in other modules:
// import { MyWidget } from "my-widget.js";
```

**CSS prototype attachment (alternative):**
```css
/* Attach component via CSS prototype */
my-widget {
  prototype: MyWidget url(my-widget.js);
}
```

### Custom Painting with paintContent()

Implement immediate mode rendering using Graphics API:

```js
class AnimatedWidget extends Element {
  angle = 0;
  _animationId = null;

  componentDidMount() {
    // Use standard Web API for animation
    const animate = () => {
      this.angle += 0.05;
      this.requestPaint();  // Schedule repaint
      this._animationId = requestAnimationFrame(animate);
    };
    this._animationId = requestAnimationFrame(animate);
  }

  componentWillUnmount() {
    // Clean up animation
    if (this._animationId !== null) {
      cancelAnimationFrame(this._animationId);
    }
  }

  // Paint layers available:
  paintBackground(gfx) { /* Draw behind background */ }
  paintContent(gfx) { /* Draw on top of background - MOST COMMON */ }
  paintForeground(gfx) { /* Draw on top of content */ }
  paintOutline(gfx) { /* Draw on top of everything */ }

  paintContent(gfx) {
    const { width, height } = this.box("client");

    gfx.save();
    gfx.translate(width / 2, height / 2);
    gfx.rotate(this.angle);

    gfx.fillStyle = Color.rgb(0.2, 0.6, 1.0);
    gfx.fillRect(-50, -50, 100, 100);

    gfx.restore();
  }
}
```

**Key paintContent patterns:**
- Always call `this.requestPaint()` to schedule repaint
- Use `this.box("client")` (or `"inner"`) for element size — returns a `Rect` with `width`/`height` properties. (Note: `"dimension"` is NOT a valid `element.box()` boxType — that value belongs to the separate `element.state.box(what, boxOf, ...)` method, which returns a `[width, height]` array instead.)
- Use `gfx.save()` / `gfx.restore()` for transformations
- Combine with Reactor for hybrid components

### Element.box() - Getting Element Metrics

The `Element.box()` method returns geometric information about elements:

```js
element.box(boxType[, relativeTo[, asPpx]]) : Rect
// Returns: Graphics.Rect object with properties [x, y, width, height]
```

**boxType** (first argument) - defines which metric to return:

| boxType | Description |
|---------|-------------|
| `"inner"` | Inner box of the element (content area) |
| `"border"` | Border box (including borders) |
| `"padding"` | Padding box |
| `"margin"` | Margin box |
| `"client"` | Client/scrollable area (padding minus scrollbars) |
| `"content"` | Content outline (scrollable content size) |
| `"caret"` | Caret position (if any) |
| `"icon"` | Position of foreground image |
| `"scroll"` | Projection of client rect on content box |

**relativeTo** (second argument, optional) - coordinate system:

| relativeTo | Description |
|------------|-------------|
| `"self"` | (default) Relative to the element itself |
| `"parent"` | Relative to DOM parent |
| `"document"` | Relative to root document |
| `"window"` | Relative to window client area |
| `"screen"` | Absolute screen coordinates |
| `"container"` | Relative to nearest positioned container |
| `Element` | Relative to specific element reference |

**asPpx** (third argument, optional) - if `true`, returns screen/physical pixels instead of CSS DIPs

```js
// Get element size (Rect has x/y/width/height properties)
const { width, height } = this.box("inner");

// Get position relative to document
const { x, y, width, height } = this.box("inner", "document");

// Get absolute screen position in physical pixels
const rect = this.box("border", "screen", true);
```

**Debugging gotcha:** `JSON.stringify(element.box(...))` prints `{}` — the returned
`Rect`'s `x`/`y`/`width`/`height` aren't enumerable own properties, so `JSON.stringify`
sees nothing even though `rect.width` etc. read back fine directly. If you're logging
box metrics while debugging a layout issue (e.g. dumping them into an on-page `<pre>`
since `console.log` doesn't reliably reach the terminal outside the Inspector — see
`@debug` module notes), destructure the fields yourself
(`` `${rect.x},${rect.y},${rect.width}x${rect.height}` ``) or use `element.state.box()`
below instead, which returns a plain array that serializes correctly.

### Element.state.box() - Array-shaped Metrics (Different Method!)

`element.state.box()` is a **separate** method from `element.box()` above — different signature, different return shape. It's the one used throughout the real samples for quick tuple destructuring:

```js
element.state.box(what, boxOf[, relativeTo[, asPpx]]) : Array
```

- `what` (first argument) - shape of the returned array: `"xywh"` → `[x,y,w,h]`, `"rect"` → `[x0,y0,x1,y1]`, `"position"` → `[x,y]`, `"dimension"` → `[width,height]`, `"left"|"right"|"top"|"bottom"|"width"|"height"` → single number
- `boxOf` (second argument, **required**) - same box vocabulary as `element.box()`'s `boxType`: `"inner"|"border"|"padding"|"margin"|"client"|"content"|"caret"|"icon"`
- `relativeTo`, `asPpx` - same meaning as `element.box()`

```js
// Get element size as [width, height]
const [width, height] = this.state.box("dimension", "inner");

// Get [x, y, width, height]
const [x, y, w, h] = this.state.box("xywh", "border", "window");
```

### Reactor (JSX) Components

Reactor is Sciter's **native** JSX implementation — no transpiler, no preprocessor, no virtual DOM library needed. It is just two built-in features: JSX syntax + `element.patch()`.

> **Key difference from React:** `this` inside a Reactor class component IS the real DOM element (not a React.Component wrapper). You have full DOM API on `this` directly.

#### JSX Basics

```js
// JSX is native syntax, no Babel needed
const vel = <h1 id="hw">Hello, {name}</h1>;

// Equivalent tuple form:
const vel = JSX("h1", { id: "hw" }, ["Hello, ", name]);

// JSX HTML shortcuts:
<input(name) />        // name="name"
<input|text />         // type="text"
<input.search />       // class="search"
<input#lookup />       // id="lookup"
// combinable:
<button|radio(group).first>

// Namespace components: use - instead of .
<App-ComponentA />     // renders App.ComponentA

// JSX is extensible: JSX = m; works for Mithril, etc.
```

#### JSX Special Attributes

```js
// Runtime state (not initial value):
<li state-expanded={isOpen} />          // :expanded pseudo-class
<input|text state-value="John" />       // current value (not default)
<div state-html={someHtmlString} />     // set innerHTML from string

// value= sets INITIAL value (once on create); state-value= sets RUNTIME value

// DOM references:
const nameInput = Reactor.createRef();
<input|text var={nameInput} />
// Later: nameInput.focus()
```

#### Function Components

```js
// Full signature: (props, kids, parent)
// `this` is null for a new element, or existing Element instance for updates
function Welcome(props, kids, parent) {
  return <h1>Hello, {props.name}</h1>;
}

// Component names MUST start with uppercase
const vel = <Welcome name="Ivan" />;
document.body.content(vel);
```

#### Class Components

```js
class Clock extends Element {
  time = new Date();   // initial state as instance field

  // this(props, kids) — called BOTH on initial mount AND on parent re-render
  // Use this to process incoming props uniformly
  this(props, kids) {
    // called before render() on every prop update from parent
  }

  componentDidMount() {
    // Use element.timer() for self-throttling timers tied to element lifetime
    // Return true from callback to keep ticking (no clearInterval needed)
    this.timer(1000, () => {
      this.componentUpdate({ time: new Date() });
      return true;   // keep ticking; return false/nothing to stop
    });
  }

  componentWillUnmount() {
    // timer auto-stops when element removed — no manual cleanup needed
  }

  render() {
    return <div>Time: {this.time.toLocaleTimeString()}</div>;
  }
}
```

> **`element.timer()` vs `setInterval()`:** Prefer `this.timer()` inside class components — it is tied to the element's lifetime (auto-stops on unmount) and a new call replaces the previous timer on the same element.

#### Component Lifecycle

| Method | Triggered by | Notes |
|--------|-------------|-------|
| `constructor(props,kids)` | Element creation | Optional; `super()` required |
| `this(props,kids)` | Initial mount + every parent re-render | Process incoming props here |
| `render(props,kids)` | Initial mount | Has props/kids args |
| `render()` | `componentUpdate()` | No args — store props in `this()` if needed |
| `componentDidMount()` | After DOM attachment | DOM is live; start timers here |
| `componentWillUnmount()` | Before DOM removal | Cleanup |
| `componentDidUpdate()` | After `componentUpdate()`-triggered render | Post-render focus, etc. |

#### State Updates

```js
class Counter extends Element {
  count = 0;

  render() {
    return <div>
      <span>{this.count}</span>
      <button click={() => this.componentUpdate({ count: this.count + 1 })}>+</button>
    </div>;
  }
}
```

`componentUpdate(obj)` does:
1. `Object.assign(this, obj)` — merge data onto element
2. `this.post(() => this.patch(this.render()))` — schedule reconciliation

Multiple `componentUpdate()` calls coalesce into a single render. Sciter also supports a shorthand call syntax:
```js
this.componentUpdate { time: new Date() };  // same as componentUpdate({ time: new Date() })
```

#### Rendering and patch() Reconciliation

```js
// Populate (replaces content)
element.content(<ul><li>A</li><li>B</li></ul>);
element.append(<li>new item</li>);
element.prepend(<li>first item</li>);

// Reconcile (efficient DOM diffing — CORE of Reactor)
element.patch(<div id="root"><h1>Updated</h1></div>);
element.patch(<MyComponent />, true);   // onlyChildren=true: keep root tag/attrs

// patch() match criteria (how it finds what to update vs. what to add/remove):
// 1. same key= attribute
// 2. same id= attribute
// 3. same name= attribute
// 4. same tag name (fallback)
```

#### List Rendering with Keys

```js
function TodoList({ todos }) {
  return <ul>
    {todos.map(todo =>
      <li key={todo.id} status={todo.status}>
        {todo.text}
      </li>
    )}
  </ul>;
}
// Use data IDs as keys, not array indexes (indexes break reconciliation on reorder)
```

#### Event Handler Syntax

```js
class MyComponent extends Element {
  // Basic event — handler receives (event)
  ["on click"](evt) { console.log(evt.x, evt.y); }

  // Delegated — second arg is the matched element
  ["on click at button.close"](evt, btn) { btn.remove(); }

  // :root targets the component element itself
  ["on click at :root"](evt) { }

  // Post event to parent (async, decoupled)
  ["on click at button.search"](evt, btn) {
    this.post(new Event("do-search", { data: this.$("input").value }));
  }
}
```

#### Styles for Components

```js
// Option 1: external CSS styleset (file + set name)
render() {
  return <clock styleset={__DIR__ + "styles.css#clock"}>...</clock>;
}

// Option 2: inline CSS.set tagged template (co-located with component)
const clockStyles = CSS.set`
  :root { flow: vertical; }
  span.time { white-space: nowrap; }
`;

render() {
  return <clock styleset={clockStyles}>...</clock>;
}
```

CSS styleset rules use `:root` to target the component element itself — no global namespace pollution.

#### `<reactor>` HTML Mounting Point

Alternative to JS-only mounting — declare components directly in HTML:

```html
<body>
  <reactor type="Tabs" src="tabs.js">
    <tab name="first" label="First tab">First tab content</tab>
    <tab name="second" label="Second tab">Second tab content</tab>
  </reactor>
</body>
```

The `<reactor>` element is **replaced** by the rendered component in the final DOM. Attributes: `type` = class name, `src` = script URL.

#### Preventing Reconciliation

```js
// Opt out of Reactor's DOM patching for a specific element:
element.state.reconciliation = false;
// Equivalent to shouldComponentUpdate() returning false in React
```

#### Hybrid Components (JSX + Custom Painting)

```js
class Gauge extends Element {
  value = 50;

  render() {
    return <div .gauge>
      <input #slider type="hslider" min="0" max="100" state-value={this.value} />
    </div>;
  }

  componentDidMount() {
    this.on("change at input", (evt, input) => {
      this.componentUpdate({ value: parseInt(input.value) });
      this.requestPaint();
    });
  }

  paintContent(gfx) {
    const [w, h] = this.state.box("dimension", "inner");
    const barH = (this.value / 100) * h;
    gfx.fillStyle = Color.hsv((this.value / 100) * 120, 0.7, 0.9);
    gfx.fillRect(0, h - barH, w, barH);
  }
}
```

## Common Patterns

### Async Operations with Promises

```cpp
class NativePromise : public sciter::om::asset<NativePromise> {
    sciter::value resolver;
    sciter::value rejector;

public:
    sciter::value then(sciter::value r, sciter::value rej) {
        resolver = r;
        rejector = rej;
        return this;
    }

    void resolve(const sciter::value& result) {
        resolver.call(result);
    }
};
```

### Custom Behaviors (C++)

```cpp
struct MyBehavior : public sciter::event_handler {
    virtual bool subscription(HELEMENT he, UINT& event_groups) {
        event_groups = HANDLE_DRAW | HANDLE_TIMER;
        return true;
    }

    virtual void attached(HELEMENT he) { /* ... */ }
    virtual void detached(HELEMENT he) { /* ... */ }
    virtual bool handle_timer(HELEMENT he, TIMER_PARAMS& params) { /* ... */ }
    virtual bool handle_draw(HELEMENT he, DRAW_PARAMS& params) { /* ... */ }

    SOM_PASSPORT_BEGIN_EX(assetInterface, MyBehavior)
        SOM_FUNCS(SOM_FUNC(start))
    SOM_PASSPORT_END
};
```

## Build Configuration

### CMake Requirements

- Minimum CMake 3.20.0
- C++17 standard
- Platform-specific configurations for macOS/Windows

### Required Definitions

```cmake
add_definitions(-DUNICODE -D_UNICODE)
if(LOCALMODE)
    add_definitions(-DLOCAL_MODE)
endif()
```

### Dependencies

```cmake
find_package(spdlog CONFIG REQUIRED)
find_package(fmt CONFIG REQUIRED)
```

### Alternative: gsciter (Universal Browser Project)

For a simpler integration approach, consider using the `gsciter` project pattern from `integrate/gsciter/`:

**Key features:**
- Single source file works across all platforms (Windows, macOS, Linux)
- Resources packaged as compiled archive
- Simple, minimal C++ code (~60 lines)
- Ideal for browser-style applications

**Basic structure:**
```cpp
#include "sciter-x-window.hpp"

class gSciter: public sciter::window {
public:
    gSciter() : window(SW_TITLEBAR | SW_RESIZEABLE | SW_CONTROLS | SW_MAIN) {}
};

int uimain(std::function<int()> run) {
    // Enable features
    ::SciterSetOption(NULL, SCITER_SET_SCRIPT_RUNTIME_FEATURES,
                      ALLOW_FILE_IO | ALLOW_SOCKET_IO | ALLOW_EVAL | ALLOW_SYSINFO);

    // Load resources
    sciter::archive::instance().open(aux::elements_of(resources));

    // Create and load window
    sciter::om::hasset<gSciter> pwin = new gSciter();
    pwin->load(WSTR("this://app/default.htm"));

    return run();
}
```

**When to use gsciter vs full template:**
- **gsciter**: Simple browser-style apps, minimal C++ needs
- **Full template**: Complex native integration, custom behaviors, multiple windows

## Resource Loading

### Local Mode (Development)

Resources loaded from filesystem - use for development:
```cpp
#define LOCAL_MODE
```

### Archive Mode (Production)

Resources compiled into binary:
```cpp
#include "resources.cpp"
sciter::archive::instance().open(aux::elements_of(resources));
appBaseUrl = WSTR("this://app/main.htm");
```

## scapp Mode (Pure HTML/CSS/JS)

scapp is the Sciter engine packaged as a standalone executable. No C++ compilation required.

### Running with scapp

```bash
# Run specific HTML file
scapp main.htm

# With debug inspector
scapp main.htm --debug

# Without arguments - looks for default files in order:
scapp
# Searches for: run.js → scapp.htm → scapp.html → main.htm → main.html → index.htm → index.html
```

### scapp Project Structure

Simple HTML + JS - just two files needed:

```
myapp/
├── main.htm           # Entry point (HTML + CSS + JS)
└── resources/         # Optional: images, fonts, etc.
```

**Or with separate files:**
```
myapp/
├── main.htm
├── styles.css
├── app.js
└── resources/
```

### Entry Point Files (Without Arguments)

When `scapp` is run without arguments, it looks for these files in order:

| File | Mode |
|------|------|
| `run.js` | Bootstrap mode (JS runtime configuration) |
| `scapp.htm` / `scapp.html` | HTML window mode |
| `main.htm` / `main.html` | HTML window mode |
| `index.htm` / `index.html` | HTML window mode |

First file found is used.

### Basic main.htm

```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
    <meta charset="utf-8">
    <style>
        body { flow: vertical; padding: 20dip; font: system; }
        h1 { color: #2c3e50; }
    </style>
</head>
<body>
    <h1>Hello from scapp!</h1>

    <script type="module">
        import * as env from "@env";
        import * as sys from "@sys";

        document.$("h1").textContent = `Hello from ${env.PLATFORM}`;
    </script>
</body>
</html>
```

Run: `scapp` (if named main.htm) or `scapp main.htm`

### scapp vs C++ Mode

| Feature | scapp Mode | C++ Mode |
|---------|-----------|----------|
| Compilation | Not needed | CMake + build required |
| Prototyping | ✅ Fast | ❌ Slower |
| Cross-platform | ✅ Same files work everywhere | ❌ Need per-platform builds |
| Native API | @sys, @env, @sciter modules | Full C++ API |
| Custom behaviors | ❌ JS only | ✅ C++ behaviors |
| Deployment | Copy scapp.exe + files | Custom executable |
| Use for | Web apps, prototypes, tools | System tools, performance-critical |

### Debugging

```bash
# Enable inspector
scapp main.htm --debug
```

```html
<!-- Inspector connection is allowed by default; explicitly opt OUT with: -->
<html disable-debug>
```

**Verification gotchas learned the hard way (screenshot-driven debugging of a real app):**

- **scapp does not hot-reload.** Editing `.htm`/`.css`/`.js` and re-screenshotting the
  *same still-running* window shows stale output. Fully quit the process (not just the
  window) and relaunch after every change you want to verify — `pkill -f scapp` (or
  equivalent) then re-run, don't assume a visible window reflects the file on disk.
- **A layout bug can be window-size-dependent even when it has no business being one.**
  A fix that looks correct in a window you resized larger for convenience (more visible
  slack space) can still be broken at the actual declared `window-width`/`window-height`
  — cross-axis alignment bugs in particular (see the `flow:horizontal`/`vertical`
  "common mistake" notes in `css-reference.md`) can be masked by extra room. Always do
  the final verification pass at the real target window size, not a scaled-up debug
  size.
- **Don't trust eyeballing screenshots for a few-pixel centering question** — crop tight
  and either measure the pixel gap programmatically (e.g. Python/PIL) or, better, read
  the actual box metrics from the page itself (inject a temporary on-page debug `<pre>`
  populated via `element.state.box(...)`, since `console.log` output isn't reliably
  visible outside the Inspector — then remove the debug code once confirmed). Numbers
  settle arguments that crops don't. **Caveat:** low-res/small crops can still fool you
  even when you *are* cropping tight — see the sciter-mcp zoom note below.

### Known Pitfalls (hard-won via sciter-mcp / real-app debugging)

These cost significant back-and-forth to diagnose. Read before spending another round
rediscovering them.

- **`element.box("content", ...)` does NOT tell you whether content is visually
  centered/aligned — do not use it to verify centering.** The "content" box reports the
  extent of the scrollable content, not its final rendered/aligned position within the
  padding box. Concretely: querying it for an `<input>` whose text was genuinely
  top-aligned (not centered) returned `y: 0` relative to the padding box — looked like a
  smoking gun. But querying the *same way* on a `<button>` that was visually confirmed
  (via a tight zoomed screenshot) to be correctly centered returned the **identical**
  `y: 0` / same gap numbers. The metric doesn't move when the real alignment does, so it
  proves nothing either way. If you need to verify vertical/horizontal centering, either
  (a) take a screenshot cropped tight to the element's **border** box (`element.box(
  "border", "window", true)` for coordinates, fed into the snapshot tool's `region`, or
  simpler, its `selector` param) with **zoom ≥ 3–4x** so a few-px offset is actually
  visible — a 20–30px-tall control shown at native size is too small to judge by eye —
  or (b) compare `box("inner", ...)` (the true padding box) against known content
  dimensions, never `box("content", ...)` for this purpose.

- **`line-height: height("100%")` — the dynamic self-referential centering trick used
  internally by `sciter:master-base.css`/`sciter:ux-master.css` for buttons and
  edit-behavior inputs — does not reliably take effect when re-declared from an author
  stylesheet on an `<input>`.** Confirmed by setting it via `element.style` (max
  specificity, should beat every stylesheet rule) and observing the computed line-height
  stay at whatever was inherited instead. No error, no warning — it silently no-ops.
  Don't fight it: use a literal pixel value equal to the element's own explicit `height`
  (e.g. `height: 40px; line-height: 40px;`) instead. This is plain, standard, single-line
  vertical-centering CSS and it works reliably where the Sciter-specific function didn't.

- **A generic `button, input { font: inherit; ... }` reset silently breaks vertical
  centering, because `font` is a shorthand that includes `line-height`.** Master
  stylesheets often center single-line text by tying `line-height` to the box's own
  height (see above). An innocuous-looking author reset that only *looks* like it's
  touching font-family/color will also overwrite that line-height with whatever the
  parent's plain inherited value is — and the mis-centering that results is often only
  a handful of px, easy to miss without the zoomed-screenshot technique above.

- **`padding-right` reserved for an overlaid icon does not reliably stay clear of text
  in `behavior:edit` inputs.** When a value overflows and the edit behavior auto-scrolls
  to keep the (possibly invisible/unfocused) caret in view, that scroll positioning is
  computed against the full padding-box width, not the content-box width — so it ignores
  the `padding-right` reservation and long values can visibly run under a
  `position:absolute` icon overlaid via `right:`/`top:`. Don't rely on padding to keep an
  overlay clear of edit-behavior text. Instead lay the icon out as an ordinary flow
  sibling (e.g. wrap = `flow:horizontal` with border/background, input = borderless
  `width:*` flex child, icon = fixed-width flow child after it) so overlap is
  structurally impossible rather than merely reserved-against.

- **`input.type = "..."` (JS property assignment) does not update the underlying `type`
  content attribute**, so attribute-selector rules like `input[type="password"]` (which
  is what actually attaches `behavior:password`/`behavior:edit` and drives masking) never
  re-match — the input keeps rendering under its *old* type despite `el.type` reading
  back the new value. Use `el.setAttribute("type", "text")` / `getAttribute("type")`
  instead of the `.type` property when you need the visual/behavioral change to actually
  take effect.

---

## URL Schemes

| Scheme | Purpose |
|--------|---------|
| `http://`, `https://` | Remote HTTP resources |
| `file://` | Local file system (memory-mapped) |
| `data://` | Inline data (standard) |
| `home://path` | Relative to sciter.dll / app executable location |
| `this://app/...` | Content of packed sciter archive (packfolder blobs) |
| `sciter:resource` | Resources embedded in Sciter itself (e.g., `sciter:ux-master.css`, `sciter:msgbox.htm`) |
| `res:resource-name` | Windows-only: resources bundled in the app binary |
| `path:...` | CSS inline SVG path image |
| `icon:name` | Stock icon by name (e.g., `icon:right`) |

```css
/* path() and icon() in CSS */
div { background-image: url(path: M 0 0 L 1 1 Z); }
img { src: "icon:right"; }
el { foreground-image: icon(0 0 100 100; M 10,30 A 20,20 0 0 1 60,70 Z); }
```

---

## Reactive Signals (NEW in v5)

Signals are the core reactive primitive in Sciter's Reactor. Components auto-re-render when signals they read change.

`Reactor` is a **global** (like `Window`/`document`), not an importable module — there is no `from "reactor"` or `from "@reactor"` form. Destructure off the global:

```js
const { signal, computed, effect } = Reactor;

// Create signal
const count = signal(0);

// Read / write
count.value;          // read (subscribes current context)
count.value = 1;      // write (triggers observers if changed)
count.peek();         // read WITHOUT subscribing
count.send(value);    // fire unconditionally (even if same value)
count.dispose();      // stop signal

// Derived signal
const doubled = computed(() => count.value * 2);

// Side-effect (auto-subscribes, re-runs on change)
effect(() => console.log(count.value));

// Component-scoped signal (auto-disposed when element removed from DOM)
class Counter extends Element {
  count = this.signal(0);

  render() {
    return <div>
      <span>{this.count.value}</span>
      <button click={() => this.count.value++}>+</button>
    </div>;
  }
}
```

**Signal object properties and methods:**
```js
signal.value          // get/set — fires observers if changed
signal.peek()         // get WITHOUT subscribing
signal.send(value)    // fire unconditionally (even if same value)
signal.dispose()      // stop signal, free all subscriptions
signal.valueElements   // DOM input elements bound to this signal
signal.observingElements  // DOM elements observing this signal
```

**Bidirectional binding with DOM inputs:**
```jsx
const name = signal("World");
<input|text value={name} />   // input drives signal; signal drives input (when not focused)
<p>Hello, {name.value}!</p>
```

**Computed shorthand:** inside `computed()`, signal variables can be used by name (no `.value`):
```js
const fullName = computed(() => `${name} ${surname}`);
// equivalent to:
const fullName = computed(() => `${name.value} ${surname.value}`);
```

**`element.signal()` for functional components** — scoped to element lifetime:
```js
function Counter() {
  const count = this.signal(0);   // auto-disposed when element is removed
  return <div>
    <p>Count: {count}</p>
    <button onclick={() => ++count.value}>click me</button>
  </div>;
}
document.body.append(<Counter />);
```

Reactive components auto-re-render on signal changes — no explicit `componentUpdate()` needed when using signals.

---

## New Runtime Modules (v5)

### BJSON — Binary JSON

```js
import BJSON from "@bjson";

const bjson = new BJSON();
const blob = bjson.pack({ hello: "world" });   // -> ArrayBuffer
bjson.unpack(blob, data => {
  console.assert(data.hello == "world");
});
```

### Zip — Archive Handling

```js
// Open from file or buffer
const zip = Zip.openFile("/path/to/archive.zip" [, password]);
const zip = Zip.open(arrayBuffer [, password]);

// Iterate items
zip.length;
zip.item(index);          // by index
zip.item("path/file");    // by path

for (const item of zip) {
  item.isDir, item.isFile, item.path;
  item.data;              // ArrayBuffer
}

// Mount as virtual URL namespace (very powerful)
const zip = Zip.openData(someArrayBuffer);
zip.mountTo("this://mounts/mypack/");
// Then: <img src="this://mounts/mypack/images/logo.png"> works
```

### Audio

```js
const audio = await Audio.load(url);   // throws "404" if not found

audio.progress  // 0.0..1.0
audio.volume    // 0.0..1.0

await audio.play();   // Promise resolves when playback ends
audio.pause();
audio.resume();
audio.stop();
```

### URL Class (Sciter-Extended)

```js
// Sciter-specific properties on URL instances:
url.filename    // filename part
url.dir         // directory part
url.extension   // file extension

URL.guessMimeType(url)   // guess MIME from extension
URL.fromPath(path)       // file path -> URL string
URL.toPath(url)          // URL string -> file path
```

### Asset Class (Native Objects)

```js
Asset.instanceOf(obj, "ClassName") : bool   // check native asset type
Asset.typeOf(assetObj) : string             // get type name
```

---

## CSS New Features

### @const and @mixin

```css
@const PRIMARY: #2c7be5;
@const BASE-SIZE: 14px;

div { color: @PRIMARY; font-size: @BASE-SIZE; }

@mixin CARD(bg, radius) {
  background: @bg;
  border-radius: @radius;
  padding: 12px;
}
.card { @CARD(white, 8px); }
.dark { @CARD(#333, 8px); }
```

### CSS Scoped Styles via JS (CSS.set)

```js
const styles = CSS.set`
  :root { width: 100px; height: 100px; background: #f0f0f0; }
  :root > span { color: red; }
  :root:hover { background: #e0e0e0; }
`;

render() {
  return <div styleset={styles}><span>Styled</span></div>;
}
```

### @image-map (CSS Sprites)

```css
@image-map icons {
  src: url(icons.png) 120dpi, url(icons@2x.png) 240dpi;
  cells: 10 2;
  items: save, open, close, edit, delete;
}
button.save { background-image: image-map(icons, save); }
```

### Media Query Syntax (Sciter-specific)

Sciter uses JS operators, NOT W3C `and`/`min-width` syntax:

```css
/* CORRECT Sciter syntax: */
@media screen && (width >= 600px) { ... }
@media (ui-ambience == "dark") { ... }
@media Windows { ... }

/* WRONG (browser syntax — does NOT work): */
@media screen and (min-width: 600px) { ... }
```

Built-in media variables: `width`, `height`, `platform`, `os`, `Windows`, `MacOS`, `Linux`, `desktop`, `handheld`, `ui-ambience` (`"dark"`/`"light"`), `high-contrast`, `has-touch-screen`, `has-pen`, `engine-version-major`

---

## Terminal Behavior (NEW in v5)

```html
<terminal rows="24" columns="80"></terminal>
```

```js
const term = document.$("terminal");

term.terminal.write("Hello \x1b[31mWorld\x1b[0m\n");  // ANSI escape codes
term.terminal.read([row, col, maxLen]);                 // read text
term.terminal.resize(rows, cols);
term.terminal.clear();

term.terminal.rows, term.terminal.columns;
term.terminal.caretRow, term.terminal.caretColumn;
```

Events: `"change"` (user input), `"statechange"`, `"bell"`

---

## Lottie Animation (NEW in v5)

```html
<lottie src="animation.json" autoplay loop></lottie>
<lottie src="anim.json">
  <param path="Layer Name" prop="FillColor" value="#ff0000" />
</lottie>
```

```js
const anim = document.$("lottie");

anim.lottie.load("other.json");
anim.lottie.play([firstFrame, lastFrame]);
anim.lottie.stop();
anim.lottie.update("layerPath", "fillColor", Color.rgb(1, 0, 0));

anim.lottie.playing, anim.lottie.speed, anim.lottie.loop;
anim.lottie.frame, anim.lottie.frames, anim.lottie.position, anim.lottie.duration;
anim.lottie.markers;  // [{name, start, end}]
```

Events: `"animationstart"`, `"animationloop"`, `"animationend"`

---

## JSX i18n (Internationalization)

Translation is **zero-runtime-cost** — hooks are called at parse/compile time, not at runtime. Translated strings are baked into bytecode.

```js
// Translatable string literal (hook called at parse time)
const title = @"Settings";

// Translatable element text content
<button @>Submit</button>

// Translatable attribute (@ prefix before attribute name)
<button @title="Submit">X</button>

// Named translation ID (override default ID)
<span @nbottles>{n} bottles</span>

// Translatable JSX text fragment (partial translation)
<caption><@>Hello</>, {name}!</caption>
```

**Translation hooks** (must be defined BEFORE scripts that use `@` markers):

```js
// Static text: attributes, text content, string literals
// type: 0=attribute, 1=element text, 2=string literal
JSX_translateText = function(text, context, type) {
  return myTranslationTable[text] ?? text;
};

// Dynamic text: elements with computed content (plurals, etc.)
// node = ["tag", {attrs}, [children]]; return transformed VNode
JSX_translateNode = function(node, translationId) {
  return JSX("span", {}, [getPlural(translationId, n)]);
};

// Auto-translate these tags without needing @ marker
JSX_translateTags = { "caption": true, "label": true, "button": true };
```

**Translation context** via source comments:
```js
/*@Host meeting*/        // sets JSX_translationContext for following @-literals
let text = @"Host";     // JSX_translateText gets context = "Host meeting"
// Useful when same word has different translations depending on context
```

**Hook loading order** — hooks must exist at compile time:
```html
<head>
  <script type="module" src="i18n/hooks.js" />  <!-- installs hooks FIRST -->
  <script type="module" src="app/main.js" />    <!-- compiled with active hooks -->
</head>
```

**Available inside hook functions:**
- `JSX_translationFileName` — URL of source script file
- `JSX_translationlineNo` — line number of literal
- `JSX_translationContext` — context from `/*@context*/` comment

---

## Additional Element Methods

```js
// Animated content replacement (returns Promise)
await element.replaceContent(JSX, {
  duration: 300ms,
  ease: "ease-in-out",
  effect: "slide-left"
});
// Effects: "blend","blend-atop","slide-top/bottom/left/right",
//          "slide-over-top/bottom/left/right","remove-top/bottom/left/right",
//          "scroll-top/bottom/left/right"

element.flushPaint();              // force immediate synchronous repaint
element.unwrapElement();           // remove self, keep children in parent
element.swapWith(otherElement);    // swap DOM positions

// Post to next event loop turn
element.post(function [, avoidDuplicates]);
element.post(event);

// Self-throttling timer tied to element lifetime
// Return true from callback to keep firing (like setInterval)
// A new call on same element REPLACES the previous timer
element.timer(milliseconds, callback);

// Create element from JSX or tag string
const el = Element.create(<div class="foo">Hello</div>);
const el = Element.create("div");
```

### Element.state Additions

```js
element.state.reconciliation = false;  // opt out of Reactor reconciliation (like shouldComponentUpdate returning false)
element.state.occluded;            // (readonly int) 0=fully visible, 0xf=fully clipped
element.state.flow;                // (readonly string) current layout manager
element.state.visible;             // (readonly bool)
element.state.animationType;       // undefined|"blend"|"transition"|"animation"|"image"

element.state.contentWidths();             // -> [minWidth, maxWidth]
element.state.contentHeight(width);        // -> number
element.state.mapLocalToWindow(x, y);     // -> [xW, yW]
element.state.mapWindowToLocal(xW, yW);   // -> [x, y]
```

---

## Additional Window Methods

```js
Window.this.requestAttention("info"|"alert"|"stop");  // taskbar flash / dock bounce

const id = Window.this.addHotKeyHandler("Ctrl+Shift+P", () => { ... });
Window.this.removeHotKeyHandler(id);

Window.this.state = Window.WINDOW_SHOWN_NA;  // show without activating

Window.share.myKey = "value";       // cross-window shared data storage

Window.elementAt(screenX, screenY); // Element at screen coordinates
Window.ticks();                     // milliseconds since process start

// Broadcast events
Window.post(new Event("app-event", { bubbles: true, data: payload }));  // async
Window.send(new Event("app-event", { bubbles: true, data: payload }));  // sync, stops at first consumer

// Windows 11 Mica effect
Window.this.blurBehind = "light source-desktop";
Window.this.blurBehind = "dark ultra source-desktop";
```

---

## Document API Additions

```js
document.url();                        // document's own URL
document.url("images/logo.png");       // resolve relative URL

// Bind dynamic image for use in CSS
document.bindImage("my://icon/0", someGraphicsImage);
// CSS: div { background-image: url(my://icon/0); }
```

**Document lifecycle order:**

```js
// 1. Synchronous global script code (during SciterLoadFile)
document.ready = function() {
  // 2. After DOM+prototypes loaded — synchronous, window size NOT yet known
};
document.on("ready", function() {
  // 3. Async, after SciterLoadFile returns — window dimensions ARE available
});
// 4. Standard: "DOMContentLoaded", "closerequest", "beforeunload", "unload"
```

---

## scapp Bootstrap Mode (run.js)

When `scapp` finds `run.js` first, it enters **bootstrap mode**. Only `@env`, `@sys`, `@sciter`, and `application` are available — no DOM, no fetch, no timers.

```js
// run.js
import * as env from "@env";

// Select graphics backend (optional, before creating windows)
application.start("gpu");
// Backends: "gpu","raster","direct2d","direct2d-warp","opengl","vulkan","metal"

const mainWin = new Window({
  url: __DIR__ + "main.htm",
  parameters: { theme: "dark" }
});

mainWin.on("close", () => application.quit(0));

const exitCode = application.run();   // blocks until quit
```

---

## Predefined Constants

```js
__FILE__    // URL of the current source file
__DIR__     // directory of the current file (always ends with /)
__FUNC__    // current function name ("<anonymous>", "<eval>", "<script>", "<module>")
__LINE__    // current line number
```

---

## Additional @sciter Module Functions

```js
import * as sciter from "@sciter";

sciter.VERSION;          // "5.0.3.11"
sciter.QUICKJS_VERSION;  // QuickJS engine version

sciter.compress(buffer [, method="lzf"]) : ArrayBuffer
  // methods: "gz","gzip","lzf"
sciter.decompress(buffer [, method="lzf"]) : ArrayBuffer
sciter.crc32(buffer) : integer

sciter.setModuleUrlResolver(fn)
  // fn(name, documentDir, srcDir) : string — custom module URL resolution

sciter.loadLibrary("name")   // load native .dll/.so plugin extension
```

---

## Additional @env Module Functions

```js
import * as env from "@env";

env.domainName()              // network domain name
env.home([relpath])           // path relative to sciter.dll/app exe
env.homeURL([relpath])        // same as URL
env.variable(name)            // getenv()
env.variable(name, value)     // setenv()
env.variable(name, null)      // unsetenv()
env.exec(...args)             // execute process (fire-and-forget)
```

---

## Behaviors Reference (Summary)

> **This section is a summary, NOT exhaustive.** For the full behavior list — including `popup`, `history`, `label`, `clickable`, `time`, `frame-set`, and `menu-bar`, which are NOT covered below — see `assets/behaviors-reference.md` (the authoritative, complete reference).

> **Access pattern:** Behaviors expose their API via a namespace on the element:
> `element.edit.selectAll()`, `element.vlist.navigateTo()`, `element.frame.document`, etc.

---

### behavior:button / behavior:clickable / behavior:hyperlink / behavior:label

**Elements:** `<button>`, `<input type=button|reset|submit>`, toolbar buttons (clickable), `<a href>` (hyperlink), `<label>` (label)

```html
<button>OK</button>
<button type="menu">File ▾</button>   <!-- dropdown trigger -->
<button type="checkbox">Toggle</button>
<button type="radio" name="g">Option</button>
<a href="page.htm" target="@system">Open in OS</a>  <!-- target=@system opens in default app -->
<label for="buddy">Click me</label> <input|text id="buddy">
```

**Events:**
- `"click"` — posted after mouse up / Space key (async)
- `"press"` — synchronous, on mouse down / Space key down

**Notes:** `behavior:clickable` is the non-focusable lightweight variant (used inside `<toolbar>`). `behavior:label` forwards mouse events to its labeled element.

---

### behavior:check / behavior:radio

**Elements:** `<input type="checkbox">`, `<button type="checkbox">` (check); `<input type="radio">`, `<button|radio(group)>` (radio)

```html
<input type="checkbox" name="adult" value="yes" checked>
<input type="checkbox" name="opt" mixed>   <!-- allows null/indeterminate state -->
<input|radio(gender) value="male" checked> Male
<input|radio(gender) value="female"> Female
```

**Attributes:** `checked`, `name`, `value`, `as="string|integer|float|numeric|auto"`, `mixed` (check only)

**Value:** `true/false` (check); `true/false` per element, form gets value of checked radio (radio)

**Events:** `"change"` / `"input"` (state changed, both); `"press"` (synchronous, **check only**); `"click"` (asynchronous, **radio only**)

---

### behavior:slider

**Elements:** `<input type="hslider">`, `<input type="vslider">`, `<input|hslider>`, `<input|vslider>`

```html
<input type="hslider" min="0" max="100" value="50" step="1">
```

**Attributes:** `min`, `max`, `value`, `step`

**Value:** number, current slider position

**Events:** `"change"` / `"input"`

---

### behavior:edit

Single-line text input. Accessible via `element.edit.*`

**Elements:** `<input type="text">`, `<input|text>`

```html
<input|text(username) value="John" maxlength="50" placeholder="Enter name"
       filter="a~zA~Z " readonly spellcheck="yes">
```

**Attributes:** `value`, `size`, `maxlength`, `filter` (e.g. `"a~zA~Z0~9"`, prefix `^` to exclude), `placeholder`, `readonly`, `spellcheck`

**Events:** `"change"` / `"input"` (async), `"changing"` (sync, cancelable — `event.reason`: BY_INS_CHAR=3, BY_INS_CHARS=4, BY_DEL_CHAR=5, BY_DEL_CHARS=6; `event.data` = chars to insert, r/w)

**Value:** string

**API:**
```js
el.edit.selectAll()
el.edit.selectRange(start, end)      // end is exclusive; no args = deselect
el.edit.removeText()                 // delete selection
el.edit.insertText(text)             // replace selection or insert at caret
el.edit.appendText(text)             // append to end

el.edit.selectionStart  // int, caret if no selection
el.edit.selectionEnd    // int
el.edit.selectionText   // string
el.edit.isStandalone    // bool r/w — true: arrow keys always consumed
```

---

### behavior:password

Same as `behavior:edit` but masks input. API via `element.edit.*` (same interface as edit).

```html
<input|password(pwd) maxlength="32" password-char="●">
```

Extra attribute: `password-char="*"` — placeholder character shown instead of typed characters.

---

### behavior:textarea

Multi-line plain text for **small** texts. Accessible via `element.textarea.*`

**Elements:** `<textarea>`

```html
<textarea name="notes" readonly spellcheck="true"></textarea>
```

**API:**
```js
el.textarea.selectAll()
el.textarea.selectRange(start, end)
el.textarea.insertText(text)
el.textarea.appendText(text)
el.textarea.removeText()

el.textarea.selectionStart   // int
el.textarea.selectionEnd     // int
el.textarea.selectionText    // string
```

---

### behavior:plaintext

Multi-line plain text optimized for **large** texts (thousands of lines). Each line is a `<text>` child. Accessible via `element.plaintext.*`

**Elements:** `<plaintext>`

```html
<plaintext readonly spellcheck="false"></plaintext>
```

**Value:** string (lines joined with `\r\n`)

**API:**
```js
// Content
el.plaintext.content            // string r/w, or write array of strings
el.plaintext.lines              // int, line count
el.plaintext[index]             // string, get/set line by index
for (let line of el.plaintext.children) { ... }  // enumerate lines

// Selection
el.plaintext.selectionStart     // [lineNo, pos]
el.plaintext.selectionEnd       // [lineNo, pos]
el.plaintext.selectionText      // string

// Methods
el.plaintext.load(url)
el.plaintext.save(url)
el.plaintext.selectAll()
el.plaintext.selectRange(startLine, startPos, endLine, endPos)
el.plaintext.appendLine(text | lines[])
el.plaintext.insertLine(at, text | lines[])
el.plaintext.removeLine(at [, count])
el.plaintext.update(mutator(tctx) {})  // transactional edit (same tctx as richtext)
```

**Commands** (via `el.execCommand(cmd)`):
```
"edit:cut", "edit:copy", "edit:paste", "edit:selectall", "edit:undo", "edit:redo"
"edit:delete-next", "edit:delete-prev", "edit:delete-word-next", "edit:delete-word-prev"
"edit:insert-break", "edit:insert-text"
"navigate:backward", "navigate:forward", "navigate:word-start", "navigate:word-end"
"navigate:up", "navigate:down", "navigate:line-start", "navigate:line-end"
"navigate:start", "navigate:end"
```

---

### behavior:richtext

WYSIWYG HTML editor. Accessible via `element.richtext.*`

**Elements:** `<htmlarea>`

```html
<htmlarea readonly content-style="editor.css" spellcheck="true">
  <h2>Initial content</h2>
  <p>Edit me...</p>
</htmlarea>
```

**Attributes:** `readonly`, `content-style` (URL of CSS for editor content), `spellcheck`

**Value:** string (HTML content — same as `.html` property)

**API:**
```js
el.richtext.url                          // string r/w, URL of loaded document

el.richtext.load(url)                    // load from file URL
el.richtext.load(html, url)              // load from string/ArrayBuffer
el.richtext.save(fileUrl)                // save to file
el.richtext.loadEmpty()                  // clear to empty document
el.richtext.sourceToContent(html, url, selStart, selEnd)
el.richtext.contentToSource()            // → [html, url, selStart, selEnd]

// Transactional update (single undoable operation)
el.richtext.update(function(tctx) {
  tctx.setAttribute(el, "class", "highlight");
  tctx.setText(textNode, "new text");
  tctx.insertHTML(node, offset, "<b>bold</b>");  // → [node, offset]
  tctx.insertText(node, offset, "text");
  tctx.insertNode(node, offset, newNode);
  tctx.deleteSelection();
  tctx.deleteRange(n1, off1, n2, off2);
  tctx.deleteNode(node);
  tctx.split(node, offset, untilElement);
  tctx.wrap(n1, off1, n2, off2, wrapElement);
  tctx.unwrap(element);
  tctx.setTag(element, "li");
  tctx.removeAttribute(element, "class");
  tctx.execCommand("format:apply-span:b");
  return true;  // commit; return false to discard
});
```

**Commands** (via `el.execCommand(cmd [, params])`):
```
"edit:cut", "edit:copy", "edit:paste", "edit:selectall", "edit:undo", "edit:redo"
"edit:insert-break", "edit:insert-soft-break"
"edit:insert-text", "edit:insert-html"          // params = text/html string
"format:apply-span:b|strong"                    // wrap in tag, remove existing
"format:apply-span:font", {color:"#f00"}        // with attributes
"format:toggle-span:b|strong"                   // toggle wrapping
"format:toggle-list:ul"  / "ol" / "dl"
"format:toggle-pre"
"format:indent", "format:unindent"
"format:morph-block:p"                          // change block tag
"format:unwrap-element:blockquote"
"edit:insert-table-row:before|after"
"edit:insert-table-column:before|after"
"edit:merge-table-cells", "edit:split-table-cells"
"edit:delete-table-rows", "edit:delete-table-columns"
```

**Keyboard shortcuts:** Ctrl+B/I/U for bold/italic/underline; Ctrl+Numpad1–6 → H1–H6; Ctrl+Numpad0 → `<p>`; Ctrl+Numpad7 → `<pre>`; Ctrl+Numpad+/- indent/unindent; Ctrl+NumpadDot → `<ol>`, Ctrl+Numpad* → `<ul>`

---

### behavior:masked-edit

Formatted input with static separators and editable "islands". Accessible via `element.masked.*`

**Elements:** `<input type="masked">`, `<input|masked>`, also used internally by `<input|date>` and `<input|time>`

```html
<input|masked mask="000.000.000.000">   <!-- IP address -->
<input|masked mask="##/##/####">        <!-- date MM/DD/YYYY -->
```

**Mask characters:** `_` = any alphanumeric, `@` = alpha, `#` = numeric, `0` = numeric (zero-padded), other chars = static separators

**Value:** string or array (when mask set programmatically)

**Events:** `"change"` / `"input"`, `"statechange"` (group focus changed)

**API:**
```js
el.masked.selectGroup(group)
el.masked.selectAll()
el.masked.getGroupValue(group?)       // string | number | undefined
el.masked.setGroupValue(group?, value)
el.masked.groupType(group?)           // "_" | "@" | "#" | "0" | "|"

el.masked.groupsCount   // int, read-only
el.masked.currentGroup  // int, read-write
el.masked.value         // array of group values, read-write

// Programmatic mask (more control than mask attribute):
el.masked.mask = [
  { type: "integer", width: 3, min: 0, max: 255, "leading-zero": true }, ".",
  { type: "integer", width: 3, min: 0, max: 255, "leading-zero": true }, ".",
  { type: "text", width: 5, filter: "a~z" },
  { type: "enum", width: 3, items: ["AM", "PM"] }
];
```

---

### behavior:integer / behavior:decimal / behavior:number

Numeric inputs with optional +/- step buttons. Accessible via `element.edit.*` on the internal caption.

```html
<input|integer min="0" max="100" step="1" value="50" placeholder="Enter value">
<input|decimal min="0.0" max="1.0" step="0.1" value="0.5">
<input type="number" min="-999" max="999">
```

**Attributes:** `value`, `min`, `max`, `step` (creates +/- buttons if set), `placeholder` / `novalue`, `readonly`

**Value:** integer / float / undefined

**Events:** `"change"` / `"input"` (async), `"changing"` (sync)

**Note:** Internal `<caption>` has `behavior:edit` — access via `el.$("caption").edit.*`

---

### behavior:select (listbox / tree)

Accessible via `element.select.*`

**Elements:** `<select size="N">`, `<select|list>`, `<select|list multiple>`, `<select|list multiple="checkmarks">`, `<select|tree>`, `<select|tree multiple="checkmarks">`

```html
<select|list>
  <option value="#ff0000" selected>Red</option>
  <option value="#00ff00">Green</option>
</select>

<select|tree>
  <option expanded>
    <caption>Group A</caption>
    <option value="a1">Item A1</option>
    <option value="a2">Item A2</option>
  </option>
</select>
```

**Attributes:** `size`, `name`, `novalue`, `as="auto|integer|float|numeric|string"`, `multiple`, `multiple="checkmarks"`, `treelines`

**Option attributes:** `value`, `selected`, `expanded` (tree group)

**Value:** scalar (single select) or array (multiple select); type per `as` attribute

**Events:** `"change"` (posted), `"changing"` (sync), `"expanded"`, `"collapsed"`

**API:**
```js
el.select.currentOption         // Element r/w, currently selected <option>
el.select.options               // Element, the options container
el.select.optionByValue(val)    // Element | null

// To set current option programmatically:
someOption.execCommand("set-current");
```

---

### behavior:select-dropdown (combobox)

Accessible via `element.select.*`

**Elements:** `<select>` (no size), `<select|dropdown>`, `<select editable>` (editable combobox)

```html
<select placeholder="Pick one">
  <option value="a">Option A</option>
  <option value="b" selected>Option B</option>
</select>

<select editable>
  <option value="cat">Category</option>
</select>
```

**DOM model after init:** `<select> → <caption> + <button> + <popup><option>...</option></popup>`

Individually styleable: `select > caption`, `select > button`, `select > popup`

**Value:** any (always string when `editable`)

**Events:** `"change"` (posted), `"changing"` (sync)

**API:**
```js
el.select.showPopup()
el.select.hidePopup()
el.select.options    // the <popup> element — append options here at runtime:
el.select.options.append(<option value="x">X</option>);
el.value = "x";     // set selected option
```

---

### behavior:form

Aggregates named inputs into a compound value map. Accessible via `element.form.*`

**Elements:** `<form>`

```html
<form action="/submit" method="post">
  <input|text name="username">
  <input|password name="pwd">
  <div name="prefs">               <!-- named group = sub-object -->
    <input|checkbox name="dark" value="yes" checked>
  </div>
  <button type="submit">Login</button>
</form>
```

**Value:** `{ username: "...", pwd: "...", prefs: { dark: "yes" } }`

**Events:** `"submit"` (from submit button), `"reset"` (from reset button), `"change"` / `"input"` (any field changed)

**API:**
```js
el.form.submit()   // POST to action URL
el.form.reset()    // reset all inputs to initial values
el.value           // read/write aggregate object
```

---

### behavior:frame

Loadable sub-document container. Accessible via `element.frame.*`

**Elements:** `<frame>`, `<iframe>`

```html
<frame src="content.htm" history></frame>
<frame content-style="override.css"></frame>
```

**State:** `:busy` during loading

**Events:** `"newdocument"` (loading started), `"complete"` (DOM ready + resources loaded)

**API:**
```js
el.frame.document          // Document, child document root element
el.frame.url               // string r/w, URL of loaded document
el.frame.mediaVars         // object r/w, CSS media variables for the document

el.frame.loadFile(url)
el.frame.loadHtml(html, baseUrl)
el.frame.loadEmpty()
el.frame.saveFile(fileUrl)
el.frame.saveBytes()       // → ArrayBuffer (UTF-8)
```

**History (with `history` attribute):**
```js
el.back()                  // → true if navigated
el.forward()               // → true if navigated
el.length                  // backward depth
el.forwardLength           // forward depth
// Event: "historystatechange"
```

---

### behavior:frameset

Resizable pane container with splitters. Accessible via `element.frameset.*`

**Elements:** `<frameset>`

```html
<frameset cols="200px,*">
  <div id="sidebar">...</div>
  <splitter/>
  <frame id="content" src="main.htm"></frame>
</frameset>
```

**Attributes:** `cols="w1,w2,..."` or `rows="h1,h2,..."` — comma-separated lengths (dip, px, `*` flex)

**API:**
```js
el.frameset.state          // array r/w — current pane sizes (persist/restore UI state)
```

---

### behavior:pager (print preview)

**Elements:** `<frame type="pager">`, `<frame|pager>`

```html
<frame|pager src="document.htm" page-template="template.htm"></frame|pager>
```

**Events:** `"pagination-start"`, `"pagination-end"`, `"pagination-page"` (`event.reason` = page number)

**API:**
```js
el.pager.pages             // int, read-only
el.pager.page              // int, read-write (current page)
el.pager.document          // Document
el.pager.documentName      // string r/w

el.pager.loadFile(docUrl [, templateUrl])
el.pager.loadHtml(html, baseUrl [, templateUrl])
el.pager.printers()        // → [{id, name, shareName, comment, location, isDefault}]
el.pager.selectPrinterDialog()
el.pager.selectDefaultPrinter()
el.pager.selectPrinter(id)
el.pager.print([pageNumbers])  // print all or [1,3,5]
```

---

### behavior:calendar

**Elements:** `<input type="calendar">`, `<input|calendar>`

```html
<input|calendar value="2024-01-15" firstdayofweek="1" mode="days">
```

**Attributes:** `value` (ISO 8601 `YYYY-MM-DD`), `mode` (`"days"` | `"months"` | `"years"` | `"century"`), `firstdayofweek` (0=Sun, 1=Mon…)

**Value:** Date | undefined

**Events:** `"change"` / `"input"`, `"statechange"` (view mode / month / year changed)

**API:**
```js
el.calendar.mode             // string r/w
el.calendar.stepUp([n])      // advance by n (day/month/year/decade per mode)
el.calendar.stepDown([n])
```

---

### behavior:date

Date input with dropdown calendar picker.

```html
<input|date value="2024-01-15" firstdayofweek="1" timezone="local">
```

**Attributes:** `value` (`YYYY-MM-DD`), `timezone` (`"local"` or `"+HH:MM"`), `firstdayofweek`

**Value:** Date | undefined

**Events:** `"change"` / `"input"`

---

### behavior:output

Formatted read-only display. Accessible via element value.

```html
<output|text(price) value="42.50" novalue="N/A">
<output|currency(total) timezone="local">
<output|date(created) timezone="+05:30">
```

**Attributes:** `type` (`"text"` | `"integer"` | `"decimal"` | `"currency"` | `"date"` | `"date-local"` | `"time"` | `"time-local"`), `name`, `value`, `novalue`, `timezone`

**Styling:** gets `:invalid` if value cannot be converted; gets `negative` attribute if numeric value is negative (`output[negative] { color: red; }`)

---

### behavior:progress / behavior:meter

```html
<progress max="100" value="35">
<meter max="1.0" value="0.75">
<!-- No max/value = infinite animation -->
<progress>
```

**Attributes:** `max` (float, default 1.0), `value` (float 0..max)

**Value:** float

---

### behavior:details

Toggle expand/collapse on click of `<summary>` or `<caption>`.

```html
<details open>
  <summary>Click to expand</summary>
  Hidden content here
</details>

<!-- Or on custom elements: -->
<li behavior="details">
  <caption>Title</caption>
  <p>Content</p>
</li>
```

**Attributes:** `open` (or `open="true"`) — initially expanded

**Events:** `"expand"`, `"collapse"` (both posted)

---

### behavior:menu / behavior:menu-bar

```html
<!-- Context/popup menu -->
<menu.context>
  <li id="copy">Copy <span.accesskey>Ctrl+C</span></li>
  <hr>
  <li>Sub-menu
    <menu><li id="sub1">Sub item</li></menu>
  </li>
</menu>

<!-- Menu bar -->
<ul id="menu-bar">
  <li><caption>File</caption>
    <menu>
      <li id="file-new">New <span.accesskey>Ctrl+N</span></li>
    </menu>
  </li>
</ul>
```

Menus are hidden by default. Show with `element.popup(menuEl, params)`.

**States:** `:owns-popup` on owner, `:popup` on menu element when visible

**Events:** `"click"` on menu item (posted)

```js
// Handle menu item clicks:
document.on("click", "menu > li#file-open", function(evt) { ... });
document.on("click", "li#file-new", function(evt) { ... });
```

Use `role="menu-item"` on non-`<li>` elements to make them selectable.

---

### behavior:scrollbar (standalone)

```html
<widget|vscrollbar for="#my-list">
<widget|hscrollbar for="#content">
```

**Attributes:** `for="selector"` — bind to scrollable element as external scrollbar

**Value:** int (slider position)

**Events:** `"change"` (bubbling); also non-bubbling: `"scroll-step-plus"`, `"scroll-step-minus"`, `"scroll-page-plus"`, `"scroll-page-minus"`, `"scroll-slider-press"`, `"scroll-slider-release"`

**API:**
```js
el.scrollbar.values(position, min, max, page, step)  // configure
el.scrollbar.position  // int r/w
el.scrollbar.min, .max, .page, .step  // int read-only
```

---

### behavior:virtual-list

Sliding-window list for large datasets. Accessible via `element.vlist.*`

```css
div.biglist { behavior: virtual-list; overflow-y: scroll; }
/* vertical-align: bottom → initially scrolled to end */
```

**Event: `"contentrequired"`** — must be handled to populate the list:

```js
list.on("contentrequired", function(evt) {
  const { where, start, length } = evt.data;
  // where: 0=replace all, -1=prepend, 1=append
  // Populate 'length' items starting at record index 'start'
  if (where === 0) list.content(renderItems(start, length));
  else if (where === 1) list.append(renderItems(start, length));
  else list.prepend(renderItems(start, length));

  evt.data = {
    morebefore: estimatedItemsBefore,
    moreafter: estimatedItemsAfter
  };
});
```

**API:**
```js
el.vlist.navigateTo(to)         // int | "start"|"end"|"pagenext"|"pageprior"|"itemnext"|"itemprior"
el.vlist.advanceTo(recNo)       // → Element (animated scroll)
el.vlist.scrollBy(pixels)       // → boolean (animated scroll)

el.vlist.firstVisibleItem       // Element
el.vlist.lastVisibleItem        // Element
el.vlist.firstVisibleItemIndex  // int
el.vlist.lastVisibleItemIndex   // int
el.vlist.firstBufferIndex       // int
el.vlist.lastBufferIndex        // int
el.vlist.itemsBefore            // int r/w (update when new records arrive before buffer)
el.vlist.itemsAfter             // int r/w
el.vlist.itemsTotal             // int read-only
el.vlist.slidingWindowSize      // int r/w (set to ~2× visible items count)
```

---

### behavior:expandable-list

Accordion — only one item expanded at a time.

```css
div.accordion { behavior: expandable-list; }
```

```html
<div.accordion>
  <section default>            <!-- default = initially expanded -->
    <caption>Section A</caption>
    <div>Content A</div>
  </section>
  <section>
    <caption>Section B</caption>
    <div>Content B</div>
  </section>
</div>
```

Click on `<caption>` expands its parent item and collapses all others.

**Events:** `"expand"`, `"collapse"` (both posted, `event.target` = list item)

---

### behavior:video

**Elements:** `<video>`

```html
<video src="movie.mp4" sizing="contain">
```

**Attributes:** `src`, `sizing` (`"contain"` default | `"cover"`)

**Events:** `"videoready"` (loaded, size/duration available), `"videostart"`, `"videostop"`

**API:**
```js
el.video.isPlaying      // bool read-only
el.video.isEnded        // bool read-only
el.video.duration       // float, seconds read-only
el.video.position       // float r/w, seconds
el.video.width          // int read-only, natural frame width (screen pixels)
el.video.height         // int read-only
el.video.renderingBox   // [x,y,w,h] relative to content box (x or y can be negative for "cover")
el.video.audioVolume    // float 0.0–1.0 r/w
el.video.audioBalance   // float -1.0–+1.0 r/w

el.video.load(url)
el.video.unload()
el.video.play()
el.video.stop()
```

---

### behavior:lottie (v5)

**Elements:** `<lottie>`

```html
<lottie src="animation.json" autoplay loop></lottie>
<!-- Static parametrization: -->
<lottie src="themed.json">
  <param path="Background" prop="FillColor" value="#1a1a2e" />
  <param path="Icon **" property="StrokeColor" value="#e94560" />
</lottie>
```

**Attributes:** `src`, `autoplay`, `loop`

**Events:** `"animationstart"`, `"animationloop"`, `"animationend"`

**API:**
```js
el.lottie.playing          // bool read-only
el.lottie.speed            // float r/w (1.0=normal, 2.0=2× fast)
el.lottie.loop             // bool r/w
el.lottie.frame            // int r/w, current frame (0..frames-1)
el.lottie.frames           // int read-only, total frames
el.lottie.position         // float r/w, 0.0–1.0
el.lottie.duration         // duration read-only
el.lottie.markers          // [[name, startFrame, endFrame], ...]

el.lottie.load(url)
el.lottie.play([firstFrame, lastFrame])
el.lottie.stop()
// Runtime property override (keyPath supports * and ** wildcards):
el.lottie.update("Layer Name", "FillColor", Color.rgb(1,0,0))
el.lottie.update("**.icon", "StrokeWidth", 2.5)
```

**Lottie property names:** `FillColor`, `FillOpacity`, `StrokeColor`, `StrokeOpacity`, `StrokeWidth`, `TrAnchor` ([x,y]), `TrPosition` ([x,y]), `TrScale` ([x,y] 0–100), `TrRotation` (Angle), `TrOpacity` (0–100)

---

### behavior:terminal (v5)

ANSI terminal emulator. Accessible via `element.terminal.*`

**Elements:** `<terminal>`

```html
<terminal rows="24" columns="80"></terminal>
```

**Attributes:** `rows` (max 3000), `columns` (max 3000; auto-calculated from width if omitted)

**Events:** `"change"` (buffer changed), `"statechange"` (caret moved), `"bell"` (ASCII BEL char `\a`)

**API:**
```js
el.terminal.write(text)               // write text at caret; supports ANSI escape codes
el.terminal.read([row, col, maxLen])  // read from caret or given position
el.terminal.resize(rows, cols)
el.terminal.clear()

el.terminal.rows           // int read-only
el.terminal.columns        // int read-only
el.terminal.caretRow       // int read-only
el.terminal.caretColumn    // int read-only
```

**ANSI codes supported:** cursor movement, colors (SGR), erase to EOL/screen, etc.

### HTML Window Attributes (`<html>` element)

```html
<html
  window-frame="default|transparent|solid|solid-with-shadow|extended"
  window-title="My App"
  window-icon="icon.png"
  window-width="800" window-height="600"
  window-min-width="400" window-min-height="300"
  window-resizable="true" window-minimizable="true" window-maximizable="true"
  window-alignment="5"
  window-blurbehind="auto"
  window-corners="default|not-round|round|round-small"
  window-state="shown|minimized|maximized|hidden|full-screen"
  disable-debug
  lang="en"
>
```
`disable-debug` opts OUT of inspector connections (inspector is allowed by default; there is no `window-debug` attribute).

### `<include>` Element

```html
<!-- Load external HTML fragment, optionally with media condition -->
<include src="sidebar.htm" media="(width > 800px)">
  fallback content
</include>
```
