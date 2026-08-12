# Sciter CSS Reference

Complete reference for Sciter-specific CSS syntax and constraints. Sciter's CSS looks like
W3C CSS but its **layout engine, box model additions, selectors, units, and at-rules are its
own**. Treat every assumption carried over from browser CSS as suspect until confirmed below.

## Compatibility Baseline — Read This First

Sciter's own docs state its CSS support level explicitly:

> **CSS 2.1 is implemented in full. CSS 3 implementation is limited to selected modules** that
> are practical for desktop UI: `transform` (**2D only**, no 3D/`matrix3d`/`perspective`),
> `transition` and `animation`, most CSS3 selectors, `border-radius`, `box-shadow`, `opacity`,
> `rgba()`/`hsl()` colors, `@font-face`, `@media`, `var()`, `filter()`, `backdrop-filter()`,
> and CSS gradients. Everything else in CSS3/CSS4 (Flexbox, Grid, and most modern layout/
> selector modules) is **not implemented** — Sciter provides its own alternatives instead
> (`flow`/flex-units in place of `display:flex`/`display:grid`).

**Ground rule for this document and for any code you generate:** a CSS property, value, or
selector counts as supported only if it appears explicitly below, in `docs/md/css/`, or is
seen actually used in `samples/`. **Do not assume a standard/modern CSS feature works just
because it isn't listed as "prohibited."** Sciter's CSS surface is a curated subset, not
"full CSS minus a blocklist" — silence in this doc means *unverified*, not *supported*.

**Source confidence tags used below:**

* **[confirmed]** — seen working in `samples/` and/or documented in `docs/md/css/` (Sciter.js-era sources).
* **[legacy]** — documented only on the older desktop-Sciter "CSS support map"
  (`sciter.com/docs/content/css/cssmap.html`, itself marked "incomplete") and **not**
  corroborated anywhere in the Sciter.js docs or samples in this repo. Treat as *probably*
  still true (same rendering core), but verify before depending on it — prefer the
  `[confirmed]` alternative when one is listed.
* **[not supported]** / **[not confirmed]** — explicitly contradicted by the docs, or a
  standard/modern CSS feature actively searched for and not found anywhere in `docs/` or
  `samples/`. Do not use.

The following, in particular, were searched for across every `docs/` and `samples/` file
and **found nowhere** — treat all of these as **not supported** unless you find independent
proof:

`clip-path`, `mask` / `mask-image`, `object-fit`, `object-position`, `aspect-ratio`
(as an element CSS property — the *media-query* variable of the same name does exist, see
Conditionals), `gap` (as a standalone property outside the Sciter `size`/`border-spacing`
model), `:is()`, `:where()`, `:has()`, `:focus-within`, `:focus-visible`, `@container`,
`@layer`, CSS nesting (`&`), `content-visibility`, `will-change`, `cubic-bezier()` timing
function (Sciter uses named ease functions instead, see Transitions), and 3D transform
functions (`rotate3d`, `translate3d`, `matrix3d`, `perspective`, `rotateX/Y/Z`).

## Sciter "Prohibited" Web Standards

These Web CSS features do NOT work in Sciter - use Sciter equivalents:

| Prohibited Property | Sciter Replacement |
|---------------------|-------------------|
| `display: flex` | `flow: horizontal`, `flow: vertical`, etc. |
| `display: inline-flex` | `flow: horizontal` with inline-block children |
| `display: grid` | `flow: grid(...)` |
| `flex-direction` | Use appropriate `flow` value |
| `flex-wrap` | Use `horizontal-wrap` or `vertical-wrap` |
| `justify-content` | Use `margin: *`, `border-spacing: *` |
| `align-items` | Use `vertical-align`, `horizontal-align` |
| `grid-template` | `flow: grid(...)` template |
| `grid-template-areas` | ASCII-index template inside `flow: grid(...)` |
| `gap` | `border-spacing` |
| `@media (min-width: Npx)` | `@media (width >= Npx)` (JS-operator syntax, see Conditionals) |

Other gotchas worth flagging up front:

* `flex units` (`*`, `2*`, `0.5*`) **cannot be used inside `calc()`**.
* `border-spacing` in Sciter works on **any block element's children**, not just tables:
  `div { border-spacing: 2em }` inserts 2em gaps between `div`'s children.
* `content` can be set on **any** element, not just `::before`/`::after`.
* `vertical-align` only behaves like the W3C property for `display:inline` /
  `display:inline-block` elements. On other display types it is treated as
  `content-vertical-align` (aligns the element's own content box within itself).
* `box-sizing` additionally supports a Sciter-only `padding-box` value.
* `visibility` additionally accepts `none`, treated identically to `display:none`.
* CSS variables can be declared as plain properties (`var(name): value;`), not only as
  custom properties (`--name: value;`) — see Variables & Attributes.
* `attr(name)` can appear as a **CSS declaration itself** (`attr(role): "option";`), not
  just as a value function — this sets a DOM attribute default from CSS, which has no W3C
  equivalent at all.

---

## Units

### Dimensional (length) Units

**Absolute lengths**

| Unit | Description |
|------|-------------|
| `px` | pixels — either `dip` or `ppx` depending on engine configuration; by default `1px === 1dip` |
| `in` | inches (1in = 2.54cm) |
| `cm` | centimeters |
| `mm` | millimeters |
| `pt` | points (1/72 inch, CSS 2.1 definition) |
| `pc` | picas (1pc = 12pt) |
| `dip` | device-independent pixels — 1dip = 1/96 inch. On a 96dpi screen, 1dip = 1px; on a 120dpi screen, 2dip renders as 3px. On a printer, `dip` and `px` are equivalent. |
| `ppx` | physical pixel — on screen, exactly one device pixel; on a printer, 1ppx = 1/96 inch |

**Relative lengths**

| Unit | Description |
|------|-------------|
| `em` | font-size of the element itself |
| `rem` | font-size of the root element |
| `ex` | x-height of the relevant font |
| `ch` | width of the `0` character in the relevant font |
| `%` | percentage of the corresponding metric of the parent (context-dependent, per spec) |
| `vw` | 1/100 of view (window) width |
| `vh` | 1/100 of view (window) height |
| `vmin` | 1/100 of the view's smallest side |
| `vmax` | 1/100 of the view's largest side |

**Width/height-based lengths (Sciter-specific)**

| Unit | Description |
|------|-------------|
| `width(X%)` | percentage of this element's own `width` property value (`auto` if `width` undefined) |
| `height(Y%)` | percentage of this element's own `height` property value (`auto` if `height` undefined) |

```css
p {
  height: 1.6em;
  line-height: height(100%); /* ties line-height to the element's own height */
}
```

**Flex units** — see [Flex Units](#flex-units) below: `N*` and `*` (shorthand for `1*`).
Not usable inside `calc()`.

`%%` **[legacy]** — "percent of free space" unit, documented on the old desktop-Sciter CSS
map as equivalent to flex units (`1* == 100%%`), usable on `width`/`height`/`margin`/
`padding`/`border-*-width`. **Not mentioned anywhere in the current Sciter.js docs**
(`docs/md/css/units/dimentional.md` only documents `*`/`N*`). Prefer `*`/`N*` flex units —
don't reach for `%%` unless you've confirmed it still parses in the Sciter.js build you're
targeting.

**calc()** is supported (standard semantics), except flex units cannot appear inside it.

### Angle and Duration Units

Standard CSS units, unchanged from the W3C spec:

* Angle: `deg`, `rad`, `grad`, `turn`
* Duration: `s`, `ms`

### Color Units

**Absolute colors**

```css
#f00                    /* #rgb */
#ff0000                 /* #rrggbb */
#aaff0000                /* #aarrggbb  -- note: alpha comes FIRST, unlike CSS #rrggbbaa */
rgb(255,0,0)             /* 0..255 per channel */
rgb(100%,0%,0%)          /* 0..100% per channel */
rgba(255,0,0,0.5)
rgb(255 0 0 / 50%)       /* modern space-separated form */
hsl(300,50%,50%)
hsl(300 50% 50% / 50%)
hsv(300,50%,50%)         /* HSV color space — no direct W3C equivalent */
hsv(300 50% 50% / 50%)
```

> Gotcha: Sciter's 8-digit hex form is `#AARRGGBB` (alpha first), the reverse of the
> `#RRGGBBAA` order used by modern browser CSS.

**Relative colors — `morph()`**

`morph(basecolor, arg1, arg2, ...)` derives a new color from `basecolor` (a color value,
constant, or variable) using one or more transform arguments:

| Argument | Effect |
|----------|--------|
| `hue:Adeg` | set H (hue) component absolutely, 0-360 |
| `rotate:Adeg` | rotate H relatively, -360deg..+360deg |
| `lightness:p%` | set L (lightness) absolutely, 0-100 |
| `lighten:p%` | increase L relatively |
| `darken:p%` | decrease L relatively |
| `saturation:p%` | set S (saturation) absolutely, 0-100 |
| `saturate:p%` | increase S relatively |
| `desaturate:p%` | decrease S relatively |
| `opacity:p%` | set alpha absolutely, 0-100% |
| `opacify:p%` | change alpha relatively, -100%..100% |
| `mix:p%` | mix with a `color2` argument, 0% = basecolor, 100% = color2 |
| `grayscale:p%` | convert toward grayscale, 100% = pure grayscale |
| `sepia:p%` | convert toward sepia, 100% = pure sepia |

```css
@const BASECOLOR: #0C0;
div { background: morph(@BASECOLOR, lighten:25%); }
```

**`tint(basecolor, deltaLightness [, deltaSaturation])`** **[confirmed]** — shorthand color
transform, seen throughout `samples/samples.css/css++/`. Args are floats, not percentages:

```css
border: 4px solid tint(@THEME_COLOR, -0.25);        /* darken lightness by 0.25 */
background: linear-gradient(top, tint(basecolor,+0.3), basecolor, tint(basecolor,-0.4));
```

---

## Gradients **[confirmed]**

Confirmed working via `samples/samples.css/gradients/*.htm`. `linear-gradient()` and
`radial-gradient()` accept several positional-argument forms — unlike browser CSS, direction/
position/size arguments come **before** the color-stop list, and can be mixed and matched:

```css
/* keyword direction */
background: linear-gradient(top, @START, @END);
background: linear-gradient(left, red, yellow, green, blue, magenta);
background: linear-gradient(top left, @START, @END);          /* diagonal */

/* angle */
background: linear-gradient(45deg, @START, @END);

/* position + angle (gradient line pinned to a start point) */
background: linear-gradient(25% 25%, 45deg, @START, @END);

/* two positions (start-point + end-point, both % or length) */
background: linear-gradient(100% 100%, 80px 80px, @START, @END);

/* position + explicit size + angle */
background: linear-gradient(center center, 80px 80px, 45deg, @START, @END);

/* color stops can carry offsets, like standard CSS */
background: linear-gradient(45deg, red, yellow 70%, green 75%, blue);
```

```css
/* radial-gradient(position, shape extent, color-stops...) */
background: radial-gradient(25% 25%, ellipse farthest-corner, red, yellow, green, blue, rgba(255,0,255,0.5));
background: radial-gradient(75% 75%, circle closest-side, white, orange, rgba(0,0,204,0.5));
```

Radial `shape` ∈ `circle` | `ellipse`; `extent` ∈ `closest-side` | `closest-corner` |
`farthest-side` | `farthest-corner`.

`background: linear-gradient(...)`/`radial-gradient(...)` are used through the normal
`background`/`background-image` slot; `@const`-declared colors substitute directly as
color-stop arguments.

`repeating-linear-gradient()`, `repeating-radial-gradient()`, and `conic-gradient()`
**[not confirmed]** — not found in any doc or sample; don't assume they work.

**Legacy 4-corner gradient** **[legacy]** — `background-color` shorthand form from the old
cssmap: `background-color: color-left-top, color-right-top, color-right-bottom, color-left-bottom;`
("HTMLayout specific"). Prefer `linear-gradient()`/`radial-gradient()` — they're the
confirmed, documented mechanism in Sciter.js.

---

## Flow Layout

`flow` is Sciter's replacement for both `display:flex` and `display:grid`. It defines the
layout manager used to arrange an element's children.

```
flow: default          - auto-detect layout by content
flow: horizontal       - single row
flow: horizontal-wrap  - multiple rows ("brick work")
flow: vertical         - single column (close to default browser block flow)
flow: vertical-wrap    - multiple columns ("brick work")
flow: stack            - children stacked on top of one another
flow: grid(...)        - explicit grid, ASCII-index template
flow: row(...)         - grid variant, columns filled automatically by tag name
flow: text             - text-only layout, like a default <p>
```

### flow:horizontal

Children laid out in a single row.

```css
container {
  display: block;
  flow: horizontal;
  padding: 30px;
  border-spacing: 30px; /* gap between children */
}
child { width: *; /* equal widths, if desired */ }
```

* If defined, left/right margins of adjacent children **collapse** (same rule W3C applies
  to top/bottom margins in normal vertical block flow).
* `child { height: * }` makes a child fill the row's vertical space.
* `vertical-align` / `horizontal-align` on the *container* align children that aren't
  using flex units.

**Common mistake — forgetting `vertical-align` on the container.** This is easy to get
wrong because the *default* cross-axis behavior is inconsistent depending on the child:
a child with no intrinsic size (e.g. a bare `<span>` of text, no padding) silently
**stretches** to fill the row's full height even without `height:*` set explicitly; a
child with its own intrinsic size (e.g. a padded `<button>`) does **not** stretch — it
keeps its natural height and sits **top-aligned** in any leftover cross-axis space. In
both cases nothing is centered unless the *container* explicitly sets
`vertical-align: middle`. The visible symptom is identical either way and easy to
misread as a text-alignment bug: content hugs one edge (usually the top) with dead
space on the other side, even though the child's own box is internally sized/padded
correctly. If you see that pattern, check the *parent* flow container's
`vertical-align` first — don't start tuning padding/line-height/text-align on the child.
`height: max-content` on the child is documented (see `samples-css.md`'s flexbox
rosetta table) as a way to opt a stretched child out of stretching, back to its natural
size — **this was not confirmed working** in practice (silently no-op in testing); don't
rely on it. Setting `vertical-align` on the flow container is the reliable fix.

### flow:horizontal-wrap

Like `horizontal`, but wraps into multiple rows when children don't fit.

* `child { height: * }` fills a child to the row's height.
* Force a row break explicitly with `child { clear: after }` or `clear: before`.

### flow:vertical

Children laid out in a single column (closest analog to normal browser block flow).

* Top/bottom margins of adjacent children collapse.
* `child { width: * }` spans the container's full width.
* `child { height: * }` lets one child absorb remaining vertical space.
* Same cross-axis rule as `flow:horizontal` above, just rotated: use `horizontal-align`
  on the *container* to center/align children that don't fill the full width — it is
  not automatic, and the "no intrinsic size stretches / has intrinsic size stays at the
  start edge" split described above applies here too (start edge = left, not top).

### flow:vertical-wrap

Like `vertical`, but wraps into multiple columns.

* `child { clear: after | before }` forces a column break.
* Two growth sub-modes, selected via overflow:
  * `overflow-x: auto | scroll | scroll-indicator` → **horizontal grow**: new columns
    added to the right, horizontal scrollbar appears if needed.
  * `overflow-y: auto | scroll | scroll-indicator` → **vertical grow**: columns get
    taller, vertical scrollbar appears if needed.

### flow:stack

Children stacked on top of each other — conceptually like `position:relative` +
`position:absolute` children, but:

1. Lighter weight — no separate rendering-tree layer created.
2. Managed as part of normal static layout (participates in sizing/reflow).
3. Supports flex units for responsive positioning.

```css
container { flow: stack; padding: 30px; }
child:nth-child(1) {
  height: *;              /* spans full height */
  width: 60px;
  margin: 0 * 0 20px;      /* flex-unit margins position the child */
}
```

* Precise position/alignment: use `margin` (including flex-unit margins).
* Visual re-ordering: use `z-index`.

### flow:grid()

Explicit grid with an ASCII-index template. Cells can span multiple rows/columns.

```css
body {
  flow: grid( 1 1 1,
              2 5 3,
              4 4 4 );
}
body > main { size: *; /* main = index 5, fills its cell and pushes others to the edges */ }
```

Rules for the template:

1. `grid()` accepts comma-separated row definitions.
2. Each row is whitespace-separated element indexes (1-based DOM child order).
3. A cell spanning multiple rows/columns repeats its index in every spanned position.
4. Spans must form rectangular sections.
5. `*` marks an empty/unoccupied grid position.

Cell content and spacing:

* `display:block` children span the whole cell box; their `margin`s become inter-cell
  spacing.
* `display:inline-block` children sit inside the cell box; their `margin`s space them
  from the cell box edges.
* Inter-cell spacing = the larger of: margins on `display:block` children, or the
  container's `border-spacing`.

**flow-rows / flow-columns** define explicit row/column sizing:

```css
flow-rows: <rc-metric> <rc-metric> ...;
flow-columns: <rc-metric> <rc-metric> ...;
```

Each `<rc-metric>` is one of:

* a length, e.g. `100px`
* a flex unit, e.g. `*`
* `min-content` or `max-content`
* `minmax(min, max)`, e.g. `minmax(100px, 200px)`
* `repeat(N, <rc-metric>)`, e.g. `repeat(3, 300px)`

```css
flow-rows: 100px * max-content;
flow-columns: repeat(3, minmax(100px, 1*));
```

### flow:row()

A `grid()` variant where columns are filled automatically by matching HTML tag names
rather than by index numbers.

```css
form { flow: row(label, input select); flow-columns: max-content *; }
```

```html
<form>
  <label>first name</label><input|text(first-name) />
  <label>gender</label>
  <select(gender)><option>male</option><option>female</option></select>
</form>
```

Column 1 collects `<label>` elements, column 2 collects `<input>` or `<select>` elements.
An element **not** listed in the row template spans the full row width.

---

## Flex Units

Flex units — `*` (= `1*`), `2*`, `0.5*` — behave like a spring/coil of a given strength
attached to a side/part of an element. They distribute **free space remaining after**
length and `%` units are applied to content.

Applicable to: `width`, `height`, `size` (shorthand), `margin-*`, `padding-*`,
`border-*-width`.

**Flexible margins** — shift a child within a container using a ratio:

```css
child { margin-left: 0.7*; margin-right: 0.3*; } /* 70/30 split of free space */
```

**Flexible dimensions** — fill a container's free area:

```css
child { width: 1*; height: 1*; }   /* or simply: */
child { size: *; }
```

**Flexible border-spacing** — equal spacing between children:

```css
container { flow: horizontal; border-spacing: 1*; }
child { width: 87px; }
```

`size` is itself a Sciter shorthand: `size: 100px` → `width:100px; height:100px`;
`size: 100px 200px` → `width:100px; height:200px`. `size: *` works the same way with
flex units.

---

## Selectors

### Standard CSS 2.1 / CSS 3 Selectors (Supported As-Is)

| Pattern | Represents |
|---|---|
| `*` | any element |
| `E` | element of type E |
| `E[foo]` | E with attribute "foo" |
| `E[foo="bar"]` | E whose "foo" == "bar" exactly |
| `E[foo~="bar"]` | "foo" is whitespace-separated list containing "bar" |
| `E[foo^="bar"]` | "foo" begins with "bar" |
| `E[foo$="bar"]` | "foo" ends with "bar" |
| `E[foo*="bar"]` | "foo" contains substring "bar" |
| `E[foo\|="en"]` | "foo" is hyphen-separated list starting with "en" |
| `E:root` | E is the document root |
| `E:nth-child(n)`, `:nth-last-child(n)`, `:nth-of-type(n)`, `:nth-last-of-type(n)` | structural position |
| `E:first-child`, `:last-child`, `:first-of-type`, `:last-of-type`, `:only-child`, `:only-of-type` | structural position |
| `E:empty` | no children (incl. text nodes) |
| `E:link`, `E:visited` | hyperlink states |
| `E:lang(fr)` | element in language "fr" |
| `E::before`, `E::after` | generated content |
| `E.warning` | class selector |
| `E#myid` | ID selector |
| `E:not(s)` | negation |
| `E F` | descendant combinator |
| `E > F` | child combinator |
| `E + F` | adjacent sibling |
| `E ~ F` | general (subsequent) sibling |

### Sciter Shortcut Selectors

| Pattern | Equivalent |
|---|---|
| `E(name)` | `E[name="name"]` |
| `E\|name` | `E[type="name"]` (also used as element-creation shorthand, e.g. `<input\|text>`) |
| `div#id.class` | shorthand combining tag/id/class, same as web CSS |

### State (Pseudo-Class) Selectors

These reflect element state and are readable/writable from JS as `element.state.xxx`.
Some are runtime-only (read-only), others may also be set from JS.

| Selector | Matches | JS property |
|---|---|---|
| `:empty` | no children / `<input>` with no value | `state.empty` |
| `:active` | mouse/touch pressed | `state.active` |
| `:hover` | mouse inside element | `state.hover` |
| `:focus` | element focused | `state.focus` |
| `:tab-focus` | got focus via TAB traversal | `state.tabfocus` |
| `:owns-focus` | has focused descendant | `state.ownsfocus` |
| `:focusable` | element is focusable | `state.focusable` |
| `:link` | has `behavior:hyperlink` | `state.link` |
| `:visited` | not set by runtime; JS-settable | `state.visited` |
| `:checked` | checked (radio/checkbox/option) | `state.checked` |
| `:current` | current element (e.g. option in select) | `state.current` |
| `:disabled` | disabled | `state.disabled` |
| `:read-only` | read-only (textarea/htmlarea) | `state.readonly` |
| `:expanded` / `:collapsed` | option/tree node state (mutually exclusive) | `state.expanded` / `state.collapsed` |
| `:node` | expandable/collapsible node option in select\|tree | `state.node` |
| `:incomplete` | img/frame content not yet arrived | `state.incomplete` |
| `:busy` | img/frame loading | `state.busy` |
| `:invalid` | input element has an invalid value | `state.invalid` |
| `:animating` | has running transition/animation (incl. scroll) | `state.animating` |
| `:popup` | shown as a popup right now | `state.popup` |
| `:owns-popup` | has a popup shown via `E.popup(popupEl)` | `state.ownspopup` |
| `:drag-over` | drag hovering over element | `state.dragover` |
| `:drag-source` | is a drag source (see `Window.performDrag()`) | `state.dragsource` |
| `:drop-target` | JS-only convention, not set internally | `state.droptarget` |
| `:ltr` / `:rtl` | LTR / RTL environment | `state.isltr` |
| `:theme(A)` | element or ancestor has `theme="A-B"` or `"B-A"` | — |
| `:window-root` | is the window's root doc or a popup-owning element | — |
| `:blur-behind` | `:window-root` using blur-behind background | — |

Not confirmed anywhere in docs/ or samples/ (dropped, previously listed here without support): `:read-write`, `:valid`, `:missing`, `:in-range`/`:out-of-range`, `:required`/`:optional`, a second/focus-related sense of `:current`, `:captive`.

Setting state from JS:

```js
element.state.visited = true;
```

Setting state from JSX (prefix the state name with `state-`):

```js
render() { return <div state-visited={true}>...</div>; }
```

---

## Properties Reference

Unless noted, properties behave as in the W3C spec. Sciter adds a large number of its own
on top.

### Standard-Behavior Properties (grouped)

| Group | Properties |
|---|---|
| Direction | `direction` |
| Display/visibility | `display`, `visibility` (supports `none` = `display:none`) |
| Floats | `clear`, `float` |
| Color & font | `color`, `font`, `font-family`, `font-size`, `font-style`, `font-variant`, `font-variant-ligatures`, `font-variant-caps`, `font-weight`, `letter-spacing`, `line-height`, `baseline-shift`, `font-rendering-mode` (`sub-pixel` default, `snap-pixel` for crisp carets) |
| Text | `text-decoration(-style/-line/-color/-thickness)`, `text-indent`, `text-overflow`, `text-shadow`, `text-transform`, `white-space`, `text-wrap`, `word-wrap`, `word-break`, `tab-size` |
| Selection | `text-selection-color`, `text-selection-background-color`, `text-selection-caret-color`, `text-selection` |
| Dimensions | `min-height`, `min-width`, `max-height`, `max-width`, `height`, `width`, `size` (Sciter shorthand), `box-sizing` (+ `padding-box`) |
| Alignment | `text-align`, `vertical-align`, `horizontal-align` (alias of `content-horizontal-align`), `content-vertical-align` (`top`/`middle`/`bottom`), `content-horizontal-align` (`start`/`end`/`left`/`center`/`right`) |
| Background | `background`, `background-attachment`, `background-color`, `background-image`, `background-position(-top/-left/-right/-bottom)`, `background-repeat`, `background-offset(-top/-left/-right/-bottom)`, `background-size`, `background-width`, `background-height`, `background-clip`, `background-image-frame`, `background-blend-mode` |
| Borders | `border` (+ per-side/-color/-style/-width), `border-collapse`, `border-radius` and all corner/-x/-y variants, `box-shadow` |
| Outlines | `outline-color`, `outline-width`, `outline-style` (`none`/`solid`/`dotted`/`dashed`/`glow`†/`nwse-hatch`†/`nesw-hatch`†), `outline-offset`, `outline` |
| Filters | `filter`, `backdrop-filter` |
| Transform | `transform`, `transform-origin(-x/-y)` |
| Printing | `page-break-before`, `page-break-after`, `page-break-inside` |
| Margin | `margin` (+ sides), `hit-margin`† (non-visual margin extending the hover/hit box) |
| Padding | `padding` (+ sides) |
| Border spacing | `border-spacing`, `border-spacing-x/-y` — applies to **any** block's children, not just tables |
| Lists | `list-style`, `list-style-image/-position/-type`, `list-marker-color/-size/-style` |
| Overflow | `overflow`, `overflow-x`, `overflow-y` (+ `scroll-indicator` value for non-space-taking mobile-style scrollbar) |
| Cursor | `cursor` |
| Image rendering | `image-rendering`: `auto`\|`crisp-edges`(=`default`)\|`pixelated`(=`optimize-speed`)\|`optimize-quality`(=`auto`)\|`inherit` |
| Opacity | `opacity` |
| Positioning | `z-index`, `position`, `left`, `right`, `top`, `bottom` |
| Transitions | `transition`, `transition-delay/-duration/-property/-timing-function` |
| Animations | `animation`, `animation-name/-duration/-delay/-iteration-count/-direction/-timing-function/-fill-mode/-play-state` |
| Auxiliary | `appearance` (only `none` supported, suppresses default `<input>`/`<button>` rendering), `zoom`, `pointer-events` |

† = Sciter-specific value, not part of the W3C spec for that property.

### Sciter-Specific Properties

| Category | Properties / Notes |
|---|---|
| Content | `content` — usable on **any** element, not just `::before`/`::after` |
| Layers | `layer`: `auto`\|`force` (buffers element to a bitmap, for complex drawing)\|`disabled`; `content-isolate`: `isolate` (default; style-set content not user-overridable)\|`none` |
| Shape | `border-shape` — accepts SVG `path(m ... z)`; combined with `overflow:hidden` clips content to that path |
| Clip box | `clip-box`: `default`\|`content-box`\|`padding-box`\|`border-box`\|`margin-box`\|`hit-margin-box` |
| Fills/strokes (SVG-style, apply to vector images on any element) | `fill`, `fill-opacity`, `fill-rule`, `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `stroke-miterlimit`, `stroke-dasharray`, `stroke-dashoffset`, `stroke-opacity`, `stop-color`, `stop-opacity`, `marker`, `marker-start`, `marker-mid`, `marker-end` |
| Flow layout | `flow`, `flow-rows`, `flow-columns` — see [Flow Layout](#flow-layout) |
| Scrolling behavior | `scroll-manner`, `scroll-manner-x`, `scroll-manner-y` — value is `scroll-manner(prop:val, ...)` with `animation:true|false`, `step:<length>`, `page:<length>`, `wheel-step:<length>`. **[legacy]** finer-grained flags `page-animation:true\|false`, `step-animation:true\|false`, `home-animation:true\|false`, `wheel-animation:true\|false` also appear on the old cssmap (splitting the unified `animation` flag per trigger) — not corroborated in current Sciter.js docs, so prefer the unified `animation` flag unless you've confirmed the split flags still parse. |
| Component binding | `behavior: <name>` (native behavior), `prototype` (class controller), `aspect` (functional controller) — see [Behaviors & Aspects](#behaviors--aspects) |
| Foreground layer | `foreground`, `foreground-attachment`, `foreground-image`, `foreground-position(-top/-left/-right/-bottom)`, `foreground-repeat`, `foreground-size`, `foreground-width`, `foreground-height`, `foreground-clip`, `foreground-image-frame`, `foreground-image-cursor`, `foreground-blend-mode`, `foreground-color` (semi-transparent overlay drawn atop background+content) |
| Role | `role` — e.g. `tr { role: "option" }` makes table rows selectable as `<select>` options |
| Image transforms | `background-image-transformation`, `foreground-image-transformation` — whitespace-separated list of `contrast(0..1)`, `brightness(0..1)`, `gamma(0..4)`, `hue(0..360deg)`, `saturation(0..1)`, `opacity(0..1)`, `flip-x()`, `flip-y()` |
| Scrollbar styling | `vertical-scrollbar`, `horizontal-scrollbar` (accept a styleset name — see [Scrollbar Styling](#scrollbar-styling)); `overscroll-behavior(-x/-y)`: `auto`\|`contain`\|`none` |
| Context menu | `context-menu`: `selector(...)` (element used as menu) or `url(...)` (partial HTML with `<menu>`) |
| Style sets | `style-set`, `style-set-base` — see [Style Sets](#style-sets) |
| RTL mapping | `mapping: left-to-right(part1, ..., partN)` where parts ∈ `margin`\|`border`\|`background`\|`background-image`\|`background-position`\|`foreground`\|`layout`\|`alignment` |
| Popup position | `popup-position: <popup-reference-point> <anchor-reference-point>`, `popup-anchor-reference-point`, `popup-reference-point` — values: `top-left`, `top-center`, `top-right`, `middle-left`, `middle-center`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right` |
| Popup animation | `popup-animation(type:blend\|inflate\|slide\|roll, axis:horizontal\|vertical, heading:start-to-end\|end-to-start, duration:100ms)` |

### Value Enumerations for High-Risk Properties

These properties exist in both browser CSS and Sciter CSS, which makes it easy to assume
browser-standard values carry over. They don't always. Sciter's own value set for each is
enumerated here — **values not listed were not found in any doc or sample and should not be
assumed to work.**

**`display`** **[legacy list, cross-checked against `display:table-cell` usage in
`samples/samples.css/css++/`]** — confirmed keywords: `block`, `inline`, `inline-block`,
`list-item`, `contents`, `table`, `inline-table`, `table-row`, `table-cell`, `table-body`.
**`flex`, `inline-flex`, `grid`, `inline-grid`, `flow-root`, `table-caption`,
`table-column(-group)`, `table-header/footer-group`, `run-in` — not supported/not
confirmed.** Use `flow:` for flex/grid-equivalent layouts (see Flow Layout).

**`visibility`** **[confirmed]** — `visible` (default) | `hidden` (takes space, invisible) |
`none` (Sciter-specific, same as `display:none`) | `collapse`. Per
`samples/samples.css/css++/visibility-none-article.htm`: *"collapse — the element is in the
rendering tree, takes space, but its height or width is collapsed to zero... In Sciter this
works for any element, but in standard CSS only for table rows."* — i.e. `visibility:collapse`
is far more broadly usable in Sciter than in browsers (browsers effectively limit it to
`<tr>`). Prefer `visible`/`collapse` toggling over `display` for dynamic show/hide, since it
avoids having to remember each element's original non-`none` display value.

**`overflow` / `overflow-x` / `overflow-y`** — shorthand form is
`overflow-type [scroll-manner(...)]`. Values: `visible` (default) | `scroll` | `hidden` |
`auto` | `hidden-scroll` **[confirmed — used in `docs/md/behaviors/README.md`]** (scrollbar
hidden, content still scrollable) | `scroll-indicator` (mobile-style non-space-taking
indicator) | `none` **[legacy]** (shortcut for `overflow:visible; min-width:min-content;
min-height:min-content;`).

**`cursor`** **[legacy list; the subset `default`/`pointer`/`text`/`move`/`se-resize` is
confirmed in samples]** — `auto` | `crosshair` | `default` | `pointer` | `move` |
`{n,ne,e,se,s,sw,w,nw}-resize` | `text` | `wait` | `help` | `drag-copy` | `drag-move` | a
`url(...)` to a `.cur`/`.ani` file. **Modern browser cursor keywords — `grab`, `grabbing`,
`zoom-in`, `zoom-out`, `not-allowed`, `context-menu`, `col-resize`, `row-resize`, `alias`,
`copy`, `cell`, `all-scroll`, `progress`, `no-drop`, `vertical-text` — are not confirmed.**
(`foreground-image-cursor` additionally lists `progress` and `no-drop` in its own value set
on the legacy map — that's a different property from `cursor`, don't conflate the two.)

**`border-radius`** — standard 1–4 value / `/`-elliptical syntax, **but** **[legacy]**:
*"with non-zero border radius, colors of all borders shall be the same"* — don't design a
rounded element with different colors per side; they'll collapse to one.

**`min-width` / `max-width`** — `auto` is a valid value on both, but its *default* meaning
is Sciter-specific and non-standard **[legacy]**: `min-width:auto` defaults to the element's
own intrinsic min width for **all** elements (mimics old IE, not the CSS spec default of
`0`); `max-width:auto` is the default specifically on `<table>` (models "size to content"
table sizing). Don't assume `min-width`/`max-width` start at CSS-spec defaults.

**`letter-spacing`** **[legacy — flagged "N/A" on the classic cssmap, uncorroborated
elsewhere]**. Treat as having no confirmed effect until you've tested it in your target
build; don't rely on it for spacing.

**Unitless `line-height` on small single-line text (pills/badges/chips/tags)** — a
real, repeatedly-observed bug, not a design nitpick: a unitless `line-height` (e.g. the
common `body { line-height: 1.6 }` for paragraph readability, inherited into everything)
makes text render visibly **above center** inside a symmetrically-padded single-line
container — the "extra" leading isn't split evenly above/below the glyph the way the CSS
spec describes, it shows up mostly *below*. It's easy to misdiagnose this as a
flow/alignment bug (it looks identical to one) and waste time on `vertical-align` /
`flow` fixes that do nothing, because the real cause is upstream: the inherited
`line-height` multiplier. Fix: give any small padded text badge (status pills, tags,
chips, segmented-control buttons, etc.) its own explicit `line-height` — `1` or `1em` —
instead of letting it inherit the page's prose line-height. Diagnose it directly rather
than guessing: read `element.state.box("dimension","inner")` before/after the change —
if the box's own height shrinks by roughly `(inherited-multiplier − 1) × font-size` and
the glyph now sits centered, that confirms line-height was the cause. (Separately:
`getComputedStyle(el).lineHeight` for an unresolved unitless value can report a bogus
huge number in some builds — e.g. it printed `820`/`1312` matching the *window height*,
not the font-size. Don't trust that specific read-back; measure the rendered box instead.)

**`background-repeat` / `foreground-repeat`** **[legacy]** — beyond the standard `repeat` |
`no-repeat` | `repeat-x` | `repeat-y`, Sciter adds `expand` (expandable-9-slice-style
filling, paired with the `background-offset-*`/`foreground-position-*` margins already
documented above) and `stretch [keep-ratio]` (stretch to fill, optionally preserving aspect
ratio — position the result with `background-position`).

---

### Gradients, Filters, Transforms — Confirmed Function Sets

**`filter` / `backdrop-filter`** **[confirmed — `samples/samples.css/css3-filter/`]**:
`blur(<length>)`, `brightness(<percent>)`, `contrast(<percent>)`, `grayscale(<percent>)`,
`hue-rotate(<deg>)`, `invert()`, `opacity(<percent>)`, `saturate(<percent>)`,
`sepia(<percent>)`, `drop-shadow(<offset-x> <offset-y> <blur> <color>)`. This matches the
standard CSS Filter Effects function set closely — no surprises here, but note the SVG
`url(#filter)` reference form is not confirmed.

**`transform`** **[confirmed 2D subset]** — per the official compatibility statement,
**transform is 2D only**. Confirmed functions from samples: `rotate(<deg>)`,
`scale(<n>)` / `scale(<x>,<y>)`, `translate(<x>,<y>)`. `skew()`/`skewX()`/`skewY()` and
`matrix()` are standard 2D CSS functions not found in any sample here — treat as
**not confirmed**, not as safely assumed. **`rotate3d()`, `translate3d()`, `matrix3d()`,
`perspective()`, `rotateX/Y/Z()` are explicitly out of scope** ("2D only") even though a
bundled third-party stylesheet (`samples/samples.css/css-fontawesome/`) contains `rotate3d()`
calls — that file is a straight port of the real Font Awesome web CSS and its 3D-transform
keyframes are not guaranteed to render correctly under Sciter's 2D-only transform engine.

---

## Transitions & Animations

### `transition` — two accepted syntaxes **[confirmed]**

**Standard-CSS-like shorthand** — `property [ease-name] duration`, seen throughout
`samples/samples.css/gradients/`:

```css
div { transition: transform 0.5s; }                    /* property + duration, default ease */
div { transition: background linear 0.5s; }             /* property + ease-name + duration */
div { transition: transform quart-out 0.5s; }
```

**Function-call-per-property form** (pre-dates the W3C shorthand, per Sciter's own docs —
*"transition was implemented in H-SMILE core long before it was specified by W3C so there are
differences in notation"*):

```css
.mybutton:hover {
  transition: color(linear,200ms) border-color(linear,100ms);
}
```

Multiple properties: space-separate multiple `property(...)` terms, or (shorthand form)
comma-separate multiple `property duration` terms.

**Ease-function names** — Sciter uses **named ease functions, not `cubic-bezier()`**
(`cubic-bezier()` is not confirmed anywhere in docs/samples — don't use it):

```
none  linear
quad-in    quad-out    quad-in-out
cubic-in   cubic-out   cubic-in-out
quart-in   quart-out   quart-in-out
quint-in   quint-out   quint-in-out
sine-in    sine-out    sine-in-out
expo-in    expo-out    expo-in-out
circ-in    circ-out    circ-in-out
elastic-in elastic-out elastic-in-out
back-in    back-out    back-in-out
x-back-in  x-back-out  x-back-in-out
xx-back-in xx-back-out xx-back-in-out
bounce-in  bounce-out  bounce-in-out
```

### `@keyframes` + `animation` **[confirmed — `samples/samples.sciter/themes/windows-flat/theme.css`]**

Standard `@keyframes` syntax and `animation` shorthand both work:

```css
@keyframes flat-progress-slide {
  from { background-position-left: 0%; }
  to   { background-position-left: 100%; }
}
.progress { animation: 1.2s infinite alternate flat-progress-slide; }
```

Remember the 2D-only `transform` restriction applies inside keyframes too.

---

## Style Sets

A **style set** is a named, scoped block of style rules — Sciter's equivalent of a
LESS/SASS scoped module, applied as a whole to a DOM subtree.

### Declaration

```css
@set name [< parent-set-name] {
  :root { ... }          /* the host element itself */
  :root > child { ... }  /* direct child of host */
  child { ... }           /* any descendant */
}
```

* The element the set is applied to is the set's **root**, selected via `:root` inside
  the set.
* Rules inside a style set only ever match the host element and its descendants.
* **Inheritance**: `@set name < parent-set-name { ... }` — the new set starts with all
  rules from `parent-set-name`, then appends its own. Normal CSS specificity applies
  across inherited + own rules (more specific wins regardless of origin).

### Application

**Via CSS** — on the host element's own selector:

```css
selector { style-set: set-name [url(file.css)]; }
```

If `url(file.css)` is given, that file is loaded on demand and the set looked up by name
inside it.

**Via HTML** — `styleset` attribute, `file.css#set-name`:

```html
<div styleset="styles.css#set-name">...</div>
```

**Via JS/JSX** — same `styleset` attribute, with `__DIR__` to build an absolute URL:

```js
render() {
  return <div styleset={__DIR__ + "styles.css#set-name"}>...</div>;
}
```

**Via JS/JSX with an inline, anonymous set** — `CSS.set` tagged template, useful for
single-file components:

```js
const styleSet = CSS.set`
  :root { flow: vertical; }
  :root > child { ... }
`;
render() { return <div styleset={styleSet}>...</div>; }
```

### Overriding Style Set Rules From Outside

Style set rules apply **on top of** normal rules — to override a style-set property from
a normal rule targeting the same host element, you must use `!important`:

```css
@set TestSet { :root { color: red; background: gold; } }

div {
  style-set: TestSet;
  color: green !important; /* wins over the style set */
  background: red;         /* loses to the style set — no !important */
}
```

---

## Behaviors & Aspects

Sciter "behaviors" attach JS logic to DOM elements declaratively, from CSS. There are two
mechanisms: **class controllers** (`prototype`) and **functional controllers** (`aspect`).

### `prototype` — Class Controllers

A class controller subclasses the built-in `Element` class and takes over an element's
behavior — an element can have exactly **one** prototype at a time (JS has no multiple
inheritance).

```css
user-card {
  display: block;
  flow: vertical;
  prototype: UserCard url(users-ui.js);
}
```

```js title="users-ui.js"
class UserCard extends Element {
  componentDidMount() {
    // 'this' is the subclassed DOM element; build DOM here via this.content(), this.append(), etc.
  }
  componentWillUnmount() {
    // called when "declassed" — removed from DOM or reassigned another class
  }
}
```

```css
prototype: class-name [url(file.js)];
```

* `class-name` — the JS class name.
* `url(file.js)` — URL of a JS **module** file where the class is defined.

### `aspect` — Functional Controllers

Aspects solve the "only one prototype" limitation: any number of aspect functions can
attach independent partial behaviors ("aspects") to the same element.

```js title="ui-helpers.js"
function OnClickAspect() {
  this.on("click", () => {
    let attrClick = this.attributes["click"];
    eval(attrClick);
  });
}
```

```css title="ui-helpers.css"
*[onclick] { aspect: OnClickAspect url(ui-helpers.js); }
```

```css
aspect: function-name[( ...parameters... )] [ url(file.js) ];
```

* `function-name` — the JS function name.
* `url(file.js)` — URL of the JS file defining it.

> **Unusual inheritance rule**: *every* matching rule's `aspect` gets invoked for an
> element — unlike normal CSS cascading where a later/more-specific rule replaces an
> earlier one. So:
> ```css
> [onclick]  { aspect: OnClickAspect  url(ui-helpers.js); }
> [onchange] { aspect: OnChangeAspect url(ui-helpers.js); }
> ```
> both `OnClickAspect` and `OnChangeAspect` run on an element matching both selectors.

**Parametrized aspects** — CSS can pass parameters as a keyed object:

```css
chart { aspect: Donut(fill: #f00 #0f0 #00f, thickness:0.2) url(micro-charts.js); }
```

```js
// called as MicroChart.Donut.call(domElement, params)
const params = {
  fill: [Color.RGB(255,0,0), Color.RGB(0,255,0), Color.RGB(0,0,255)],
  thickness: 0.2
};
```

---

## Scrollbar Styling

(Official docs page is a stub; the following is everything documented about scrollbars
elsewhere in the CSS reference.)

* `vertical-scrollbar` / `horizontal-scrollbar` — accept the name of a **styleset**
  (`@set`) that defines the scrollbar's look/feel.
* `overscroll-behavior`, `overscroll-behavior-x`, `overscroll-behavior-y` — what happens
  at the scroll boundary:
  * `auto` — rollback animation on touch scroll, no overscroll on mouse wheel
  * `contain` — overscroll with rollback animation
  * `none` — no overscroll at all
* `overflow-y: scroll-indicator` (also valid for `overflow-x`) — shows a non-space-taking
  mobile-style scroll indicator instead of a classic scrollbar.
* Webkit-style pseudo-elements are also recognized for basic thumb/track theming:
  ```css
  ::-webkit-scrollbar { width: 10px; }
  ::-webkit-scrollbar-track { background: #f1f1f1; }
  ::-webkit-scrollbar-thumb { background: #888; }
  ::-webkit-scrollbar-thumb:hover { background: #555; }
  ```

---

## Markers & Shadows (`::marker`, `::shadow`/`::shade`)

Alongside standard `::after`/`::before`, Sciter has `::marker` and `::shadow` /
`::shade` pseudo-elements. Both are `display:block` and are laid out as if their
container used `flow:stack` — so `margin` (including flex-unit margins) positions them.

```css
div { size: 64px; border: 3px solid blue; }
div::marker {
  size: 32px;
  margin: 0 * * 0; /* pinned to top-left corner */
  background: rgba(255,0,0,0.5);
  z-index: 1; /* above content layer */
}
```

Cover the whole host element:

```css
div::marker { size: *; background: rgba(255,0,0,0.5); z-index: 1; }
```

`::shadow`/`::marker` provide similar functionality; use both together if you need two
independent extra layers outside the element's own DOM.

### Shadow DOM via `::shade` + `prototype`

For non-trivial injected content, attach a `prototype` to the `::shade` pseudo-element:

```css title="css"
div::shade { size: *; prototype: MyShadow url(shadow.js); }
```

```js title="shadow.js"
class MyShadow extends Element {
  componentDidMount() {
    // 'this' here is the ::shade pseudo element
    this.content(<><h1>This is shadow DOM!</h1><div>...</div></>);
  }
}
```

Style the shade's content separately via a style set:

```css
div::shade { style-set: MyShade; }
@set MyShade {
  :root { ... }        /* the ::shade itself */
  :root:hover { ... }
  /* ...rules for its children... */
}
```

---

## Image Maps (`@image-map`)

A catalog of named fragments (cells) of one base bitmap, used as CSS sprites.

```css
@image-map toolbar-icons {
  src:   url(tb-icons.png) 120dpi,       /* used at <= 120dpi */
         url(tb-icons-x2.png) 240dpi,    /* used at <= 240dpi */
         url(tb-icons-jumbo.png);        /* fallback for everything else */
  cells: 15 2;                            /* 15 columns, 2 rows in the source image */
  items: bold, italic, underline, strike,
         font-family, font-size, text-color, text-back-color;
}
```

* `src` supports multiple resolution variants (DPI-selected automatically).
* `cells: columns rows` — the grid dividing the base image.
* `items:` — logical names assigned in row-major cell order.

### `image-map()` function

Selects a named fragment as an image; usable anywhere an image is expected:

```css
toolbar > button { size: 2em; background: no-repeat 50% 50%; padding: 3px; }
toolbar > button.bold   { background-image: image-map(toolbar-icons, bold); }
toolbar > button.italic { background-image: image-map(toolbar-icons, italic); }
```

---

## Paths & Vector Images (`path()`, `icon()`)

Sciter draws simple vector shapes directly in CSS without needing SVG DOM elements or
icon fonts, via `path()` and `icon()` functions/URL schemes.

### `path()`

Uses the same command syntax as SVG's `d` path attribute.

```css
div {
  background-image: url(path:c 50,0 50,100 100,100 c 50,0 50,-100 100,-100);
  background-repeat: no-repeat;
}
/* equivalent function form: */
div {
  background-image: path(c 50,0 50,100 100,100 c 50,0 50,-100 100,-100);
  fill: #000;
}
```

Also usable as a plain URL wherever a URL is expected, with the `path:` scheme:

```html
<img src="path:c 50,0 50,100 100,100 c 50,0 50,-100 100,-100" />
```

```css
img { border: 1px dotted; fill: gold; stroke: red; stroke-width: 3px; }
```

### `icon()`

Variant of `path()` with two forms:

**Stock icons** — Sciter ships an internal library used by built-in components:

```html
<img src="icon:right" />
```

(list of names viewable in `usciter` from the Sciter SDK.)

**Custom icons** — `icon(vbox; d-path)`:

* `vbox` — 4 numbers = the SVG viewport, same meaning as `viewBox`.
* `d-path` — SVG `d` path command string.

```css
icon.heart {
  foreground-image: icon(0 0 100 100; M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z);
  foreground-repeat: no-repeat;
  foreground-size: contain;
  fill: none;
  stroke: red;
  stroke-width: 1px;
}
```

Icons exported as SVG from [Google Fonts](https://fonts.google.com/icons) can be
converted directly into this format (copy the `d` path).

---

## Variables & Attributes

### CSS Variables

**Declaration** — two equivalent forms:

```css
body {
  var(text-color): #000;      /* Sciter ergonomic form */
  var(base-width): 100px;
  --text-color: #000;          /* standard custom-property form, 4.4.8.0+ */
  --base-width: 100px;
}
```

**Usage** — variables inherit from parent to child, and can be substituted anywhere a
string/color/length is expected:

| Form | Behavior |
|---|---|
| `var(name, defaultValue)` | substitutes `defaultValue` if `name` isn't declared |
| `length(name)` | Sciter length-variable specialization |
| `color(name)` | Sciter color-variable specialization |

```css
div {
  color: color(text-color);        /* #000 */
  width: length(base-width);       /* 100px */
  height: var(base-height, 80px);  /* 80px, base-height undefined */
  font-size: var(--base-width);    /* 100px */
}
```

### Custom (Dash-Prefixed) Properties — a *different* mechanism **[legacy]**

Don't confuse this with `--name`/`var()` above. Any property name starting with a single
`-` is treated as a **custom, non-inherited** attribute-like slot, independent of the
variable system:

```css
p { border: 1px solid red; -custom: "value"; }
```

Value can be a quoted string, an nmtoken, a number, a `url(...)`, or `selector(...)`. Unlike
`--name`/`var()` custom properties, these do **not** inherit parent→child and are not looked
up via `var()`/`color()`/`length()`.

### CSS Attributes (`attr()`)

**Declaration form** — sets a *default DOM attribute value* for matching elements,
purely from CSS. This has **no W3C equivalent**:

```css
select div { attr(role): "option"; }
```

replaces having to repeat it in HTML:

```html
<select|list>
  <div role="option">...</div>
  <div role="option">...</div>
</select>
```

**Usage form** — `attr(name)` as a *value*, e.g. inside `content`, or inside another
`attr()` declaration:

```html
<button value="Press me!" />
```
```css
button { content: attr(value); } /* renders "Press me!" */
```

`parent-attr(name)` reads an attribute value from the **parent** element.

---

## Conditionals

### `@media`

Placeable at the top level, inside `@set`, or nested in other conditional at-rules.

```css
@media <condition> { ...rules... }
```

`<condition>` is either a single media-variable name (`@media print { ... }`) or an
expression combining several (`@media print or handheld { ... }`).

> **Sciter's media query syntax is NOT W3C-compatible.** Comparisons use JS-style
> operators instead of the `min-`/`max-` prefix convention:
>
> | W3C | Sciter |
> |---|---|
> | `@media screen and (max-width: 600px)` | `@media screen && (width < 600px)` |
> | `@media (min-width: 600px)` | `@media (width >= 600px)` |
>
> `and` → `&&`. Full comparison set: `<`, `>`, `==`, `<=`, `>=`, and `and`/`or` for
> logical combination, `( )` for grouping.
>
> **Runtime-change caveat**: min/max-style constraints (e.g. `width < 600px`) trigger on
> **screen** size changes, not window resize, unlike browsers.

Custom, app-controlled media variables:

```css
@media (viewport == "narrow") { div:nth-child(1n) { clear:after; } }
@media isMobile { .columns { flow: vertical; } }
```
```js
Window.this.mediaVars({ viewport: "normal" });
Window.this.mediaVars({ isMobile: false });
```

**Built-in media variables**

| Name | Description |
|---|---|
| `width`, `height` | window dimensions |
| `min-width`, `min-height` | from `window-min-size`, else 0 |
| `max-width`, `max-height` | from `window-max-size`, else desktop size |
| `aspect-ratio` | window width/height |
| `monitors` | number of connected displays |
| `device-width`, `device-height` | primary display size |
| `device-aspect-ratio` | device-width / device-height |
| `orientation-portrait` / `orientation-landscape` | derived from device dimensions |
| `colors` | bits per pixel |
| `resolution` | dots per inch |
| `resolution-dpcm` | dots per centimeter |
| `physical-resolution` | (macOS) backend dpi |
| `high-contrast` | OS high-contrast theme active |
| `has-pen`, `has-mouse`, `has-mouse-wheel`, `has-horizontal-mouse-wheel`, `has-touch-screen`, `has-pen-screen`, `has-multi-touch` | input device capability flags |
| `screen-reader` | screen reader running |
| `slow-machine` | OS "slow machine" hint (unreliable) |
| `composition-supported` (alias `ui-blurbehind`) | OS supports blur-behind |
| `dropdown-animation-supported`, `menu-animation-supported`, `tooltip-animation-supported` | user animation preferences |
| `ui-ambience` | `"dark"` or `"light"` |
| `ui-accented-window-decoration` | Windows only, accent-colored chrome |
| `engine` | `"sciter"` |
| `engine-version-minor`, `engine-version-major` | numbers |
| `sciter` | always true |
| `os` | OS name string |
| `platform` | `"Windows"`\|`"OSX"`\|`"Linux"`\|`"Android"`\|`"iOS"` |
| `desktop` / `handheld` | device class |
| `print` | print / print-preview context |
| `Windows`, `MacOS`, `Linux` | boolean per-OS flags |
| `windowless` | running under windowless Sciter.Lite |

### `@const`

```css
@const name : <value> [<value>...];
```

Use as `@name` wherever a value is expected:

```css
@const BACKGROUND: no-repeat url(...) 50% 50%;
@const DARK: #222;
body { background: @BACKGROUND; }
body { background: @DARK; }
```

### `@mixin`

Named, reusable set of CSS properties, applied by `@name`.

```css
@mixin LIKE-BUTTON(basecolor) {
  behavior: button;
  color: #ffffff;
  background: linear-gradient(top, tint(basecolor,+0.3), basecolor);
}
div { @LIKE-BUTTON(#fff); }
```

Parametric mixins reference their params with `@paramName` inside the body:

```css
@mixin mname(paramName1, paramNameN) {
  name1: @paramName1;
  name2: @paramNameN;
}
some { @mname(val1, val2); color: black; }
```

Properties applied by a mixin can be **overridden afterward** in the same rule:

```css
a[href] {
  @LIKE-BUTTON(#ff0000);
  display: block; /* overrides display:inline-block set inside the mixin */
}
```

### `@supports`

Depends on Sciter's support for a specific property/value pair (not a general feature
query — only accepts a single `property: value` declaration as the condition):

```css
@supports (transform-origin: 5% 5%) {
  /* rules used only if Sciter supports transform-origin */
}
```

### `@if` / `@else`

**Load-time-only** conditional compilation — evaluates media expressions **once**, at
load time, and never re-evaluates them (unlike `@media`, which re-evaluates at runtime).
Semantically equivalent to C/C++ preprocessor `#if`/`#else`/`#endif`.

```css
@if (Windows or MacOS) {
  html { background: white; }
} @else {
  html { background: black; }
}
```

**Rule of thumb**: use `@if` for conditions that never change at runtime (e.g.
`platform`, `desktop`); use `@media` for conditions that can change while the app is
running (e.g. `high-contrast`, custom app-defined media vars).

### `@import` **[confirmed — `samples/samples.css/css-fontawesome/main.htm`]**

Standard CSS stylesheet inclusion:

```css
@import url(fontawesome/fontawesome.css);
```

### `@font-face` **[confirmed — listed in the official CSS3 module list, used in bundled font CSS]**

Standard embedded/custom font declaration syntax works as in browser CSS.

### `@include` **[legacy — not confirmed for Sciter.js]**

Documented only on the old cssmap as a way to pull a *script* (not a stylesheet) into the
document from CSS: `@include "mime-type" url(...) [media-types];`, e.g.
`@include "text/tiscript" url(script.tis) screen;` (equivalent of
`<script type="text/tiscript" src="script.tis">`). This predates Sciter.js's ES-module
system (`<script type="module">`, `import`) — don't reach for `@include` in Sciter.js code;
use ES module imports instead. Listed here only so it's recognized if encountered in ported
legacy-Sciter code, not as something to write new.

---

## HTML Shortcuts in CSS

```css
div#id.class { }   /* combines tag + id + class, same shorthand as web CSS */
widget[type="x"]   /* attribute selector */
input|text          /* E|name shorthand == E[type="name"], also usable as an element tag */
```
