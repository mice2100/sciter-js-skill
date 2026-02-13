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
| `display: grid` | `flow: grid(...)` / `flow: row(...)` |
| `flex: 1` / `flex-grow` | Flex units: `width: *`, `height: *` |
| `gap` / `justify-content` | `border-spacing: *` or `margin: *` |
| `@media (max-width: 600px)` | `@media width < 600px` (comparison operators) |
| `var(--name)` | Declaration: `var(name): value;` — Usage: `var(name)` (no `--` prefix needed) |
| `calc(100% - 10px)` | Supported, but **cannot** use `*` units inside `calc()` |
| `::placeholder` | `:empty` (styles empty input value) |
| `::-webkit-scrollbar` | Use `vertical-scrollbar: "style-set-name"` |

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
| **Type shortcut** | `<input|text>` = `<input type="text">` |
| **Name shortcut** | `<input(firstName)>` = `<input name="firstName">` |
| **Class shortcut** | `<div.myclass>` = `<div class="myclass">` |
| **ID shortcut** | `<div#myid>` = `<div id="myid">` |
| **Multiple shortcuts** | `<button|radio(group).first>` = `<button type="radio" name="group" class="first">` |
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

#### Placeholder Styling with `:empty`

Use the `:empty` pseudo-class to style empty inputs (similar to placeholder effect):

```css
/* Faint color when input is empty */
input:empty {
  color: var(--color-text-faint);
}

/* Apply to specific input types */
input|text:empty,
input|search:empty {
  color: #999;
}

/* Combine with other selectors */
input:empty:not(:focus) {
  font-style: italic;
}
```

**Note**: Unlike the CSS `::placeholder` pseudo-element, `:empty` targets the actual input value when it's empty — the text color changes when user types.

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

### Layout System (`flow` vs `display`)

Sciter uses **`flow`** for layout management (similar to flex/grid) and **`display`** for visibility/type (block/inline/none).

| Flow Value | Description | Equivalent |
|------------|-------------|------------|
| `flow: vertical` | Children in a column | ~Flex Column |
| `flow: horizontal` | Children in a row | ~Flex Row |
| `flow: vertical-wrap` | Columns wrapping to next line | ~Flex Col Wrap |
| `flow: horizontal-wrap` | Rows wrapping to next line | ~Flex Row Wrap |
| `flow: stack` | Children on top of each other | ~Absolute Position |
| `flow: grid(...)` | ASCII-art grid layout | ~Grid Template |
| `flow: row(...)` | Named columns flow | ~Grid Rows |
| `flow: text` | Text layout (like `<p>`) | Standard Flow |

```css
/* Stack Layout - simpler than absolute positioning */
.overlay-container {
  flow: stack;
  size: *;
}
.background { size: *; }
.foreground { margin: *; /* centered */ }

/* Grid Layout */
.app-layout {
  flow: grid(
    1 1 1,
    2 3 4
  );
  /* 1=header, 2=nav, 3=main, 4=aside */
}
```

### Flex Units (`*`)

Flex units distribute **free space** (after fixed/content sizes).

- `*` or `1*`: Equal share of space.
- `2*`: Twice the share.
- `0.5*`: Half share.

**Usage:**
- `width/height`: `width: *`
- `margin`: `margin: *` (centers element), `margin-right: *` (aligns left)
- `padding`: `padding: *`
- `border-spacing`: `border-spacing: *` (gap between children)

### Selectors

#### Shortcuts
| Shortcut | Standard Equivalent |
|----------|---------------------|
| `E#id` | `E[id="id"]` |
| `E.class` | `E[class="class"]` |
| `E|type` | `E[type="type"]` (e.g., `input|text`) |
| `E(name)` | `E[name="name"]` |

#### State Pseudo-classes
Map to `element.state` properties.

| Selector | Description |
|----------|-------------|
| `:active`, `:hover`, `:focus` | Standard interaction states |
| `:checked` | Checked state (radio/checkbox) |
| `:current` | Current item (select option/list item) |
| `:expanded` / `:collapsed` | Tree node / Select option state |
| `:empty` | No children OR empty input value |
| `:invalid` / `:valid` | Input validation state |
| `:busy` | Element is loading (frame/img) |
| `:popup` | Is currently shown as popup |
| `:owns-popup` | Has a popup shown |
| `:owns-focus` | Contains the focus element |
| `:tab-focus` | Received focus via Tab key |
| `:ltr` / `:rtl` | Text direction |
| `:window-root` | The root element of a window |

### Sciter-Specific Properties

| Property | Purpose | Example |
|----------|---------|---------|
| **`behavior`** | Attach native controller | `behavior: button` |
| **`prototype`** | Attach JS Class controller | `prototype: MyClass url(file.js)` |
| **`aspect`** | Attach JS functional aspect | `aspect: MyAspect url(file.js)` |
| `size` | Width & Height shorthand | `size: 100dip`, `size: *` |
| `flow` | Layout manager | `flow: vertical` |
| `foreground` | Foreground layer (image/color) | `foreground: url(icon.svg)` |
| `hit-margin` | Extend click area | `hit-margin: 10dip` |
| `border-shape` | Vector path border/mask | `border-shape: path(...)` |
| `popup-position` | Popup anchor logic | `popup-position: 7 1` (NUMPAD) |
| `content` | Replace content (any element) | `content: attr(value)` |
| `context-menu` | Attach context menu | `context-menu: selector(#menu)` |
| `cursor` | Custom cursor | `cursor: url(cursor.png) 10 10` |
| `layer` | Bitmap caching | `layer: force` |
| `content-isolate` | Style isolation | `content-isolate: isolate` |

### At-Rules & Functions

#### `@media`
Sciter uses JS-like syntax for media queries:
```css
@media width < 800px { ... }
@media platform == "Windows" { ... }
@media theme == "dark" { ... }
```

#### `@const` & `@mixin`
```css
@const PRIMARY: #007bff;
@mixin Box(w, h) { width: @w; height: @h; }

div {
  background: @PRIMARY;
  @Box(100dip, 50dip);
}
```

#### `@set` (Style Sets)
Scoped style modules, essential for components and scrollbars.
```css
@set MyCardStyles {
  :root { background: white; border: 1px solid #ccc; }
  header { font-weight: bold; }
}

div.card { style-set: MyCardStyles; }
```

#### `@image-map`
CSS sprites.
```css
@image-map icons {
  src: url(sprites.png);
  cells: 4 4; /* 4 cols, 4 rows */
  items: edit, delete, open, save;
}
button.edit { background-image: image-map(icons, edit); }
```

#### `@if` / `@else`
Load-time conditional logic.
```css
@if os == "Windows" { ... } @else { ... }
```

#### Functions
- **`path(d-string)`**: Inline vector path.
- **`icon(name)`**: Stock OS icon (e.g., `icon(warning)`).
- **`var(name, default)`**: CSS variable (resolved from hierarchy).
- **`attr(name)`**: Get attribute value (can be used in `content`).
- **`color(name)`** / **`length(name)`**: Typed variable access.

### Scrollbar Styling (via `@set`)

Sciter scrollbars are styled by assigning a style set to `vertical-scrollbar` or `horizontal-scrollbar`.

```css
@set std-scrollbar {
  .base { background: #eee; } /* track */
  .slider { background: #aaa; border-radius: 4px; } /* thumb */
  .slider:hover { background: #888; }
  .prev, .next { display: none; } /* hide buttons */
}

/* Apply to all scrollable elements */
* {
  vertical-scrollbar: std-scrollbar;
  horizontal-scrollbar: std-scrollbar;
}
```

### Video & Lottie

Sciter supports native video and Lottie playback via behaviors:

- **Video**: `<video src="file.mp4" />` (requires platform codecs)
- **Lottie**: `<lottie src="anim.json" />` (use `behavior: lottie`)

Links: [Sciter CSS Map](https://sciter.com/docs/content/css/cssmap.html)

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

// Self-closing is REQUIRED for void elements
<img src="photo.png">      {/* ❌ WRONG: not closed */}
<img src="photo.png" />     {/* ✅ CORRECT: self-closed */}
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

### ⚠️ Component Export Rules

**CRITICAL**: Element-derived components MUST be exported as ES6 modules for use in other files.

```js
// ✅ CORRECT: Export class for module reuse
export class VideoControls extends Element {
  render() { return <div>...</div>; }
}

// ❌ WRONG: Do NOT use registration functions
function registerElement(name, cls) { ... }  // NEVER do this
VideoControls.register("video-controls");      // NEVER do this
window.customElements.define(...);             // NEVER do this
```

**Usage in other modules:**

```js
// Import and use the component
import { VideoControls } from "./video-controls.js";

class App extends Element {
  render() {
    return <VideoControls src="video.mp4" />;
  }
}
```

**Why ES6 exports?**
- Sciter.js uses standard ES6 modules (`import`/`export`)
- No custom registration system exists
- Direct class references enable proper JSX compilation
- Components can be tree-shaken and analyzed statically

### Component Lifecycle Order

**Mounting**: `constructor()` → `this(props,kids)` → `render(props,kids)` → `componentDidMount()`

**Update by parent**: `this(props,kids)` → `render(props,kids)`

**Update by self**: `componentUpdate({...})` → `render()` → `componentDidUpdate()`

**Unmounting**: `componentWillUnmount()`

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
|---------|----------|-------|
| `<button>` | `behavior:button` | Click handler, keyboard support |
| `<input\|checkbox>` | `behavior:check` | `:checked` state, tristate |
| `<input\|radio>` | `behavior:radio` | Radio group with same `name` |
| `<a href>` | `behavior:hyperlink` | Navigation, `target` attribute |
| `<label>` | `behavior:label` | Focus delegation |
| Any element | `behavior:clickable` | Add click/tap support |

### Editors

| Element | Behavior | Key Features |
|---------|----------|-------|
| `<input\|text>` | `behavior:edit` | `el.edit.*` methods, `filter`, `placeholder`/`:empty` |
| `<input\|password>` | `behavior:password` | Same as edit (`el.edit.*`) + char masking |
| `<input\|masked>` | `behavior:masked-edit` | `el.masked.*`, mask: `#`=digit, `_`=any, `@`=alpha |
| `<input\|integer>` | `behavior:integer` | `min`, `max`, `step`, `placeholder`/`:empty` |
| `<input\|decimal>` | `behavior:decimal` | Decimal input with precision |
| `<input\|number>` | `behavior:number` | Numeric with up/down buttons |
| `<textarea>` | `behavior:textarea` | `el.textarea.*`, multi-line text |
| `<plaintext>` | `behavior:plaintext` | `el.plaintext.*`, code editor, load/save |
| `<htmlarea>` | `behavior:htmlarea` | `el.htmlarea.*`, WYSIWYG HTML editor |

### Selects

| Element | Behavior | Key Features |
|---------|----------|-------|
| `<select>` | `behavior:select` | Single/multiple/checkmarks/tree variants |
| `<select\|tree>` | `behavior:select` | Hierarchical `<option>` |
| `<select\|dropdown>` | `behavior:select-dropdown` | `editable`, dropdown popup |

### Date/Time

| Element | Behavior | Notes |
|---------|----------|--------|
| `<input\|calendar>` | `behavior:calendar` | Visual calendar picker |
| `<input\|date>` | `behavior:date` | Date input with masked-edit caption |
| `<input\|time>` | `behavior:time` | Time input |

### Containers

| Element | Behavior | Key Features |
|---------|----------|-------|
| `<form>` | `behavior:form` | `el.form.*`, compound value (JSON map) |
| `<frame>` / `<iframe>` | `behavior:frame` | `el.frame.*`, `loadFile(url)`, `loadHtml(html, url)` |
| `<frameset>` | `behavior:frame-set` | `el.frameset.*`, resizable pane splitter |
| `<details>` | `behavior:details` | `:expanded`/`:collapsed` states |

### Outputs & Animation

| Element | Behavior | Notes |
|---------|----------|-------|
| `<output>` | `behavior:output` | Formatted output (`type`: text/integer/decimal/currency/date/time) |
| `<progress>` | `behavior:progress` | Progress bar (indeterminate if no value) |
| `<meter>` | `behavior:progress` | Static progress |
| `<video>` | `behavior:video` | `el.video.*`, playback control |
| `<lottie>` | `behavior:lottie` | `el.lottie.*`, animation with keyPath props |

### Lists

| Element | Behavior | Key Features |
|---------|----------|-------|
| Any element | `behavior:virtual-list` | `el.vlist.*`, sliding window, `contentrequired` event |
| Any element | `behavior:expandable-list` | Accordion, `:expanded`/`:collapsed` |

### Menus

| Element | Behavior | Notes |
|---------|----------|-------|
| `<menu.popup>` | `behavior:menu` | Popup/context menu, `role="menu-item"` |
| `<ul#menu-bar>` | `behavior:menu-bar` | Horizontal menu bar with dropdown submenus |

### Auxiliary

| Element | Behavior | Notes |
|---------|----------|-------|
| `<widget\|vscrollbar>` | `behavior:scrollbar` | `el.scrollbar.*`, standalone scrollbar |
| `<widget type="terminal">` | `behavior:terminal` | `el.terminal.*`, console emulation |
| `<frame history>` | `behavior:history` | Back/forward navigation |
| `<frame\|pager>` | `behavior:pager` | `el.pager.*`, print/preview |

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

**Asset References** (included with this skill):

- **C++ Integration**: See [cpp-integration.md](./cpp-integration.md) for SOM_PASSPORT, custom behaviors, uimain()
- **Behaviors**: Full behavior reference — see [behaviors-reference.md](./assets/behaviors-reference.md)
- **CSS Reference**: Cheat sheet — see [css-reference.md](./assets/css-reference.md)
- **Reactor Components**: See [reactor-component-reference.md](./assets/reactor-component-reference.md)
- **Runtime API**: See [runtime-api-reference.md](./assets/runtime-api-reference.md)
- **Graphics API**: See [graphics-api-reference.md](./assets/graphics-api-reference.md)
- **Custom Painting**: See [component-painting-reference.md](./assets/component-painting-reference.md)
- **SOM Patterns**: See [som-patterns.md](./assets/som-patterns.md)

---

## Quick Reference Cards

### CSS vs Web Standard — Quick Lookup

| Concept | ❌ Web Standard | ✅ Sciter |
|---------|----------------|-----|
| Layout | `display: flex` | `flow: horizontal`/`vertical` |
| Grid | `display: grid` | `flow: grid(...)` |
| Sizing | `flex-grow` | `width: *` / `width: 0.5*` |
| Media | `@media (max-width: 600px)` | `@media width < 600px` |
| Variables | `--custom: value` | `var(name): value` |

### Critical Sciter Rules

1. **Always self-close** — `<img />`, `<br />`, `<input />` must be explicitly closed
2. **Use `flow` for layouts** — not `display: flex`
3. **Use `dip` for sizing** — device-independent pixels (1/96")
4. **Use `border-spacing: *`** for equal spacing between children
5. **JSX syntax** — use comparison operators: `@media width < 600px` (no parentheses)
6. **Signals over componentUpdate()** — Use `Reactor.signal()` for reactive state
7. **Element references via `var`** — JSX: `<div var={this.myRef}>`
