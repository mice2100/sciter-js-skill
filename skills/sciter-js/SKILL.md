---
name: sciter-js
description: Sciter.js 6.0.3.8 desktop application development. Comprehensive guide covering CSS, JSX/Reactor, Signals, DOM API, @sys/@env/@storage modules, Graphics, all built-in behaviors, scapp mode, C++ integration, i18n, and all Sciter-specific features. For: Sciter.js, Sciter, SciterJS, scapp, usciter, sciter-js-sdk, Sciter UI, Sciter desktop apps, HTML/CSS/JS apps with scapp, Sciter components, Sciter Graphics, Reactor, JSX, Signals, flow layout, flex units, element painting, @storage database, tray icon, FolderView, CSS grid. Supports both pure JS development (with scapp) and C++ integration modes.
---

# Sciter.js Skill

Professional Sciter.js 6.0 desktop application development. Sciter embeds an HTML/CSS/JS engine into native desktop applications. It is **NOT** a browser — many standard Web/Node.js APIs do NOT work.

## CRITICAL: Prohibited Patterns

> **Read this first.** Sciter's engine differs from browsers. Using the wrong APIs will produce silent failures or errors.

### CSS — DO NOT USE these:

| ❌ Web Standard | ✅ Sciter Equivalent |
|----------------|---------------------|
| `display: flex` | `flow: horizontal` / `flow: vertical` |
| `display: grid` | `flow: grid(...)` |
| `flex-grow`, `flex-shrink` | Flex units: `width: *`, `width: 0.5*` |
| `@media (max-width: 600px)` | `@media width < 600px` (comparison operators, no parens) |
| CSS `var(--name)` only | Sciter also supports `var(name):` declaration form |
| CSS `var()` comma syntax | Sciter's `var()` does **NOT** support commas. Use separate declarations: `var(name): value;` |
| `display: none` | `visibility: none` (Sciter equivalent) |
| `rem`, `em` units (for font sizes) | Use `dip` for device-independent pixels |
| CSS `calc()` with flex units | Flex units cannot be used inside calc |
| Standard CSS pseudo-elements only | Sciter-specific pseudo-elements: `::marker`, `::shadow` (block-level) |

### JavaScript — DO NOT USE these:

| ❌ Web/Node.js | ✅ Sciter Equivalent |
|---------------|---------------------|
| `document.getElementById()` | `document.$("#id")` or `document.getElementById()` (both work) |
| `require()` / CommonJS | `import` statements (ES modules only) |
| `fs` (Node.js) | `import * as sys from "@sys"` → `sys.fs.*` |
| `process.env` | `import * as env from "@env"` → `env.variable()` |
| `React.useState()` | `this.componentUpdate()` or `Reactor.signal()` |
| `React.useRef()` | JSX `var` attribute: `<div var={this.myRef}>` |
| `ReactDOM.render()` | `element.patch(<App/>)` or `element.content(<App/>)` |
| `<img>`, `<br>`, `<input>` (self-closing) | Must explicitly close: `<img />`, `<br />`, `<input />` |
| `Node.js streams` | Sciter uses libuv-based @sys module |
| Web standard fetch API | Use Sciter's fetch (has `sync` option) |

### HTML — Sciter Differences:

| Feature | Sciter Syntax |
|---------|--------------|
| **Type shortcut** | `<input\|text>` = `<input type="text">` |
| **Name shortcut** | `<input(firstName)>` = `<input name="firstName">` |
| **Class shortcut** | `<div.myclass>` = `<div class="myclass">` |
| **ID shortcut** | `<div#myid>` = `<div id="myid">` |
| **Multiple shortcuts** | `<button|radio(group).first> = `<button type="radio" name="group" class="first">` |
| **Space after element** | Space is optional after element name (not before `=`), unlike HTML |
| **Custom tags allowed** | `<toolbar>`, `<user-card>`, etc. with custom `style="display:block"` |
| **Attribute events** | Not supported in static HTML; use JSX instead: `<button onclick={...}>` |
| **Numeric input** | Use `<input|text filter="0~9">` instead of `<input|number>` — number input styling is hard to customize |
| **`&platform-cmd;`** | Replaced with `Ctrl/CMD...` in strings |

### HTML Best Practices

#### Numeric Input with Filter

Use `<input|text>` with `filter` attribute for numeric input:

```html
<!-- ✅ CORRECT: Styled numeric input -->
<input|text filter="0~9" id="webServerPort" placeholder="8888">

<!-- ❌ AVOID: Number input styling is hard to customize -->
<input|number id="port" min="0" max="9999">
```

**Filter syntax examples:**
- `filter="0~9"` — allow digits 0-9
- `filter="0~9."` — allow decimal numbers
- `filter="a~z A~Z"` — allow alphabetic characters
- `filter="0~9 a~z"` — allow alphanumeric

---

## Development Modes

### scapp Mode (Pure JS — No C++ Required)

Use scapp as the application host for pure JavaScript development:

```bash
scapp main.htm          # Run directly
scapp main.htm --debug  # With inspector
scapp                   # Auto-finds: run.js → scapp.htm → main.htm → index.htm
```

```
myapp/
├── main.htm           # Entry point
├── css/styles.css     # Sciter CSS
├── js/app.js          # Application logic
└── resources/         # Images, assets
```

**No build step required** — just save files and run.

### C++ Integration Mode

For native system access and custom behaviors. See **cpp-integration.md** for full C++ reference including:
- SOM_PASSPORT macro for C++ interface
- Window class methods: `Window.this.assetInterface.methodName(args)`
- Custom behaviors with `prototype` CSS property
- uimain() and native event handling

---

## CSS System

Sciter's CSS extends standard CSS with desktop-specific features for UI development.

### Flow Layout (Primary Layout System)

Sciter uses `flow` instead of `display: flex/grid`:

```css
/* Single row / column */
.row  { flow: horizontal; }
.col  { flow: vertical; }

/* Wrapping */
.wrap-h { flow: horizontal-wrap; }
.wrap-v { flow: vertical-wrap; }

/* Stacked */
.stack { flow: stack; }

/* Grid — ASCII art layout */
.grid {
  flow: grid(
    1 1 1,
    2 5 3,
    4 4 4 4
  );
}

/* Named rows */
.form { flow: row(label, input select); }

/* Flex Units — Fill Free Space

Flex units distribute **available space** proportionally:

```css
child { width: *; }       /* fill remaining space */
child { width: 0.7*; }     /* 70% of free space */
child { width: 2*; }        /* 2x weight */
child { margin: 0.3* 0.7*; } /* flexible margins */
.parent  { border-spacing: *; }  /* equal spacing between children */
```

**Important**: Flex units (`*`) cannot be used inside `calc()`.

### CSS Units

| Unit | Description | Usage |
|------|-----------|------|
| **px** | Physical pixels (1:1 on 96dpi), same as `ppx` | `width: 100px` |
| **dip** | Device-independent pixels (1/96") - **PRIMARY UNIT** | `width: 8dip` |
| **ppx** | Physical pixels - always 1:1 | `width: 10ppx` |
| **in/cm** | Inches | `width: 2.54in` |
| **%** | Percentage of parent | `width: 50%` |
| **em/rem** | Font relative | `font-size: 1.2em` |
| **vw/vh** | Viewport units | `width: 50vw` |
| *** | Flex unit (equals `1*`) | `size: *` = width & height |

**Width/Height units** (for responsive sizing):

```css
/* Width based on parent */
child { width: width(X%); height: height(Y%); }

/* OR percentage of parent's content-box */
child { width: width(content-box); height: height(content-box); }
```

### CSS @-Rules

#### `@media` — Media Queries (Sciter syntax)

```css
/* Comparison operators, no parentheses */
@media width < 600px { body { font-size: 12pt; } }
@media platform == "Windows" { body { font: system; } }

/* Built-in variables */
@media high-contrast { .card { background: white; color: black; } }

/* Custom variables (set via JS) */
@media viewport == "narrow" { div:nth-child(1n) { clear: after; } }
```

#### `@const` — Named Constants

```css
@const BRAND_COLOR: #3498db;
@const SPACING: 8dip;

button { background: @BRAND_COLOR; padding: @SPACING; }
```

#### `@mixin` — Reusable Style Blocks

```css
@mixin rounded(radius) {
  border-radius: $radius;
  overflow: hidden;
}

.card { @rounded(8dip); background: white; }
```

#### `@if` / `@else` — Compile-time Conditionals

```css
/* Like C preprocessor */
@if platform == "Windows" {
  body { font: system; }
} @else {
  body { font: 12pt "Helvetica Neue"; }
}
```

#### `@image-map` — CSS Sprites

```css
@image-map toolbar-icons {
  src: url(toolbar.png);
  cells: 4 2;
  items: save, open, cut, copy, paste, undo, redo;
}

.save-btn { background-image: image-map(toolbar-icons, save); }
```

Usage:
```css
.button.bold { background-image: image-map(toolbar-icons, bold); }
```

#### `@set` — Style Sets (Scoped Styles)

Named style sets for component scoping:

```css
@set card-styles {
  :root { flow: vertical; padding: 8dip; }
  .title { font-weight: bold; }
}

.card { style-set: card-styles; }
```

Apply via CSS: `.card { style-set: card-styles; }`
Apply via JS/JSX: `CSS.set()` function.

### CSS Variables (`var()`)

Sciter supports CSS variables but with **different syntax** than standard CSS:

```css
/* ✅ CORRECT: Sciter var syntax */
:root {
  var(primary-color): #3498db;
  var(spacing): 8dip;
}

button {
  background: var(primary-color);
  padding: var(spacing);
}

/* ❌ WRONG: Standard CSS comma syntax not supported */
:root {
  --primary-color: #3498db, --spacing: 8dip;
}
```

### Sciter-Specific CSS Properties

| Property | Purpose | Example |
|----------|---------|------|
| `size` | Width/height shorthand | `size: 100dip 50dip` or `size: *` |
| `border-shape` | Custom border shape | `border-shape: path(M 0 0 L10 10 Z)` |
| `foreground-*` | Foreground image layer | `foreground: url(icon.svg)` |
| `hit-margin` | Extend interactive area | `hit-margin: 4dip` |
| `popup-position` | Default popup anchor | `popup-position: 7 1` (NUMPAD) |
| `popup-animation` | Popup appearance effect | `popup-animation: blend 200ms` |
| `context-menu` | Assign context menu | `context-menu: url(menu.htm)` |
| `role` | ARIA-like role | `role: toolbar` |
| `content-isolate` | Prevent style leakage | `content-isolate: isolate` |
| `mapping` | RTL/bidirectional support | `mapping: rtl` |
| `layer` | Force bitmap buffer | `layer: force` |
| `clip-box` | Clip element to box | `clip-box: padding-box` |

### State Selectors (CSS ↔ JS ↔ JSX)

Sciter state pseudo-classes with JS/JSX counterparts:

| CSS Selector | JS Access | JSX State | Notes |
|-------------|-----------|-------|
| `:active` | `el.state.active` | `state-active` | Mouse pressed |
| `:hover` | `el.state.hover` | - | Mouse over (read-only) |
| `:focus` | `el.state.focus` | - | Has focus |
| `:checked` | `el.state.checked` | `:checked={true}` | Toggle state |
| `:disabled` | `el.state.disabled` | `state-disabled` | Grayed out |
| `:readonly` | `el.state.readonly` | `state-readonly` | Read-only |
| `:expanded` | `el.state.expanded` | `:expanded={true}` | Expanded state |
| `:collapsed` | `el.state.collapsed` | - | Opposite of :expanded |
| `:invalid` | `el.state.invalid` | `state-invalid` | Validation failed |
| `:empty` | `el.state.empty` | - | No content |
| `:busy` | `el.state.busy` | `state-busy` | Loading |
| `:current` | `el.state.current` | - | Current item in list |
| `:selected` | `el.state.selected` | - | Selected item |
| `:tab-focus` | `el.state.tabfocus` | Tab focus |
| `:owns-focus` | `el.state.ownsfocus` | Has focused child |

Additional read-only states: `:visible`, `:flow`, `:occluded`, `:popup`, `:owns-popup`, `:drag-over`, `:drag-source`, `:ltr`, `:rtl`, `:window-root`, `:blur-behind`, `:animating`.

### Vector Images — `path()` and `icon()`

Inline SVG paths in CSS for lightweight icons:

```css
/* Inline path */
.icon-arrow { background: path(M 10 5 L10 5 Z) 0 0 10 10; }

/* Icon function */
.expand { background-image: icon(right); }

/* Stock icons */
.close { background-image: icon(close); }
```

---

## JSX & Reactor

**Native JSX** — Sciter has built-in JSX support without build step. No Babel, no Webpack.

### JSX Syntax

```jsx
// Basic element with attributes
const el = <h1 id="hw">Hello, world!</h1>;

// Shorthand attributes
<input|text />           /* type="text" */
<input(name) />            /* name="name" */
<input.search />           /* class="search" */
<input#lookup />          /* id="lookup" */

// Combined shortcuts
<button|radio(group).first>    /* type="radio" name="group" class="first" */

// Self-closing required
<img src="photo.png" />    /* ❌ WRONG */
<img src="photo.png" />       /* ✅ CORRECT */
```

### Reactor Signals (Reactive State)

Signals are observable values for automatic re-rendering:

```js
const { signal, computed, effect } = Reactor;

// Create signal
const count = signal(0);
count.value += 1;              // triggers subscribers

// Computed signal
const doubled = computed(() => count.value * 2);

// Effect (side-effect)
effect(() => console.log(`Count: ${count.value}`));
```

### Class Components

```js
class MyComponent extends Element {
  name = "World";

  // Called on creation AND on parent re-render
  this(props) {
    this.name = props.name || "World";
  }

  // Required - returns JSX
  render(props, kids) {
    return <h1>Hello, {this.name}</h1>;
  }

  // Lifecycle
  componentDidMount() { /* setup */ }
  componentWillUnmount() { /* cleanup */ }

  // State updates
  handleClick() {
    this.componentUpdate({count: this.count + 1});
  }

  // Event handlers (event name syntax)
  ["on click"]() {
    console.log("clicked!");
  }
}
```

### Component Lifecycle Order

**Mounting**: `constructor()` → `this(props,kids)` → `render(props,kids)` → `componentDidMount()`

**Update by parent**: `this(props,kids)` → `render(props,kids)`

**Update by self**: `componentUpdate({...})` → `render()` → `componentDidUpdate()`

**Unmounting**: `componentWillUnmount()` → `componentWillUnmount()`

---

## DOM API

### Element Queries (Sciter shortcuts)

```js
element.$("selector");           // first match (querySelector)
element.$$("selector");          // all matches (querySelectorAll)
element.$p("selector");            // closest ancestor (closest)
element.$o("selector");            // owner (for popups)
element.$is("selector");           // test match (matches)
```

### Element Properties

```js
el.tag;                  // "div", "span"
el.elementIndex;          // index among siblings
el.value;                 // behavior-specific value
el.checked;               // maps to :checked
el.state;                // state object (see State Selectors table)
```

### Element.State (Runtime State Flags)

```js
// Set states (triggers CSS)
el.state.expanded = true;     // → :expanded { ... }
el.state.disabled = true;      // → :disabled { ... }

// Read-only states
el.state.hover;              // mouse over?
el.state.visible;            // is visible?
el.state.focus;              // has focus?

// State methods
el.state.capture(true);       // capture mouse
el.state.pixelsIn("1.2em"); // convert CSS units to pixels
```

### Element Events (jQuery-style)

```js
// Subscribe
el.on("click", handler);
el.on("click", "button.close", handler);  // delegated

// Unsubscribe
el.off("click");
el.off(".my-ns");

// Once
el.once("click", handler);

// Global events (cross-window)
el.onGlobalEvent("app-update", handler);
element.onGlobalEvent("custom-event", handler);
```

### Element — Popups & Airborne

```js
// Show popup
el.popup(<menu>...</menu>, {
  anchorAt: 7,     // NUMPAD position (7=bottom-left of anchor)
  popupAt: 1,      // NUMPAD position on popup (1=top-left)
  animationType: "blend"
});

// Make element float
el.takeOff({
  x: 100, y: 100,
  relativeTo: "screen",
  window: "detached"  // "attached"|"detached"|"popup"
});

// Land back
el.takeOff();
```

### Element — Timers

```js
// Throttle-friendly timer (replaces existing)
el.timer(200, function() {
  // this = element
  return true;  // repeat (interval)
});

// Deferred execution
el.post(function() {
  // this = element
});
```

### Element — Custom Painting

```js
class PaintedElement extends Element {
  paintBackground(gfx) {
    // draw behind content
  }

  paintContent(gfx) {
    // main custom drawing
  }

  paintForeground(gfx) {
    // draw on top of content
  }
}
```

### Element.box() — Geometry

```js
element.box("inner", "self", "document", "window");
```

---

## Window API

### Creating Windows

```js
const win = new Window({
  type: Window.FRAME_WINDOW,
  url: "page.htm",
  caption: "My Window",
  width: 800, height: 600
  alignment: 5,  // NUMPAD: center on screen
  parameters: { data: "passed to window" }
});
```

### Window Properties

```js
Window.this.state;           // WINDOW_SHOWN, WINDOW_HIDDEN, etc.
Window.this.frameType;        // "standard", "solid", "solid-with-shadow", "extended", "transparent"
Window.this.caption;         // title bar text
Window.this.minSize = [w,h]; // min size
Window.this.maxSize = [w,h]; // max size
Window.this.focus;           // element with focus
```

### Window Methods

```js
// File dialogs
const path = Window.this.selectFile({
  mode: "open",
  filter: "HTML Files (*.htm)|*.html|All Files (*.*)|*.*"
});
const folder = Window.this.selectFolder({ caption: "Select folder" });

// Modal dialog
const result = Window.this.modal(<dialog>...</dialog>);
const result = Window.this.modal({ url: "dialog.htm", parameters: data });

// Media variables
Window.this.mediaVar("myvar");           // get/set
Window.this.mediaVars({ myvar: "value" });  // set multiple

// Hotkeys (Windows only)
Window.this.addHotKeyHandler("F5", () => console.log("F5 pressed"));
Window.this.removeHotKeyHandler(id);

// Tray icon
const img = await Graphics.Image.load("icon.svg");
Window.this.trayIcon({ image: img, text: "Tooltip" });
Window.this.trayIcon("remove");
```

---

## Event System

### Event Categories

| Category | Events |
|----------|--------|
| **Mouse** | `click`, `dblclick`, `mousedown`, `mouseup`, `mousemove`, `mouseenter`, `mouseleave`, `wheel` |
| **Keyboard** | `keydown`, `keyup`, `keypress` |
| **Focus** | `focus`, `focusin`, `focusout`, `blur` |
| **Scroll** | `scroll`, `scrollanimationstart`, `scrollanimationend` |
| **Gestures** | `gesture-start`, `gesture-end`, `pan`, `pinch`, `rotation` |
| **Document** | `parsed`, `ready`, `complete`, `close`, `beforeunload`, `unload` |
| **Drag-n-Drop** | `drag`, `dragenter`, `dragleave`, `drop` |

### Event Properties

```js
evt.type;              // "click", "mousedown", etc.
evt.target;            // source element
evt.clientX, evt.clientY; // viewport relative
evt.screenX, evt.screenY;     // screen coordinates
evt.keyCode;            // keyboard key code
evt.ctrlKey, evt.shiftKey, evt.altKey, evt.metaKey;
```

---

## JS Runtime Modules

### Module `@sciter` (Sciter-specific)

```js
import * as sciter from "@sciter";

// DOM queries (document-level)
sciter.$("selector");
sciter.$$("selector");

// Event handling
sciter.on("click", handler);
sciter.off("click");
sciter.once("click", handler);

// Global events
sciter.onGlobalEvent("app-event", handler);

// Synchronous import
const mod = sciter.import("module.js");

// Module URL resolver (NPM-style)
sciter.setModuleUrlResolver((name, docDir, srcDir) => {
  return `${docDir}node_modules/${name}/index.js`;
});

// Value parsing (JSON++)
sciter.parseValue("12px");       // Length
sciter.parseValue("0xFF");         // Integer (hex)
sciter.parseValue("0d2021-12-01"); // Date

// Encoding
sciter.encode(text, "utf-8");    // string → ArrayBuffer
sciter.decode(bytes, "utf-8");   // ArrayBuffer → string

// Compression
sciter.compress(buffer, "gzip");
sciter.decompress(buffer, "gzip");

// Base64
sciter.toBase64(buffer);
sciter.fromBase64(string);

// Hashing
sciter.md5(buffer);
sciter.crc32(buffer);

// Device pixels
sciter.devicePixels(100);  // CSS px → device px

// UUID
sciter.uuid();

// Load library
sciter.loadLibrary("name");
```

### Module `@sys` (Node.js-style I/O)

All async functions return Promises. File system, network, sockets, pipes, processes:

```js
import * as sys from "@sys";

// File operations (async)
const data = await sys.fs.readFile("path.txt");   // → ArrayBuffer
await sys.fs.unlink("path.txt");
await sys.fs.rename("old", "new");
await sys.fs.copyfile("src", "dst");
const entries = await sys.fs.readdir("folder");    // → [{name, type}]
const stat = await sys.fs.stat("path");          // {st_size, st_mtime, ...}

// File operations (SYNC versions - use sys.fs.sync.* or *Sync)
const data = sys.fs.sync.readFile("path.txt");    // or sys.fs.readFileSync()
sys.fs.sync.unlink("path.txt");                // or sys.fs.unlinkSync()
sys.fs.sync.rename("old", "new");             // or sys.fs.renameSync()
sys.fs.sync.copyfile("src", "dst");           // or sys.fs.copyfileSync()
const entries = sys.fs.sync.readdir("folder");   // or sys.fs.readdirSync()
const stat = sys.fs.sync.stat("path");         // or sys.fs.statSync()
sys.fs.sync.mkdir("path");                    // or sys.fs.mkdirSync()
sys.fs.sync.rmdir("path");                    // or sys.fs.rmdirSync()
sys.fs.sync.chmod("path", mode);             // or sys.fs.chmodSync()

// File handles (for random access)
const file = await sys.fs.open("path.txt", "r");
const bytes = await file.read();
await file.write(data);
await file.close();

// File handles (SYNC versions)
const file = sys.fs.sync.open("path.txt", "r");  // or fs.openSync()
const bytes = file.readSync();                     // read data
file.writeSync(data);                             // write data
file.closeSync();                                // close file

// Watching files
const watch = sys.fs.watch("path", (path, events) => {
  // events: 0x01 = rename, 0x02 = change
});
watch.close();

// Path utilities
sys.fs.splitpath("/foo/bar.txt");  // → ["/foo", "bar.txt"]

// Sockets (TCP/UDP)
const socket = new sys.Socket(sys.AF_INET, sys.SOCK_STREAM);
await socket.connect({ip: "127.0.0.1", port: 8080});
await socket.write(data);
const data = await socket.read();
socket.close();

// Spawn processes
const proc = sys.spawn("command", ["arg1", "arg2"]);
proc.stdin, proc.stdout, proc.stderr;  // pipes
proc.kill();

// System info
sys.cwd();           // current directory
sys.homedir();       // user home
sys.tmpdir();        // temp directory
sys.exepath();        // executable path
sys.uname();         // OS info
sys.environ();       // all env vars
sys.getenv("PATH");   // single var
```

### Module `@env` (Environment Variables)

```js
import * as env from "@env";

// Constants
env.OS;          // "Windows-10", "macOS-14.0", etc.
env.PLATFORM;     // "Windows", "OSX", "Linux", "Android"
env.DEVICE;       // "desktop", "mobile"
env.language();    // "en", "zh", etc.
env.userName();    // current user
env.machineName(); // computer name
env.arguments();   // command line args array

// Functions
env.launch("url");           // open in default browser
env.exec("scapp.exe", "main.html");
env.path("desktop");            // Desktop folder
env.path("documents");          // Documents folder
env.home("relpath");            // resolve to sciter.dll location
env.homeURL("relpath");         // same as file:// URL

// Environment variables
env.variable("PATH");           // read
env.variable("MY_VAR", "value"); // set
env.variable("MY_VAR", null);       // unset

// Drives
env.drives();    // → ["C:", "D:"]
```

### Module `@storage` (Persistent Database)

Key-value database with indexing:

```js
import * as Storage from "@storage";

const storage = Storage.open(env.path("documents") + "/app.db");
storage.root = storage.root || {
  usersByName: storage.createIndex("string", true),
  logsByDate: storage.createIndex("date", false)
};

storage.root.usersByName.set("John", {name: "John", age: 30});
const user = storage.root.usersByName.get("John");

storage.registerClass(User);
storage.commit();
storage.close();
```

### Module `@debug` (Developer Tools)

```js
import * as debug from "@debug";

debug.setUnhandledExceptionHandler((err) => {
  console.error(err.stack);
});

debug.callStackAt(0);  // → {functionName, fileName, lineNo, isNative}
```

---

## Graphics API

### Graphics.Image

```js
// Load from URL
const img = await Graphics.Image.load("photo.png");

// Create from drawing function
const img = new Graphics.Image(100, 100, g => {
  g.fillRect(0, 0, 100, 100, #000000);
});

// Save to bytes
img.toBytes("png");

// Pixel color lookup
const color = img.colorAt(50, 50);
```

### Graphics.Text

Text block for measurement and drawing:

```js
const textLayout = new Graphics.Text("Hello World\nLine 2\nLine 3");

// Properties
textLayout.lines;        // number of text lines
textLayout.chars;         // text content (read/write)
textLayout.style;          // CSS styles (read/write)
textLayout.class;          // CSS class name

// Methods for measurement
const [minW, maxW, usedW] = textLayout.width();
textLayout.height(usedH);  // sets used height

// Get line text
const lineText = textLayout.lineChars(lineNo);
```

### Graphics.Path

```js
const path = new Graphics.Path();
path.moveTo(x, y);
path.lineTo(x, y);
path.arc(x, y, r, s, e);
path.closePath();
```

### Color

```js
Color.rgb(1.0, 0, 0);        // RGB (0..255)
Color.hsv(0, 1, 1);          // HSV
Color.hsl(0, 1, 0.5);        // HSL
Color.morph(base, lighten:25%);  // color transformations
```

---

## Built-in Behaviors

Native DOM element controllers attached via CSS `behavior:name`.

### Buttons

| Element | Behavior | Notes |
|---------|----------|
| `<button>` | `behavior:button` | Click handler, keyboard support |
| `<input\|checkbox>` | `behavior:check` | `:checked` state, tristate |
| `<input\|radio>` | `behavior:radio` | Radio group with same `name` |
| `<a href>` | `behavior:hyperlink` | Navigation, `target` attribute |
| `<label>` | `behavior:label` | Focus delegation |
| Any element | `behavior:clickable` | Add click/tap support |

### Editors

| Element | Behavior | Key Features |
|---------|----------|--------|
| `<input\|text>` | `behavior:edit` | `el.edit.*` methods |
| `<input\|password>` | `behavior:password` | Same as edit + `el.masked.*` |
| `<input\|masked>` | `behavior:masked-edit` | Input mask: `#`=digit, `_`=any, `@`=alpha |
| `<input\|integer>` | `behavior:integer` | — | `min`, `max`, `step` |
| `<input\|decimal>` | `behavior:decimal` | — | Decimal input with precision |
| `<input\|number>` | `behavior:number` | — | Numeric with up/down buttons |
| `<textarea>` | `behavior:textarea` | — | Multi-line text |
| `<plaintext>` | `behavior:plaintext` | Multi-line plaintext, syntax highlighting |
| `<htmlarea>` | `behavior:htmlarea` | WYSIWYG HTML editor (full list below) |

### Selects

| Element | Behavior | Key Features |
|---------|----------|--------|
| `<select\|list>` | `behavior:select` | `el.select.*` | `multiple`, `multiple="checkmarks"` |
| `<select\|tree>` | `behavior:select` | Hierarchical `<option>` |
| `<select>` / `<select\|dropdown>` | `behavior:select-dropdown` | `editable`, `showPopup()`, `hidePopup()` |

### Date/Time

| Element | Behavior | Notes |
|---------|----------|--------|
| `<input\|calendar>` | `behavior:calendar` | Visual calendar picker |
| `<input\|date>` | `behavior:date` | Date input with masked-edit caption |
| `<input\|time>` | `behavior:time` | Time input |

### Containers

| Element | Behavior | Key Features |
|---------|----------|--------|
| `<form>` | `behavior:form` | `el.form.*` | Compound value (JSON map) |
| `<frame>` / `<iframe>` | `behavior:frame` | `el.frame.*` | `loadFile(url)`, `loadHtml(html, url)` |
| `<frameset>` | `behavior:frame-set` | — | Resizable frame splitter |
| `<details>` | `behavior:details` | — | Collapsible section |

### Outputs & Animation

| Element | Behavior | Notes |
|---------|----------|--------|
| `<output>` | `behavior:output` | Formatted output, `format` attribute |
| `<progress>` | `behavior:progress` | — | Progress bar |
| `<meter>` | `behavior:progress` | Static progress |
| `<video>` | `behavior:video` | `el.video.*` | Video playback, `src` attribute |
| `<lottie>` | `behavior:lottie` | `el.lottie.*` | Lottie animation |

### Lists

| Element | Behavior | Key Features |
|---------|----------|--------|
| Any element | `behavior:virtual-list` | `el.vlist.*` | Large datasets, `navigateTo()`, `advanceTo()` |
| Any element | `behavior:expandable-list` | — | Collapsible list groups |

### Menus

| Element | Behavior | Notes |
|---------|----------|--------|
| `<menu>` | `behavior:menu` | Context/popup menu |
| `<menu.bar>` | `behavior:menu-bar` | Menu bar with dropdown submenus |

### Auxiliary

| Element | Behavior | Notes |
|---------|----------|--------|
| `<scrollbar>` | `behavior:scrollbar` | Custom scrollbar |
| `<terminal>` | `behavior:terminal` | ANSI terminal. `terminal.write()`, `terminal.resize()` |
| `<details>` | `behavior:details` | — | Collapsible section |

---

## scapp Mode Quick Start

```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
    <style>
        body { flow: vertical; padding: 20dip; font: system; }
        h1 { color: #2c3e50; }
    </style>
</head>
<body>
    <h1>Hello from scapp!</h1>
    <script type="module">
        import * as env from "@env";
        document.$("h1").textContent = `Hello from ${env.PLATFORM}`;
    </script>
</body>
</html>
```

Run: `scapp main.htm --debug`

---

**Asset References**:

- **C++ Integration**: See **cpp-integration.md** for SOM_PASSPORT, custom behaviors, uimain()
- **Behaviors**: Full behavior reference — see individual behavior files in docs/md/behaviors/
- **Storage**: See `docs/md/storage/` for complete database API

---

## Quick Reference Cards

### CSS vs Web Standard — Quick Lookup

| ❌ Web Standard | ✅ Sciter |
|----------------|-----|
| Layout | `display: flex` | `flow: horizontal`/`vertical` |
| Grid | `display: grid` | `flow: grid(...)` |
| Sizing | `flex-grow` | `width: *` / `width: 0.5*` |
| Media | `@media (max-width: 600px)` | `@media width < 600px` |
| Variables | `--custom: value` | `var(name):` + `attr(name):` |

### Critical Sciter Rules

1. **Always self-close** — `<img />`, `<br />`, `<input />` must be explicitly closed
2. **Use `flow` for layouts** — not `display: flex`
3. **Use `dip` for sizing** — device-independent pixels (1/96")
4. **Use `border-spacing: *`** for equal spacing between children
5. **JSX syntax** — use comparison operators: `@media width < 600px` (no parentheses)
6. **Signals over componentUpdate()** — Use `Reactor.signal()` for reactive state
7. **Element references via `var`** — JSX: `<div var={this.myRef}>`
