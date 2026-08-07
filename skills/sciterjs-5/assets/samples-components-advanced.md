# Samples-Mined Patterns: Components, i18n, Theming, Architecture

Real-world idioms extracted from the official `samples.sciter` sample apps — things
the prose reference docs don't spell out. Read alongside `reactor-component-reference.md`
(class components, JSX i18n compile-time hooks) and `css-reference.md` (aspects, style-sets).

## Component Libraries

`components/` shows the two ways to attach a class-based component via `prototype:`:

**Inline class** (`components/basic.htm`) — class defined in the same `<script>`, wired
via `prototype: Main;` (no `url()` needed when the class is already in scope):

```html
<style> main { prototype: Main; } </style>
<script>
class Main extends Element {
  counter = 0;
  componentDidMount() { this.render(); }
  render() {
    this.innerHTML = `<button>inc</button> clicked <span.counter>${this.counter}</span> times`;
  }
  ["on click at button"](evt, button) { ++this.counter; this.render(); }
}
</script>
<main #test/>
```

**External module** (`components/ext-component.htm` + `.js`) — identical class, but
exported from a separate file and referenced with `url()`:

```css
main { prototype: MyComponent url(ext-component.js); }
```
```js
export class MyComponent extends Element { /* same body */ }
```

Takeaway: a reusable "component library" in Sciter.js is just a folder of small `.js`
files each exporting one `Element` subclass, wired into markup purely through CSS
`prototype:` rules — no central registry/import list needed in the HTML itself.

## Data Tables

`tables/column-resizing.htm` — no special "DataTable" component; a plain `<table>` with
built-in `behavior: column-resizer` on `<thead>` for user-resizable columns, and rows
generated as a JSX array and injected via `.content()`:

```css
table > thead { behavior: column-resizer; }   /* user can drag column borders */
table > tbody { size:*; overflow-y: scroll-indicator; }
```
```js
function rows(N) {
  let list = [];
  for (let n = 0; n < N; ++n)
    list.push(<tr><td>{n}</td><td>Item {n}</td><td>status</td></tr>);
  return list;
}
document.$("table>tbody").content(rows(300));
```
Column widths are set per-`<th>` with `style="width:100px"` / `width:*` (flex column);
`flow:table-fixed` on `<table>` keeps layout stable while resizing 300+ rows.

## i18n Resource Files (runtime, non-JSX)

The compile-time `@"..."` / `JSX_translateText` hooks (already documented) are only
**one** i18n mechanism. The samples reveal a completely different, simpler **runtime
aspect-based** convention used for plain-HTML (non-JSX) apps — likely how many real
apps actually localize:

**Pattern (`i18n/basic/`)**: a CSS aspect marks translatable elements; the aspect
function captures the original (English) text as the *dictionary key*, then re-applies
whenever the language changes:

```css
/* lang.css */
.x { aspect: translate url(lang.js) }
```
```js
// lang.js
const translations = {};
let lang, translation = {};

export function setLang(langName) {
  let update = !!lang;
  if (!(langName in translations)) {
    let t = sciter.import(__DIR__ + `lang-${langName}.js`)?.default; // lazy-load per-language file
    translations[langName] = t;
    translation = t;
  } else {
    translation = translations[langName];
  }
  document.attributes["lang"] = lang = langName;
  if (update)
    for (let element of document.$$(".x")) element.translate();  // re-translate all marked elements
}
setLang(document.attributes["lang"] || "en");

export function translate() {           // this = the aspected element; called once on mount
  const key = this.innerText;           // ORIGINAL text is the dictionary key
  this.translate = () => {              // stash a per-element re-translate closure
    const newText = translation[key];
    if (newText) this.innerText = newText;
  };
  this.translate();
}
```

Each language file (`lang-en.js`, `lang-de.js`, ...) is a plain ES module exporting a
flat key→string object as `default`:
```js
// lang-de.js
const translation = { "yes": "Ja", "no": "Nein" };
export default translation;
```

Language files are lazy-loaded on demand via `sciter.import()` (not bundled up front),
and switching language re-walks `document.$$(".x")` calling each element's own
`.translate()` closure — no full page reload needed. `document.attributes["lang"]` is
kept in sync purely so CSS `:lang(xx)` selectors also work (see below).

**CSS-only translation** (`i18n/context-menu-translation.htm`) — for menu/native chrome
text, `:lang()` plus `content:` can replace strings with zero JS:
```css
menu.context li[name="edit:undo"] label:lang(ru) { content: "Отменить"; }
```
Switching is just `document.attributes["lang"] = "ru"`.

### i18n-reactor: the resource-table convention for the JSX compile-time hooks

`i18n-reactor/` shows how the already-documented `JSX_translateText` /
`JSX_translateNode` / `JSX_translateTags` hooks are wired to **actual translation
files** in a real app — the compile-time mechanism docs don't cover this part:

- Translation tables are plain JS **object literals with function values for plurals**,
  loaded via **synchronous fetch + eval** (not `import`), keyed by the untranslated text:
  ```js
  // langs/ru.js
  {
    "{} matches": function(n) {
      if (n == 0) return "Спичечный коробок пуст";
      else if (n == 1) return "В коробке́ только одна спичка";
      else if (n >= 10 && n <= 20) return n + " спичек в коробке́";
      else switch (n % 10) {
        case 1: return n + " спичка в коробке́";
        case 2: case 3: case 4: return n + " спички в коробке́";
        default: return n + " спичек в коробке́";
      }
    },
    "first test": "Первый тест",
    "UI language": "Язык интерфейса",
  }
  ```
  ```js
  // app.htm loader
  function loadTranslation(lang) {
    let table = fetch(__DIR__ + "langs/" + lang + ".js", {sync:true}).text();
    translation = eval("(" + table + ")");
  }
  JSX_translateText = (text) => translation[text] || text;
  JSX_translateNode = (node, translationId) => {
    const handler = translation[translationId];
    if (typeof handler != "function") return node;
    let translatedText = handler(...node[2]);      // pass VNode's children as call args
    return translatedText ? JSX(node[0], node[1], [translatedText]) : node;
  };
  ```
- **Whole-app relanguaging via `<frame>` reload**: the host page (`demo.htm`) has a
  `<select#lang>` and a `<frame src="app.htm">`. On language change it loads the new
  translation table, sets `lang` attribute on the frame, then forces a **full reload**
  of the framed document so the JSX compiler re-runs its translate hooks with the new
  table in scope:
  ```js
  document.on("input", "select#lang", function(evt, select) {
    loadTranslation(select.value);
    const frameEl = document.$("frame");
    frameEl.attributes["lang"] = select.value;
    frameEl.frame.loadFile(frameEl.frame.document.url());   // force reparse/retranslate
  });
  ```
- **Built-in context menu translation** — attach a translating aspect to native context
  menu labels app-wide:
  ```css
  menu.context li label { aspect: MenuItemLabel; }
  ```
  ```js
  globalThis.MenuItemLabel = function() {
    const label = JSX_translateText(this.innerText);
    if (label) this.innerText = label;
  };
  ```
- **Dev tool**: `i18n-reactor/generate-translation-table.htm` is a translation-table
  *generator* — it swaps in different `JSX_translateText`/`JSX_translateNode`
  implementations that just *record* every string encountered (with `fileName`,
  `lineNo`, `context` captured from `JSX_translationFileName` /
  `JSX_translationLineNo` / `JSX_translationContext` globals the compiler sets) and then
  emits a ready-to-fill JS object to the clipboard. Worth mentioning as a technique for
  bootstrapping a translation file from an existing app rather than as a runtime
  pattern.

## Aspects in Practice

`aspects/basic.htm` confirms aspects run once at CSS-match time and can toggle
pseudo-class state on their own element:
```css
section.test { aspect: basicAspect; }
```
```js
function basicAspect() {
  this.innerHTML = "Woo-hoo, aspect is working!";
  this.state.visited = true;   // drives section.test:visited { ... } below
}
```
Parametric aspects (`aspects/parametric-aspect.htm`) confirm named-argument CSS syntax
maps straight to a single `params` object argument:
```css
section:nth-child(1) { aspect: aspectWithParams(foo:1, bar:"veni!") url(parametric-aspect.js); }
```
```js
export function aspectWithParams(params) {         // this = element
  this.innerHTML = `aspect params: ${JSON.stringify(params)}`;
}
```

## Theming

`themes/` demonstrates a full switchable-theme architecture — not just static
`prototype:`/`style-set` CSS, but the runtime plumbing an app needs:

- **Theme = a whole separate CSS file** applied to content via `<frame content-style="...">`,
  switched by reassigning the attribute and forcing a reload of the framed document:
  ```js
  frame.attributes["content-style"] = "android-material/theme.css";
  frame.frame.loadFile(frame.frame.document.url());   // reapply content-style
  ```
- **Light/dark mode** via the already-documented `:theme()` pseudo-class, driven by a
  simple top-level attribute: `document.attributes.theme = "light" | "dark"`, matched
  by `html:theme(light) { background:#fff; }` / `html:theme(dark) { ... }`.
- **Density/compact mode** via a plain attribute selector: `html[ui-size="compact"] { font-size:9pt; }`,
  set with `frame.frame.document.attributes["ui-size"] = "compact"` — note it's set on the
  content **frame's inner document**, not the top-level `document`.
- **A theme file is a self-contained token + style-set package.** `android-material/theme.css`
  defines a full color ramp with `var()` custom properties derived from the OS accent
  color via `morph()`, then overrides built-in style-sets (`@set std-button < std-button-base`)
  to consume those tokens:
  ```css
  html {
    var(accent): #04f;
    var(lighten5): morph(window-accent-color, lighten: 60%);   /* OS accent color-derived ramp */
    var(lighten1): morph(window-accent-color, lighten: 12%);
    var(darken1):  morph(window-accent-color, darken: 3%);
    var(accent1):  morph(window-accent-color, rotate: -20deg);  /* hue-rotated accent variants */
    var(button-face): color(lighten4);
  }
  @set std-button < std-button-base {
    :root { aspect: Ripple url(theme.js); background: color(button-face); }
    :root:not(:disabled).primary { var(button-face): color(accent); }
  }
  ```
  `window-accent-color` is a special color keyword sourced from the OS accent-color
  setting — a whole Material-style palette can be generated from it with `morph()`.
- **Custom paint aspect used purely for a themed visual effect** — `theme.js`'s `Ripple()`
  is a material-design ripple/touch-feedback effect implemented with `paintContent`,
  `requestAnimationFrame`, and `this.style.colorOf("background-color")` to derive the
  ripple color from the element's own themed background — a good template for any
  themeable "decorator" aspect.

## js++ Extensions

- **`<script type="json-plus">` embedded data block** (`js++/json-plus-parsing.htm`) —
  a convention for embedding JSON++ literals directly in markup, parsed at runtime with
  `parseValue` from `@sciter`:
  ```html
  <script type="json-plus" id="data">
    { date: 2022-01-01; length: 12pt; name-extra: 12rad; bigint: 1234n; arr2: 1 2 3 4; }
  </script>
  ```
  ```js
  import { parseValue } from "@sciter";
  let data = parseValue(document.$("#data").innerText);
  // data.date instanceof Date, data.length instanceof Length, data["name-extra"] instanceof Angle
  ```
  Note unquoted keys, bare dates, unit-suffixed numbers (`12pt`, `12rad`), a trailing
  `n` for BigInt, and both `[1,2,3,4]` and bare-space `1 2 3 4` array syntaxes.
- **Length/Duration arithmetic used directly in element code**, not just CSS
  (`js++/length-units.htm`, `duration-units.htm`):
  ```js
  div.style.width = 6cm + 30mm;         // unit arithmetic, result stays a Length
  elTime.timer(1s, () => { ... });      // duration literal in place of a millisecond int
  ```

## Observable Pattern (pre-/alongside Signals)

`observable/` shows a **Proxy-based observable** pattern that predates/coexists with
Signals, built on the third-party `object-observer` library (vendored as-is under
`observable/object-observer/`), wrapped in ~15 lines of glue (`observable/observer.js`):

```js
import { Observable } from 'object-observer/object-observer.js';

class Observer extends Element {
  #data = null;
  constructor(props, kids) {
    super();
    let data = props.data;
    if (!Observable.isObservable(data)) console.error("Observer require Observable object");
    this.#data = data;
    data.observe(changes => { this.componentUpdate() });   // any mutation -> re-render
  }
  get data() { return this.#data; }
}
export { Observable, Observer };
```

Usage — a component subclasses `Observer` instead of `Element`, gets `this.data` as a
live Proxy, and any property write anywhere triggers `componentUpdate()`:
```js
const Data = Observable.from({ greeting: "?" });   // plain object -> deep-observed Proxy
class Application extends Observer {
  render() {
    return <body>
      <input|text value={this.data.greeting} />
      <p>Hello {this.data.greeting}!</p>
    </body>;
  }
  ["on change at input"](evt, input) { Data.greeting = input.value; }  // mutate shared model directly
}
document.body.patch(<Application data={Data}/>);
```
Contrast with Signals: this is coarse-grained (any mutation anywhere on the observed
object triggers a full `componentUpdate()` of every `Observer` watching it — no
fine-grained dependency tracking), and state lives in a plain mutable object rather
than a `Signal()` accessor. Simpler mental model, less efficient for large/frequently-updated trees.

## App Architecture

From `applications.quark/hello-world` (minimal) and `applications.quark/mdview` (real
multi-file app):

- **Minimal app shape**: single `.htm`, `window-icon`/`window-resizable` attributes on
  `<html>`, window centered/sized in `document.ready` via `Window.this.screenBox("workarea","xywh")`
  + `Window.this.move(x,y,w,h)`.
- **Custom-chrome app shape** (`mdview/main.htm`): `window-frame="extended"` + a
  `<header>` containing `role=window-caption` / `role=window-icon` /
  `<window-buttons>` with `role="window-minimize/maximize/close"` children (all
  already documented elsewhere) combined with a **`<frameset>` for the actual app
  layout** — a nav `<frame>` (file tree + search) and a content `<frame
  content-style="content/style.css">` for themeable rendered output, plus a hidden
  overlay `<frame>` used for print preview.
- **Settings persistence module pattern** (`mdview/settings.js`) — a tiny
  publish/subscribe-free registry of "persistable" objects, each with `store(data)` /
  `restore(data)` methods, aggregated into one JSON file:
  ```js
  const list = [];
  export function add(persistable) { list.push(persistable); }
  export async function store() {
    const data = {};
    for (const p of list) p.store(data);
    const file = await sys.fs.open(path, "w+", 0o666);
    await file.write(encode(JSON.stringify(data, null, "  "), "utf-8"));
    file.close();
  }
  export async function init(APP_NAME) {
    path = env.path("USER_APPDATA", APP_NAME + ".json");   // note: 2-arg form, app-specific subfolder/file
    return await restore();
  }
  // window position/size is itself just one registered persistable:
  add({
    store(data) {
      const [x,y,w,h] = Window.this.box("xywh", "border", "screen", true);
      data.window = {left:x, top:y, width:w, height:h};
    },
    restore(data) {
      if (data.window) {
        const x = Math.max(data.window.left, 0);
        const y = Math.max(data.window.top, 0);
        const w = Math.max(data.window.width, 800);
        const h = Math.max(data.window.height, 600);
        Window.this.move(x, y);          // move to monitor
        Window.this.move(x, y, w, h);    // replace on monitor
      }
    },
  });
  // throttled auto-save on move/resize:
  function saveState() {
    if (!document.parentWindow) { Window.this.off(saveState); return; }  // window unloaded, stop
    document.timer(1000, store);   // coalesce rapid move/size events into one write
  }
  Window.this.on("move", saveState).on("size", saveState);
  ```
  `env.path("USER_APPDATA", APP_NAME)` — the two-argument form itself IS documented
  (`env.path(name, [relpath])` in `module-env.md`, `relpath` gets joined onto the folder
  path); it's specifically the value `"USER_APPDATA"` (vs. the documented `"appdata"`)
  that isn't confirmed elsewhere — double check that constant name before relying on it.
- Module boundary convention in `mdview`: one `.js` module per concern (`settings.js`,
  `toc.js`, `pager.js` in `printview/`) imported by a thin `main.js` that wires DOM
  references (`document.$("frame#content")` etc.) to those modules — no framework,
  just ES module imports.

## Lightbox/Modal

`lightbox-dialog/lightbox.js` implements a **from-scratch modal dialog system** using
the low-level windowing/event APIs — genuinely non-obvious since Sciter.js has no
built-in `showModal()`:

- The dialog is a JSX `<dialog>` element **appended into `document.body`** (an overlay
  layer, not a new OS window), with a styleset auto-injected if the caller didn't
  supply one — note the direct manipulation of the JSX VNode's props (`node[1]`) before
  mounting:
  ```js
  export function lightbox(jsxDialog) {
    if (!jsxDialog[1].styleset)
      jsxDialog[1].styleset = __DIR__ + "lightbox.css#dialog";
    document.body.append(jsxDialog);
    var dlg = document.body.lastElementChild;
    ...
  ```
- **Modality is a real blocking loop**, not a Promise/callback — achieved by redirecting
  all input to the dialog subtree and manually pumping the event loop:
  ```js
  var wnd = Window.this;
  var savedFocus = wnd.focus;
  wnd.eventsRoot = dlg;              // restrict event dispatch to the dialog subtree
  while (true) {
    if (dlg.state.collapsed) break;              // dlg.state.collapsed = true signals "done"
    if (wnd.state == Window.WINDOW_HIDDEN) break;
    if (wnd.state == Window.WINDOW_STATE_NA) break;
    wnd.doEvent();                    // pump one event, blocking
  }
  wnd.eventsRoot = null;
  wnd.focus = savedFocus;
  dlg.remove();
  ```
  `lightboxAsync()` is the same setup minus the `while` loop — it just sets
  `wnd.eventsRoot = dlg` and returns a `{close, set onclose}` handle, i.e. non-modal /
  non-blocking, callback-driven close.
- **Result extraction**: OK button reads `dlg.value || dlg.$("form")?.value` (element's
  own composite value first, else the inner `<form>`'s value object); Cancel returns
  `undefined`. Escape/Enter keys are wired to the `#cancel`/`#ok` buttons manually via a
  `keydown` handler.
- **Prevents the host window from closing while a dialog is open** by intercepting
  `closerequest` and collapsing the dialog instead:
  ```js
  Window.this.document.on("closerequest.lightbox", (evt) => {
    dlg.state.collapsed = true;
    evt.preventDefault();
    return true;
  });
  ```
- **CSS**: backdrop effect is a `filter: blur(15px)` + dimmed `foreground-color` on
  `body.dialog-shown`, dialog itself animates in via an `opacity` transition only
  (no `transform` in `lightbox-dialog/lightbox.css`) toggled by a `.shown` class
  added on the next event-loop tick (`dlg.post(() => dlg.classList.add("shown"))`).

## Toast Notifications

`toast-notification/` implements toasts as a **separate transparent OS popup window**,
not an in-page overlay — the more robust approach for notifications that must render
above all app content (or even when the app is minimized):

```html
<!-- toast.htm -->
<html window-frame="transparent">
  <style>
    html { background: transparent; size: max-content; overflow: none; }
    body[state=initial] { transform: translate(0,100%); opacity: 0; }  /* offstage */
    body[state=shown]   { transform: translate(0,0);    opacity: 1; }
    body[state=closed]  { transform: translate(100%,0); opacity: 0; }
    body { transition: transform quad-out 500ms, opacity linear 500ms; }
  </style>
  <script>
    Window.this.show = function(message) {                              // public API called from opener
      const [,,screenX2,screenY2] = Window.this.screenBox("workarea","rect");
      body.$("main").innerText = message;
      const [w,h] = body.state.box("dimension","margin","this",true);   // measure real rendered size
      Window.this.move(screenX2 - w, screenY2 - h);                     // pin to bottom-right of workarea
      body.attributes["state"] = "shown";
      body.timer(5s, () => body.attributes["state"] = "closed");        // auto-dismiss
    };
    body.attributes["state"] = "initial";
  </script>
  <body state="initial"><header>Hello</header><main></main></body>
</html>
```
Opener creates it as a borderless popup and calls the window's own custom `show()` method:
```js
let toastWindow = new Window({ type: Window.POPUP_WINDOW, url: __DIR__ + "toast.htm" });
toastWindow.show("Hello world");
```
Key techniques not covered elsewhere in the skill: `window-frame="transparent"` +
`background: transparent` on `<html>` for a shaped, chrome-less notification surface;
measuring an off-screen-sized element with `state.box("dimension","margin","this",true)`
(the `true` = "as physical pixels") before positioning the window; state-attribute-driven
slide/fade transitions (`initial` → `shown` → `closed`) instead of imperative animation
code; attaching arbitrary public methods (`Window.this.show = ...`) directly onto the
window's document script scope so the opener can call into it after construction.
