# Patterns Mined From `samples.css/`

Real-world patterns and gotchas extracted from Sciter's official CSS sample apps that
were **not** already covered in `css-reference.md`. Organized by topic; each entry has a
short explanation + a real excerpt from the sample it came from.

---

## Stock Icons (`icon:name`)

`css-reference.md` only said "list of names viewable in `usciter`". Here is the actual
list, mined from `stock-icons.htm` (`<icon|name>` custom-tag syntax, CSS form is
`url(icon:name)`):

**Arrows**: `arrow-left`, `arrow-right`, `arrow-up`, `arrow-down`, `left`, `right`, `up`,
`down`, `upload`, `download`, `undo`, `redo`, `replay`, `refresh`, `external`,
`internal`, `caret`, `caret-up`, `caret-down`, `scale`, `scale-h`, `scale-v`, `move`,
`move-alt`, `swap`, `shuffle`

**Inline**: `i-left`, `i-right`, `i-up`, `i-down`, `i-tick`, `i-cross`, `i-plus`,
`i-minus`, `i-equal`, `i-divide`, `i-bullet`, `i-asterisk`

**Audio/video**: `play`, `pause`, `prev`, `next`, `subtitles`, `vol-low`, `vol-mid`,
`vol-high`, `vol-mute`, `captions`, `hd`, `audio-description`

**Charts**: `chart-line`, `chart-bar`, `chart-scatter`, `chart-area`, `chart-pie`

**Time/date**: `calendar`, `clock`

**User actions**: `star`, `heart`, `flag`, `bookmark`, `chat`

**Editorial**: `edit`, `delete`, `plus`, `minus`, `show`, `hide`, `lock`, `ban`,
`pipette`, `cog`, `link`, `attach`, `copy`

**Users**: `user`, `group`

**Content**: `file`, `folder`, `image`, `video`, `audio`, `microphone`, `video-camera`,
`print`

**Navigation**: `menu`, `bars`, `opts-h`, `opts-v`, `home`, `cancel`, `search`,
`zoom-in`, `zoom-out`, `contract`, `expand`

**Layout**: `grid`, `matrix`, `list`, `landscape`, `portrait`, `panel-left`,
`panel-right`, `min`, `max`

**Network**: `mail`, `code`, `cloud`, `web`, `wifi`, `drive`, `server`, `rss`, `share`

**Toggle**: `box`, `box-full`, `box-plus`, `box-minus`, `box-tick`, `box-cross`,
`box-plus-o`, `box-minus-o`, `box-tick-o`, `box-cross-o`, `radio-off`, `radio-on`,
`radio-full`, `power`

**Status**: `info`, `warn`, `pass`, `fail`, `unknown`

**Text**: `text`, `bold`, `italic`, `underline`, `strikeout`, `text-size`,
`text-unstyle`, `sub`, `sup`, `paragraph`, `hash`, `at`, `translate`

**Alignment**: `align-left`, `align-center`, `align-right`, `justify-left`,
`justify-center`, `justify-right`, `indent`, `outdent`, `chapters`, `columns`,
`sort-asc`, `sort-desc`

**Layers**: `above`, `below`, `difference`, `intersect`, `outline`, `unite`

Usage: `<icon|star />` custom tag (auto-sizes as a button-like icon element), or
`background-image: url(icon:star)`. The `<icon>` element also natively supports
`behavior:button` and `fill`/`background` styling:

```css
icon { size:24px; behavior:button; }
icon:hover { background:#000; fill:#fff; }
```
```html
<icon|arrow-left title="Left Arrow" />
```

### `stock:` scheme — distinct from `icon:`

Separate from named "microns" icons, Sciter also ships a small **`stock:`** image
scheme drawn via `fill`/`stroke`/`stroke-width` (from `css++/stock-images.htm` and
`css++/stock-images-styling.htm`). Available names: `arrow-left`, `arrow-right`,
`arrow-up`, `arrow-down`, `arrow-ne`, `arrow-se`, `arrow-sw`, `arrow-nw`, `arrow-n`,
`arrow-s`, `arrow-e`, `arrow-w` (each with a `-hollow` filled/outline variant),
`checkmark` (+ `-hollow`), `cross-x` (+ `-hollow`), `disk`, `circle`, `frame`, `block`,
`chevron-right`/`-left`/`-up`/`-down` (each + `-hollow`).

```css
section.filled > div { fill:#000; background-image:url(stock:arrow-left); background-size:7dip 7dip; }
section.hollow > div { stroke:#000; stroke-width:1dip; fill:transparent; background-image:url(stock:arrow-left); }
```

Used as `<img src="stock:checkmark">` too. Color comes from `fill`/`stroke`, not
`background-color`, so tinting stock icons per-theme is just a CSS `color`/`fill` swap.

---

## File-Type Icons (`behavior:file-icon`)

`file-icon.htm` shows a native behavior that renders the OS's file-type icon for a given
path — no image asset needed:

```css
icon.file { behavior:file-icon; }
```
```jsx
function FileName({filename}) {
  const [folder, file] = fs.splitpath(filename);
  return <text filename={filename}><icon.file/>{file}</text>
}
```

The element reads its `filename` **attribute** to know which file's icon to draw (set
via JSX attribute `filename={...}`, i.e. `<icon.file filename="C:/path/to/file.txt">`).

---

## Icon Fonts (Font Awesome)

`css-fontawesome/` embeds a **modified** Font Awesome 6 Free CSS build. Two
Sciter-specific adaptations documented in the CSS file's own header comment
(`fontawesome/fontawesome.css`):

1. All `-webkit-*` properties stripped (irrelevant/unsupported in Sciter).
2. **`::before` pseudo-elements are NOT used** — glyphs are set as direct `content` on
   the icon class itself: `.fa-xing-square { content: "\f169"; }` instead of
   `.fa-xing-square::before { content: "\f169"; }`. This works because in Sciter
   `content` can be set on any element (already noted in css-reference.md), so the
   extra pseudo-element indirection browsers need is unnecessary — **prefer setting
   icon-font glyph content directly on the element class**, skip `::before`.

Usage is otherwise standard Font Awesome markup, self-closed since `<i>` carries no
children:

```html
<link/@import url(fontawesome/fontawesome.css);
<i class="fa fa-camera-retro fa-5x" />
<button><i class="fas fa-star" /> label</button>
```

`@font-face` blocks for `'Font Awesome 6 Free'` / `'Font Awesome 6 Brands'` work
normally; sizing via `.fa-1x`...`.fa-9x` (`font-size: Nem`) classes.

---

## css++ Extensions (Sciter-only CSS features beyond the prose docs)

### `@mixin`-in-`@mixin` composition

Mixins can call other mixins from inside their own body, letting you build semantic
variants on top of a shared base (`css++/@mixin-in-mixin.htm`):

```css
@mixin LIKE-BUTTON(basecolor) { behavior:button; background:linear-gradient(top, tint(basecolor,+0.3), basecolor, tint(basecolor,-0.4)); }
@mixin PRIMARY-BUTTON   { @LIKE-BUTTON(#007bff); color:#fff; }
@mixin SECONDARY-BUTTON { @LIKE-BUTTON(#868e96); color:#fff; }
a.btn-primary { @PRIMARY-BUTTON; display:inline-block; }
```

### `@if`-conditional `@mixin` and `@const` redefinition

The same mixin/const name can be redefined per `@if` branch (screen vs print, etc.) —
later matching definition wins, effectively giving you conditional design tokens
(`css++/conditional-@mixin.htm`, `css++/conditional-@const.htm`):

```css
@if screen { @mixin LIKE-BUTTON { background:linear-gradient(top,#3498db,#2980b9); } }
@if print  { @mixin LIKE-BUTTON { background:#ccc; } }
div { @LIKE-BUTTON; }
```

`@const` can also be scoped **inside a `@set` styleset**, shadowing an outer `@const` of
the same name only within that styleset's rules:

```css
@const MAIN_COLOR:#00f;               /* fallback */
@set test {
  @const MAIN_COLOR:#090;             /* shadows outer value, only inside this set */
  p { color:@MAIN_COLOR; }
}
div.with-set { style-set:test; }
```

### `tint()` 3-argument form

`css-reference.md` shows `tint(color, luminanceDelta)`. Samples show a **second delta
for saturation**: `tint(color, luminanceDelta, saturationDelta)`
(`css++/hsl-colors.htm`):

```css
ul.t3 li:nth-child(1) { color: tint(@BASE_COLOR, -0.5, -0.5); } /* darker AND desaturated */
```

### System logical colors (full enumerated list)

`css++/system-colors.htm` enumerates every OS-theme logical color keyword usable
anywhere a `<color>` is expected: `activecaption`, `inactivecaption`,
`activecaptiontext`, `inactivecaptiontext`, `appworkspace`, `desktopbackground`,
`threedtext`, `threedface`, `threedhighlight`, `threedlight`, `threedshadow`,
`threedlightshadow`, `threeddarkshadow`, `windowtext`, `window`, `graytext`,
`highlight`, `highlighttext`, `infobackground`, `infotext`, `scrollbar`. Combine with
`tint()` for theme-aware derived colors (see `hsl-colors.htm`):

```css
@const THEME_COLOR: infobackground;   /* a system color, used as a normal token */
pre { border: 4px solid tint(@THEME_COLOR, -0.25); background-color: tint(@THEME_COLOR, 0.25); }
```

### `outline-style: glow`

A Sciter-only outline style for focus rings, animatable via `transition`
(`css++/outline-glow.htm`):

```css
input.glow:focus {
  border-color: highlight;
  outline: 5dip glow highlight -1dip;   /* width style color offset */
  transition: outline linear 0.25s, border-color linear 0.25s;
}
```

### Custom cursor from an image (`style.setCursor`)

`element.style.setCursor(image, hotspotX, hotspotY)` / `setCursor(null)` to reset — sets
a per-element cursor from a loaded `Graphics.Image` (`css++/dynamic-cursor.htm`):

```js
const img = await Graphics.Image.load(__DIR__ + "images/cursor.png");
document.$("div").style.setCursor(img, 24, 24);
// later: document.$("div").style.setCursor(null);
```

### `attr()` for driving `<img>`/`<picture>` src from CSS

Beyond attribute defaults on inputs, `attr(src)` can point pictures at theme-specific
stock images purely from CSS, no markup change needed (`css++/attributes.htm`):

```css
picture.info  { attr(src): url(sciter:icon-information.png); }
picture.error { attr(src): url(sciter:icon-error.png); }
```
(`sciter:icon-*.png` is another built-in icon URL scheme, distinct from `icon:`/`stock:`.)

### `::mark(name)` + `Range` — programmatic text highlighting

A pseudo-element (distinct from `::marker`) for highlighting arbitrary text ranges,
driven entirely from JS via the DOM `Range` object — useful for search-result
highlighting in text areas (`css++/mark.htm`):

```css
textarea::mark(found) { color:brown; background-color:yellow; }
```
```js
const range = new Range();
range.setStart(textNode, pos);
range.setEnd(textNode, pos + needle.length);
range.applyMark("found");   // range.clearMark("found") to remove
```

### `text-overflow: path-ellipsis`

Ellipsizes long **file paths** intelligently — collapses the middle, keeping the start
and the filename visible — instead of naive tail-truncation. Falls back to plain
`ellipsis` behavior for text without path separators (`css++/path-ellipsis.htm`):

```css
p { width:0.5*; overflow-x:hidden; white-space:nowrap; text-overflow:path-ellipsis; }
```

### `visibility` — full value semantics (`none` vs `hidden` vs `collapse`)

`css-reference.md` only notes `visibility:none` ≈ `display:none`. The full picture from
`css++/visibility-collapse.htm` + `css++/visibility-none-article.htm`:

* `none` — excluded from the render tree entirely, like `display:none` (Sciter-specific).
* `hidden` — stays in the render tree and **takes up space**, just isn't painted.
* `collapse` — stays in the render tree but its size on the **flow axis** collapses to
  zero (e.g. in `flow:horizontal`, a `visibility:collapse` child keeps its height but
  its width collapses) — works for *any* element in Sciter, not just table rows as in
  standard CSS.
* `visible` — default.

```css
[collapsed] { visibility:collapse; }   /* width→0 in a flow:horizontal row, height kept */
[hidden]    { display:none; }
```

Also: attribute-driven multi-state visibility toggling via `~=` attribute selectors is a
clean way to implement view-mode switches without JS-side class juggling
(`css++/visibility-none.htm`):

```css
[for-mode] { visibility:none; }
html[mode='pending'] [for-mode~='pending'] { visibility:visible; }
```
```js
document.on("change", "select|switch", (evt, sel) => document.setAttribute("mode", sel.value));
```

### `<style src="..." forlang="...">` — language-conditional stylesheet loading

Loads an entire external stylesheet only when the document's language matches
(`css++/lang-conditional-css.htm`):

```html
<html lang=ru>
<style src="css/ru.css" forlang="ru,ua" />
<style src="css/en.css" forlang="en,en-ca" />
```

### `aspect` lifecycle: `.detached`

Beyond mounting (`function Foo({...}) { ... }` runs on attach), an aspect function
can define a static `.detached` callback that runs on unmount/detach
(`css++/aspect.htm`):

```js
function Foo({caption}) { this.innerText = caption; }
Foo.detached = function () { console.log("Foo detached", this); };
```

### `height: width(N%)` — fixed aspect-ratio boxes

`width(X%)` is documented as a value function; the practical fixed-ratio-box idiom is
worth calling out explicitly (`css++/fixed-ratio.htm`):

```css
div { width:50%; height:width(75%); }  /* forces a 4:3 box regardless of width */
```

### `display:contents` for template grouping in `flow:row()`

`display:contents` elements are invisible to layout but usable as **markup-only
grouping wrappers** around `flow:row()` template cells — handy for keying/looping
repeated row-groups in JSX without breaking the grid (`css-flex/grid-row-template-like-table.htm`):

```css
dl { flow:row(dt, dd); flow-columns: max-content *; }
row { display:contents; }   /* pure grouping, doesn't participate in the grid itself */
```
```html
<dl>
  <row><dt>Term</dt><dd>Definition</dd></row>
  <row><dt>Term2</dt><dd>Definition2</dd></row>
</dl>
```

### `<details>`/`<summary>` and `behavior:details`

Native HTML5 `<details>`/`<summary>` works out of the box, no CSS needed
(`css++behaviors/details-summary.htm`). For custom collapsible markup, apply
`behavior:details` to any element and style with the `:expanded` pseudo-class
(`css++behaviors/details.htm`):

```css
li { behavior:details; }
li > p { visibility:none; }
li:expanded > p { visibility:visible; }
```
```html
<details><summary>Epcot Center</summary><p>...</p></details>
```

### `behavior:expandable-list` — accordion with `:animating` state

Built-in accordion behavior where only one `<li>` is `:expanded` at a time; the
`:animating` pseudo-class lets you keep detail content visible/interactive *during* the
collapse/expand transition (`css++behaviors/expandable-list.htm`):

```css
ul { behavior:expandable-list; }
ul > li:expanded { height:100*; }
ul > li:animating > div.details { visibility:visible; overflow:hidden; }
```
```html
<li default> <!-- 'default' attribute = initially expanded item -->
```
A `prototype` attached to detail content can observe visibility via a `visualstatechange`
event on itself.

---

## Inline Vector Images — Sciter's Extended `d`-Path Syntax

Beyond standard SVG path commands (`MmLlHhVvCcSsQqTtAaZz`, fully supported), Sciter adds
an **expandable path** dialect for vector images that must scale responsively with their
container (`css++inline-vector-images/path-expandable.htm`,
`css++inline-vector-images/path-images-expandable.htm`):

* Command sequence must start with `E` to opt into expandable-path mode.
* **Negative coordinates** (including `-0`) with uppercase absolute commands are
  treated as an **offset from the right/bottom edge** of the image's render box, not a
  negative position:
  ```css
  background-image: url(path:E M0,0 L-0,-0);   /* diagonal line, top-left to bottom-right corner */
  ```
* **Proportional coordinates**: a number in `0.0`–`1.0` followed by `*` is a fraction of
  the render box. Bare `N*` is ambiguous per-axis by position; suffix `X`/`Y` pins it
  explicitly to width or height: `0.5*X` = 50% of width, `0.66*Y` = 66% of height.
  Proportional coordinates can also be negative (anchored from the right/bottom, same as
  literal negative coords):
  ```css
  background-image: url(path:E M0,0 L1*,1*);            /* diagonal corner-to-corner, scales with box */
  background-image: url(path:M 0 0 H -0.5*Y c 0.66*Y 0 0.66*Y 1* 0 1* V 1* H 0 z);
  ```
* This also composes with the standard (non-`E`) `path()`/`icon()` functions and
  `border-shape: path(...)`, where flex-unit arithmetic like `(1* - 40)` can appear
  directly inside path coordinates to make a shape hug the container regardless of size
  (`css++inline-vector-images/border-shape-path.htm`):
  ```css
  border-shape: path(M 0 20 L 20 0 C 40 20 (1* - 40) 20 (1* - 20) 0 L 1* 20 ... Z);
  ```
* Literal `icon:` URLs can inline a full `viewBox;d-path` pair directly as a string
  (equivalent to the `icon(vbox; d-path)` function form already documented):
  ```html
  <img src="icon:0 -960 960 960;M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47..." />
  ```
* `foreground-image-cursor: pointer` + the `evt.isOnIcon === element` check inside
  `mousedown`/`mouseup` handlers lets you detect clicks specifically on a
  `foreground-image` icon (e.g. a search box's icon click), separate from clicks on the
  rest of the element (`css++inline-vector-images/path-images.htm`):
  ```js
  this.on("mousedown", evt => { onIcon = evt.isOnIcon === this; });
  this.on("mouseup", evt => { if (onIcon && evt.isOnIcon === this) this.post(new Event("icon-click",{bubbles:true})); });
  ```

---

## Gradients — Full Positional Syntax

`css-reference.md` never documented gradient argument forms. From
`gradients/test-linear-gradient.htm` and `gradients/test-radial-gradient.htm`:

```css
/* linear-gradient: keyword direction */
background: linear-gradient(top, red, blue);
background: linear-gradient(top left, red, blue);          /* diagonal */

/* linear-gradient: explicit angle */
background: linear-gradient(45deg, red, yellow, green, blue, magenta);

/* linear-gradient: position + explicit pixel dimension of the gradient line
   (position%, size, [angle,] color-stops...) — lets the gradient NOT cover
   the full box, anchored at a point */
background: linear-gradient(100% 100%, 80px 80px, red, blue);
background: linear-gradient(25% 25%, 45deg, red, blue);              /* position + angle */
background: linear-gradient(center center, 80px 80px, 45deg, red, blue); /* position + dims + angle */

/* color stops can carry explicit offsets — demonstrated in the samples for
   radial-gradient (gradients/test-radial-gradient.htm), not linear-gradient: */
background: radial-gradient(25% 25%, ellipse farthest-corner, red, yellow 70%, green 75%, blue, rgba(255,0,255,0.5));

/* radial-gradient: (position, shape extent, color-stops...) */
background: radial-gradient(25% 25%, ellipse farthest-corner, red, yellow, green, blue);
background: radial-gradient(75% 75%, circle closest-side, white, orange, rgba(0,0,204,.5));
```

Shape keyword is `ellipse`|`circle`; extent keyword is one of `farthest-corner`,
`farthest-side`, `closest-corner`, `closest-side` — all four combinations are valid and
behave per the CSS radial-gradient spec.

Gradients transition smoothly with `transition: background linear 0.5s` — animating
between two full gradient definitions (not just color) works and is a cheap "highlight"
hover effect.

---

## CSS Filters — Practical Notes

`filter` functions are otherwise standard CSS (`blur(Ndip)`, `opacity(N%)`,
`saturate(N%)`, `sepia(N%)`, `brightness(N%)`, `grayscale(N%)`, `contrast(N%)`,
`hue-rotate(Ndeg)`, `invert()`), but two things aren't obvious from the spec alone:

* **`drop-shadow()` takes comma-separated positional args**, not the space-separated
  `<length> <length> <length> <color>` browsers use:
  ```css
  filter: drop-shadow(10px, 10px, 10px, rgba(0,0,0,0.7));
  ```
* Filters **compose** by just listing them space-separated: `filter: hue-rotate(45deg)
  drop-shadow(10px,10px,10px,rgba(0,0,0,.7));` (`css3-filter/filter-composite.htm`).
* `backdrop-filter: blur(20dip)` works for frosted-glass panel effects over a background
  image — pair with a translucent `background-color` (`css3-filter/backdrop-filter.htm`):
  ```css
  .box { background-color: rgba(240,250,255,0.55); backdrop-filter: blur(20dip); }
  ```
* Since not all platforms support filters efficiently, gate filter-dependent rules with
  `@media supports-filters { ... }` (from `css3-filter/doc.htm`, the official guidance).

---

## CSS Variables — the JS-side API

`css-reference.md` covers `var(name): value;` declaration syntax and standard
`--name: value;` but not how to **read/write variables from JS at runtime**. From
`css-variables/test-color.htm` and `css-variables/test-length.htm`:

```css
html { var(w): 300px; var(red-channel): 0%; }
div  { width: var(w); background: rgba(var(red-channel), var(green-channel), var(blue-channel), var(alpha-channel)); }
```
```js
// bulk-set CSS custom properties on an element (here: html/document root) from JS:
document.style.variables {
  "red-channel": Length.percent(v.red),
  "width": Length.px(300),
};
// same API works on any element: el.style.variables { name: value, ... };
```

`Length.percent(n)` / `Length.px(n)` (and presumably other `Length.*` unit
constructors) build typed length values for use as variable values — plain JS numbers
won't implicitly get a unit. This is the idiomatic way to drive live CSS-variable-based
theming/animation from script (seen animating a `width` var on a 20ms timer in
`test-length.htm`, and building an RGBA color-picker in `test-color.htm`).

---

## Scrollbars — Full Custom-Scrollbar Anatomy

`css-reference.md` explicitly flags this section of the official docs as "a stub". The
samples fill in what the stub omits.

### Full part/pseudo-class list for `@set` scrollbar stylesets

From `scrollbars-n-scrolling/scrollbar-styling-1.htm` / `-2.htm` / `-3.htm` — a
scrollbar styleset (referenced via `vertical-scrollbar:`/`horizontal-scrollbar:`) can
target these child part classes: `.prev`, `.next` (step buttons), `.base` (the track,
sometimes named `.back` for the click-to-page-scroll surface), `.prev-page`,
`.next-page` (page-step regions of the track), `.slider` (the thumb), `.corner` (the
dead zone where h+v scrollbars meet). All support `:hover`, `:active`, `:disabled`:

```css
@set my-v-scrollbar {
  .prev, .next   { border:1dip solid #AAA; foreground-image:url(...); height:15dip; }
  .base, .next-page, .prev-page { background-image:url(...); background-repeat:expand; }
  .slider        { border:1dip solid #AAA; foreground-image:url(...); }
  .next:disabled, .slider:disabled, .prev:disabled { height:0; border:none; foreground-image:none; }
  .next:hover, .slider:hover, .prev:hover   { background-color:#EEE; }
  .next:active, .slider:active, .prev:active { background-color:#FFF; }
  .base   { width:15dip; }   /* explicit scrollbar thickness */
  .corner { background-color:transparent; }
}
ul { vertical-scrollbar: my-v-scrollbar; horizontal-scrollbar: my-h-scrollbar; }
```
A minimal flat/modern scrollbar just needs `.prev { display:none; } .next { display:none; }`
to hide the arrow buttons, then style `.base`/`.slider` background colors and
`border-radius`.

### `scroll-manner()` — full option set

`css-reference.md` lists `animation`, `step`, `page`, `wheel-step` as scroll-manner
properties; samples additionally exercise **per-input-device animation toggles**:

```css
overflow: auto scroll-manner(animation:false);                          /* no animation at all */
overflow: auto scroll-manner(wheel-animation:false, wheel-step:10dip);   /* mouse-wheel specific */
overflow: auto scroll-manner(page-animation:true, step-animation:false, step:auto);
```
i.e. `wheel-animation`, `page-animation`, `step-animation` are independently
toggleable booleans (separate from the blanket `animation` flag).

### External/bound scrollbar widgets

A standalone `<widget|vscrollbar>` / `<widget|hscrollbar>` element can be data-bound to
a *different* scrollable element via a `for="#id"` attribute, replacing that element's
built-in scrollbars — useful for custom layouts where the scrollbar must live outside
the scrollable area (`scrollbars-n-scrolling/scrollbar-bound.htm`):

```css
#scrollable { overflow:scroll; }   /* scrollable, but its own scrollbars stay hidden */
```
```html
<div #scrollable>...</div>
<widget|vscrollbar for="#scrollable" />
<widget|hscrollbar for="#scrollable" />
```

### Scroll event introspection

`element.onScroll = function(evt) {...}` fires for both scroll commands and position
updates; `evt.reason` is a bitfield decoded as `(vertical, cause, part)` where `cause`
distinguishes wheel/keyboard/scrollbar-drag/programmatic-animation origin, and — when
`cause == SCROLL_SOURCE_SCROLLBAR` — `part` identifies which scrollbar part triggered it
(`BASE`/`PLUS`/`MINUS`/`SLIDER`/`PAGE_MINUS`/`PAGE_PLUS`/`CORNER`). Useful for
suppressing side effects during programmatic vs user-driven scrolling
(`scrollbars-n-scrolling/scrollbar-events.htm`, TIScript sample but the event/bitfield
shape is the same under JS).

### `overflow: scroll-indicator` styleset target classes

The mobile-style non-space-taking scroll indicator is also styled via `@set` +
`vertical-scrollbar`, but only exposes `.slider` and `.base` (no prev/next/page parts;
`.base` is the collapsed hover-to-reveal track):

```css
@set v-scroll-indicator {
  .slider { background:red; margin:0; }
  .base   { width:20px; min-width:3px; }  /* 20px on hover, collapses to 3px */
}
section.custom { vertical-scrollbar: "v-scroll-indicator"; }
```

---

## Flow vs Flexbox — Direct Rosetta Stone

`css-flexbox-vs-flex-units.htm` (and the near-duplicate `css-flex/flow-vs-flexbox.htm`)
is a side-by-side comparison document meant to be viewed in both a browser and Sciter,
giving exact `display:flex` → `flow:`/flex-unit equivalents beyond the simple table
already in css-reference.md:

| Browser flexbox | Sciter flow/flex |
|---|---|
| `display:flex; flex-direction:row;` | `flow:horizontal;` |
| `display:flex; flex-direction:column;` | `flow:vertical;` |
| `display:flex; flex-wrap:wrap;` (+ fixed child width) | `flow:horizontal-wrap;` (+ fixed child width) |
| `flex-direction:row; justify-content:space-between;` | `flow:horizontal; border-spacing:*;` |
| `flex-direction:row; align-items:stretch;` + child `align-self:flex-start` | `flow:horizontal;` + child `height:*` (stretch) vs `height:max-content` (start) |
| `flex-direction:row; align-items:center;` + child `align-self:flex-start` | `flow:horizontal;` + child `margin-top:*; margin-bottom:*;` (center) vs `margin-top:0` only (top-align) |
| `flex:1` on one child | `width:1*` (or `height:1*` in vertical flow) on that child |

Key insight demonstrated: standard flexbox's `align-items`/`align-self` cross-axis
alignment has **no direct Sciter property** — it's reproduced by choosing which margin
(`margin-top`/`margin-bottom` or `margin-left`/`margin-right`) gets the flex unit `*`,
or by setting the child's own cross-axis size to `*` (stretch) vs `max-content`
(shrink-to-fit, i.e. "flex-start"-like). This margin-based technique is the general
Sciter idiom for anything browsers do with `align-items`/`justify-content`.

**Caveat from real-world testing:** the `height:max-content` half of that row (opting a
child out of default stretch, back to its natural size) did **not** work in practice —
set on a `flow:horizontal` child it was silently ignored, the child still stretched.
Don't rely on it. For simple "center this row of children" cases, skip the margin-*
technique too and reach for `vertical-align: middle` (or `horizontal-align: center` in
`flow:vertical`) directly on the **container** instead — see `css-reference.md`'s
`flow:horizontal`/`flow:vertical` sections. That was confirmed working, is one property
instead of two, and doesn't depend on the stretch/max-content behavior at all. Reserve
the margin-`*` trick for cases that specifically need *asymmetric* alignment (e.g. one
child pinned top, another centered) that a single `vertical-align` on the container
can't express.

The doc's own caveat: `display:flex` "breaks existing CSS box model" so browser vs
Sciter child dimensions may not match pixel-for-pixel even with equivalent rules —
useful expectation-setting when porting flexbox layouts.
