# Graphics & Media Patterns Mined From Official Samples

Real-world idioms extracted from `samples.sciter/{svg-icons,images,video,audio,lottie,immediate-mode-painting,image-generation-painting,effects,colorizer,printing,terminal,code-beautifier}`.
This file complements (does not repeat) `graphics-api-reference.md`, `component-painting-reference.md`, and `behaviors-reference.md`.

## SVG & Icons

SVG in Sciter is not just a static image format — it participates in the CSS cascade of its host document.

**CSS custom properties flow from the host element into an inline `<svg>`'s attribute values** via `var()`, exactly like in a browser:

```css
/* icon.svg used as background image */
.icon {
  var(acolor): #00F;              /* CSS var defined on host element */
  background: url(icon.svg) no-repeat;
  fill: yellow;                   /* also settable via CSS fill on host */
}
.icon:hover { var(acolor): #F00; }
```
```xml
<!-- icon.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="3" width="20" height="17" rx="2" stroke="var(--acolor,#000)" stroke-width="2"/>
</svg>
```
This works whether the SVG is used as a CSS `background`/`foreground-image` **or** inlined directly in markup.

**Inline `<svg>` supports `styleset` targeting `@set` rules by class**, so individual sub-shapes can be recolored from the host document's stylesheet without touching the SVG file:
```html
<svg width="24" height="24" viewBox="0 0 24 24" styleset="#test">
  <rect class=a .../>
</svg>
<style>
@set test { rect.a { fill: blue; } }
</style>
```

**Three distinct ways to bring an SVG file into a page**, each with different semantics:
```html
<img src="icon.svg" />          <!-- treated as a raster-like image -->
<include src="icon.svg"/>       <!-- SVG markup is spliced into the DOM directly (inline, stylable) -->
<div style="background:url(icon.svg)"> <!-- as a CSS image -->
```
`<include src=.../>` is the way to get a *live*, CSS-targetable SVG subtree without hand-copying markup into the page.

**CSS `path()`/`url(path:...)` values** are used pervasively for vector icon buttons instead of separate SVG/PNG assets — see `foreground-image: url(path:M 11,10 21,17 11,24 z);` under Video below. This avoids extra image files entirely for simple glyphs.

## Images

The `images/` sample folder itself contains only raw PNG assets (no source files) — those PNGs are consumed by other samples/widgets as generic image content; nothing new to extract there beyond standard `<img>`/`background`/`Graphics.Image.load` usage already covered in `graphics-api-reference.md`.

## Video

**Full custom video-controls overlay as a Reactor component** (`video/video-controls.js` + `.css`), driven entirely by native `video.*` behavior events and properties — a good reference implementation to copy from:
```js
export class VideoControls extends Element {
  render() {
    // reads this.video.duration / .position / .audioVolume directly
    return <video controls src={this.src} mode={this.status}
                  styleset={__DIR__ + "video-controls.css#video-controls"}>{content}</video>;
  }
  ["on video-start"]() { this.componentUpdate({ status: "playing" }); }
  ["on video-stop"]()  { this.componentUpdate({ status: this.video.isEnded ? "ended" : "stopped" }); }
  ["on mouse-enter"]() { this.showBar(true); }   // auto-hide control bar
  ["on input at input.position"](evt,slider) { this.video.stop(); this.video.position = slider.value; }
}
```
Note the event names actually fired are `"video-start"`/`"video-stop"` (hyphenated) on the element, distinct from the `"videostart"`/`"videostop"` (no hyphen) DOM events documented elsewhere and also used in other samples (`"on videostart at video"`) — **both spellings appear across samples**, so listen for both / verify empirically if an event handler doesn't fire.

**Auto-hide control bar via CSS transform + transition**, toggled from JS (not CSS-only `:hover`) so it can pulse via a timer:
```css
div.bar { transition: transform quart-in-out 400ms; }
div.bar[shown=false] { transform: translate(0,100%); }
```
```js
showBar(onOff) {
  this.componentUpdate { barIsShown: onOff };
  if (onOff) { this.timer(500ms, this.pulse); this.pulse(); }  // duration literal `500ms` directly in JS
}
```

**Volume slider uses a log10 lookup table**, not a linear 0..1 mapping, since human hearing / audio volume perception is logarithmic — a real UX gotcha worth reusing:
```js
static vlog10 = [0,0,0.3010,0.4771,0.6020,0.6989,0.7781,0.8450,0.9030,0.9542,1];
```

**`sizing="contain"` / `sizing="cover"`** attribute on `<video>` controls letterboxing vs. cropping, mirroring CSS `object-fit`.

**`behavior:video-generator`** — a native test/demo behavior (`video.generator` class + `behavior: video-generator video;`) that synthesizes frames at 24 FPS for testing partial-frame video updates. Snapshotting the live frame to a PNG file uses the same `style.imageOf()` + `.toBytes()` + `@sys` fs pattern used for element-to-image capture (see Image Generation section):
```js
video.onsizechange = function() { let [w,h] = this.state.box("dimension"); ... };
document.on("click","#snapshot", async function() {
  let frame = video.style.imageOf("foreground-image");
  let arrayBuffer = frame.toBytes("png");
  const file = await sys.fs.open(URL.toPath(__DIR__ + "frame.png"), "w+", 0o666);
  await file.write(arrayBuffer); await file.close();
});
```

**`behavior:camera`** (`behavior: camera video;`) exposes `video.camera.devices` (array of device names) and `video.camera.streamFrom(deviceIndex)` to pick a webcam and stream live video into a `<video>` element — undocumented elsewhere in the skill:
```js
for (let dname of video.camera.devices) dl.append(<button|radio>{dname}</button>);
dl.on("click", "button", (evt, button) => video.camera.streamFrom(button.elementIndex));
```
(Native C++ camera-capture behavior must be enabled in the SDK build for this to work.)

**Live video-frame-as-CSS-background with blur, via `bindImage`** — binds the currently-playing video frame to an `in-memory:` URL so a *sibling* element's CSS `background` (with `filter: blur()`) can show a blurred duplicate of the video as a backdrop:
```css
video-stack > div { background: url(in-memory:video-frame) no-repeat 50% 50%; background-size:cover; filter: blur(30px); }
```
```js
["on videostart at video"](e, videoEl) {
  const img = videoEl.style.imageOf("foreground-image");
  document.bindImage("in-memory:video-frame", img);
}
```
This is the idiomatic way to do "ambient blur backdrop" effects (as seen in media players) purely in CSS+JS, no manual painting needed.

## Audio

`Audio.load(url)` / `.play()` / `.pause()` / `.resume()` / `.stop()` usage is already documented in SKILL.md; samples confirm the idiom of always wrapping in `try/catch` since `Audio.load` throws on 404, and nulling out the reference after `stop()`:
```js
try {
  audio = await Audio.load(__DIR__ + "/file.mp3");
  await audio.play();          // resolves when playback ends naturally
} catch (e) { console.log(e); }
```
`audio.play()` can be called without `await` and paired with `pause()`/`resume()` mid-stream (`test-pause-resume.htm`). Calling `.stop()` on a still-playing `Audio` and awaiting it before loading a new one avoids overlapping playback when switching tracks quickly (`test-stop.htm`).

## Lottie

**Full lottie player UI pattern** (`lottie/lottie-player.htm`): position slider bound to `lottie.position` (0..1), a `timer(32, fn)` (~30fps) poll loop that returns `lottie.playing` to auto-stop itself when done, and a `<folder>` file browser (`filter="*.json"`) feeding `"file-activate"` events to swap animations at runtime:
```js
document.on("file-activate", (e) => {
  ellottie.lottie.stop(); ellottie.lottie.load(e.data); ellottie.lottie.play();
  ellottie.timer(32, showLottieState);
  return true;
});
function showLottieState() {
  elposition.value = ellottie.lottie.position;
  return ellottie.lottie.playing;      // timer callback: return false/falsy to stop repeating
}
```

**Theming a Lottie via CSS variables + `lottie.update()`**, driven from form controls — the `"**"` keyPath wildcard applies a property update to *all* matching layers:
```js
document.$("lottie").lottie.update("Shape Layer 1.Ellipse 1.Fill 1", "FillColor", hcolor);
document.$("lottie").lottie.update("**", "StrokeWidth", w);   // wildcard keyPath = every layer
```

**`lottie.markers`** (array of `[name, startFrame, endFrame]`) is used to play a named sub-range of an animation without hardcoding frame numbers:
```js
var markers = this.lottie.markers;
this.lottie.play(markers[1][1], markers[2][1]);  // e.g. touchDownStart..touchDownEnd
```

## Immediate-Mode Painting

**`aspect:` (function-based behavior) vs `prototype:` (class-based)** — both are used for immediate-mode painting setup; `aspect` binds a plain constructor function that runs with `this` = the element (no `class`/`extends Element` needed):
```css
body { aspect: Particles; }
```
```js
function Particles() {
  const text = new Graphics.Path(...);
  function paint(context) {
    let [width,height] = this.state.box("dimension","inner");
    context.draw(circle, particle);      // draw a pre-built Graphics.Path at a point
    this.requestPaint();                 // self-scheduling animation loop
  }
  this.paintContent = paint;
}
```
Full continuous-animation loop pattern: build reusable `Graphics.Path`/`Graphics.Text` objects **once** outside the paint function (not per-frame), mutate a plain-object particle array each frame, and end every paint call with `this.requestPaint()` to keep animating. FPS is measured with `Window.ticks()` deltas averaged over a ring buffer and shown via `Window.this.caption`.

**Interactive drag-selection box** combining `paintForeground`, pointer capture, and a blocking modal event loop:
```js
this.on("^mousedown", event => {
  this.paintForeground = paint;
  this.state.capture(true);
  this.on("^mousemove", move);
  Window.this.doEvent("untilMouseUp");   // blocks until mouseup, pumping the message loop
  this.paintForeground = null;
  this.off(move);
  this.state.capture();
});
```
`Window.this.doEvent("untilMouseUp")` is a synchronous drag-loop primitive not covered elsewhere in the skill — lets you write drag interactions as straight-line imperative code instead of separate mousemove/mouseup handlers.

**Clip-to-background-area trick**: `gfx.pushLayer("background-area")` + oversized `fillRect(-1000,-1000,2000,2000)` fills exactly the element's background box (border-radius included) by relying on the layer's clip, without computing the box geometry by hand.

**Auto-scale-to-fit content painting** (`draw-element.htm`) — a component whose `paintContent` computes a uniform scale factor from child content size vs. own box, then transforms and `gfx.draw(content)`s an arbitrary child element (here a `<picture>` figure), returning `true` to suppress the default content painting:
```js
paintContent(gfx) {
  const [w,h] = this.state.box("dimension","inner");
  const [cw,ch] = content.state.box("dimension","border");
  let scale = Math.min(w/cw, h/ch, 1 /*conceptually*/);
  gfx.translate((w - cw*scale)/2, (h - ch*scale)/2);
  gfx.scale(scale,scale);
  gfx.draw(content);
  return true;   // we drew the content ourselves — element must not also draw it
}
```

**`document.paintOutline`** (top of z-order, above everything) plus `document.morphContent(stepFn, {duration})` implement a smooth "focus ring travels between fields" animation (`effects/focus-animator.js`) driven off native `"focus"`/`"focusout"` document events and `evt.relatedTarget`/`evt.target` box rects — a complete non-trivial example of app-wide custom-painted UI chrome.

## Procedural Image Generation

**`new Graphics.Image(w, h, painterFn)`** used to synthesize a custom mouse cursor at runtime, then install it via `style.setCursor(image, hotspotX, hotspotY)`:
```js
function generateMouseCursorImage(width,height) {
  return new Graphics.Image(width, height, function(gfx) {
    gfx.strokeStyle = "red"; gfx.fillStyle = "gold";
    gfx.draw(new Graphics.Path("M 1 1 L 99 0 L 35 35 L 0 99 Z"));
  });
}
document.body.on("mousedragrequest", function(evt) {
  this.style.setCursor(generateMouseCursorImage(100,100), 0, 0);
  return true;
});
document.body.on("mouseup", function(evt) { this.style.setCursor(null); });
```

**Rendering a live element/frame subtree to a PNG file** — `new Graphics.Image(w, h, elementOrFrame)` (element itself as the "painter") + `.toBytes("png")` + `@sys` filesystem write, used identically for both a captured `<frame>` (whole embedded document) and a video snapshot:
```js
import * as sys from "@sys";
const [w,h] = frame.state.box("dimension");
const image = new Graphics.Image(w, h, frame);      // element passed directly as painter source
const bytes = image.toBytes("png");
const file = await sys.fs.open(URL.toPath(__DIR__ + "frame.png"), "w");
await file.write(bytes); await file.close();
```
This "pass an existing element as the Image painter" form (vs. a callback function) isn't spelled out in `graphics-api-reference.md` and is a clean way to rasterize any live subtree (including a `<frame src=...>` showing a whole other document) to PNG bytes.

## CSS Effects/Filters

`filter: blur(30px)` on a plain `<div>` combined with the `bindImage` live-video-frame trick above is the only concrete `filter` usage found in samples (see Video section) — confirms `blur()` works as a standard CSS filter function; no other filter functions were exercised in these samples.

**Content-replacement transition effects** — `element.replaceContent(newContent, {effect, ease, duration})` (already documented) is exercised with the full enumerated list of effect names, useful as a copy-pasteable reference of valid values:
`blend`, `blend-atop`, `slide-{top,bottom,left,right}`, `slide-over-{top,bottom,left,right}`, `remove-{top,bottom,left,right}`, `scroll-{top,bottom,left,right}`. And easing names: `linear`, `{quad,cubic,quart,quint,sine,expo,circ,elastic,back,x-back,xx-back,bounce}-{in,out,in-out}`.

**`element.morphContent(stepFn, {ease, duration})`** — undocumented elsewhere in the skill. Runs `stepFn(progress: 0..1)` on every animation tick; returning `false`/falsy from the step function early-terminates the animation. Used to drive a custom `paintForeground` line-sweep animation:
```js
function step(progress) { p = progress; div.requestPaint(); return true; }
await div.morphContent(step, {ease:"sine-in-out", duration:600});
```
Also callable on `document` itself (`document.morphContent(...)`) for whole-page animations, not just a single element.

## Printing

Sample confirms `behavior:pager` (`frame|pager`) usage end-to-end and reveals real-world details not fully spelled out in `behaviors-reference.md`:

- **Event name mismatch vs. documented names**: the sample listens for `"on paginationready"` and `"on paginationend"` (single word, no hyphen), where `behaviors-reference.md` documents `"pagination-start"` / `"pagination-end"` / `"pagination-page"` (hyphenated). Treat both spellings as possible in practice and verify empirically:
  ```js
  ["on paginationready"](evt) { ... }               // pager is ready to accept a document
  ["on paginationend"](evt) { document.$("#numpages").value = evt.reason; }  // evt.reason = total page count
  ```
- **Deferred document loading pattern**: rather than loading a document immediately, the pager fires `"paginationready"` once template/page-size negotiation is done, and the app supplies the document lazily via a custom bubbling event:
  ```js
  ["on paginationready"](evt) {
    let event = new Event("provide-current-document", {bubbles:true});
    if (this.dispatchEvent(event)) {
      const {html, href} = event.data;
      this.pager.loadHtml(html, href);
    }
  }
  ```
- **Printer selection UI** is built from `pager.printers()` as a radio-button list (not the native `selectPrinterDialog()`), then wired to `pager.selectPrinter(id)`:
  ```js
  for (var printer of this.pager.printers())
    printers.append(<button|radio(printer) value={printer.id} state-checked={printer.isDefault}>{printer.name}</button>);
  document.on("change", "div#printers", (evt,form) => Pager.instance.pager.selectPrinter(form.value.printer));
  ```
- **`<frame|pager>` attributes used together**: `cols=1 page-template="page-template.htm" content-style="print.css"` — `content-style` supplies a stylesheet applied to the *paginated content* (separate from the page template's own styles), used here to make tables/images/blockquotes print-friendly (`border-collapse`, `max-width:100%`, etc).
- **Page template document structure** (`page-template.htm`) — the template's `<html>` root receives `page-no` and `page-parity` ("odd"/"even") attributes per rendered page, and must contain a `<pageframe/>` element where the actual paginated content is projected:
  ```html
  <html page-no page-parity>
    <head><style>body{flow:vertical;} body>pageframe{size:*; margin:0.5in;}</style></head>
    <body><pageframe /></body>
  </html>
  ```
- Current page navigation: `pager.page = pageNumber` (read/write, as documented), bound to an `<input|integer>` in the sample's UI.
- No undocumented top-level `Printer`/`print()` global was found — all printing goes through the `behavior:pager` element API (`frame.pager.*`), which is already documented in `behaviors-reference.md`. The sample folder is a good canonical reference implementation for that behavior, not a new API surface.

## Terminal

Confirms `behavior:terminal` basics (`terminal.write()` with ANSI/`\x1b[...m` escape codes, `rows`/`columns` attributes) already documented. Adds one reusable pattern:

**Tagged-template ANSI color helper** (`xterm.js`) — a small library wrapping ANSI SGR codes as chainable tagged-template getters, e.g. `` xt.bold`text` ``, `` xt.dim.bg_blue`text` ``, letting terminal output be colorized without manually concatenating escape codes:
```js
writeln(xt.bold`back colors:`);
writeln(xt.dim.bg_blue`BLUE`, "dim back color");
writeln(xt.underline`underline`, "and", xt.strikethrough`strikethrough`);
```
where `writeln` just does `terminal.write(args.join(" ") + "\r\n")`. Not a Sciter API itself, but a handy idiom to reuse when producing colored terminal output from script (data table: SGR code, colors object, styles object with `[on,off]` pairs, e.g. `red: [31, 39]`, `bold: [1, 22]`).

## Syntax Highlighting (Tokenizer + `::highlight()`)

The `colorizer/` sample reveals a **`Tokenizer` API and text-range highlighting mechanism not documented anywhere else in the skill** — genuinely new surface, used to build a live syntax-highlighting `<pre>`/`<plaintext>` editor:

```js
export function colorize() {                 // installed via `aspect: colorize url(colorizer.js);`
  const tz = new Tokenizer(this, syntaxMimeType);  // e.g. "text/html", "text/css", "text/javascript"
  let tt;
  while (tt = tz.nextToken()) {
    switch (tt) {
      case "number":      tz.tokenRange.highlight("number"); break;
      case "string":      tz.tokenRange.highlight("string"); break;
      case "comment":     tz.tokenRange.highlight("comment"); break;
      case "name": {
        const val = tz.tokenValue;
        if (KEYWORDS[val]) tz.tokenRange.highlight("keyword");
        break;
      }
      case "tag-start":  /* markup mode */ break;
      case "tag-head-end": (new Range(tagStart, tz.tokenRange.end)).highlight("tag"); break;
      case "island-end": tz.pop(); break;   // returned from an embedded <script>/<style> region
    }
  }
}
```
Key API surface observed:
- `new Tokenizer(element, mimeType)` — tokenizes an element's text content (`text/html`, `text/css`, `text/javascript`, or any registered syntax).
- `tz.nextToken()` — advances and returns a token-type string (`"number"`, `"number-unit"`, `"string"`, `"name"`, `"comment"`, `"tag-start"`, `"tag-head-end"`, `"tag-end"`, `"tag-attr"`, `"island-end"`, ...).
- `tz.tokenRange` — a `Range` covering the current token; `.highlight(name)` tags it for CSS styling (equivalent to `range.applyMark(name)`, already documented).
- `tz.tokenValue` — the token's text.
- `tz.markupTag` / `tz.markupAttributeName` / `tz.markupAttributeValue` — set during markup tokenization.
- `tz.push(mimeType, endMarker)` / `tz.pop()` — enters/exits an embedded-language "island" (e.g. `<script>` inside HTML), matching the `"island-end"` token type.
- `new Range(startPos, endPos)` constructed directly from two token-range boundary positions (not just via selection).

**Styling uses `::highlight(name)`**, distinct from the `::mark(name)` pseudo already documented for `range.applyMark()` — both appear to work off the same underlying mark mechanism:
```css
text::highlight(keyword) { color: blue; }
text::highlight(string)  { color: teal; }
text::highlight(comment) { color: green; }
```

**Live editor variant**: applying `aspect: colorize url(colorizer.js);` to a `<plaintext>` element (not just static `<pre>`) makes it an editable syntax-highlighted text box; re-tokenizing on every `"change"` event via a debounce timer keeps highlighting in sync while typing:
```js
if (isEditor) this.on("change", function() { this.timer(40, doIt); });   // ~40ms debounce
```
Redefining the element's `value` accessor (`Object.defineProperty(me, "value", {get/set...})`) to re-run tokenization on every external `.value =` assignment is the pattern used to keep highlighting correct when content is set programmatically, not just by typing.

This is effectively a full recipe for building a code editor / log viewer with syntax highlighting purely in Sciter script — no native extension required.

## Code Beautifier (minor, non-graphics)

`code-beautifier/` is a dev-tooling sample (runs `prettier` over `.htm`/`.js`/`.css` via `npm`/`npx`), not a runtime graphics/painting technique. One portable gotcha it documents: Sciter's compact markup shortcuts (`<select|dropdown(theme)>` for type/id/class/name shorthand) are not valid HTML and will fail generic HTML tools like Prettier unless a space is inserted (`<select |dropdown(theme)>`). Worth knowing if wiring any external HTML formatter/linter into a Sciter project's build.
