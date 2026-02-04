---
name: sciter-js
description: Sciter.js 5.0.3.11 desktop application development. Use for: Sciter.js, Sciter, SciterJS, scapp, usciter, sciter-js-sdk, Sciter UI, Sciter desktop apps, HTML/CSS/JS apps with scapp, Sciter C++ integration, Sciter components, Sciter Graphics, Reactor, JSX, flow layout, flex units, element painting, custom drawing. Features: richtext editor, @storage database, tray icon, FolderView, CSS grid, C++/JS bridging. Supports both pure JS development (with scapp) and C++ integration modes.
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

# Package as standalone
scapp -p myapp main.htm
```

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
virtual bool on_event(HELEMENT he, BEHAVIOR_EVENT_PARAMS& params) {
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

Built-in file browser component for navigating directories:

```js
import * as FolderView from "@sys/fs/folder-view.js";

// Usage in HTML:
// <folder-view path="/path/to/folder" />
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

- **CSS Reference**: See `assets/css-reference.md` for complete Sciter CSS syntax
- **Behaviors**: See `assets/behaviors-reference.md` for all built-in behaviors (richtext, frame, edit, select, etc.)
- **SOM Patterns**: See `assets/som-patterns.md` for advanced SOM_PASSPORT usage
- **Project Template**: See `assets/template/` for complete scaffolding template
- **Runtime API**: See `assets/runtime-api-reference.md` for `@sciter`, `@sys`, `@env`, `@debug`, `@storage` modules
- **Graphics API**: See `assets/graphics-api-reference.md` for Graphics, Color, Path, Image, Brush
- **Component & Painting**: See `assets/component-painting-reference.md` for Element extension and custom painting
- **Reactor/JSX**: See `assets/reactor-component-reference.md` for Reactor components and JSX

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
await sys.fs.writeFile("path", data);
await sys.fs.copyfile("src", "dst");
await sys.fs.readdir("folder");        // -> [{name,type}]
await sys.fs.stat("path");             // File info

// File watching
const watch = sys.fs.watch("path", (path, events) => { });
watch.close();

// TCP socket
const socket = new sys.Socket(sys.AF_INET, sys.SOCK_STREAM);
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
env.drives();            // -> ["C:", "D:"] on Windows
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

// Custom exception handler (override default)
console.reportException = function(err, isPromise) {
  Window.this.modal(<alert>{err.toString()}</alert>);
  return "";
};

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
// Get graphics context
const g = canvas.toPixels();
// OR in element.paintContent(g => { ... })

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
- Use `this.box("dimension")` for element size
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
| `"dimension"` | `[width, height]` - just the size |
| `"xywh"` | `[x, y, width, height]` - position and size |
| `"rect"` | Same as `"xywh"` |

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
// Get element size
const [width, height] = this.box("dimension");

// Get position relative to document
const [x, y, w, h] = this.box("inner", "document");

// Get absolute screen position in physical pixels
const rect = this.box("border", "screen", true);
```

### Reactor (JSX) Components

Reactor is Sciter's native JSX implementation - no transpilation needed:

**Function Component:**
```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

**Class Component:**
```js
class Clock extends Element {
  time = new Date();
  _intervalId = null;

  componentDidMount() {
    // Use setInterval instead of Element.timer()
    this._intervalId = setInterval(() => {
      this.componentUpdate({ time: new Date() });
    }, 1000);
  }

  componentWillUnmount() {
    // Clean up interval
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
    }
  }

  render() {
    return <div>Time: {this.time.toLocaleTimeString()}</div>;
  }
}
```

**Rendering with patch():**
```js
// Initial render
document.body.patch(<Welcome name="World" />);

// Update (efficient DOM diffing)
document.body.patch(<Welcome name="Sciter" />);
```

### Component Lifecycle

| Method | When Called | Purpose |
|--------|-------------|---------|
| `constructor()` | Object creation | Initialize properties |
| `this(props,kids)` | Props/kids received | Process new data |
| `render()` | Update needed | Return JSX virtual DOM |
| `componentDidMount()` | After DOM attachment | Setup timers, subscriptions |
| `componentWillUnmount()` | Before DOM removal | Cleanup resources |
| `componentDidUpdate()` | After componentUpdate() | Post-render adjustments |
| `paintContent(gfx)` | Repaint needed | Custom graphics rendering |

### State Updates

```js
class Counter extends Element {
  count = 0;

  increment() {
    // WRONG: Direct mutation doesn't trigger re-render
    // this.count++;

    // CORRECT: Use componentUpdate
    this.componentUpdate({ count: this.count + 1 });
  }

  render() {
    return <div>
      <span>{this.count}</span>
      <button click={() => this.increment()}>+</button>
    </div>;
  }
}
```

### List Rendering with Keys

```js
function TodoList({ todos }) {
  return <ul>
    {todos.map(todo =>
      <li key={todo.id}>
        {todo.text}
      </li>
    )}
  </ul>;
}
```

### Hybrid Components (JSX + Custom Painting)

```js
class HybridWidget extends Element {
  value = 50;

  render() {
    return <div .hybrid>
      <label>Value: {this.value}</label>
      <input #slider type="hslider" min="0" max="100" value={this.value} />
    </div>;
  }

  componentDidMount() {
    this.$("#slider").on("change", () => {
      this.value = parseInt(this.$("#slider").value);
      this.componentUpdate();
      this.requestPaint();  // Trigger paintContent
    });
  }

  paintContent(gfx) {
    const { width, height } = this.box("dimension");
    const barHeight = (this.value / 100) * height;

    gfx.fillStyle = Color.hsv((this.value / 100) * 120, 0.7, 0.9);
    gfx.fillRect(0, height - barHeight, width, barHeight);
  }
}
```

### Event Handler Syntax

```js
class MyComponent extends Element {
  // Basic event
  ["on click"]() { }

  // Event with parameter
  ["on click"](evt) {
    console.log(evt.x, evt.y);
  }

  // Delegated event (selector)
  ["on click at button.close"]() { }

  // :root selector (component itself)
  ["on click at :root"]() { }

  // Immediate child selector
  ["on click at :root > button"]() { }
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

# Or add to HTML
<html window-debug="true">
```

## Asset References
