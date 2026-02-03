# Sciter CSS Reference

Complete reference for Sciter-specific CSS syntax and constraints.

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
| `gap` | `border-spacing` |

## Flow Property Values

```
flow: default          - Auto-detect by content
flow: horizontal       - Single row layout
flow: vertical         - Single column layout
flow: horizontal-wrap  - Multiple rows (wrapping)
flow: vertical-wrap    - Multiple columns (wrapping)
flow: stack           - Stacked elements (absolute positioning alternative)
flow: grid(...)       - Explicit grid layout
flow: row(...)        - Automatic row fills
flow: text            - Text-only layout
```

## Flex Units

Flex units (`*`, `1*`, `0.5*`, etc.) can be applied to:
- `width`, `height`
- `margin-*`, `padding-*`
- `border-*-width`
- `size` (shorthand for width + height)

```
width: *         /* 1* - fills available space */
width: 2*        /* 2x the space of 1* */
width: 0.5*      /* Half the space of 1* */
size: *          /* width: *; height: *; */
margin: 0.3* 0.7* /* 30/70 split */
```

## Grid Layout Syntax

```
flow: grid(
    1 2 3,
    4 5 5,
    6 6 6
);
```

Numbers represent DOM child order (1-based). Same number = spanned cell.

### Grid with Explicit Rows/Columns

```css
flow-rows: 100px * max-content;
flow-columns: repeat(3, minmax(100px, 1*));
```

## Style Sets (@set)

Reusable style groups with local scope:

```css
@set MyButton {
    :root { background: blue; }
    :hover { background: darkblue; }
    :active { background: navy; }
    :disabled { opacity: 0.5; }
}

button {
    @set MyButton; /* Apply style set */
}
```

## Behaviors and Aspects

### Prototype (Class Controller)

```css
element-name {
    prototype: ClassName url(module.js);
}
```

### Aspect (Functional Controller)

```css
*[attr] {
    aspect: functionName url(module.js);
}
```

### Parameterized Aspect

```css
chart {
    aspect: Chart(type:donut, colors:#f00 #0f0) url(charts.js);
}
```

## Sciter-Specific Pseudo-Classes

```
:current        - Currently focused element
:captive        - Elements in captive context
:owns-popup     - Elements that own open popup
:missing        - Elements with missing required attributes
:valid          - Form elements with valid values
:invalid        - Form elements with invalid values
:in-range       - Values within min/max
:out-of-range   - Values outside min/max
:required       - Required form fields
:optional       - Optional form fields
:read-only      - Read-only elements
:read-write     - Editable elements
```

## Sciter-Specific Properties

```
context-menu: url(menu.htm); /* Custom context menu */
foreground-image: url(...);  /* Layered images */
foreground-repeat: ...;
foreground-position: ...;
text-selection: #color;      /* Selection color */
text-selection: none;        /* No selection */
```

## HTML Shortcuts in CSS

```css
div#id.class { }  /* instead of div[id="id"][class="class"] */
widget[type="x"]  /* attribute selector */
```

## Image Sprites (@image-map)

```css
@image-map my-sprites url(sprites.png) {
    :icon1 { rect: 0px 0px 16px 16px; }
    :icon2 { rect: 16px 0px 32px 16px; }
}

.icon1 {
    background-image: my-sprites(icon1);
}
```

## Variables

```css
@variable --my-color #ff0000;
@variable --spacing 10px;

element {
    background: var(--my-color);
    margin: var(--spacing);
}
```

## Conditional CSS (@media)

```css
@media (platform: "windows") { }
@media (platform: "mac") { }
@media (platform: "linux") { }
@media (theme: "dark") { }
@media (theme: "light") { }
@media (min-width: 800px) { }
```

## Scrollbar Styling

```css
body {
    scrollbar-virtual-mode: true; /* Mobile-style scrolling */
}

::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-track { background: #f1f1f1; }
::-webkit-scrollbar-thumb { background: #888; }
::-webkit-scrollbar-thumb:hover { background: #555; }
```
