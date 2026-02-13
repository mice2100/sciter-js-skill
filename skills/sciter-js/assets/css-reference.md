# Sciter CSS Cheat Sheet

Comprehensive reference for Sciter-specific CSS.

## ⚠️ Differences from Web CSS

| Web Standard | Sciter Equivalent | Notes |
|--------------|-------------------|-------|
| `display: flex` | `flow: horizontal` / `flow: vertical` | Use `flow` for layout |
| `display: grid` | `flow: grid(...)` | ASCII-art grid |
| `flex: 1` | `width: *` or `height: *` | Flex units for dimensions |
| `gap: 10px` | `border-spacing: 10px` | Spacing between flow items |
| `@media (max-width: 600px)` | `@media width < 600px` | JS-like comparison syntax |
| `var(--name)` | `var(name)` | Name without dashes allowed |
| `::placeholder` | `:empty` | Targets empty input value |
| `vh` / `vw` | `100vh` / `100vw` | Supported but `*` often better |

## Layout: `flow`

```css
.row { flow: horizontal; }
.col { flow: vertical; }
.wrap-row { flow: horizontal-wrap; }
.grid { 
  flow: grid(1 1 1,
             2 3 3); 
}
.stack { flow: stack; } /* ~absolute position */
```

## Units

- **`dip`**: Device Independent Pixels (1/96 inch). **Use for all layout.**
- **`px`** / **`ppx`**: Physical pixels.
- **`*` (Flex)**: Remainder of free space. `1*`, `2*`, `0.5*`.

```css
.container { 
  width: 100dip; 
  height: *;        /* Fill remaining height */
  padding: 10dip;   
  margin: *;        /* Center in parent */
}
```

## Selectors & State

| Selector | Description |
|----------|-------------|
| `input|text` | `<input type="text">` |
| `div#id` | `<div id="id">` |
| `:hover` | Mouse over |
| `:active` | Mouse down |
| `:focus` | Has focus |
| `:checked` | Checked/Active state |
| `:expanded` | Expanded (tree/select) |
| `:empty` | Empty (input value or children) |
| `:busy` | Loading (frame/img) |
| `:popup` | Is popup |
| `:owns-popup` | Hosts popup |

## At-Rules

### `@media`
```css
@media width < 600px { ... }
@media platform == "Windows" { ... }
@media theme == "dark" { ... }
```

### `@set` (Style Sets)
Used for component styling and isolating styles.
```css
@set MyStyles {
  :root { background: red; }
  .child { color: white; }
}
div { style-set: MyStyles; }
```

### `@mixin`
```css
@mixin Box(w,h) { width: @w; height: @h; }
div { @Box(100px, 100px); }
```

### `@image-map` (Sprites)
```css
@image-map icons {
  src: url(sprites.png);
  cells: 2 2;
  items: add, remove, edit, save;
}
button.add { background-image: image-map(icons, add); }
```

## Sciter Properties

| Property | Usage |
|----------|-------|
| `behavior: name` | Attach native/JS behavior |
| `prototype: Class url(...)` | Attach JS class |
| `aspect: Func url(...)` | Attach JS function |
| `size: w h` | Shorthand for width/height |
| `hit-margin: 5dip` | Expand click area |
| `popup-position: 7 1` | Anchor popup (Keypad 7 to 1) |
| `cursor: url(...) x y` | Custom cursor |
| `foreground: url(...)` | Foreground image layer |
| `border-shape: path(...)` | Clip/border element to path |
| `vertical-scrollbar: Set` | Custom scrollbar style set |

## Scrollbar Styling

Apply a style set to `vertical-scrollbar`.

```css
@set StdScrollbar {
  .base { background: #eee; }
  .slider { background: #888; border-radius: 4px; }
  .slider:hover { background: #666; }
  .prev, .next { display: none; }
}

* { vertical-scrollbar: StdScrollbar; }
```

## Variables

Sciter variables:

```css
:root {
  var(main-color): #00f;
  var(spacing): 10dip;
}

div {
  color: var(main-color);
  padding: var(spacing);
}
```
