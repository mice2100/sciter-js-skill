# Patterns from official samples: windows, popups, menus, docking

Extracted from `samples.sciter/{frameset,popup,splash,tray-icon,window,docking,resizable,tooltips++,menu,msgbox+dialog,native-behaviors,desktop-dom-elements}`. This is a supplement to `dom-html-reference.md` / `behaviors-reference.md` / `SKILL.md` — only patterns not already covered there. Read those first; this file is real-code idioms and gotchas.

## Windows

**Splash screen → main window handoff.** Main window starts hidden (`window-state="hidden"` on `<html>`, and belt-and-suspenders `Window.this.state = Window.WINDOW_HIDDEN` in script), opens a splash `POPUP_WINDOW`, and passes a callback through `parameters` that the splash calls when done to reveal the main window:
```js
// main.htm — starts hidden
new Window({
   url: __DIR__ + "splash.htm",
   type: Window.POPUP_WINDOW,
   alignment: 5,
   parameters: function() { Window.this.state = Window.WINDOW_SHOWN; }
});
```
```js
// splash.htm — counts down via a Reactor component, then calls back and closes itself
componentDidMount() {
   this.timer(1000, ()=>{
      this.componentUpdate({counter: this.counter - 1});
      if (this.counter <= 0) {
        if (typeof Window.this.parameters == "function") Window.this.parameters();
        Window.this.close();
      } else return true; // returning true from a timer callback keeps it ticking
   });
}
```
Splash window itself uses HTML-attribute sizing: `<html window-frame="solid" window-width="640px" window-height="480px">`.

**Extended chrome (`window-frame="extended"`) requires you to draw the titlebar yourself** using specific elements/roles, and platform-specific CSS because macOS draws its own buttons:
```html
<window-header>
  <window-icon role="window-icon" />
  <window-caption role="window-caption">Extended window</window-caption>
  <window-buttons>
    <window-button role="window-minimize"></window-button>
    <window-button role="window-maximize"></window-button>
    <window-button role="window-close"></window-button>
  </window-buttons>
</window-header>
```
```css
@media platform != "OSX" { /* draw full custom titlebar + buttons, use var(accent-color):window-accent-color, height:window-caption-height, width:window-button-width */ }
@media platform == "OSX" { html > window-header > window-buttons { display:none; /* macOS draws its own */ } }
html:owns-focus { border-color: morph(color(accent-color), opacity:50%); }
html[window-state="maximized"] { border-color:transparent; }
html[window-blurbehind] { background:transparent; }
```
Gotcha: `window-button[role="window-close"|"window-maximize"|"window-minimize"]` get their icons from CSS `foreground-image: url(path:...)` (inline SVG-like path syntax), not image files. `window-state` attribute values include `"maximized"` / `"full-screen"` for state-scoped styling.

**`ToolWindow` subclass pattern** — wrap `Window` construction logic (size from vnode props × `devicePixelRatio`, fixed type) in a subclass so callers just do `new ToolWindow(<content/>)`:
```js
export class ToolWindow extends Window {
  constructor(content /* vnode */) {
    const width = (content[1]["window-width"] || 200) * devicePixelRatio;
    const height = (content[1]["window-height"] || 200) * devicePixelRatio;
    super({ url: __DIR__ + "tool-window.htm", type: Window.TOOL_WINDOW,
            width, height, alignment: 9, parameters: content });
  }
}
```
The tool window's own HTML renders `Window.this.parameters` directly as content (`document.body.content(Window.this.parameters)`) and has a `<button role="window-close"/>` that only appears `html:hover` (borderless popup-style close button).

**Virtual desktop / Spaces changes** — `spacechange` fires on `Window.this`; `Window.this.isOnActiveSpace` tells you if the window is on the currently visible desktop. Sample spawns a small "proxy" window on the *new* active space that self-closes as soon as the space changes again:
```js
Window.this.on("spacechange", () => {
  if (!Window.this.isOnActiveSpace) {
    new Window({ url: __DIR__ + "proxy-window/window.htm", width:100, height:100, alignment:9, parameters:"secondary-window" });
  }
});
// inside the proxy window itself:
Window.this.on("spacechange", () => { if (!Window.this.isOnActiveSpace) Window.this.close(); });
```

**Hotkeys, attention, blur-behind (real option combos):**
```js
Window.this.addHotKeyHandler("Control+F8", () => Window.this.modal(<alert>Control+F8!</alert>));
// requestAttention only makes sense once minimized; sample always defers via a timer:
Window.this.state = Window.WINDOW_MINIMIZED;
document.timer(1000, () => Window.this.requestAttention("info"));
// re-requesting attention automatically whenever window leaves minimized state unexpectedly:
Window.this.on("statechange", () => { if (Window.this.state != Window.WINDOW_MINIMIZED) Window.this.requestAttention("stop"); });
```
`blurBehind` value is built by joining three independent radio groups: `[ambience, tone, source].join(" ")` → e.g. `"dark ultra source-desktop"`. Toggling ambience must also flip a `theme` attribute on `<html>` manually — `blurBehind` does not restyle your content automatically:
```js
document.on("change","form",(_,form) => {
  const p = form.value;
  Window.this.blurBehind = [p.ambience, p.tone, p.source].join(" ");
  document.attributes["theme"] = p.ambience == "dark" ? "dark" : "light";
});
```

**`Window.all` / `Window.share`** — enumerate all open windows and share simple data across them:
```js
let allwindows = Window.all.map(w => w.document.url());
Window.share.foo = "BAR"; // any window can read Window.share.foo
```

## Popups & Dialogs

**Anchor/popup reference points are 1-9 numpad layout** (1=bottom-left … 9=top-right; `popupAt` is the point *on the popup* that lands at `anchorAt` *on the anchor*, or at explicit `x,y`):
```js
div.popup(div.$("popup"), { popupAt: 2, x: evt.windowX, y: evt.windowY }); // popup's bottom-center at explicit coords
anchor.popup(popupEl, { anchorAt: 2, popupAt: 8 }); // anchor's bottom-center meets popup's top-center
```
Popup animation options actually used together: `{ anchorAt:9, popupAt:7, animationType:"slide", animationAxis:"horizontal", animationHeading:"start-to-end", animationDuration:100ms }`.

**Popup dismiss/keyboard-nav idiom for a custom editbox dropdown** (`EditPlus` behavior): track the shown popup on `this.pel`, hide via `this.pel.state.popup = false` (not `.remove()`), null it out in `popupdismissed`, and manually route `ArrowDown`/`ArrowUp` between owner and popup:
```js
["on focusout"](evt) { if (this.pel?.state) this.pel.state.popup = false; }
["on popupdismissed at :root"]() { this.pel = null; }
["on keydown at :root"](evt) {
  if (evt.code == "ArrowDown") {
    if (!this.pel) this.showMenu();
    this.pel.state.focus = true;
    this.pel.firstElementChild.state.current = true;
    return true;
  }
}
```
Closing a reference-popup on any click inside it: `document.on("^mouseup", "popup", (evt,popup) => popup.state.popup = false);` (note the `^` sinking-phase prefix so it fires before the popup's own handlers).

**Custom-shaped popups/calltips** are painted, not bordered: assign a JS "aspect" constructor via CSS `aspect: Name(param:value, ...)`, then override `this.paintBackground(gfx)` to draw a `Graphics.Path` (rounded rect + arrow) and `gfx.fill()`. Read the box with `this.state.box("dimension","border")` / `box("rect","border","inner")` inside the paint function, and remember to `gfx.translate(-loff,-toff)` first because paint coords are content-relative. For the popup's actual position, the CSS property is `popup-position: at-bottom|at-top|at-right|at-tail|at-end` (single alignment keyword shorthand) or the two-point form `popup-position: <popup-point> <owner-point>` e.g. `top-center bottom-center`. On menu-owning buttons the equivalent attribute-driven property is `popup-attachment` (see Menus below) — the popup CSS reads that attribute (`this.attributes["popup-attachment"]`) to pick which corner gets the pointer notch, and drop-shadow is done via `gfx.pushLayer("margin-box", "drop-shadow(2px,2px,3px,#0007)")` around the fill.

**Message boxes / custom dialogs via `Window.this.modal(...)`:**
- Built-ins: `Window.this.modal(<info>...</info> | <alert caption="..."> | <error> | <question><content>...</content><buttons><button id="yes" role="default-button">Yes</button><button id="no" role="cancel-button">No</button></buttons></question>)`. Return value from `<question>` is the clicked button's `id`; a `<question>` can embed a real `<form>` with inputs and the resolved value includes form data.
- Custom-styled built-in dialog: `styleset={__DIR__ + "custom.css#alert!"}` — the trailing `!` syntax is confirmed present in the real sample (`msgbox+dialog/message-box.htm:66`), but its exact meaning ("forces override of the built-in styleset rules") is this doc's own inference — no prose doc explains `!`-suffixed styleset anchors, so verify at runtime if it doesn't behave as expected.
- Full custom dialog window: `Window.this.modal({ url: __DIR__ + "dialog.htm", alignment: -8 })` — note the **negative alignment value** is valid (mirrors the corner, per sample: `-8` vs `8`). Sciter's script grammar also allows the object-literal argument to a single-arg call to be written as a bare block, so you'll see this in samples: `Window.this.modal { url: ..., alignment: -8 };` (equivalent to passing `({...})`).
- Inside the dialog itself, `@import url(sciter:msgbox.css)` reuses the stock message-box chrome, structured as `<main#content type="info">...</main><footer#button-bar><button role="default-button">Close</button></footer>`; call `Window.this.close({foo:"foo", bar:42})` to return a structured value to the caller's `modal()`.
- Disable/dim the parent while a dialog is open by toggling a state class, not the window itself: `document.state.disabled = true` before opening, `= false` after `modal()` returns; pair with `html:disabled { foreground-color:rgba(0,0,0,0.3); transition: foreground-color linear 300ms; }`.

## Tray Icon

Full pattern combining `trayIcon()`, a right-click popup **window** (not a DOM popup), and app lifecycle events:
```js
// set / update / remove / query placement — same call, different arg shapes
Window.this.trayIcon({ image: await Graphics.Image.load(__DIR__ + "app.svg"), text: "..." });
Window.this.trayIcon({ text: "updated at: " + new Date() });   // update only
Window.this.trayIcon("remove");
const [x,y,w,h] = Window.this.trayIcon("place");

Window.this.on("trayiconclick", evt => {
  const { screenX, screenY, buttons } = evt.data;
  new Window({
     type: Window.POPUP_WINDOW,
     url: __DIR__ + "trayicon-popup.htm",
     state: Window.WINDOW_HIDDEN,     // create hidden, popup activates itself
     x: screenX, y: screenY,
     alignment: 2                      // window placed on top of x/y
  });
});
```
The popup window (`trayicon-popup.htm`) shows itself and grabs focus on `ready`, then **closes itself as soon as it loses activation** (clicking elsewhere) — this is the standard "tray menu" dismiss pattern:
```js
document.on("ready", () => { Window.this.state = Window.WINDOW_SHOWN; Window.this.activate(true); });
Window.this.on("activate", event => { if (!event.reason) Window.this.close(); return true; });
```
It talks back to the main window via `Window.this.parent` and a bubbling custom event, then closes itself:
```js
document.on("click","li#exit", () => { Window.this.parent.dispatchEvent(new Event("exit"), true); Window.this.close(); });
```
Main window listens for that custom event to actually quit / restore:
```js
Window.this.on("exit", () => { Window.this.trayIcon("remove"); Window.this.close(); });
Window.this.on("reveal", () => { Window.this.state = Window.WINDOW_SHOWN; });
document.on("click","button#hide", () => { Window.this.state = Window.WINDOW_HIDDEN; }); // hide-to-tray, not close
```
Gotcha: the tray popup document sets `menu.popup { visibility:visible; display:block; ... border:none; }` — a `<menu.popup>` used as full-window content (not an actual anchored popup) needs these overrides since `behavior:menu` popups default to `display:none` until shown.

## Menus

`<button|menu>` wraps a `<menu.popup>` child and gets dropdown-button behavior for free — no JS needed to open it:
```html
<button|menu>With menu<menu.popup><li>Veni</li><li>Vidi</li><li>Vici</li></menu></button>
```
Dynamic **context menu**: build the menu in the `contextmenu` handler and assign it to `evt.source`; return `true` to signal you supplied one:
```js
["on contextmenu"](evt) {
  evt.source = Element.create(<menu.context><li>Veni</li><li>Vidi</li><li>Vici</li></menu>);
  return true;
}
```
System/native menu bar: put a `<menu.window>` element in `<head>` (not `<body>`) — this hands the menu to the OS-native window menu instead of rendering an in-page menu bar.

A **menu bar** (`behavior:menu-bar` on the top `<ul>`) can host arbitrary interactive content inside items, not just `<li>` text — radios, checkboxes, sliders, progress bars, `<select>`, and even a `<button>` that opens a dialog, all live inside `<menu>` items in the sample. A table-flow submenu is also valid: `<menu.table><tr><td role="menu-item">1.1</td>...</tr></menu>` with CSS `menu.table { flow:table; }` and `td[role="menu-item"]:current`. `accesskey="^2"` (caret = Ctrl) pairs with a manually-added `<span class="accesskey">Ctrl+2</span>` label — the engine handles the key but you must render the hint text yourself. A `<caption role="window-caption">` can be placed as the last `<li>`-sibling inside the menu-bar `<ul>` to turn the remaining space into a draggable window caption region.

CSS states worth knowing from `menu-bar.css`: `ul#menu-bar > li:owns-popup` / `menu li:hover:owns-popup` (highlight while its submenu is open, vs `:current` for keyboard focus), `menu li:has-child-of-type(menu)` (auto-adds a submenu arrow via `foreground-image:url(stock:arrow-right)`), and `@media (menu-animation-supported) { menu { popup-animation: popup-animation(type:blend, duration:100ms); } }` for feature-detected fade-in.

## Frameset Navigation

The whole `frameset` sample is just nested, arbitrarily-typed panels — any element (not just `<frame>`) can be a frameset child:
```html
<frameset rows="64px,*">
  <frameset cols="64px,*"><div>Framesets can</div><splitter/><div>host</div></frameset>
  <splitter/>
  <frameset cols="2*,1*"><div>any arbitrary DOM element</div><splitter/><section>as a split panels</section></frameset>
</frameset>
```
`min-height:min-content` / `min-width:min-content` on the `frameset`/children prevents panels collapsing past their content's intrinsic size when dragging `<splitter/>`. `<splitter/>` is a self-closing empty element — style it directly (`splitter:hover { background:red; }`) for a drag-affordance highlight.

## Docking & Resizable Panels

The `docking` sample is a full drag-to-dock framework (`docks.js`/`docks.css`) built entirely from documented primitives, but the *combination* is the non-obvious part:

- **Detaching an element into a free-floating "window"** without an OS window: reparent it into a `<popup class="windowed"/>` sibling, add a `.window` class, then `dockable.takeOff({x, y, window:"detached", relativeTo:"screen"})` followed by `dockable.window.performMove()` to hand off to the OS's native move-drag loop immediately (so the user's already-down mouse button drags it).
- **Making a windowed/floating element's whole caption draggable** and its edges resizable by the OS itself requires answering hit-testing yourself via the `mousehittest` event (only meaningful once the element is "airborn"/windowed):
  ```js
  ["on mousehittest"](evt) {
    if (!this.isWindowed) return false;
    evt.data = evt.target.$is("caption>text") ? "caption" : "auto"; // HTCAPTION vs default
    return true;
  }
  ```
- **Detecting drag-to-undock** uses the `mousedragrequest` event (fired once a real drag gesture — not just mousedown — is recognized) on the caption/tab, returning `true` once you've called your own takeoff logic, `false` to let default handling proceed.
- `replacementstart` / `replacementend` fire on a frame while the user is moving/resizing it via its native splitter/chrome; `evt.data` carries a mode string (`"move"` observed) so you can distinguish drag-move from resize.
- `frameset[tabs]` — adding a bare `tabs` attribute to a `<frameset>` turns it into a tab container; pair with a `<header>` of `<caption>` elements using `behavior:radio` for tab switching (`:checked` = active tab), and toggle content via manual DOM append/detach in `switchTab()`, not CSS visibility.
- Reparenting a `<frameset>` that's down to one child: `parent.unwrapElement()` collapses the now-redundant wrapper.
- Dock-target hit testing walks `elementFromPoint` under the cursor and computes marker regions from `dockable.state.box("rect","padding", this)` (box relative to an *arbitrary ancestor element*, not just window/screen) to draw the blue "drop here" overlays in `paintForeground`.
- Layout persistence is DIY: each dock node type implements its own `persist()` returning a plain JSON-able object (`{kind:"DockSplitSet", type, sizes: frameset.state.join(","), children}`), and a `constructKids(defs)` switch rebuilds JSX from that on restore.
- Flex sizing helper: `Length.fx(1)` / `1fx` literal marks a frameset child as "take remaining space" (the flexible-length unit), used when normalizing a resized dock group so exactly one child is `*`-sized.

**Resizable elements — two different techniques, both via CSS `aspect:`:**

1. *Corner-grab resize* (`resizable/inplace`): hit-test the bottom-right 15px corner manually in `mousedown`/`mousemove` (`evt.x > w-15 && evt.y > h-15`), toggle a `.mouse-on-corner` class for `cursor:se-resize`, and drive the actual resize loop with:
   ```js
   this.state.capture(true);
   Window.this.doEvent("untilMouseUp");   // blocks here, pumping only mouse events, until button released
   this.state.capture(false);
   ```
   Handlers are namespaced (`mousedown.resizable`, `mousemove.resizable`) and torn down in the aspect's `detached()` lifecycle hook: `Resizable.detached = function(){ this.off(".resizable"); }`.
2. *8-handle resize* (`resizable/handles`): CSS `hit-margin: @HANDLE_SIZE` extends the *hit-testable* (not visual) box so handles just outside the border still receive mouse events; handle rectangles are computed from `this.box("border").pointOf(numpad)` and inflated with `Graphics.Rect(center) >> handleSize`; uses `^mousemove` (sinking phase, i.e. capture-phase — fires even though `state.capture(true)` is active on a descendant) instead of plain `mousemove`.

Only the 8-handle technique uses `this.box("border","parent")` (box relative to the *parent* element); corner-grab resize instead uses window-relative calls (`this.state.box("xywh","border","window",false)`). Both call `Window.this.update()` after each `style.set()` to force a synchronous repaint rather than waiting for the next frame.

**Free-floating/"airborn" draggable DOM windows** (`desktop-dom-elements`) — elements that behave like real desktop widgets: drag via caption, `takeOff({x,y,relativeTo:"window",window:"detached"})` while dragging, snap back with `takeOff({x,y,relativeTo:"window",window:"attached"})` when dropped back "at home" (element rejoins normal flow). Docking-to-edge-of-window when dragged past the window boundary is computed from a `placement` getter comparing the element's screen box to `Window.this.box("rect","border","self",true)`, with a `THRESHOLD` (in device pixels) separating "snapped to edge" from "fully detached". Smooth snap-back animation is done by hand with a repeating `this.timer(10, ...)` that eases position by half the remaining delta each tick (not a CSS transition, because `takeOff` position isn't animatable via CSS). Drag loop is the same `capture(true)` + `Window.this.doEvent("untilMouseUp")` idiom as the resizable samples.

## Tooltips

- `title="plain text"` vs `tooltip="rich <b>HTML</b>"` attribute — two different mechanisms for static per-element tooltips.
- `titleid="idOfPopupElsewhereInDoc"` points at a **separate, reusable, hand-styled** `<popup id="...">` block instead of inline text — lets you build a rich (multi-paragraph, image, even non-rectangular speech-bubble via `background-image`+`background-repeat:expand`) tooltip once and reference it from many elements.
- Dynamic tooltip content, two variants of the `tooltiprequest` event:
  ```js
  // (a) create fresh JSX each time
  this.on("tooltiprequest", evt => { evt.source = Element.create(<popup.dyn-tip role="tooltip">Tip <b>#{++counter}</b></popup>); return true; });
  // (b) reuse one popup element, just mutate its text (cheaper, avoids re-creating DOM every hover)
  this.on("tooltiprequest", evt => { tooltip.innerText = printf(format, ++counter); evt.source = tooltip; return true; });
  ```
- Auto tooltip for **clipped/ellipsized text**: when `text-overflow:ellipsis` actually truncates content, Sciter shows an automatic tooltip with the full text — no JS needed. Style it via `label.custom popup[role=overflow-tooltip] { ... }` (a distinct role from the normal `popup[role=tooltip]`).
- Auto-dismiss a tooltip after N seconds by giving `popup[role=tooltip]` a shared behavior/prototype that starts a timer on mount: `prototype: Tooltip;` + `componentDidMount(){ this.timer(1s, ()=> this.state.popup = false); }`.
- Positioning CSS lives on the `popup[role="tooltip"]` selector scoped by ancestor, e.g. `toolbar#positioning > button#at-bottom > popup[role="tooltip"] { popup-position: top-center bottom-center; }` (two-point form) or the shorthand `popup-position: at-right;`. `margin` on the popup offsets it from its owner (`margin:6dip`).

## Native Behaviors

Three distinct "native" (C++-implemented) behaviors demonstrated:
- **`behavior: native-clock`** — a native painter that exposes a custom asset interface for reading drawing primitives back into JS/graphics: `clock.nativeClock.getPath(x,y,w,h,t,bool)` returns a path you can `gfx.draw()` yourself on the *background* layer, while the native side paints the clock face on the *content* layer — i.e. native and script painting are composited in the same element, at different layers. `clock.nativeClock.getImage(20,20)` similarly returns a native-rendered `Graphics.Image`.
- **`behavior: tabs`** — a native tab-strip control with a required structure: a `<div role="page-tab-list">` strip containing `<div panel="panel-id" role="page-tab">` labels, each `panel` attribute matching the `id` of a sibling content `<div>`. Active tab panel is toggled purely by the `:expanded` pseudo-class (`.tabs > :not(.strip):expanded { visibility:visible; }`); inactive ones need `visibility:none` explicitly since the behavior doesn't hide them for you.
- **`behavior: native-textarea`** — wraps an actual native OS edit control (Win32 `EDIT` class) as a Sciter element. The sample hides it via a `.hidden { visibility:hidden; }` class toggled in JS — being a real overlaid native child window, prefer `visibility:hidden` over `display:none` for the same reason as other native-overlay elements (the sample itself carries no explicit comment warning about this, so treat it as a reasonable inference, not a documented gotcha).
