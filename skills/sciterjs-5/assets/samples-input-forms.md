# Samples: Input, Forms, Editing, Drag & Drop

Patterns mined from `samples.sciter/` (forms, input-elements*, drag-n-drop*, gestures,
load-save-dialogs, editor-plaintext, editor-richtext, virtual-list, native-access).
Only non-obvious things not already covered in `behaviors-reference.md` / `dom-html-reference.md`.

## Forms

`behavior:form` builds a **hierarchical** value object from any named descendant, not just
classic `<input>`s. A container with a `name` attribute becomes a nested sub-object:

```html
<form>
  <select(dropdownSelect)>...</select>
  <textarea(textArea)>Sample</textarea>
  <input|text(textEdit) value="sample" />
  <button|checkbox(checkboxButton) value="checked">Checkbox</button>
  <div(names)>                          <!-- sub-object "names" -->
    <input|text(first) value="My">
    <input|text(last) value="Name">
  </div>
</form>
```
`form.value` → `{ dropdownSelect, textArea, textEdit, checkboxButton, names: { first, last } }`.

- Listen once on the whole document, delegate by selector:
  `document.on("change", "form", (evt, form) => JSON.stringify(form.value));`
- Round-trip: `form.value = parsedJsonObject;` sets every named field at once (including nested
  sub-objects) — no per-field wiring needed.
- Radio groups collapse to a single value: `behavior:form` reports the `value` attribute of
  whichever radio in the group is checked, not an array.
- A plain command `<button>` with no `name` is simply excluded from `form.value`.

## Input Styling

Real elements use `appearance:none` + explicit color/background, then restyle state
pseudo-classes and native pseudo-elements directly — there's no shadow-DOM indirection:

```css
button.custom { appearance:none; background-color:gold; color:red; padding:0.5em 1em; }
button.custom:hover { background-color:yellow; }
button.custom:checked { background-color:black; color:white; }   /* checkbox/radio buttons */

meter.custom { appearance:none; background-color:gold; }
meter.custom::marker { background-color:red; }   /* the meter's filled bar */
```

`<details>`/`<summary>` custom chevron + expand animation, entirely in CSS (no JS):
```css
details > summary::marker { transition: transform 200ms linear; }   /* rotates the built-in triangle */
details > div { visibility:collapse; height:0; transition: visibility 200ms linear, height 200ms linear; }
details > div:animating { visibility:visible; border-top:1px solid #aaa; }  /* :animating = mid-transition */
details:expanded > div { visibility:visible; height:max-content; }
```

`<select>` option checkmark via `foreground-image` (not `background-image`) so it composites
over the option's own background:
```css
select option:checked {
  foreground-image:url(stock:checkmark);
  foreground-repeat:no-repeat; foreground-size:7px; foreground-position:8px 50%;
}
select[name=x]:empty > caption { color:red; }   /* style the placeholder/no-value caption */
```

Placeholder text for empty inputs/selects/dropdowns uses the **`novalue`** attribute (not
`placeholder`): `<input|text novalue="some" />`, `<select novalue="select country">`.
Setting `select.value = undefined` (or including `field: undefined` in a `form.value =` object)
clears the field back to its `novalue` placeholder state — genuine null/empty support, not just
an empty string.

`<select>` supports `<optgroup label="...">` or `<optgroup><caption>...</caption>...</optgroup>`
for grouped dropdown options.

`printf("%V", value)` is a handy global for pretty-printing a form/select value for debug display
(used in place of `JSON.stringify` in one sample).

`<select>` population from JS: `select.clear(); select.append(<option value={i}>{text}</option>);`
then `select.value = someValue;` — plain DOM append works fine for building option lists.

Localizing built-in date/time pickers purely via CSS `:lang()` + `content:` on the empty
segment spans:
```css
input:lang(ru) span.year:empty  { content:"гггг"; }
input:lang(ru) span.month:empty { content:"м"; }
input.custom td.today { background-color:yellow; }              /* today cell in calendar */
input.custom span.today-caption { content:"Сегодня"; }           /* "Today" button label */
```
`<input type=date>`/`<input type=time>` accept the string values `"today"` / `"now"` directly
as `value=`. `<input type=time no-seconds>` hides the seconds segment.

## Drag & Drop (in-app)

Sciter has **no native HTML5-style drag events for element-internal DnD** — the idiomatic
pattern is a manual "mouse modal loop" driven from `mousedragrequest`:

```js
element.on("mousedragrequest", function(evt) {
  document.post(function() {
    // 1. cursor = rendered snapshot of the dragged element
    let image = new Graphics.Image(element);
    document.style.setCursor(image, x, y);
    element.style.visibility = "hidden";      // or classList.add("drag-source")

    // 2. route all mousemoves to document, remember last hovered target
    document.state.capture(true);
    document.attributes["dnd"] = "";           // flag for CSS (e.g. html[dnd] .drop-target:hover)
    document.on("mousemove", onmove);

    // 3. block here until mouse button released
    let r = Window.this.doEvent("untilMouseUp");

    // 4. restore
    document.state.capture(false);
    document.off(onmove);
    document.style.setCursor(null);
    element.style.visibility = undefined;
    document.attributes["dnd"] = undefined;

    if (r && lasttarget) callback(lasttarget.$p(".drop-target"));
  });
  return true;   // must return true from mousedragrequest to engage
});
```
Key mechanics: `document.state.capture(true)` short-circuits all mouse events to `document`
regardless of what's under the cursor; `Window.this.doEvent("untilMouseUp")` pumps the message
loop synchronously and returns when the button is released; must be wrapped in `document.post()`
so the drag starts on the *next* event-loop tick (letting the triggering mousedown finish first).

**In-list reordering** (drag-n-drop/sorting/sorter.js): track element under cursor via
`container.$(":root > :hover:not(.drag-source)")` on every `mousemove`, compare
`.elementIndex` to detect direction, and swap DOM nodes live during the drag with an animated
transform:
```js
function swap(nodeA, nodeB) {
  const parentA = nodeA.parentElement;
  const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
  nodeB.parentElement.insertBefore(nodeA, nodeB);   // move nodeA to before nodeB
  parentA.insertBefore(nodeB, siblingA);            // move nodeB to before nodeA's old sibling
}

function replaceElement(el, dir) {
  let a, b;
  if (dir) { a = el; b = el.nextElementSibling; }
  else     { a = el.previousElementSibling; b = el; }

  a.style.set { transform: "translate(0,-100%)" };  // pre-position
  b.style.set { transform: "translate(0,100%)" };
  swap(a, b);
  Window.this.update();                               // force layout before animating
  a.style.set { transform: "translate(0,0)", transition: "transform 100ms linear" };
  b.style.set { transform: "translate(0,0)", transition: "transform 100ms linear" };
  a.once("transitionend", () => a.style.removeProperties());
  b.once("transitionend", () => b.style.removeProperties());
}
```
Also handles **auto-scroll while dragging** by comparing `evt.contentPosition.y` against
`container.box("clip","scroll")` bounds and calling `container.scrollBy({top, behavior:"smooth"})`.
`element.state.box("position","inner","window",false)` gets an element's position relative to
the window — useful for computing drag-cursor hotspot offsets.

## System Drag & Drop

`Window.this.performDrag(data, mode, dragIcon[, xOff, yOff])` starts an OS-level drag from a
`mousedragrequest` handler. `data` is a plain object; recognized keys: `text`, `html`, `file`,
`json`:
```js
document.$("div").on("mousedragrequest", async function(evt) {
  var img = await Graphics.Image.load(__DIR__ + "../images/spade.png");
  let r = Window.this.performDrag({ text: "the spade image" }, "copy", img, 20, 20);
});
// dragging a link: send both text and html
document.$("a[href]").on("mousedragrequest", function(evt) {
  var data = { text: this.text, html: this.outerHTML };
  Window.this.performDrag(data, "copy", this);
});
// dragging a form's current values out as JSON
document.$("form").on("mousedragrequest", function(evt) {
  Window.this.performDrag({ json: this.value }, "copy", this);
});
```
`performDrag` accepts an `Element` directly as the drag icon (renders it), not just an `Image`.

**Receiving system drops** — two patterns observed, and the actual event name used in samples
is **`dragaccept`**, not `willacceptdrop` (the name in dom-html-reference.md); treat both as
possible depending on SDK version and test at runtime:

1. Class-based (`prototype:` component) with `on<event>` methods:
```js
class FileDropZone extends Element {
  files = [];
  ondragaccept(evt) {
    if (evt.detail.dataType == "file") {
      this.files = Array.isArray(evt.detail.data) ? evt.detail.data : [evt.detail.data];
      return true;   // returning true = accept this drop
    }
  }
  ondragenter(evt) { this.classList.add("active-target"); return true; }
  ondragleave(evt) { this.classList.remove("active-target"); return true; }
  ondrop(evt) { /* evt here — files already captured in ondragaccept */ }
}
```
```css
div.file-drop-zone { prototype: FileDropZone; border: 4px dashed; }
div.file-drop-zone.active-target { background: gold; }
```

2. Functional/delegated, using `evt.stopPropagation()` to claim the event (note: on `drop` the
   payload is `evt.data`, plain — not `evt.detail.data`):
```js
container.on("dragaccept", evt => evt.stopPropagation());        // accept everything
container.on("dragenter",  evt => container.classList.add("allow-drop"));
container.on("dragleave",  evt => container.classList.remove("allow-drop"));
container.on("drag",       evt => evt.stopPropagation());
container.on("drop", evt => {
  container.classList.remove("allow-drop");
  container.innerText = JSON.stringify(evt.data, null, "  ");
  evt.stopPropagation();
});
```

## Gestures

Two independent surfaces observed:

- **Component class methods**, event names *with* hyphens (`gesture-start`, `gesture-pinch`,
  `gesture-pan`), some using the sinking-phase `^` prefix:
```js
["on ^gesture-start at :root"](evt) { this.state.wantsGestures("pan-horizontal"); }
["on ^gesture-pan at :root"](evt) {
  if (!this.actionsShown && evt.deltaX < 0) this.triggerActions();
}
["on gesture-pinch"](evt) {
  this.rotation += evt.deltaRotation;
  this.zoom = Math.max(0.5, Math.min(4.0, this.zoom * evt.deltaZoom));
}
```
  (dom-html-reference.md documents the no-hyphen forms `gesturestart`/`gesturepinch`/etc. —
  both spellings appear in the wild; if one doesn't fire, try the other.)
- `wantsGestures(...)` **must be called synchronously inside the gesture-start handler**, and
  accepts multiple gesture kinds at once: `this.state.wantsGestures("zoom", "rotation")`.
- Swipe-to-reveal-actions list pattern (chat-app style): track `evt.deltaX` sign in the pan
  handler to open/close a per-row actions panel via CSS `state.expanded` + `transitionend`
  cleanup; `this.parentElement.collapseExpandedItems()` closes siblings before opening a new one.
- Pinch/zoom scene example drives CSS custom properties directly from gesture deltas:
  `this.style.variables({ rotation: this.rotation, zoom: this.zoom })` where CSS reads
  `transform: rotate(var(rotation)) scale(var(zoom));`.

## File Dialogs

`Window.this.selectFile({...})` — synchronous, returns a path string or `null`:
```js
const file_filter =
  "HTML files only(*.htm,*.html)|*.htm;*.html|" +
  "SVG files only(*.svg)|*.svg|" +
  "All Files (*.*)|*.*";

let fn = Window.this.selectFile({
  filter: file_filter,
  mode: "open",                              // or "save"
  path: URL.toPath(__DIR__ + "load-save-file.htm")   // initial dir/filename
});
```
Filter string format: `"Label(*.ext1,*.ext2)|*.ext1;*.ext2|..."` repeated, pipe-separated.
`URL.toPath(url)` converts a `file://`/relative URL into a native OS path for the `path` option.
Can also be called positionally: `Window.this.selectFile(optionsObject)`.

## Plaintext/Richtext Editors

**Transactional editing** (`.plaintext.update()` / `.richtext.update()`) is the correct way to
programmatically insert/delete content — both share the same `tctx` transaction API:
```js
editor.plaintext.update(tctx => {
  const [node, offset] = tctx.deleteRange(anchor[0], anchor[1], caret[0], caret[1]);
  tctx.insertHTML(node, offset, "<img src='sciter:copy.png'/>");
  caret = tctx.lastPosition;      // position after the edit
  return true;                    // must return true to commit; false/undefined rolls back
});
editor.selection.collapse(caret[0], caret[1]);   // restore caret after the transaction
```
`tctx.insertText(node, offset, text)` returns `[node, offset]` for the new caret. `tctx.wrap(
anchorNode, anchorOffset, focusNode, focusOffset, element)` wraps the current selection range in
an element (e.g. turn selected text into `<a href=...>`) — throws if the range can't be wrapped,
so call inside try/catch and return `false` on failure to abort the transaction.

**Autocomplete/autocorrect-on-type** pattern (emoji shortcodes, smart-replace), built on the
`change` event's `evt.reason` codes:
```js
// evt.reason values:
// 0 CHANGE_BY_INS_CHAR, 1 CHANGE_BY_INS_CHARS (paste), 2 CHANGE_BY_DEL_CHAR,
// 3 CHANGE_BY_DEL_CHARS, 4 CHANGE_BY_UNDO_REDO, 5 CHANGE_BY_INS_CONSECUTIVE_CHAR, 6 CHANGE_BY_CODE
document.on("change", "plaintext", (evt, el) => {
  if (evt.reason == 5 /*CONSECUTIVE*/ || evt.reason == 0 /*INS_CHAR*/) {
    // inspect el.selection.focusNode.data up to focusOffset for a trigger sequence,
    // then run a tctx.update() replace as above
  }
});
```
Only react on `INS_CHAR`/`INS_CONSECUTIVE_CHAR` (typing), not on paste/undo/code-driven changes,
to avoid double-triggering.

`plaintext.appendLine(text)` — simplest way to append a line to a `<plaintext>` (native-access
sample's entire content).

**`Range` API + `::mark(name)`** for inline squiggly-underline / error-highlight style
annotations independent of DOM structure:
```js
const errorRange = new Range();
errorRange.setStart(textNode, 8);
errorRange.setEnd(textNode, 13);
errorRange.applyMark("error");
```
```css
plaintext > text::mark(error) { text-decoration: wavy underline red; }
plaintext > text::mark(error):hover { text-decoration: wavy underline blue; }
```
Querying marks under the pointer for hover popups: `this.rangeFromPoint(evt.x, evt.y)` returns
a `Range`; `range.marks()` returns the array of active mark names at that point — used in
`mouseidle` to show a popup only when hovering a marked/"error" range:
```js
["on mouseidle"](evt) {
  let range = this.rangeFromPoint(evt.x, evt.y);
  if (!range || !range.marks().includes("error")) return;
  this.shownPopup = this.popup(<popup.error>...</popup>, {x: evt.windowX, y: evt.windowY, popupAt: 7});
}
```

**Inline-block insertion + deletion via `::marker` click** (tag/chip style spans inside
plaintext):
```js
editor.plaintext.update(ctx => { ctx.insertHTML(sel.focusNode, sel.focusOffset, `<span>BC${n}</span>`); });
document.on("^mousedown", "span", (evt, span) => {
  if (evt.target.tag == "::marker") {           // clicked the ::marker pseudo-element (an "x" icon)
    editor.plaintext.update(ctx => { ctx.deleteNode(span); return true; });
    return true;
  }
});
```
```css
span::marker { background: url(stock:cross-x) no-repeat 50% 50%; cursor:pointer; }
```

**Richtext toolbar wiring** (editor-chrome/behavior.js) — generic bind-by-selector pattern that
supports both raw `execCommand` strings and custom functions, with throttled state refresh:
```js
class RichtextEditor extends Element {
  componentDidMount() { this.toolbar = this.$("toolbar"); this.current = this.$("htmlarea"); this.setupToolbar(); }
  setupToolbar() {
    const ACTIVE = 0x01, DISABLED = 0x02;
    let bind = (selector, cmd, param) => {
      var uiel = this.$(selector);
      uiel.on("click", () => this.current.execCommand(cmd, param));
      this.observers.push(() => {
        var cmdState = this.current.queryCommand(cmd, param) || 0;
        uiel.state.checked  = (cmdState & ACTIVE) != 0;
        uiel.state.disabled = (cmdState & DISABLED) != 0;
      });
    };
    bind("button.bold", "format:toggle-span:b|strong");
    bind("button.italic", "format:toggle-span:i|em");
    bind("button.del", "format:toggle-span:del|strike");
    bind("button.code", "format:toggle-span:code");
  }
  ["on statechange at htmlarea"](evt, htmlarea) {
    this.timer(200, this.updateObservers);   // throttle: coalesce rapid selection-change refreshes
  }
}
```
`format:toggle-span:tag1|tag2` command param toggles between two equivalent tags (e.g. legacy
`<strike>` vs semantic `<del>`). `<richtext>` wraps a `<toolbar>` + `<htmlarea src=... content-
style=...>`; `content-style` points to a separate CSS file applied *inside* the edited document,
independent of the host page's stylesheet.

`htmlarea.execCommand("edit:insert-html", htmlString)` inserts raw HTML at the caret; must first
focus (`htmlarea.state.focus = true`) and typically `execCommand("navigate:end")` to place the
caret before inserting.

Hyperlink click-to-launch-in-OS-browser inside an editable `htmlarea` (must prevent Sciter's own
navigation and use the sinking `^click` so it fires before the editor's own handling):
```js
import * as Environment from "@env";
document.on("^click", "[href]", (evt, a) => {
  Environment.launch(a.attributes["href"]);
  evt.preventDefault();
});
```

## Virtual List

Beyond the raw `oncontentrequired` event (already documented), the sample `virtual-select.js`
shows a full **class-based data-provider** pattern used to build custom virtual list/select
reactor components — override 3 virtual methods instead of touching `contentrequired` directly:
```js
class VirtualList extends Element {
  itemAt(at)     { /* override: return this.items[at] */ }
  totalItems()   { /* override: return this.items.length */ }
  indexOf(item)  { /* override: return this.items.indexOf(item) */ }
  renderItem(item, isCurrent, isSelected) { /* override: return <option>...</option> */ }
  oncontentrequired(evt) {
    const {length, start, where} = evt.data;
    if (where > 0) evt.data = this.appendElements(start, length);
    else if (where < 0) evt.data = this.prependElements(start, length);
    else evt.data = this.replaceElements(start, length);
    return true;
  }
}
```
Consumers subclass and only implement `itemAt`/`totalItems`/`indexOf`/`renderItem` — the base
class handles append/prepend/replace bookkeeping and the reactor `render()` sync.

When the **underlying dataset shrinks or changes length** while scrolled, `render()` must detect
`this.vlist.itemsTotal != totalItems()`, then explicitly re-navigate:
```js
if (this.vlist.itemsTotal != totalItems) {
  if (firstVisibleIndex == 0) this.post(() => this.vlist.navigate("start"));
  else if (lastVisibleIndex >= totalItems) this.post(() => this.vlist.navigate("end"));
  else this.post(() => { this.vlist.itemsAfter = totalItems - this.vlist.itemsBefore - this.children.length; });
}
```
(`.post()` defers the vlist call to the next tick — mutating `vlist` state mid-render is unsafe.)

**Mouse-drag auto-scroll inside a virtual list** (drag-select scrolls list when pointer leaves
bounds), driven by `mousetick` (periodic pulse while a mouse button is held):
```js
["on ~mousedown"](evt) { this.state.capture(true); }
["on ~mouseup"](evt)   { this.state.capture(false); }
["on ~mousetick"](evt) {
  let height = this.state.box("height");
  if (evt.y < 0) this.vlist.navigate("itemprior");
  else if (evt.y > height) this.vlist.navigate("itemnext");
}
```
Keyboard nav delegates to `vlist.advanceTo(index)` / `.navigateTo("start"|"end")`, tracking a
separate `currentItem` (not DOM-index-based) so it survives sliding-window recycling.

## Native Access

The `native-access/` sample is thin (just `<plaintext>` + `.appendLine`) — no OS-native bridging
example beyond what's already covered in SKILL.md's C++ integration section. `load-save-dialogs`
and `drag-n-drop-system` (above) are the actual "talk to the OS" samples in this batch.
