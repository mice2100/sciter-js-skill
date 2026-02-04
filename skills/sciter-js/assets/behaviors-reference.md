# Sciter Built-in Behaviors Reference

Complete reference for all built-in Sciter behaviors. Behaviors are automatically applied to specific elements.

## behavior:richtext (Rich Text Editor)

Applied to: `<htmlarea>`

WYSIWYG HTML editing with full document container support.

### HTML

```html
<htmlarea content-style="editor.css" spellcheck="true">
  <h2>Editable Content</h2>
  <p>Type here...</p>
</htmlarea>

<!-- Or full document mode -->
<htmlarea>
  <html>
    <body>
      <h2>Full Document</h2>
      <p>Content...</p>
    </body>
  </html>
</htmlarea>
```

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `readonly` | boolean | Make editor read-only |
| `content-style` | URL | CSS file for editor content |
| `spellcheck` | boolean | Enable/disable spell checking |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `CTRL+B` | Bold |
| `CTRL+I` | Italic |
| `CTRL+U` | Underline |
| `CTRL+D` | Code block `<code>` |
| `CTRL+1-6` | Heading `<h1>`-`<h6>` |
| `CTRL+0` | Paragraph `<p>` |
| `CTRL+NUMPAD7` | Preformatted `<pre>` |
| `CTRL+NUMPAD+` | Indent |
| `CTRL+NUMPAD-` | Unindent |
| `CTRL+NUMPAD.` | Ordered list `<ol>` |
| `CTRL+NUMPAD*` | Unordered list `<ul>` |
| `CTRL+NUMPAD/` | Definition list `<dl>` |

### Commands (execCommand)

```js
const editor = document.$("htmlarea");

// Common editing
editor.execCommand("edit:cut");
editor.execCommand("edit:copy");
editor.execCommand("edit:paste");
editor.execCommand("edit:undo");
editor.execCommand("edit:redo");

// Insert
editor.execCommand("edit:insert-break"); // ENTER
editor.execCommand("edit:insert-soft-break"); // SHIFT+ENTER
editor.execCommand("edit:insert-text", "text");
editor.execCommand("edit:insert-html", "<b>HTML</b>");

// Format
editor.execCommand("format:apply-span:b|strong");
editor.execCommand("format:toggle-span:i|em");
editor.execCommand("format:toggle-list:ul");
editor.execCommand("format:toggle-list:ol");
editor.execCommand("format:toggle-list:dl");
editor.execCommand("format:toggle-pre");
editor.execCommand("format:indent");
editor.execCommand("format:unindent");
editor.execCommand("format:morph-block:p");
editor.execCommand("format:unwrap-element:blockquote");

// Table (when in table)
editor.execCommand("edit:insert-table-row:before");
editor.execCommand("edit:insert-table-row:after");
editor.execCommand("edit:insert-table-column:before");
editor.execCommand("edit:insert-table-column:after");
editor.execCommand("edit:merge-table-cells");
editor.execCommand("edit:delete-table-rows");
editor.execCommand("edit:delete-table-columns");
editor.execCommand("edit:split-table-cells");
```

### Transactional Updates

```js
editor.richtext.update((tctx) => {
    tctx.setAttribute(element, "class", "highlight");
    tctx.setTag(element, "li");
    tctx.setText(node, "new text");
    tctx.insertHTML(node, offset, "<b>text</b>");
    tctx.insertText(node, offset, "text");
    tctx.insertNode(node, offset, newNode);
    tctx.deleteSelection();
    tctx.deleteRange(node1, offset1, node2, offset2);
    tctx.deleteNode(node);
    tctx.split(node, offset, untilElement);
    tctx.wrap(node1, offset1, node2, offset2, wrapperElement);
    tctx.unwrap(element);
    return true; // commit, false to discard
});
```

### Properties and Methods

```js
// Properties
editor.richtext.url = "document.htm";

// Methods
editor.richtext.load("url");
editor.richtext.load(htmlString, baseUrl);
editor.richtext.save("fileUrl");
editor.richtext.loadEmpty();
editor.richtext.sourceToContent(html, url, selStart, selEnd);
const [html, url, selStart, selEnd] = editor.richtext.contentToSource();
```

### Events

| Event | Description |
|-------|-------------|
| `change` | Content changed (asynchronous) |
| `changing` | Content about to change (synchronous) |

## behavior:frame

Applied to: `<frame>`

Document container for loading external HTML documents.

### HTML

```html
<frame src="document.htm" />
<frame id="content"></frame>
```

### JavaScript

```js
const frame = document.$("frame");

// Load document
frame.load("document.htm");

// Access frame document
const frameDoc = frame.frame.document;
const frameWindow = frame.frame.window;

// Debug mode
frame.frame.debugMode = true;
```

## behavior:edit

Applied to: `<input type="text">`, `<input>`

Single-line text editing.

### HTML

```html
<input type="text" value="text" />
<input />

<!-- Read-only -->
<input type="text" readonly />
```

### Properties

| Property | Description |
|----------|-------------|
| `value` | Current text |
| `selectionStart` | Selection start |
| `selectionEnd` | Selection end |
| `textLength` | Text length |

### Methods

```js
input.selectAll();
input.setSelection(start, end);
input.replaceSelection(text);
```

## behavior:textarea

Applied to: `<textarea>`

Multi-line text editing.

### HTML

```html
<textarea rows="10" cols="80">Text</textarea>
```

## behavior:password

Applied to: `<input type="password">`

Password input with masking.

### HTML

```html
<input type="password" />
```

## behavior:number

Applied to: `<input type="number">`

Numeric input with validation.

### HTML

```html
<input type="number" min="0" max="100" step="1" value="50" />
```

## behavior:decimal

Applied to: `<input type="decimal">`

Decimal/floating-point number input.

### HTML

```html
<input type="decimal" min="0.0" max="1.0" step="0.01" value="0.5" />
```

## behavior:integer

Applied to: `<input type="integer">`

Integer input with step buttons.

### HTML

```html
<input type="integer" min="0" max="100" value="50" />
```

## behavior:calendar / behavior:date

Applied to: `<input type="date">`, `<input type="calendar">`

Date picker with calendar popup.

### HTML

```html
<input type="date" value="2024-01-01" />
<input type="calendar" />
```

## behavior:slider

Applied to: `<input type="hslider">`, `<input type="vslider">`

Slider control for numeric values.

### HTML

```html
<input type="hslider" min="0" max="100" value="50" step="1" />
<input type="vslider" min="0" max="100" value="50" />
```

## behavior:progress

Applied to: `<input type="progress">`, `<progress>`

Progress bar indicator.

### HTML

```html
<input type="progress" value="50" max="100" />
<progress value="50" max="100">50%</progress>
```

## behavior:check

Applied to: `<input type="checkbox">`

Checkbox control.

### HTML

```html
<input type="checkbox" checked />
<input type="checkbox" id="agree" />
<label for="agree">Agree</label>
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `checked` | boolean | Check state |
| `value` | string | Value when checked |

## behavior:radio

Applied to: `<input type="radio">`

Radio button group.

### HTML

```html
<input type="radio" name="group" value="1" checked />
<input type="radio" name="group" value="2" />
```

## behavior:select

Applied to: `<select>`

Dropdown selection control.

### HTML

```html
<select>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>

<!-- Multiple selection -->
<select multiple size="5">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Properties

| Property | Description |
|----------|-------------|
| `value` | Selected value(s) |
| `options` | Array of options |
| `length` | Number of options |

## behavior:select-dropdown

Applied to: `<select type="dropdown">`

Modern dropdown with popup list.

### HTML

```html
<select type="dropdown">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

## behavior:button

Applied to: `<button>`, `<input type="button">`

Clickable button control.

### HTML

```html
<button>Click Me</button>
<input type="button" value="Click" />
<button disabled>Disabled</button>
```

### States

| State | Description |
|-------|-------------|
| `:hover` | Mouse over |
| `:active` | Being pressed |
| `:focus` | Has focus |
| `:disabled` | Disabled |

## behavior:hyperlink

Applied to: `<a>`, `<a href>`

Hyperlink navigation.

### HTML

```html
<a href="https://sciter.com">Link</a>
<a href="document.htm">Local</a>
<a href="mailto:user@example.com">Email</a>
```

## behavior:menu

Applied to: `<menu>`, `<menu.popup>`

Popup menu control.

### HTML

```html
<menu.popup id="context-menu">
  <li#open>Open</li>
  <li#save>Save</li>
  <li.separator />
  <li#exit>Exit</li>
</menu>
```

### JavaScript

```js
const menu = document.$("menu#context-menu");
menu.popup(element, x, y);
```

## behavior:virtual-list

Applied to: `<widget virtual-list>`

Virtual scrolling list for large datasets.

### HTML

```html
<widget virtual-list id="list" style="flow: vertical; height: 300dip;">
  <!-- Items generated dynamically -->
</widget>
```

### JavaScript

```js
const list = document.$("widget#list");

// Set data source
list.items = [
    { id: 1, text: "Item 1" },
    { id: 2, text: "Item 2" }
];

// Or with function
list.items = function(anchor, direction) {
    // Return items based on anchor
    return [];
};
```

## behavior:popup

Applied to: `<popup>`

Popup window/tooltip control.

### HTML

```html
<popup #tooltip>
  Tooltip content
</popup>
```

## behavior:output

Applied to: `<output>`

Output element for displaying results.

### HTML

```html
<output id="result">0</output>
```

## behavior:details

Applied to: `<details>`

Collapsible details section.

### HTML

```html
<details open>
  <summary>Click to expand</summary>
  <p>Hidden content</p>
</details>
```

## behavior:terminal

Applied to: `<widget type="terminal">`

Terminal/console emulator.

### HTML

```html
<widget type="terminal" />
```

## behavior:video

Applied to: `<video>`

Video playback control.

### HTML

```html
<video src="video.mp4" autoplay loop muted controls>
  Your browser does not support video.
</video>
```

## behavior:pager

Applied to: `<widget type="pager">`

Pagination control for printing.

### HTML

```html
<widget type="pager" />
```

## behavior:expandable-list

Applied to: `<select>` with expandable items

Tree-like expandable list.

## behavior:history

Applied to navigation elements

Forward/back navigation history.

## behavior:label

Applied to: `<label>`

Label for form controls.

## behavior:clickable

Applied to clickable elements

Generic click behavior.

## behavior:scrollbar

Applied to: scrollbar elements

Custom scrollbar behavior.

## behavior:frame-set

Applied to: `<frameset>`

Frame set layout.

## behavior:menu-bar

Applied to: `<menu-bar>`

Application menu bar.

## behavior:lottie

Applied to: `<widget type="lottie">`

Lottie animation player.

### HTML

```html
<widget type="lottie" src="animation.json" />
```

## behavior:masked-text

Applied to: `<input type="masked-text">`

Text input with format mask.

## behavior:textarea

Applied to: `<textarea>`

Multi-line text input.

## behavior:time

Applied to: `<input type="time">`

Time picker.

## Quick Reference Table

| Element | Default Behavior |
|---------|------------------|
| `<htmlarea>` | `richtext` |
| `<frame>` | `frame` |
| `<button>` | `button` |
| `<input>` | `edit` |
| `<input type="text">` | `edit` |
| `<input type="password">` | `password` |
| `<input type="number">` | `number` |
| `<input type="decimal">` | `decimal` |
| `<input type="integer">` | `integer` |
| `<input type="date">` | `date` |
| `<input type="calendar">` | `calendar` |
| `<input type="hslider">` | `slider` |
| `<input type="vslider">` | `slider` |
| `<input type="progress">` | `progress` |
| `<input type="checkbox">` | `check` |
| `<input type="radio">` | `radio` |
| `<select>` | `select` |
| `<select type="dropdown">` | `select-dropdown` |
| `<textarea>` | `textarea` |
| `<menu>` | `menu` |
| `<menu.popup>` | `popup` |
| `<a>` | `hyperlink` |
| `<video>` | `video` |
| `<details>` | `details` |
| `<output>` | `output` |
| `<widget virtual-list>` | `virtual-list` |
| `<widget type="pager">` | `pager` |
| `<widget type="terminal">` | `terminal` |
| `<widget type="lottie">` | `lottie` |
