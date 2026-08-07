# DOM & HTML Reference

Sciter follows W3C DOM conventions with simplifications and Sciter-specific extensions. This covers the base DOM/HTML API surface not already in SKILL.md (which covers `element.box()`, `element.timer()`, `element.post()`, `element.replaceContent()`, `element.state.*` extras, `Window.this` extras, Reactor/JSX, custom painting).

## Document

`document` is the global root element. `Document extends Element`, so `document === document.documentElement`, and every Element method (see below) works on `document` too.

### Properties

| Property | Type | Notes |
|---|---|---|
| `document.body` | Element | `<body>` |
| `document.head` | Element | `<head>` |
| `document.documentElement` | Element | `<html>`, `=== document` |
| `document.readyState` | string | `"interactive"` (operational) or `"complete"` (resources finished) |
| `document.globalThis` | object | global namespace object for this document; all top-level `var`/`function` become members |
| `document.defaultView` | object | same as `document.globalThis` |

### Methods

```js
document.querySelector(selector): Element | null
document.$(selector)                    // synonym

document.querySelectorAll(selector): Element[]     // [] if none
document.$$(selector)                              // synonym

document.getElementById(id): Element | null         // id WITHOUT leading '#'

document.createElement(tag[, attributes]): Element
document.createTextNode(text): Text
document.createComment(text): Comment
document.createDocumentFragment(): Element

document.createNodeIterator(root[, whatToShow[, filter]]): NodeIterator
document.createRange([startNode, startIndex[, endNode, endIndex]]): Range
document.createDocument() / document.createHTMLDocument(): Document
```

```js
for (const span of document.$$("span")) console.log(span);
```

Sciter-specific:

```js
document.bindImage(url[, img]): Image | null
```
Associates an arbitrary `img` (`Graphics.Image`) with `url` so it can be referenced from CSS (`background-image: url(...)`). Omit `img` to read the current binding; pass `null` to remove it.

```js
document.bindImage("in-memory:dynback");
```
```css
div { background-image: url("in-memory:dynback"); }
```

```js
document.url([relpath]): string
```
Resolves `relpath` against the document's own URL. With no argument, returns the document's own URL.

## Node (base class of Element, Text, Comment)

### Properties

| Property | Notes |
|---|---|
| `nodeName` | `"#comment"`, `"#text"`, `"#document"`, or `element.tagName` |
| `nodeType` | see NodeType constants below |
| `nodeValue` | text of Text/Comment nodes (read-write); `null` otherwise |
| `nodeIndex` | index of node within parent's child list |
| `childNodes` | `NodeList` of all children (including text/comment nodes) |
| `firstChild` / `lastChild` | first/last child `Node` |
| `nextSibling` / `previousSibling` | sibling `Node` |
| `parentNode` / `parentElement` | parent `Element` |
| `ownerDocument` | owning `Document` |
| `parentWindow` | `Window` hosting this node |
| `textContent` | Text/Comment: own text (read-only in Sciter); Element: concatenation of descendants' text |

### Methods

```js
node.cloneNode()          // NOTE: always deep-clones in Sciter (no shallow option)
node.contains(otherNode): boolean
node.getRootNode(): Document          // always returns ownerDocument in Sciter
node.hasChildNodes(): boolean
node.isEqualNode(otherNode): boolean
node.isSameNode(otherNode): boolean   // node === otherNode
node.remove()                          // removes node from DOM

Node.commonParent(nodeA, nodeB): Element   // static
```

`compareDocumentPosition()` is NOT implemented.

### NodeType constants

`Node.ELEMENT_NODE`, `Node.ATTRIBUTE_NODE`, `Node.TEXT_NODE`, `Node.CDATA_SECTION_NODE`, `Node.PROCESSING_INSTRUCTION_NODE`, `Node.COMMENT_NODE`, `Node.DOCUMENT_NODE`, `Node.DOCUMENT_TYPE_NODE`, `Node.DOCUMENT_FRAGMENT_NODE`

### NodeList

`element.childNodes` returns a `NodeList`: `.length`, `.item(n)`, and supports `for...of`.

### Text (`extends Node`)

```js
textNode.data: string      // read-write
textNode.length: int       // read-only
textNode.wholeText: string // read-only, text of all logically-adjacent Text nodes combined
```

### Comment (`extends Node`)

```js
commentNode.data: string   // read-write
commentNode.length: int    // read-only
```

### NodeIterator

Returned by `document.createNodeIterator(root[, whatToShow[, filter]])`. Iterable via `for...of`.

```js
iterator.root            // read-only Node
iterator.filter          // read-only, the filter function passed
iterator.whatToShow      // read-only int, ORed NodeFilter.SHOW_* mask
iterator.referenceNode   // read-only, current Node

iterator.nextNode(): Node | null
iterator.previousNode(): Node | null
```

`whatToShow` mask bits: `NodeFilter.SHOW_ALL`, `SHOW_ELEMENT`, `SHOW_TEXT`, `SHOW_COMMENT`, `SHOW_DOCUMENT`.

`filter` is `function(node): int` returning one of: `NodeFilter.FILTER_ACCEPT`, `NodeFilter.FILTER_REJECT` (skip node + its subtree), `NodeFilter.FILTER_SKIP` (skip node but walk its children).

```js
const it = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT,
  (node) => node.tag === "span" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP);
let n;
while ((n = it.nextNode())) console.log(n);
```

### Range

`document.createRange([startNode, startIndex[, endNode, endIndex]])` or `element.rangeFromPoint(x, y)`.

```js
range.isCollapsed: boolean            // read-only
range.commonAncestorContainer: Element
range.startContainer / range.endContainer: Node
range.startOffset / range.endOffset: int
range.start   // [startContainer, startOffset]
range.end     // [endContainer, endOffset]

range.setStart(node, offset)
range.setEnd(node, offset)
range.setStartBefore(node) / range.setStartAfter(node)
range.setEndBefore(node) / range.setEndAfter(node)
range.selectNode(node)              // includes node's own start/end
range.selectNodeContents(node)      // excludes node's own start/end, only its content
range.collapse([toStart: bool])
range.cloneRange(): Range
```

Sciter-specific:

```js
range.nodes(): Node[]                                  // all nodes with start or end inside range
range.applyMark(name | [name, ...])                    // == range.highlight(...)
range.clearMark(name | [name, ...])                    // == range.clearHighlight(...)
range.marks(): string[]                                // mark names present in this range
range.setToMark(name)                                  // set range to bounds of a named mark
```

Marked ranges can be styled with `::mark(name) { ... }` in CSS.

## Element — base DOM surface

`Element extends Node`. This section lists plain DOM API not covered elsewhere in the skill.

### Properties

| Property | Notes |
|---|---|
| `id`, `name`, `className` | string, mirror `id`/`name`/`class` attributes |
| `tagName` | UPPERCASE tag, e.g. `"DIV"` |
| `tag` | lowercase tag, e.g. `"div"` (Sciter specific) |
| `elementIndex` | index among parent's **child elements** (differs from `nodeIndex`, which counts all nodes) |
| `innerHTML` / `outerHTML` | get/set markup; setting `outerHTML` replaces the element itself |
| `innerText` | approximated copy-paste text; setter replaces children with plain text |
| `value` | JS value reported by the native behavior attached to element; `undefined` if none |
| `firstElementChild`, `lastElementChild`, `nextElementSibling`, `previousElementSibling` | read-only |
| `childElementCount` | read-only int |
| `offsetLeft`, `offsetTop`, `offsetWidth`, `offsetHeight` | px, relative to `offsetParent` |
| `offsetParent` | nearest positioned ancestor |
| `clientLeft`, `clientTop`, `clientWidth`, `clientHeight` | px, padding box minus scrollbars |
| `scrollLeft`, `scrollTop` | px, read-write scroll position |
| `scrollPosition` | `Point` version of the above |
| `scrollWidth`, `scrollHeight` | px, scrollable content size |
| `style` | → `Element.Style` (see CSS-from-JS below) |
| `state` / `elementState` | → `Element.State` (documented in SKILL.md) |
| `disabled` | bool; get: true if self or ancestor disabled; set: disables self + descendants; reflects `:disabled` |
| `readonly` | bool, same pattern, reflects `:readonly` |
| `checked` | bool, reflects `:checked` |
| `src` | string, for elements supporting `src` (e.g. `<img>`) |

### classList

```js
element.classList.item(n)
element.classList.add(name, ...)
element.classList.remove(name, ...)
element.classList.toggle(name[, force: bool])
element.classList.contains(name)
element.classList.length
element.classList.entries()   // array of class names
```

### children

```js
element.children[n]           // Nth child ELEMENT (not node)
element.children.item(n)
element.children.length
for (let child of element.children) { ... }
```

### DOM mutation

```js
element.appendChild(node): node
element.insertBefore(node, refNode): node
element.insertAfter(node, refNode): node
element.insertAdjacentHTML(where, html)     // MDN-compatible: "beforebegin"|"afterbegin"|"beforeend"|"afterend"
element.removeChild(node): node
element.replaceChild(newNode, oldNode)
element.replaceChildren([node1[, node2, ...]])   // clear + add
element.swapWith(otherElement)                    // swap DOM locations; elements must be structurally compatible
element.childElement(n): Element | null            // n-th child element, n in [0, childElementCount)
```

### Query / matching

```js
element.querySelector(selector) / element.$(selector)
element.querySelectorAll(selector) / element.$$(selector)
element.closest(selector) / element.$p(selector)     // nearest ancestor (or self) matching selector
element.$o(selector)                                 // owner-element selector (menus/popups)
element.matches(selector) / element.$is(selector): boolean

element.getElementsByClassName(names): Element[]      // space-separated class names
element.getElementsByTagName(tagName): Element[]
element.getElementsByName(name): Element[]
```

Tips: prefix a selector with `>` (or `:root>`) to match only immediate children: `select.$(">option[value='2']")`. Selectors support comma groups: `section.$("h1,h2")`.

### Attributes

```js
element.hasAttribute(name): boolean
element.getAttribute(name): string | null
element.getAttributeNames(): string[]
element.removeAttribute(name)
element.setAttribute(name, value)
```

### Geometry / scrolling

```js
element.getBoundingClientRect(): Rect      // border box, relative to document viewport

element.scrollTo(x, y)
element.scrollTo({ position: Point, left, top, behavior: "instant"|"smooth" })

element.scrollIntoView([toTop: true])
element.scrollIntoView({ behavior: "instant"|"smooth", block: "start"|"nearest" })

element.elementFromPoint(x, y): Element | null   // x/y relative to element's inner box
```

### Focus / click

```js
element.click()     // synthesizes a click event
element.focus()     // moves input focus to element
```

### Event subscription (W3C-style)

```js
element.addEventListener(type, listener[, options])
// listener: function(event) | { handleEvent(event) }
// options: { capture: bool, once: bool }
element.removeEventListener(type, listener)
element.dispatchEvent(event)     // synchronous, all handlers run before return
element.postEvent(event)         // Sciter: async, equivalent to element.post(event)
```

### Event subscription (jQuery-style, Sciter specific)

```js
element.on(eventname[, selector], handler): Element
// eventname: "click" | "^click" (capturing phase) | "click.myns" (namespace)
// handler(evt, matchedElement) — `this` = element handler is attached to
element.off(eventname | handler): Element
element.once(eventname[, selector], handler): Element   // auto-off after first firing
```

### Global events (app-wide, cross-window)

```js
element.onGlobalEvent(eventname, handler): Element
// auto-unsubscribed when element leaves DOM
element.offGlobalEvent(eventname | handler | /* nothing = all */): Element
```
Sent via static `Window.send(event)` / `Window.post(event)` (documented in SKILL.md), delivered to every subscriber in every window of the app.

### Editing (input elements)

```js
element.checkCommand(command[, params]): flags
element.executeCommand(command[, params]): flags
```
For `<htmlarea>`, `<plaintext>`, `<textarea>`, `<input|text>`. Return flags: `0` supported, `0x01` applied, `0x02` disabled/unsupported at current caret/state.

```js
if (htmlarea.checkCommand("edit:paste") == 0) { /* pasteable */ }
htmlarea.execCommand("edit:insert-html", html);   // undoable insert at caret
```

### Native behavior interop

```js
element.xcall(name[, arg0, ..., argN]): any
```
Reaches `handle_scripting_call()` of a native behavior attached to the element.

### Misc

```js
element.clear()                       // empty the element
element.unwrapElement()               // remove self, keep children in place
element.wrapNodes(startNode, endNode, wrapEl)   // opposite of unwrapElement
element.toString(): string            // short debug representation
element.rangeFromPoint(x, y): Range | null      // collapsed range (caret) at local x/y
Element.create(JSX | tagString): Element         // static factory
```

## CSS-from-JS

### CSS namespace

```js
CSS.supports(prop, value): boolean
CSS.getComputedStyle(element[, pseudoEl]): Style   // usable without "CSS." prefix, as a global
CSS.set`...`: StyleSet
```

`CSS.set` builds a style set at runtime — handy for co-locating component CSS with its JS:

```js
const h = 64;
const myStyles = CSS.set`
  :root { width: 100px; height: ${h}px; }
  :root > span { color: red; }
`;

class MyComponent extends Element {
  render() {
    return <div styleset={myStyles}>Hello <span>embedded</span> CSS</div>;
  }
}
```
Content is a normal `@set` body, minus the `@set name {` / `}` wrapper.

### Element.Style (`element.style`)

```js
element.style.backgroundColor            // camelCase
element.style["background-color"]        // or hyphen-case
element.style.cssText                    // get/set inline style text only
```

```js
element.style.getPropertyValue(name): string
element.style.setProperty(name, value[, important])
element.style.removeProperty(name)

element.style.set({ prop1: value1, prop2: value2 });   // transactional multi-set (Sciter specific)

element.style.colorOf(name): Color | null
element.style.pixelsOf(name): number | null
element.style.imageOf(name): Image | null

element.style.variables(): { name: value, ... }         // read all CSS vars seen by element
element.style.variables({ name: value, ... })            // set CSS vars
element.style.variable(name[, value]): value              // get/set single CSS var

element.style.setCursor(null | image, hotspotX, hotspotY)
```

## Element.Selection (`element.selection`)

For `<htmlarea>`, `<plaintext>`, and any element with `selectable` attribute set.

```js
element.selection.isCollapsed: boolean
element.selection.commonAncestorContainer: Element
element.selection.anchorNode / anchorOffset
element.selection.focusNode / focusOffset      // focus = caret position
element.selection.rangeCount: uint
element.selection.type: "Caret" | "Selection" | "Element" | "TableCells"
```

```js
element.selection.collapse()
element.selection.collapseToStart() / collapseToEnd()
element.selection.containsNode(node): boolean
element.selection.empty()
element.selection.extend(node, offset)          // move focus/caret only
element.selection.getRangeAt(index): Range
element.selection.selectNodeContent(node)
element.selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset)
element.selection.toString(): string
```

## Event

### Properties

Standard: `bubbles`, `cancelable`, `currentTarget`, `defaultPrevented`, `eventPhase`, `target`, `type`, `data: any`, `details: any` (alias of `data`).

Keyboard: `keyCode` (see `sciter-x-key-codes.h`), `platformKeyCode` (native code, e.g. wParam), `code` (string like `"KeyA"`, `"F1"`, `"Enter"`), `altKey`, `ctrlKey`, `metaKey` (Cmd on macOS / Win on Windows), `shiftKey`.

Mouse: `button`, `buttons`, `isOnIcon` (true if over element's `foreground-image` area).

Coordinates (`Point` for `*Position` variants), all in CSS px unless noted:
- Current-target relative: `x`, `y`, `position`, `contentPosition` (= `position + currentTarget.scrollPosition`)
- Client (document container) relative: `clientX`, `clientY`, `clientPosition`
- Window relative: `windowX`, `windowY`, `windowPosition`
- Screen relative (screen px): `screenX`, `screenY`, `screenPosition`

Wheel/scroll: `deltaX`, `deltaY`, `delta: Size`, `deltaMode` (0 = px from touch, 1 = "lines"/wheel ticks).

Focus events only: `relatedTarget` (blur/focus/focusin/focusout).

Sciter-specific: `source` (auxiliary source element in some events), `isOnIcon: Element` variant, `reason`.

Gesture-specific: `delta: Size` (pan deltas, CSS px), `deltaZoom: float` (`currentScale *= evt.deltaZoom`), `deltaRotation: Angle` (`currentRotation += evt.deltaRotation`).

### Methods

```js
event.preventDefault()
event.stopImmediatePropagation()
event.stopPropagation()

Event.keyState(key: string): true | false | undefined   // static; e.g. Event.keyState("CapsLock")
```

### Known event types

> **Dual naming convention:** most multi-word Sciter event types have two interchangeable spellings — a camelCase form (`gesturestart`, `willacceptdrop`, `scrollanimationstart`) and a hyphenated "alt name" (`gesture-start`, `will-accept-drop`, `scroll-animation-start`). Both refer to the same event; use whichever form the API you're calling expects (e.g. `element.on("gesturestart", ...)` and CSS/native contexts using `"gesture-start"` both work). This list gives the camelCase form; assume the hyphenated equivalent also works unless noted.

**Mouse:** `mousemove`, `mouseenter`, `mouseleave`, `mouseover`, `mouseout`, `mouseidle` (triggers tooltip), `mousetick` (periodic pulse while pressed), `mousedown`, `mouseup`, `wheel`, `mousedragrequest` (drag threshold exceeded), `dblclick`, `tripleclick`.

**Behaviors:** `click`, `press` (mousedown on clickable), `input` (posted, after change), `change` (sync, before screen update), `changing` (before change, text editors), `submit`/`reset` (`<form>`), `expand`/`collapse` (e.g. tree `<option>`), `statechange` (UI state, e.g. caret moved), `currentstatechange` (`:current`), `disabledstatechange`, `readonlystatechange`, `navigation` (hyperlink click; `event.data = {url, target}`; consume in sinking phase to prevent default load), `contextmenu`, `contextmenusetup`, `animationstart`/`animationloop`/`animationend`, `transitionstart`/`transitionend`, `mediachange` (window-level, CSS media vars changed), `contentchange` (DOM add/remove/attr change), `inputlangchange`, `pastehtml`/`pastetext`/`pasteimage` (from `behavior:richtext`), `popuprequest`/`popupready`/`popupdismissing`/`popupdismissed`, `tooltiprequest`.

**Focus:** `focusin` (sent to container when focus enters), `focusout` (focus leaves), `focus`, `blur`.

**Keyboard:** `keydown`, `keyup`, `keypress` (produces `event.char`), `compositionstart`/`compositionend` (IME).

**Scroll:** `scroll`, `scrollanimationstart`/`scrollanimationend`, `scrollstepplus`/`scrollstepminus`, `scrollpageplus`/`scrollpageminus`, `scrollsliderpress`/`scrollsliderrelease`.

**Gestures** (touchpad/touchscreen): `gesturestart`, `gestureend`, `gesturepress`, `gesturepinch` (click/zoom/rotate), `gesturepan` (scroll), `gestureswipe` (fast pan). To receive gestures, handle `gesturestart` and call:
```js
element.state.wantsGestures("pan-vertical" | "pan-horizontal" | "zoom" | "rotation", ...);
```
(must be called from within the `gesturestart` handler). Use `event.deltaRotation` in `gesturepinch` for rotation, `event.deltaZoom` for zoom.

**Document lifecycle:** `parsed` (DOM built, scripts not run — container only), `DOMContentLoaded` (aka `document-ready`), `complete` (aka `document-complete`, all resources finished); closing: `closerequest` (cancelable via `preventDefault()`), `beforeunload` (script namespace still valid), `unload`.

**Element state change** (non-bubbling, element itself only): `sizechange`, `visualstatechange` (`event.reason` truthy = became visible).

**Image:** `load` (aka `image-load`), `error` (aka `image-error`).

**Pager/print preview** (`<frame|pager>`): docs list `paginationstart`/`paginationpage`/`paginationend` (alt names `pagination-start`/`pagination-page`/`pagination-end`), but the official `printing/pager.js` sample actually handles `["on paginationready"]` and `["on paginationend"]` — if `paginationstart` doesn't fire, try `paginationready` instead; treat this as a known naming inconsistency to verify against your SDK build.

**Drag-and-drop:** `drag`, `dragenter`, `dragleave`, `drop`, `dragcancel` (ESC pressed), `willacceptdrop`. To accept a drop, handle `willacceptdrop`, check `event.detail`, and call `event.stopPropagation()` to consume. `event.detail`: `{ dataType: "text"|"html"|"file"|"json", data: { text?, html?, file?: string|string[], json? } }`. Initiate D&D with `window.performDrag(...)`.
For **system** drag-and-drop (files/data dragged in from the OS), the official samples (`drag-n-drop-system/`) instead handle `"dragaccept"` (`ondragaccept(evt)` class method or `container.on("dragaccept", ...)`) to decide whether to accept an incoming OS drag, and the actual drop payload arrives on `evt.data` (not `evt.detail.data`) in `drop` handlers there — treat `willacceptdrop`/`event.detail` (in-app D&D, per prose docs) and `dragaccept`/`event.data` (system D&D, per samples) as two distinct code paths, not spelling variants of each other.

**Video:** `videoready`, `videostart`, `videostop`, `videocoordinate`, `videoframeready`.

## Window

`Window.this` is the current window instance (a `Window`, NOT a browser `window`). Most `Window.this.*` extras (trayIcon, hotkeys, blurBehind, share, elementAt, ticks, post/send, requestAttention) are already covered in SKILL.md — this section fills in the base API.

### Constructor

```js
new Window({
  type,       // Window.POPUP_WINDOW | TOOL_WINDOW | CHILD_WINDOW | FRAME_WINDOW (default) | DIALOG_WINDOW
  parent,     // owner Window; closing/minimizing owner closes/minimizes this window too
  caption,    // string
  x, y,       // screen px position
  width, height,  // screen px
  client,     // bool — if true, x/y/w/h describe the desired CLIENT box, not the frame
  alignment,  // 1..9 = align to monitor; -1..-9 = align to `parent` window (numpad layout: 1=bottom-left...9=top-right)
  screen,     // monitor index on multi-monitor systems
  state,      // Window.WINDOW_SHOWN (default) | WINDOW_MINIMIZED | WINDOW_MAXIMIZED | WINDOW_HIDDEN | WINDOW_FULL_SCREEN
  url,        // html source file to load
  parameters, // any — array/string/object passed to the new window, readable there as window.parameters
});
```

### Properties (not in SKILL.md)

| Property | Notes |
|---|---|
| `focus` | read/write, element in focus (or `null`) |
| `state` | read/write int, `Window.WINDOW_SHOWN`(1) / `WINDOW_MINIMIZED`(2) / `WINDOW_MAXIMIZED`(3) / `WINDOW_HIDDEN`(4) / `WINDOW_FULL_SCREEN`(5) / `WINDOW_SHOWN_NA`(0, write-only, show without activating) |
| `frameType` | read/write string: `"standard"`, `"transparent"`, `"solid"`, `"solid-with-shadow"`, `"extended"` (standard shape, no caption bar — draw your own) |
| `caption` | read/write string, window title |
| `icon` | read/write `Graphics.Image` |
| `screen` | read-only int, monitor index `[0, Window.screens)` |
| `graphicsBackend` | read-only string, e.g. `"direct2d"`, `"Skia/OpenGL"` |
| `minSize` / `maxSize` | `[w, h]` get/set, resizable window bounds |
| `isActive` | read-only bool, has input focus |
| `isAlive` | read-only bool, false once window closed/destroyed |
| `isOnActiveSpace` | read-only bool/undefined, on active virtual desktop |
| `isResizable` / `isMaximizable` / `isMinimizable` | read/write bool |
| `isTopmost` | read/write bool |
| `isEnabled` | read/write bool, accepts user input |
| `aspectRatio` | read/write float, w:h ratio maintained on resize |
| `eventRoot` | write, `element \| null` — short-circuits ALL UI events to that element+children only (lightbox-dialog pattern) |
| `parent` | read-only `Window \| null` |
| `document` | read-only, root `Document` of the window |
| `parameters` | read-only, value passed to constructor |

### Methods (not in SKILL.md)

```js
window.box(boxPart, boxOf[, relTo[, asPPX]])
```
`boxPart`: `"xywh"`/`"rectw"`, `"rect"`, `"position"`, `"dimension"`, or `"left"|"top"|"right"|"bottom"|"width"|"height"`.
`boxOf`: `"border"` (incl. caption/frame), `"client"`, `"cursor"` (mouse position), `"caret"` (relative to client area).
`relTo`: `"desktop"`, `"monitor"`, `"self"`. `asPPX`: physical px (true) vs CSS px (false, default).

```js
window.screenBox(what[, boxPart[, asPPX]])
```
`what`: `"frame"`, `"workarea"` (frame minus taskbar), `"device"` (monitor name), `"isPrimary"`, `"snapshot"` (`Graphics.Image` screenshot).

```js
window.move(x, y[, width, height[, "client"]])       // PPX (physical px); "client" = coords describe client box
window.moveTo(monitor, x, y[, width, height[, "client"]])  // DIPs (CSS px)

window.selectFile({ mode: "save"|"open"|"open-multiple", filter, extension, caption, path })
  // -> string | string[] | null (cancelled)
window.selectFolder({ caption, path }) // -> string (folder URL)

window.mediaVar(varname[, value])         // get/set one @media varname {...} value
window.mediaVars([values: object])        // get/set several at once

window.on("eventname", handler)   // alias addEventHandler; may use "move.myns" namespace suffix
window.off("eventname" | handler)
window.dispatchEvent(event): boolean      // sync, returns true if consumed
window.postEvent(event)                   // async

window.load(url)   // loads new document into window (prefer <frame src=...> instead)

window.xcall(name[, arg0, ...]): any      // native behavior interop, like element.xcall

window.doEvent(mode)  // "wait" | "noWait" | "untilMouseUp" | "untilQuit" | "I/O"

window.modal(<info>/<alert>/<error>/<question> JSX): any     // built-in message boxes
window.modal({params}): any                                   // shows new Window(params) as dialog; return value = value passed to window.close(val) inside it
window.modal(existingWindowInstance): any

window.performDrag(data, mode: "copy"|"move", dragIcon: Image|Element[, xOff, yOff]): "copy"|"move"|null
  // data: { text?, html?, file?: string|string[], json? }

window.focusable(dir: "next"|"prior"|"first"|"last"[, reference: element]): element
  // enumerate TAB order; assign result to window.focus to move focus

window.close([value]): bool     // value is returned from window.modal() call that opened it
window.update()                 // force layout recalculation
window.activate(bringToFront: bool)   // set input focus on window
```

### Class-level (`Window.*`)

```js
Window.this: Window            // current window
Window.all: Array<Window>      // all windows in process, including Window.this
Window.share: Object           // object shared across all windows/documents in the app (clean up in beforeunload!)
Window.screens: integer        // monitor count
Window.screenBox(screen: integer, what[, boxPart])   // like window.screenBox but for arbitrary monitor; "devicePixelRatio" also valid for `what`
Window.elementAt(screenX, screenY): Element           // may return element from ANY window in the process
Window.ticks(): milliseconds   // internal timer
Window.post(event) / Window.send(event): boolean      // global events to all windows (send is sync, stops at first consumer)
```

### Events (`window.on("eventname", handler)`)

| Event | Notes |
|---|---|
| `statechange` | `window.state` changed |
| `closerequest` | cancelable via `event.preventDefault()`; `event.reason`: `0` = user clicked chrome close (🗙), `1` = `window.close()` called, `2` = unload-old/load-new |
| `resolutionchange` | window moved to different-DPI monitor, or system resolution changed |
| `mediachange` | one or more CSS media vars changed |
| `activate` | `event.reason == 0` deactivated, `> 0` activated |
| `replacementstart` / `replacementend` | user started/ended moving or resizing the frame |
| `move` | user moved window |
| `size` | user resized window |
| `trayiconclick` | tray icon clicked |
| `spacechange` | virtual desktop changed; check `window.isOnActiveSpace` |

```js
Window.this.on("closerequest", event => {
  if (event.reason == 0) {  // clicked chrome X
    Window.this.state = Window.WINDOW_MINIMIZED;
    event.preventDefault();
  }
});
```

## Document Life Cycle

Window construction sequence:
1. HWND created with undetermined dimensions.
2. Document loads: parse → load styles → load+run JS (top-level code runs here) → assign prototype/aspect behaviors per CSS → run `document.ready` (window dims may be unknown yet — safe to call `window.move()` here if you already know target size).
3. Window dimensions are set (from root `<html>` attributes, unless script already set them).
4. `ready` event fires (`document.on("ready", fn)`) — window dimensions ARE known here.

```js
<script>
// (1) runs synchronously during SciterLoadFile(), as first step
document.ready = function() {
  // (2) synchronous, inside SciterLoadFile(); all prototype/aspect components
  // mounted (componentDidMount called); window still in construction (no dims yet)
};
document.on("ready", function() {
  // (3) POSTED, async, AFTER SciterLoadFile() returns; window may be visible
});
// or equivalently:
document.on("DOMContentLoaded", function() { /* same timing as "ready" */ });
</script>
```
Note: all `<script>` elements execute after document parsing completes (implicit `defer`).

### Unloading sequence

```js
const UNLOAD_BY_CHROME = 0, UNLOAD_BY_CODE = 1, UNLOAD_BY_LOAD = 2;

document.on("closerequest", evt => {
  if (evt.reason == UNLOAD_BY_CHROME) evt.preventDefault();  // also prevents window close on root doc
});
document.on("beforeunload", evt => {
  // non-cancelable; script namespace still valid
});
frame.on("close", evt => {
  // non-cancelable; document almost gone — handle on <frame> or window
});
```

## Out-of-Canvas Elements (popups, tooltips, airborn)

Desktop windows are smaller than a browser canvas, so Sciter renders certain elements ("windowed popups") in their own OS-level window so they can extend outside the host window's bounds: tooltips, `<select>` dropdowns, `<input|date>` calendar, `<menu>`, custom popups/flyovers.

### Static & dynamic tooltips

```html
<some title="text">                          <!-- plain text tooltip -->
<some tooltip="this my <b>rich</b> tooltip"> <!-- rich HTML tooltip -->
```

Dynamic content via the `tooltiprequest` event:

```js
class Component extends Element {
  cnt = 0;
  ["on tooltiprequest"](evt) {
    evt.source = Element.create(<popup>shown {++this.cnt} times</popup>);
    return true; // handled
  }
}
```

Tooltips are `popup` elements with `role="tooltip"`:
```css
popup[role="tooltip"] { background: gold; padding: 1em; }
some > popup[role="tooltip"] { /* scoped to a specific anchor element */ }
```

### Context `<menu>`s

```js
class Component extends Element {
  ["on contextmenu"](evt) {
    evt.source = Element.create(<menu.context>
      <li.first>First action</li>
      <li.second>Second action</li>
    </menu>);
    return true; // handled
  }
  ["on click at menu.popup > li.first"]() { /* ... */ }
}
```
Inline handlers also work: `<li onclick={() => this.doFirst()}>First action</li>`.

### Popup elements

Shown "mouse-modal": auto-dismiss on outside click or app losing focus.

```js
element.popup(popupElementOrJSX, {
  anchorAt,   // 1..9, reference point on anchor's border box (numpad layout)
  popupAt,    // 1..9, reference point on popup's margin box
  x, y,       // optional explicit window coords for popupAt point
  animationType,     // "blend" | "inflate" | "slide" | "roll"
  animationAxis,     // "horizontal" | "vertical"
  animationHeading,  // "start-to-end" | "end-to-start"
  animationDuration, // Duration
});
```
Engine positions the popup so `popupAt` lands at `anchorAt` on screen. CSS equivalents: `popup-position`, `popup-animation` properties (then `params` can be omitted).

```js
function PopupAvatar({user}) {
  return <popup.avatar><picture src={user.avatarUrl}/><caption>{user.fullName}</caption></popup>;
}
element.popup(Element.create(<PopupAvatar user={u}/>), {options});
```

Popup life-cycle events (delivered to relevant elements): `popup-request` (`evt.source` = popup about to show, sent to anchor/owner), `popup-ready` (`evt.source` = shown popup), `popup-dismissing` (`evt.target` = popup, before destruction), `popup-dismissed` (`evt.target` = owner, after destruction).

### Airborn elements

Windowed elements with explicit, code-controlled lifetime (vs. auto-dismiss popups):

```js
element.takeOff({
  x, y,                     // new position (screen px unless relativeTo says otherwise)
  width, height,            // optional new dimensions, screen px
  relativeTo,                // "screen" | "document" | "window" | "parent" | "self"
  window,                    // "attached" (moves with host window) | "detached" | "popup" (detached + topmost)
});
element.takeOff();          // no-args: "lands" element back to its original position
```

## HTML

### Syntax shortcuts

| Sciter | Regular HTML |
|---|---|
| `<input #id />` | `<input id="id" />` |
| `<input .class />` | `<input class="class" />` |
| `<input \|text />` | `<input type="text" />` |
| `<input (name) />` | `<input name="name" />` |

Combine freely: `<button|radio(group).first>First option</button>` == `<button type="radio" name="group" class="first">First option</button>`. Space after tag name is optional; regular and shortcut HTML can be mixed in the same document.

### Sciter-specific elements

| Element | Notes |
|---|---|
| `<popup>` | popup element, preferably placed in `<head>` |
| `<menu.context>` / `<menu.popup>` | context-menu styled element |
| `<plaintext>` | multiline plain text editor |
| `<htmlarea>` | WYSIWYG/richtext editor |
| `<frameset>` | resizable window blocks |
| `<select|tree>` | tree-list select |
| `<include src="some.html"/>` | inline-inserts an HTML fragment file |

### Attributes

| Attribute | Meaning |
|---|---|
| `spellcheck` | `true`/`false`, enable/disable spellcheck |
| `selectable` | allow content selection (behavior) |
| `novalue` | synonym of `placeholder` |

Other notes: inline event attributes (`onclick=...`) are **not** supported in static HTML — attach handlers in script, or use JSX (`<button onclick={func}>`). Custom element tags are allowed, but need `display` (and often `flow`) set in CSS to render meaningfully. String `&platform-cmd-mod;` renders as `Ctrl`/`Cmd` depending on OS.

### `<include>`

```html
<include src="url" [media="..."]>
  ... fallback content shown if url unavailable or media resolves false ...
</include>
```

```html
<body>
  <include src="windows-header.htm" media='platform == "Windows"' />
  <include src="osx-header.htm" media='platform == "OSX"' />
  <include src="linux-header.htm" media='platform == "Linux"' />
  <include src="content.htm" />
</body>
```

### Supported HTML elements

Sciter recognizes the full HTML5 tag set by default (`TT, I, B, U, STRIKE, S, Q, DEL, INS, BIG, SMALL, SUB, SUP, EM, STRONG, DFN, CODE, SAMP, KBD, VAR, CITE, BR, INPUT, OUTPUT, BUTTON, SELECT, TEXTAREA, HTMLAREA, RICHTEXT, PLAINTEXT, P, TEXT, UL, OL, DL, DIR, MENU, PRE, DIV, CENTER, BLOCKQUOTE, DD, DT, LI, FORM, HR, SPLITTER, H1-H6, ADDRESS, A, IMG, FONT, BASEFONT, MAP, AREA, HTML, BODY, HEAD, TABLE, TD, TH, TBODY, THEAD, TFOOT, CAPTION, COL, COLGROUP, TR, TITLE, ISINDEX, BASE, STYLE, META, LINK, SCRIPT, COMPONENT, REACTOR, OPTION, OPTGROUP, OPTIONS, WIDGET, PARAM, OBJECT, FIELDSET, LEGEND, SPAN, LABEL, NOBR, IFRAME, FRAME, FRAMESET, POPUP, INCLUDE, PICTURE, SECTION, ARTICLE, ASIDE, HGROUP, HEADER, FOOTER, MAIN, PAGEFRAME, PAGEBOX, NAV, TOOLBAR, MARK, PROGRESS, METER, TIME, FIGURE, FIGCAPTION, DETAILS, SUMMARY, SVG (+ G, PATH, RECT, CIRCLE, ELLIPSE, LINE, POLYLINE, POLYGON, SWITCH, USE, DEFS, MASK, RADIALGRADIENT, LINEARGRADIENT, STOP, TEXT), VIDEO, SOURCE, CANVAS`).

Notable purpose-specific ones: `COMPONENT`/`REACTOR` — SSX component declaration (`<component(Clock)>...</component>`, same as `<reactor(Clock)>...</reactor>`); `PICTURE` — non-cacheable image; `SPLITTER` — draggable divider; `PAGEFRAME`/`PAGEBOX` — print pagination; `WIDGET` — generic display:block input counterpart.

Custom elements render fine as long as `display` (and optionally `flow`) is set in CSS.

### Input elements → behaviors

| tag/type | behavior | purpose |
|---|---|---|
| `<input type=text>` | `behavior:edit` | single-line input |
| `<input type=password>` | `behavior:password` | password input |
| `<input type=integer>` | `behavior:integer` | integer numeric input |
| `<input type=decimal>` | `behavior:decimal` | decimal numeric input |
| `<input type=number>` | `behavior:decimal` | integer or decimal |
| `<input type=button>` | `behavior:button` | button |
| `<input type=radio>` | `behavior:radio` | radio button |
| `<input type=checkbox>` | `behavior:check` | checkbox |
| `<input type=hslider>`/`vslider` | `behavior:slider` | slider |
| `<input type=hscrollbar>`/`vscrollbar` | `behavior:scrollbar` | standalone scrollbar |
| `<input type=calendar>` | `behavior:calendar` | day selector |
| `<input type=date>` | `behavior:date` | date input |
| `<input type=time>` | `behavior:time` | time input |
| `<input type=masked>` | `behavior:masked-edit` | masked text input |

Every `<input type=X>` has a `<widget type=X>` `display:block` counterpart.

Buttons: `<button>`, `<button type=submit|reset>` (in `<form>`), `<button type=radio>` (radio + label), `<button type=checkbox>` (check + label), `<button type=menu>` (shows child `<menu>` on click), `<button type=toggle>` (check styled as toggle). Buttons inside `<toolbar>` get distinct toolbar styling.

Selects: `<select>`/`<select type=dropdown>` (`behavior:select-dropdown`), `<select type=list>` (`behavior:select`, supports multi-select w/ checkmarks), `<select type=tree>` (`behavior:tree`), `<select type=switch>` (one-of-many bar).

Text editors: `<textarea>` (`behavior:textarea`), `<htmlarea>` (WYSIWYG), `<plaintext>` (large-text optimized, supports phrasing markup per line).

Output: `<progress>`, `<meter>` (static), `<output>`, `<video>`, `<lottie>` — all `behavior:progress`/`output`/`video`/`lottie`.

Containers: `<frame>` (`behavior:frame`), `<frame type=pager>` (print preview, `behavior:pager`), `<frameset>` (`behavior:frame-set`), `<form>` (`behavior:form`), `<details>` (`behavior:details`, collapsible).

Menus: menu bar has no predefined element (`behavior:menu-bar`), `<menu.context>`/`<menu.popup>` (`behavior:menu`).

### `<html>` window root attributes

Set on the root `<html>` element to configure the OS window:

| Attribute | Description |
|---|---|
| `window-frame` | `"default"\|"standard"\|"solid"\|"solid-with-shadow"\|"extended"\|"transparent"` |
| `window-icon` | icon URL |
| `window-title` | window title |
| `window-width` / `window-height` | initial size, CSS length |
| `window-min-width` / `window-min-height` | CSS length |
| `window-max-width` / `window-max-height` | CSS length |
| `window-resizable` | `true`\|`false`\|`<length>` (e.g. `10px` resize-grip inset from frame) |
| `window-minimizable` / `window-maximizable` | `true`\|`false` |
| `window-alignment` | `1..9` relative to desktop, `-1..-9` relative to parent window |
| `window-blurbehind` | see `window.blurBehind` in SKILL.md |
| `window-corners` | `"default"\|"not-round"\|"round"\|"round-small"` (OS support, e.g. Win11) |
| `window-state` | `"shown"\|"minimized"\|"maximized"\|"full-screen"\|"hidden"` |
| `lang` | ISO 639-1, drives spellcheck dictionary, `Date` locale, etc. |
| `disable-debug` | do not connect to inspector |

### Window chrome roles

Applied to arbitrary elements inside root `<html>` to give them window-chrome behavior — this is how you build a custom title bar:

| Attribute | Behavior |
|---|---|
| `role="window-caption"` | drag to move the window |
| `role="window-minimize"` | acts as minimize button |
| `role="window-maximize"` | acts as maximize button |
| `role="window-close"` | acts as close button |
| `role="window-icon"` | acts as window icon (Windows: shows system menu on click) |

```html
<header>
  <button role="window-icon" />
  <caption role="window-caption">My Window</caption>
  <button role="window-minimize" />
  <button role="window-maximize" />
</header>
```

## Custom Aspect Functions (CSS `aspect:`)

See `component-painting-reference.md` for the full write-up (parametrized aspects, params object, one-time invocation semantics).
