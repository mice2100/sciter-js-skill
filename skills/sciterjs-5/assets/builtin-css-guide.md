# Built-in CSS Guide

Sciter.js ships a built-in "master" stylesheet pack (the `sciter:` resource
scheme) that every window loads automatically, before any app CSS. It is
Sciter's equivalent of a browser's user-agent stylesheet: it gives `<button>`,
`<select>`, `<input>`, `<menu>`, scrollbars, etc. their default look, wires
up built-in *behaviors* (`behavior:edit`, `behavior:select`, ...), and
defines the CSS variable palette (`var(accent)`, `var(widget-back)`, ...)
that the whole theme is built from.

The files live in `assets/builtin-css/` verbatim, copied from a real
Sciter.js install — **treat them as ground truth, not as something to
memorize from this guide.** This guide is an index and a cheat sheet; for
the exact selector, property value, or mixin body, open the real file. Do
not guess at a var() name, mixin name, or default value — grep the file.

## Why this matters for layout/design work

1. **Don't re-style what's already styled.** Standard elements
   (`button`, `input`, `select`, `menu`, scrollbars, `progress`, `tree`,
   `[selectable]`, `<details>`, calendar/date/time widgets, `fieldset`...)
   already have a complete, theme-aware default appearance. If a control
   looks "unstyled" or wrong, the fix is usually a missing `type=`
   attribute, a missing behavior, or a CSS var override — not writing
   full styling from scratch.
2. **Match the native look with the existing var() palette** instead of
   hardcoding colors. Custom components that should feel native (custom
   buttons, panels, dialogs) should read from `color(accent)`,
   `color(widget-back)`, `color(widget-border)`, etc. so they
   automatically follow the user's OS accent color and light/dark theme.
3. **`html:theme(dark)` / `:theme(dark)` already exists.** Dark mode is
   not something to build — it's a second `var(...)` block in
   `ux-master.css` that Sciter switches to automatically. Overriding a
   `var(...)` on `html`/`[theme]` is the correct way to reskin, not
   overriding every selector.

## File index

| File | What it is |
|---|---|
| `master-base.css` | Cross-theme base rules: binds elements to *behaviors* (`form`, `a`, `input[type=...]`, `select`, `menu`, `frame`, `terminal`, `[selectable]`, ...) and to named `style-set`/`style-set-base` pairs. Structural, not visual — few colors here. |
| `ux-master.css` | The actual default **theme**: `@import`s `master-base.css`, defines the full `var(...)` color/radius palette (light + `:theme(dark)`), and defines every `@set std-*` style-set referenced by `master-base.css` (button, edit, select, tree, calendar, sliders, scrollbars, popup menus, ...). This is where colors, paddings, borders, gradients for built-in controls actually live. |
| `color-selector.css` | Style-set + markup structure for `<input type="color">` and `widget[type="color"]` (the built-in color picker popup: hue/alpha sliders, saturation/value square, swatches). References a `color-selector.js` behavior script that is *not* included in this pack — treat the JS API as unverified if you need it. |
| `msgbox.css` + `msgbox.htm` | The default native-style message box window (`#content` icon layout for info/alert/error/warning/question, `#button-bar`). `msgbox.htm` is a full working Reactor/JSX example of a modal-ish dialog window reading `Window.this.parameters` — useful as a real pattern for building your own dialog windows, not just as CSS. |
| `menu-edit.htm`, `menu-richtext.htm`, `menu-selectable.htm` | Default context-menu markup wired via `context-menu:url(sciter:menu-*.htm)` in `master-base.css`'s `std-edit-base`, `std-htmlarea-base`, and `[selectable]` rules respectively. Copy/extend these to customize the default right-click menu of an edit box, richtext area, or selectable text region instead of writing one from scratch. |
| `default-page-template.htm` | Default print page template (`pageframe`, running header/footer with `#document-url`, `#page-no`, `#total-pages`). Reference this when implementing printing. |
| `icon-*.png`, `no-color.png`, `no-image.png`, `tree-icons-x1/x2.png` | Bitmap assets the CSS above references by `url(sciter:...)` (msgbox icons, the broken-image placeholder, the color-picker's transparency checkerboard, tree expand/collapse icons at 1x/2x). You won't need to touch these directly. |
| `debug-peer.js` | Internal wiring for the Sciter inspector (`inspector-js` pipe). Not an app-facing API — ignore unless debugging the inspector connection itself. |

## The CSS variable palette (from `ux-master.css`)

Defined on `html,[theme]` (light) and re-defined on
`html:theme(dark),[theme]:theme(dark)` (dark). Use via `color(name)` in
values, or `var(name)` when declaring. All confirmed present in the shipped
file as of this pack's copy — check the file directly if a name below
doesn't resolve, since themes can add more.

| Variable | Light default | Purpose |
|---|---|---|
| `panel` / `panel-text` | `#f9f9fa` / `#353535` | chrome/panel backgrounds (toolbars, sidebars) |
| `document` / `document-text` | `#fff` / `#000` | page/window background + text; also set on `:window-root` |
| `accent` | `window-accent-color` (OS accent) | primary brand/selection color |
| `accent-lite` / `accent-dark` | `morph()` of accent | lighter/darker accent variants |
| `widget-back` / `widget-text` / `widget-border` | `#fff` / `#000` / `#cecece` | form control chrome |
| `button-face` / `button-pressed` / `button-pressed-alt` | `#ebebeb` / `#f5f5f5` / `#d9d9d9` | button background states |
| `button-text` / `button-text-alt` | `#000` / `#fff` | button label color (alt = on accent-colored buttons) |
| `button-hover` | `color(accent-lite)` | button hover background |
| `widget-disabled` / `widget-disabled-text` | `#e8e8e8` / `#aaa` | disabled-state chrome |
| `button-scrollbar` / `slider-scrollbar` / `slider-scrollbar-hover` | scrollbar track/thumb colors | |
| `info-back` | `#ffffe4` | tooltip background |
| `border-radius` | `4px` | default control corner radius, read via `length(border-radius)` |
| `highlight` / `highlight-nf` / `highlight-focus` / `highlight-text` / `highlight-hover` | list/option row highlight states (nf = "not focused") | |
| `selection` / `selection-text` / `selection-nf` / `selection-nf-text` | text/option selection colors (nf = unfocused) | |
| `danger-color` / `success-color` / `warning-color` | `#db3737` / `#0f9960` / `#fcb000` | semantic status colors, used by `.danger`/`.success`/`.warning` button classes |
| `hyperlink` | `blue` (dark: `lightblue`) | `<a>` color |

`@const WINDOW_BORDER_RADIUS`/`WIDGET_BORDER_RADIUS` and an
`@if (window-shape == "round")` branch also control whether popups/menus
render with rounded "round window" shape or square bordered shape — see
`ux-master.css` lines ~118–152 for the exact mixins (`POPUP_SHAPE`,
`POPUP_LIST_SHAPE`, `POPUP_ITEM_SHAPE`) this switches between.

## Reusable mixins worth knowing about

`ux-master.css` defines `@mixin` blocks used to build every button-like
control consistently: `STD-BUTTON-NORMAL/HOVER/PRESSED/FOCUS/TAB-FOCUS/
DISABLED/DEFAULT`, `STD-OPTION-NORMAL/HOVER/CURRENT/PRESSED/FOCUS`,
`STD-MENU-ITEM-HOVER`, `STD-TB-BUTTON-*` (toolbar buttons). If you're
building a custom control that should feel like a native button or list
option, applying the matching mixin (via `@STD-BUTTON-NORMAL;` etc. in your
own `@set`) is more consistent than hand-rolling equivalent styles — but
mixins aren't importable across files by name from app CSS in the same way
`@import`ed variables are, so treat this as "match these values," and
confirm the exact `@mixin`/`@include`-equivalent syntax Sciter supports
before relying on cross-file mixin reuse.

## Elements with a complete built-in default style (don't restyle from zero)

From `master-base.css`'s selector → `style-set` bindings: `a`, `form`,
`input`/`widget` of type `text`/`password`/`currency`/`decimal`/`integer`/
`number`/`button`/`menu`/`selector`/`radio`/`checkbox`/`hslider`/`vslider`/
`vscrollbar`/`hscrollbar`/`calendar`/`date`/`masked`/`time`/`color`,
`select` (plain, `dropdown`, `tree`, `multiple`, `multiple="checkmarks"`),
`switch`, `toggle`, `button[type=menu|radio|checkbox|toggle|selector]`,
`toolbar > button`, `popup`, `progress`, `meter`, `textarea`, `plaintext`
(+ `[linenumbers]`), `htmlarea`, `frame`/`iframe`/`frameset[cols|rows]`,
`frame[type=pager]`, `menu.popup`/`menu.context`/`menu:synthetic` (context
menus), `menu.window` (native menu bar), `details`, `fieldset`, `terminal`,
`[selectable]`, `canvas[type=webgl|3d]`. Each maps to a named `@set std-*`
in `ux-master.css` (`master-base.css` only wires the *element → style-set*
binding; look up the actual style-set by name in `ux-master.css` for the
visual rules).

## When to actually open the raw files

- Exact default padding/height/border of a specific control before
  deciding whether to override it.
- The exact `var(...)` name to override for a themed look (don't invent
  one — check the palette table above, then the source).
- Reproducing/extending a built-in context menu, message box, or print
  template instead of building one from scratch.
- Confirming whether a selector/pseudo-class you want to target
  (`:owns-popup`, `:tab-focus`, `option:node`, etc.) is actually used by
  Sciter's own stylesheets — if the built-in styles rely on it, it's safe
  to use.
