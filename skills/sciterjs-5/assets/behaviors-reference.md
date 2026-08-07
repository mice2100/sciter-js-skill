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
| `CTRL+NUMPAD1...6` | Heading `<h1>`-`<h6>` |
| `CTRL+NUMPAD0` | Paragraph `<p>` |
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

### Value

`value` is a string reflecting current content DOM and is an **alias of the `html` property** - getting/setting `value` gets/sets HTML content.

### Special key combinations

Standard editing keys: `LEFT/RIGHT/HOME/END` (+CTRL/SHIFT combos), `BACKSPACE`, `DELETE`, `INSERT`, `CTRL+A/X/V/Z`.

Formatting shortcuts (in addition to those under Keyboard Shortcuts above): `CTRL+NUMPAD0` converts block to `<p>`.

### Common editing commands (all editable elements)

`<input|text>`, `<textarea>`, `<plaintext>`, `<htmlarea>` all share this base command set via `execCommand()`:

* `"edit:cut"`, `"edit:copy"`, `"edit:paste"`, `"edit:selectall"`, `"edit:undo"`, `"edit:redo"`
* `"edit:delete-next"`, `"edit:delete-prev"`, `"edit:delete-word-next"`, `"edit:delete-word-prev"`

## behavior:frame

Applied to: `<frame>`, `<iframe>`

Document container for loading external HTML documents. `<frame>` is an ordinary DOM element in Sciter - it can appear anywhere block elements can appear, not just inside `<frameset>`. Behavior can also be applied to any block element (`<div>`, `<section>`) via `behavior:frame` in CSS.

### HTML

```html
<frame src="document.htm" />
<frame id="content"></frame>
```

Before loading, `<frame>` can contain arbitrary content. After loading (via `src` attribute or `.load()`), the frame has a single child - the root element of the loaded document (e.g. `<html>`).

### Attributes

| Attribute | Description |
|-----------|-------------|
| `src="url"` | Optional, URL of document to load in the frame |
| `content-style="url"` | Optional, URL of .css file applied to the loaded content (useful for host-specific overrides) |

### State flags

* `:busy` - set while the document is loading; style "loading..." states with it.

### Events

| Event | Description |
|-------|-------------|
| `"newdocument"` / DOCUMENT_CREATED | Posted as the first step of loading - new (empty) document now exists |
| `"complete"` / DOCUMENT_COMPLETE | Document finished loading - DOM ready and all pending resource requests done |

```js
frame.on("complete", function(evt) { /* ... */ });
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

### Properties

| Property | Description |
|----------|-------------|
| `frame.document` | read-only, [Document](../DOM/Document) loaded into the frame |
| `frame.mediaVars` | read/write, object (name/value map) of media variables used by the document |
| `frame.url` | read/write, string, URL of document loaded into the frame |

### Methods

```js
el.frame.loadFile(url: string): bool          // load document from URL
el.frame.loadHtml(html: string | ArrayBuffer, baseUrl: string): bool  // load from HTML source/bytes
el.frame.loadEmpty()                           // clears content by loading an empty document
el.frame.saveFile(fileUrl: string): bool       // saves document to file (UTF-8)
el.frame.saveBytes(): ArrayBuffer              // saves document as UTF-8 encoded bytes
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

### Attributes

| Attribute | Description |
|-----------|-------------|
| `value="text"` | Initial value of the input |
| `size=integer` | Intrinsic/default width of the element |
| `maxlength=integer` | Max number of characters allowed |
| `filter="filter-expr"` | Limits allowed input characters. Accepts single chars and ranges, e.g. `filter=".@0~9a~zA~Z"`. Prefix with `^` to exclude instead: `filter="^.,-"` |
| `placeholder="text"` | Text shown when empty (style via `:empty` selector) |
| `readonly` | Element is read-only |
| `spellcheck="yes"` | Enables spell checking |

### Properties

| Property | Description |
|----------|-------------|
| `value` | Current text (string, reflects internal editing buffer) |
| `edit.selectionStart: int` | Start of selection, or caret position if no selection |
| `edit.selectionEnd: int` | End of selection, or caret position if no selection |
| `edit.selectionText: string` | Selected text, or `""` if none |
| `edit.isStandalone: bool` | r/w. If `true`, navigational keys (ArrowLeft/Right) are always consumed even at content boundary |

### Methods

```js
input.edit.selectAll();                    // select whole content
input.edit.selectRange([start, end]);       // select text between start (incl.) and end (excl.); omit both to clear selection
input.edit.removeText();                    // remove selected text (if any)
input.edit.insertText(text);                // insert at caret, replacing selection if any
input.edit.appendText(text);                // append text at the end
```

### Events

| Event | Description |
|-------|-------------|
| `"input"` / `"change"` (EDIT_VALUE_CHANGED) | Value changed due to user action. Posted (async) |
| `"changing"` (EDIT_VALUE_CHANGING) | Sent before a change is applied - synchronous, cancelable/filterable. `event.reason` is one of `BY_INS_CHAR=3` (typing), `BY_INS_CHARS=4` (paste), `BY_DEL_CHAR=5` (Delete/Backspace), `BY_DEL_CHARS=6` (selection removal). `event.data` (string, read/write) holds the character(s) to insert for `BY_INS_*` reasons - mutate it to filter input |

```js
input.on("changing", evt => {
  if (evt.reason === 3 /* BY_INS_CHAR */ && !/[0-9]/.test(evt.data))
    evt.data = ""; // reject non-digit input
});
```

### Special key combinations

`LEFT/RIGHT` (+CTRL/SHIFT), `HOME/END` (+SHIFT), `BACKSPACE` (+ALT/CTRL), `CTRL+A`, `DELETE/INSERT` (+SHIFT/CTRL), `CTRL+X/V/Z`. In forms with `dir` attribute, `CTRL+SHIFT` (either side) toggles `dir="ltr"`/`dir="rtl"`.

Note: this behavior can be applied to any element with `flow:text; white-space:pre` CSS.

## behavior:textarea

Applied to: `<textarea>`

Multi-line text editing, optimized for relatively small texts. For potentially large (thousands of lines) texts use `behavior:plaintext` instead.

### HTML

```html
<textarea rows="10" cols="80">Text</textarea>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `readonly` | Element is read-only |
| `spellcheck="true"\|"false"` | Enable/disable spell checking |

### Events

| Event | Description |
|-------|-------------|
| `"input"` / `"change"` | Value changed due to user action. Posted (async) |
| `"changing"` | Sent when value is about to change. Synchronous |

### Value

`string`, reflects current status of internal editing buffer.

### Special key combinations

Same set as `behavior:edit`: `LEFT/RIGHT` (+CTRL/SHIFT), `HOME/END` (+SHIFT), `BACKSPACE` (+ALT/CTRL), `CTRL+A`, `DELETE/INSERT` (+SHIFT/CTRL), `CTRL+X/V/Z`; `CTRL+SHIFT` toggles `dir="ltr"/"rtl"` when form has `dir` attribute.

### Properties (via `.textarea.` interface)

| Property | Description |
|----------|-------------|
| `textarea.selectionStart`, `textarea.selectionEnd` | read-only, integer indexes of selection start/end (`selectionEnd` is the index just past selected text) |
| `textarea.selectionText` | read-only, selected text or `""` |

### Methods

```js
const editor = document.$("textarea#editor");
editor.textarea.selectAll();
editor.textarea.selectRange(start, end);      // end position excluded
editor.textarea.appendText(text);             // true|false
editor.textarea.insertText(text);             // removes selection then inserts, true|false
editor.textarea.removeText();                 // removes selected text, true|false
```

## behavior:password

Applied to: `<input type="password">`

Password input with masking. Same base editing model as `behavior:edit`.

### HTML

```html
<input type="password" />
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `value="text"` | Initial value |
| `size=integer` | Intrinsic/default width |
| `maxlength=integer` | Max characters |
| `filter="filter-expr"` | Limits allowed input characters (same syntax as `behavior:edit`) |
| `novalue="text"` | Placeholder text shown when empty (style via `:empty`) |
| `readonly` | Element is read-only |
| `password-char="*"` | Character used as the mask placeholder |

### Events

Same as `behavior:edit`: `"input"`/`"change"` (EDIT_VALUE_CHANGED, async) and `"changing"` (EDIT_VALUE_CHANGING, sync, with `event.reason` = `BY_INS_CHAR`(3)/`BY_INS_CHARS`(4)/`BY_DEL_CHAR`(5)/`BY_DEL_CHARS`(6) and read/write `event.data`).

### Value

`string`, reflects current status of internal editing buffer.

### Properties / Methods

Same `.edit.` interface as `behavior:edit`: `selectAll()`, `selectRange([start[, end]])`, `removeText()`, `insertText(text)`, `appendText(text)`, and `selectionStart`/`selectionEnd`/`selectionText` properties.

## behavior:number

Applied to: `<input type="number">`

Either integer or floating number input element behavior.

### HTML

```html
<input type="number" min="0" max="100" step="1" value="50" />
```

### Model

On initialization, generates internal DOM:

```html
<input>
  <caption>        <!-- has behavior:edit applied with a numeric filter -->
  <button.plus>    <!-- created only if `step` attribute is defined -->
  <button.minus>
</input>
```

All sub-elements get the `:synthetic` state flag.

### Attributes

| Attribute | Description |
|-----------|-------------|
| `value=numeric` | Initial value |
| `min=numeric` | Minimum allowed value |
| `max=numeric` | Maximum allowed value |
| `step=numeric` | Increment/decrement step; if defined, creates the +/- buttons |
| `novalue="text"` \| `placeholder="text"` | Text shown when empty (style via `:empty`) |
| `readonly` | Element is read-only |

### Events

| Event | Description |
|-------|-------------|
| `"input"` / `"change"` | Value changed due to user action. Posted (async) |
| `"changing"` | Sent when value is about to change. Synchronous |

### Value

`integer`/`float` or `undefined`, reflects internal editing buffer.

### Special key combinations

Same as `behavior:edit`.

### Methods

N/A on the input itself, but the inner `<caption>` sub-element exposes `behavior:edit`-specific methods.

## behavior:decimal

Applied to: `<input type="decimal">`

Floating-point number input element behavior. Same DOM model (`<caption>`+`<button.plus>`+`<button.minus>`), attributes (`value`, `min`, `max`, `step`, `novalue`/`placeholder`, `readonly`), events (`"input"`/`"change"`, `"changing"`), value semantics, and key combinations as `behavior:number` above.

### HTML

```html
<input type="decimal" min="0.0" max="1.0" step="0.01" value="0.5" />
```

## behavior:integer

Applied to: `<input type="integer">` (or `<input|integer>`)

Integer number input element behavior. Same DOM model, attributes, events, value semantics and key combinations as `behavior:number`/`behavior:decimal` above, but `value`/`min`/`max`/`step` are integers.

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

### behavior:calendar details

Inline date input with four view modes: `century` (10-year decades), `years` (10 years in decade), `months` (12 months), `days` (days in month). Each mode renders as a `<table>` - use the DOM inspector to discover structure for custom styling.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `mode="days"\|"months"\|"years"\|"century"` | Initial view mode |
| `value="YYYY-MM-DD"` | Initial date (ISO 8601) |
| `firstdayofweek="N"` | First day of week: `0`=Sunday, `1`=Monday, etc. |

**Events:** `"input"`/`"change"` (SELECT_VALUE_CHANGED, async, date changed) and `"statechange"` (UI_STATE_CHANGED, async, view mode/month/year changed).

**Value:** Date value or `undefined`.

**Properties:** `element.calendar.mode` - string, get/set current view mode (`"days"|"months"|"years"|"century"`).

**Methods:**
```js
element.calendar.stepDown([n]);  // decrement by 1 or n (day/month/year/decade depending on mode)
element.calendar.stepUp([n]);    // increment by 1 or n
```

### behavior:date details

Applied to `<input type="date">`. On init builds:

```html
<input>
  <caption>              <!-- has behavior:masked applied -->
    <span.year>
    <span.month>
    <span.day>
  </caption>
  <button>               <!-- triggers popup calendar -->
</input>
```

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `value="YYYY-MM-DD"` | Initial date |
| `timezone="TZ"` | `"local"` or `"+HH:MM"`/`"-HH:MM"` - timezone to convert the date to |
| `firstdayofweek="N"` | First day of week: `0`=Sunday, `1`=Monday, etc. |

**Events:** `"input"`/`"change"` (SELECT_VALUE_CHANGED, async) - value changed due to user action.

**Value:** instance of `Date` or `undefined`, reflects internal editing buffer.

**Methods:** N/A on the input itself; the `<caption>` sub-element exposes `behavior:masked-edit` methods.

## behavior:slider

Applied to: `<input type="hslider">`, `<input type="vslider">`

Slider control for numeric values.

### HTML

```html
<input type="hslider" min="0" max="100" value="50" step="1" />
<input type="vslider" min="0" max="100" value="50" />
```

## behavior:progress

Applied to: `<input type="progress">`, `<progress>`, `<meter>`

Progress bar indicator.

### HTML

```html
<input type="progress" value="50" max="100" />
<progress value="50" max="100">50%</progress>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `max=float` | Maximum value, `1.0` by default |
| `value=float` | Progress value, in range `0.0 ... max` |
| `name="name"` | Standard name attribute |

If neither `max` nor `value` is defined, the element renders an infinite (indeterminate) animation.

### Value

`float`, progress value in `0.0 ... max` range.

### Methods

N/A - behavior:progress does not introduce any specific methods.

## behavior:check

Applied to: `<input type="checkbox">`, `<button type="checkbox">`

Checkbox control. Can be applied to any element to toggle its `:checked` state.

### HTML

```html
<input type="checkbox" checked />
<input type="checkbox" id="agree" />
<label for="agree">Agree</label>

<!-- Windows-style inline checkbox -->
<button type="checkbox">caption</button>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `checked` | Initializes the runtime `:checked` state |
| `name="name"` | Standard name attribute (element name on a form) |
| `value="..."` | Standard value attribute (used by `behavior:form`) |
| `as="string\|integer\|float\|numeric\|auto"` | How `value` is reported to script. `value="42"` reports as string `"42"` by default; `value="42" as="integer"` reports integer `42` |
| `mixed` | Allows the element to be in a mixed (undetermined) state |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `checked` | boolean | Check state |
| `value` | string | Value when checked |

### Events

| Event | Description |
|-------|-------------|
| `"input"`/`"change"` (BUTTON_STATE_CHANGED) | Button changed its checked state. Asynchronous |
| `"press"` (BUTTON_PRESS) | Mouse down or Spacebar down while focused. Synchronous |

### Value

`true`/`false` reflecting `:checked` state. For a `mixed` checkbox, value can also be `null` (undetermined state). Inside a `<form>`, form value collection includes the checkbox's `value` attribute only when it is checked (otherwise `undefined`).

### Methods

N/A - behavior:check does not introduce any specific methods.

## behavior:radio

Applied to: `<input type="radio">`, `<button type="radio">`

Radio button implementation. Can be applied to any group of elements sharing the same `name` to achieve one-of-group checked behavior.

### HTML

```html
<input type="radio" name="group" value="1" checked />
<input type="radio" name="group" value="2" />

<!-- Windows-style inline radio, grouped via aspect -->
<button|radio(group)>first</button>
<button|radio(group)>second</button>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `checked` | Initializes the runtime `:checked` state |
| `name="groupname"` | Radio buttons sharing the same name form a single group |
| `value="..."` | Standard value attribute (used by `behavior:form`) |
| `as="string\|integer\|float\|numeric\|auto"` | How `value` attribute is reported to script (same rules as `behavior:check`) |

### Events

| Event | Description |
|-------|-------------|
| `"click"` | Button just changed to checked. Asynchronous |
| `"change"` / `"input"` | Checked state changed due to user action |

### Value

`true`/`false`, reflects `:checked` state. Note: `behavior:form` treats all radios in a group as a single value equal to the `value` attribute of the checked element in the group.

## behavior:select

Applied to: `<select size="2...N">`, `<select|list>`, `<select|list multiple>`, `<select|list multiple="checkmarks">`, `<select|tree>`, `<select|tree multiple="checkmarks">`

List selection control (as opposed to `behavior:select-dropdown`). Can in principle be applied to any DOM element.

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

<!-- Hierarchical tree select -->
<select>
  <option expanded>
    <caption>Group A</caption>
    <option value="#ff0000">Red</option>
    <option value="#00ff00">Green</option>
  </option>
  <option>
    <caption>Group B</caption>
    ...
  </option>
</select>
```

Any element with `role="option"` is also treated as a selectable option, so a `<table>` can behave as a select:

```css
table.select > tbody { behavior:select; }
table.select > tbody > tr:current { color:white; background:blue; }
```
```html
<table class="select">
  <tbody>
    <tr role="option" value="#ff0000"><td>Red</td><td>#FF0000</td></tr>
  </tbody>
</table>
```

The selected option gets the `:current` state flag.

### Attributes

| Attribute | Description |
|-----------|-------------|
| `size=integer` | Number of visible elements (height can also be overridden by CSS) |
| `name="name"` | Standard name attribute |
| `novalue="text"` | Text rendered when nothing is selected initially |
| `as="auto"\|"integer"\|"float"\|"numeric"\|"string"` | How `<option value="...">` is parsed. Default is `"string"` (no parsing) |
| `multiple` | Allows multiple selected options |
| `multiple="checkmarks"` | Multiple selection with dedicated checkmarks |
| `treelines` | `<select|tree>` only - draws tree lines for grouping |

### `<option>` attributes

| Attribute | Description |
|-----------|-------------|
| `value="..."` | Option value; if omitted, `innerText` is used (as string) |
| `selected` | Initial `:current`/`:checked` state; defines initial select value |
| `expanded` | Initial `:expanded` state for a group `<option>` in `<select|tree>` |

### Events

| Event | Description |
|-------|-------------|
| `"change"` | Selection changed by user click. Posted |
| `"changing"` | Selection about to change. Synchronous |
| `"expanded"` | Group option was expanded by the user |
| `"collapsed"` | Group option was collapsed by the user |

### Properties

| Property | Description |
|----------|-------------|
| `options` | Reference to the DOM element holding `<option>`s (the select element itself here) |
| `select.currentOption` | Element, read/write - reference to the current option |

### Methods

* `select.optionByValue(val): Element` - returns option element for `val`, or `null` if not found.

### Commands

`element.execCommand("set-current")` sent to an `<option>` inside the select makes it the current option.

### Value

Single select: scalar value (type per `as`) of the selected option. Multi-select: array of values of selected options.

## behavior:select-dropdown

Applied to: `<select>`, `<select|dropdown>`

Standard `<select>` behavior with a dropdown popup list (as opposed to inline `behavior:select`).

### Model

After instantiation a `<select>` gets this internal structure:

```html
<select>
  <caption />
  <button />
  <popup>
    <option value="#ff0000" selected>Red</option>
    ...
  </popup>
</select>
```

Each part is individually styleable: `select > caption`, `select > button`, `select > popup`.

### HTML

```html
<select type="dropdown">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `size=integer` | Number of visible elements in the popup list |
| `name="name"` | Standard name attribute |
| `placeholder="text"` \| `novalue="text"` | Shown when no `<option selected>` initially |
| `as="auto"\|"integer"\|"float"\|"numeric"\|"string"` | Same value-parsing rules as `behavior:select` (default `"auto"` here) |
| `editable[=true\|false]` | Makes the `<caption>` part editable |

### Events

| Event | Description |
|-------|-------------|
| `"change"` | Selection changed (option clicked). Posted |
| `"changing"` | Selection about to change. Synchronous |

### Methods

```js
select.showPopup();   // shows popup list of options
select.hidePopup();   // closes popup list if open
```

### Properties

`select.options` - reference to the `<popup>` element holding the `<option>` list. Populate at runtime:

```js
const el = document.$("select");
el.select.options.append(<option value="a">A</option>);
el.value = "c"; // set current option
```

### Value

Value of the selected option (its `value` attribute, or its text if none). Note: value of `<select editable>` is always the text content of the editable caption.

## behavior:button

Applied to: `<button>`, `<input type="button">`, `<input type="reset">`, `<input type="submit">`

Standard button behavior - can be applied to any DOM element, converting it to a focusable, clickable area.

### HTML

```html
<button>Click Me</button>
<input type="button" value="Click" />
<button disabled>Disabled</button>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `value="string"` | Caption shown on `<input type=button>` |
| `name="name"` | Standard name attribute (element name on a form) |

### States

| State | Description |
|-------|-------------|
| `:hover` | Mouse over |
| `:active` | Being pressed |
| `:focus` | Has focus |
| `:disabled` | Disabled |

### Events

| Event | Description |
|-------|-------------|
| `"click"` (BUTTON_CLICK) | Generated on mouse down/up, or Spacebar press while focused. Posted (async) |
| `"press"` (BUTTON_PRESS) | Generated on mouse down, or Spacebar down while focused. Synchronous. Always fires before `"click"` |

### Value

`true`/`false`, read-only - reflects the pressed state of the button.

### Methods

N/A - behavior:button does not introduce any specific methods.

### Button click handling in script

```js
// raw handler
let btn = document.$("button#some");
btn.onclick = function() { /* ... */ };

// on() subscription
btn.on("click", function() { /* ... */ });
document.on("click", "button#some", function() { /* ... */ });
```

## behavior:hyperlink

Applied to: `<a>`, `<a href>`

Standard hyperlink behavior - can be applied to any element that has an `href` attribute.

### HTML

```html
<a href="https://sciter.com">Link</a>
<a href="document.htm">Local</a>
<a href="mailto:user@example.com">Email</a>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `href="url"` | Hyperlink URL |
| `target="ID"` | ID of a `<frame>` element to load the URL into |
| `target="@system"` | Opens URL in the system's default registered application (e.g. browser for `https://`, notepad for `.txt`) |

### Events

| Event | Description |
|-------|-------------|
| `"click"` (HYPERLINK_CLICK) | Generated on mouse down/up or Spacebar while focused. Posted (async). If not consumed, the nearest document handles URL loading |

### Value

N/A.

### Hyperlink click handling in script

```js
// raw onclick handler (return true to consume/prevent default navigation)
var a = document.$("a#some");
a.onclick = function() { /* ... */; return true; };

// on() subscription
a.on("click", function() { /* ... */ });
document.on("click", "a#some", function() { /* ... */ });

// class method handler
class SomeComponentWithLinks extends Element {
  ["on click at a#some"](evt, a) { /* ... */ }
}
```

## behavior:menu

Applied to: `<menu class="context">`, `<menu class="popup">`

Basic hierarchical popup menu functionality.

### HTML

```html
<menu.popup id="context-menu">
  <li#open>Open</li>
  <li#save>Save</li>
  <li.separator />
  <li#exit>Exit</li>
</menu>
```

`<li>` elements, or any block element with `role="menu-item"`, are treated as selectable menu items and generate `"click"` events. Menu items may have sub `<menu>`s for cascading submenus. Menu items can also be laid out as a `<table>` with `role="menu-item"` cells (e.g. a color-swatch grid).

### Attributes

N/A - behavior:menu does not use any specific attributes.

### States

| State | Description |
|-------|-------------|
| `:owns-popup` | Set on the menu owner element while the menu is shown |
| `:popup` | Set on the `<menu>` element itself while shown |

### Events

| Event | Description |
|-------|-------------|
| `"click"` | Posted when a menu item is clicked; `event.target` is the menu item |

### JavaScript

```js
const menu = document.$("menu#context-menu");
menu.popup(element, x, y);
```

Normally menus are invisible (`display:none`); visibility can't be described purely in CSS due to their lifecycle - call `menuOwnerElement.popup(menuElement, ...)` to show. `menuOwnerElement` is the element that "owns" the menu.

```js
document.on("click", "menu#some > li.file-open", function(evt) {
  // 'this' is the li element
});
```

## behavior:virtual-list

Applied to: `<widget virtual-list>` (assign via CSS `behavior:virtual-list`)

Virtual scrolling ("sliding window") list for large datasets - uses a fixed number of DOM elements regardless of dataset size.

### HTML

```html
<widget virtual-list id="list" style="flow: vertical; height: 300dip;">
  <!-- Items generated dynamically -->
</widget>
```

Note: `vertical-align: bottom` CSS on the list makes it initially appear scrolled to the end (vs. default `top`).

### JavaScript

There is no `list.items =` data-source property on the raw behavior — populate it entirely through the `"contentrequired"` event below. (Sample wrapper classes like `VirtualList`/`VirtualSelect` in `samples/samples.sciter/virtual-list/` add their own `items` convenience property on top of this, but that's app code, not part of the behavior itself.)

### Native `"contentrequired"` event

Fired when the behavior needs more elements due to scrolling:

```js
list.on("contentrequired", function(evt) {
  const { where, start, length } = evt.data; // where: 0=replace, -1=prepend, 1=append
  // populate `length` items starting at `start`, then:
  evt.data = { morebefore: 100, moreafter: 200 }; // estimated counts, for scrollbar sizing
});
```

### Methods (`.vlist.` interface)

```js
el.vlist.navigateTo(to);      // int | "start" | "end" | "pagenext" | "pageprior" | "itemnext" | "itemprior"
el.vlist.advanceTo(recNo);    // animated scroll to record number, returns Element
el.vlist.scrollBy(pixels);    // animated scroll by N CSS pixels, returns bool (whether it scrolled)
```

### Properties (`.vlist.` interface)

| Property | Description |
|----------|-------------|
| `firstVisibleItem` / `lastVisibleItem` | read-only Element, first/last visible item in the buffer |
| `firstVisibleItemIndex` / `lastVisibleItemIndex` | read-only int, index of first/last visible item in the recordset |
| `firstBufferIndex` / `lastBufferIndex` | read-only int, sliding buffer bounds |
| `itemsBefore` / `itemsAfter` | read/write int, how many items exist before/after the sliding window - update when new records appear off-window |
| `itemsTotal` | read-only int, `itemsBefore + element.children.length + itemsAfter` |
| `slidingWindowSize` | read/write int, number of DOM elements in the sliding window (ideally ~2x the visible item count) |

> **Caution — combining with Reactor/Signals:** the docs and samples never show `virtual-list` driven by a signal-based data source or rendered via JSX `render()`. Row rendering here is native (via `items`/`contentrequired`), not Reactor `patch()`-based, so per-row `:current`/selection state driven by a signal is NOT confirmed to work automatically — you likely need to manually sync selection state (e.g. via an `effect()` walking `list.children`) rather than relying on reactive re-render. Treat any virtual-list + Signals integration as unverified; test carefully.

## `<popup>` element (not a `behavior:X` CSS value)

There is no documented `behavior:popup` CSS value — `docs/md/behaviors/README.md`'s behavior list does not include "popup", and no `docs/md/behaviors/behavior-popup.md` exists. `<popup>` is instead a native "out-of-canvas"/"airborn" element type (`docs/md/DOM/out-of-canvas-elements.md`), shown programmatically via `element.popup(popupEl, options)` — it doesn't render inline like a normal behavior-driven element.

```html
<popup #tooltip>
  Tooltip content
</popup>
```

```js
element.popup(Element.create(<popup.awatar>Content</popup>), { /* options */ });
```

Tooltips are `<popup role="tooltip">` elements, styleable via `popup[role="tooltip"] { ... }`.

## behavior:output

Applied to: `<output type="...">`

Formatted, read-only output element. Can be applied to any text container (`<span>`, `<em>`, etc). Shortcut notation: `<output|text(first)/>` is equivalent to `<output name="first" type="text" />`.

### HTML

```html
<output id="result">0</output>
<output type="currency" value="1234.5" />
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `type` | Formatter: `"text"` (plain, via `toString()`), `"integer"`, `"decimal"` (locale-formatted float), `"currency"` (locale-formatted), `"date"` (UTC date, locale-formatted), `"date-local"` (local-timezone date), `"time"` (UTC time portion), `"time-local"` (local-timezone time portion) |
| `name="name"` | Standard name attribute |
| `value="..."` | Value to format and render |
| `novalue="text"` | Text shown when no value is set |
| `timezone="TZ"` | `"local"` or `"+HH:MM"`/`"-HH:MM"` - for date/time types |

If the value can't be converted to the declared type, the element gets the `:invalid` state flag. If a numeric value is negative, the element gets a `negative` attribute for styling: `output[negative] { color:red; }`.

### Value

`any`, presumably matching the declared type.

### Methods

N/A - behavior:output does not introduce any specific methods.

## behavior:details

Applied to: `<details>` by default; can be applied to any element via CSS `behavior:details`.

Collapsible details/summary logic behind the HTML5 `<details><summary>` element. Clicking `<summary>` or `<caption>` toggles between `:collapsed` and `:expanded` states.

### HTML

```html
<details open>
  <summary>Click to expand</summary>
  <p>Hidden content</p>
</details>
```

Custom application to any element:

```css
li { behavior:details; }
li > p { visibility:none; }
li:expanded > p { visibility:visible; }
```
```html
<li>
   <caption>Summary</caption>
   <p>Details</p>
</li>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `open` | Empty attribute, or with value `"true"`/`"false"` |

### Events

| Event | Description |
|-------|-------------|
| `"expand"` | Posted when item gets `:expanded` flag; `event.target` is the item |
| `"collapse"` | Posted when item gets `:collapsed` flag; `event.target` is the item |

### Value / Methods

N/A.

## behavior:terminal

Applied to (Sciter-specific): `<terminal>`

ANSI-terminal viewer. Maintains and renders a 2D character array (screen buffer) of `terminal.rows` x `terminal.columns` size.

### HTML

```html
<terminal />
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `rows` | Integer, number of rows in the terminal buffer (scrollable-buffer lines) |
| `columns` | Integer, number of columns (screen-width characters). If omitted, computed from current element width |

Maximum value for both `rows` and `columns` is **3000**.

### Events

| Event | Description |
|-------|-------------|
| `"change"` | Buffer content changed (e.g. after `.write()` or a rows/columns change) |
| `"statechange"` | Caret position changed |
| `"bell"` | `.write(text)` encountered the bell ASCII char (`\a`, code 7) |

### Methods

```js
el.terminal.write(text: string);                          // writes at caret, advances caret; text may contain ANSI control codes
el.terminal.read([row: int, column: int[, maxLength: int]]); // reads buffer content at caret or row/column
el.terminal.resize(rows: int, columns: int);               // resizes buffer (internally capped at 3000)
el.terminal.clear();                                        // clears buffer content
```

### Properties

| Property | Description |
|----------|-------------|
| `terminal.rows: int` | read-only, actual rows |
| `terminal.columns: int` | read-only, actual columns |
| `terminal.caretRow: int` | read-only, caret row |
| `terminal.caretColumn: int` | read-only, caret column |

### Value

N/A.

## behavior:video

Applied to: `<video>`

Video playback control.

### HTML

```html
<video src="video.mp4" autoplay loop muted controls>
  Your browser does not support video.
</video>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `src` | URL of the movie; if provided, playback starts immediately after loading |
| `sizing` | `"cover"` or `"contain"` (default). `contain` = full frame always visible; `cover` = frame always covers content box (may clip) |

### Properties

| Property | Description |
|----------|-------------|
| `video.isPlaying` | read-only boolean |
| `video.isEnded` | read-only boolean, `true` once playback reaches the end |
| `video.duration` | read-only float, seconds (`0` if unavailable) |
| `video.position` | read/write float, current playback position in seconds |
| `video.width` / `video.height` | read-only integer, natural frame size in screen pixels |
| `video.renderingBox` | read-only `[x, y, width, height]` in pixels relative to content box; `x`/`y` can be negative when `sizing="cover"` |
| `video.audioVolume` | read/write float `0.0...1.0` (1.0 = 0db, 0.0 = mute/-100db) |
| `video.audioBalance` | read/write float `-1.0...+1.0`, stereo balance |

### Methods

```js
video.load(movieUrl: string): true|false;  // loads without auto-playing
video.unload();                            // stops and unloads
video.play();                              // starts/resumes at current position
video.stop();                              // stops playback
```

### Events

| Event | Description |
|-------|-------------|
| `"videoready"` | Loaded successfully; `width`/`height`/`duration` now available |
| `"videostart"` | Playback started, first frame rendered |
| `"videostop"` | Playback stopped |

### Value

N/A - the behavior does not implement a value concept.

## behavior:pager

Applied to (official docs): `<frame type="pager">` / `<frame|pager>`

Print and print-preview functionality for a document.

### HTML

```html
<frame type="pager" />
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `src="url"` | URL of document to print/preview |
| `page-template="url"` | URL of page template document |

### Events

| Event | Description |
|-------|-------------|
| `"pagination-start"` | Pagination started (per prose docs; but see caveat below) |
| `"pagination-end"` | Pagination finished (per prose docs; but see caveat below) |
| `"pagination-page"` | Pagination of page `event.reason` complete (per prose docs; but see caveat below) |

> **⚠️ Discrepancy across ground-truth sources — verify at runtime before relying on this.** The prose docs give the hyphenated names above, but two independent real working samples (`samples/samples.sciter/printing/pager.js` and `samples/samples.sciter/applications.quark/mdview/printview/pager.js`) both listen for `"paginationready"` and `"paginationend"` instead — no hyphens, and "ready" not "start". A third source, the DOM event alias table (`docs/md/DOM/Event.md`), lists yet another variant pairing (`paginationstart`/`pagination-start`, `paginationend`/`pagination-ended`, `paginationpage`/`pagination-page`). For code you actually need to run, prefer the sample-confirmed `"paginationready"` / `"paginationend"`.

### Properties

| Property | Description |
|----------|-------------|
| `pager.pages: int` | read-only, number of pages |
| `pager.page: int` | read/write, current page |
| `pager.document: Document` | read-only, loaded document to be printed |
| `pager.documentName: string` | read/write, name shown in the print queue |

### Methods

```js
frame.pager.loadFile(docUrl: string[, templateUrl: string]): boolean;
frame.pager.loadHtml(html: ArrayBuffer|string, baseUrl: string[, templateUrl: string]): boolean;
frame.pager.selectPrinterDialog();        // shows system "Select Printer" dialog
frame.pager.selectDefaultPrinter();
frame.pager.selectPrinter(printerId: string);
frame.pager.printers(): [{ id, name, shareName, comment, location, isDefault }, ...];
frame.pager.print([arrayOfPageNumbers]);  // e.g. print([1,3,5]); omit to print whole doc
```

### Value

N/A.

## behavior:expandable-list

Not applied to any element by default - assign explicitly: `div.list { behavior:expandable-list; }`

Implements an "expandable" list where only one list item is `:expanded` at a time.

### DOM Model

```html
<div class="list">
   <section default>
      <caption>A</caption>
      <div>...details...</div>
   </section>
   <section>
      <caption>B</caption>
      <div>...details...</div>
   </section>
</div>
```

Clicking `<caption>` sets that item's state to `:expanded` and all siblings to `:collapsed`.

### Attributes

The item that should be `:expanded` initially should carry the `default` attribute.

### Events

| Event | Description |
|-------|-------------|
| `"expand"` | Item got `:expanded` flag; `event.target` is the item |
| `"collapse"` | Item got `:collapsed` flag; `event.target` is the item |

### Value / Methods

N/A.

## behavior:history

Applied to: `<frame history>` (a `<frame>` with the `history` attribute); applicable to any element containing frames (e.g. `<frameset>`).

Navigation history support, similar to browser back/forward buttons.

### Attributes

N/A - no specific attributes.

### Methods

Namespaced under `el.history.*` (confirmed via `samples/samples.sciter/applications.quark/mdview/main.js`):

```js
el.history.back(): true|false;      // goes back, returns true if navigation succeeded
el.history.forward(): true|false;   // goes forward, returns true if navigation succeeded
el.history.go(n);                   // jump n steps (negative = back, positive = forward)
```

### Properties

| Property | Description |
|----------|-------------|
| `el.history.length: integer` | Depth of history in the backward direction |
| `el.history.forwardLength: integer` | Depth of history in the forward direction |

### Events

| Event | Description |
|-------|-------------|
| `"historystatechange"` (HISTORY_STATE_CHANGED) | Internal navigation stack state changed |

## behavior:label

Applied to: `<label>`, `<label for="...">`

Redirects its mouse events to its labeled element - clicking the label focuses/clicks the labeled input.

### Attributes

| Attribute | Description |
|-----------|-------------|
| `for="id"` | ID of the input element labeled by this label |

### Examples

```html
<label>Click me <input|text></label>
<label for="buddy">And me too</label> <input|text id="buddy">
```

### Events / Methods / Value

N/A - no specific events, methods, or value.

## behavior:clickable

Applied to: `<toolbar><button></button></toolbar>` (button inside a toolbar) by default; can be assigned via CSS.

Clickable, **non-focusable** element - a lightweight button that generates BUTTON_CLICK events on mouse down/up.

### Attributes

N/A.

### Events

| Event | Description |
|-------|-------------|
| `"click"` (BUTTON_CLICK) | Generated on mouse down/up, or Spacebar while focused. Posted (async) |
| `"press"` (BUTTON_PRESS) | Generated on mouse down, or Spacebar down while focused. Synchronous |

### Value / Methods

N/A.

### Handling in script

```js
let btn = document.$("button#some");
btn.onclick = function() { /* ... */ };
btn.on("click", function() { /* ... */ });
document.on("click", "button#some", function() { /* ... */ });
```

## behavior:scrollbar

Applied to: `<widget|vscrollbar />`, `<widget|hscrollbar />`

Standalone scrollbar input element.

### Attributes

| Attribute | Description |
|-----------|-------------|
| `for="selector"` | Binds this scrollbar as the external scrollbar of another scrollable element |

### Methods

```js
scrollbar.values(position: int, min: int, max: int, page: int, step: int);
```
Sets `position`, `min`, `max`, `page` (slider size), `step` (arrow-click increment) at once.

### Properties

| Property | Description |
|----------|-------------|
| `scrollbar.position` | read/write integer, current slider position |
| `scrollbar.min` | read-only integer |
| `scrollbar.max` | read-only integer |
| `scrollbar.page` | read-only integer, also reflects slider size |
| `scrollbar.step` | read-only integer, arrow-click increment/decrement |

### Value

integer, position in range `[min...max]`.

### Events

Primary events (non-bubbling, delivered only to the element - use `element.on(...)`): `"scroll-step-plus"`, `"scroll-step-minus"`, `"scroll-page-plus"`, `"scroll-page-minus"`, `"scroll-slider-press"`, `"scroll-slider-release"`.

Change event (bubbling): `"change"` - generated after value changes in response to a primary event.

## behavior:frame-set

Applied to: `<frameset>` by default; can be applied to any block container (`<div>`, `<section>`).

Handles panes separated by `<splitter>` elements, allowing interactive resize.

### HTML

```html
<frameset cols="120px,*">
   <div id="help-index">
      <a href="first-topic.htm" target="help-content">First topic</a>
   </div>
   <splitter/>
   <frame id="help-content">Select topic from index</frame>
</frameset>
```

`<frameset>` may contain `<frame>` elements or any other block container (`<div>`, `<section>`) as panes.

### Attributes

| Attribute | Description |
|-----------|-------------|
| `cols="widths list"` | Column layout - comma separated Sciter length units (dip, px, mm, `*` flex, etc.). Either `cols` or `rows` is required |
| `rows="heights list"` | Row layout, same unit rules |

### Properties

| Property | Description |
|----------|-------------|
| `frameset.state: array` | read/write, array of pane widths/heights - use to persist UI layout state |

### Events / Value

N/A - no specific events; value N/A.

## behavior:menu-bar

Applied to: none by default - assign explicitly, e.g. `<ul id="menu-bar">` per `{sdk}/samples/menu/std-menu.css`.

Horizontal menu bar - a top-level container for popup menus. The engine's default style system provides no default menu-bar styling; use the sample CSS above as a starting point.

### HTML

```html
<ul id="menu-bar">
  <li>
    <caption>File</caption>
    <menu>
      <li id="file-open">Open File <span.accesskey>Ctrl+O</span></li>
      <hr>
      <li id="file-save">Save File <span.accesskey>Ctrl+S</span></li>
      <li id="file-save-as">Save File as ...<span.accesskey>Ctrl+Shift+S</span></li>
    </menu>
  </li>
</ul>
```

### Attributes / Methods

N/A - no specific attributes or methods.

### States

| State | Description |
|-------|-------------|
| `:owns-popup` | Set on the menu-owner element while its menu is shown |
| `:popup` | Set on the `<menu>` element while shown |

### Events

| Event | Description |
|-------|-------------|
| `"click"` | Posted when a menu item is clicked; `event.target` is the item |

```js
document.on("click", "li#file-open", function(evt) {
  // 'this' is that li#file-open item
});
```

## behavior:lottie

Applied to: `<lottie>` (also `<widget type="lottie">` works via aspect); `<param path="keyPath" property="propName" value="propVal" />` inside `<lottie>` redefines an animation variable (theming/parametrization).

Plays Lottie/Bodymovin JSON animations (Adobe After Effects exports) natively.

### HTML

```html
<widget type="lottie" src="animation.json" />
<lottie src="animation.json" autoplay loop />
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `src` | URL of the lottie JSON file |
| `autoplay` | Starts animation immediately after loading |
| `loop` | Repeats playback |

### Properties

| Property | Description |
|----------|-------------|
| `lottie.playing` | read-only boolean, `true` while playing |
| `lottie.speed` | read/write float, speed multiplier (default `1.0`) |
| `lottie.loop` | read/write boolean |
| `lottie.frame` | read/write integer, current frame `[0..frames)` |
| `lottie.frames` | read-only integer, total frames |
| `lottie.position` | read/write float, `0.0..1.0` |
| `lottie.duration` | read-only duration, designer-defined full loop duration |
| `lottie.markers` | read-only array of `[tagName: string, startFrame: int, endFrame: int]` tuples |

### Methods

```js
lottie.load(url: string): bool;
lottie.play([firstFrame: int, lastFrame: int]): bool;
lottie.stop(): bool;   // pauses
lottie.update(keyPath: string, propName: string, value: color|float|integer): bool; // runtime property update
```

### Events

| Event | Description |
|-------|-------------|
| `"animationstart"` | Loaded and started |
| `"animationloop"` | Last frame shown, restarted from beginning |
| `"animationend"` | Playback stopped |

### Value

N/A - no value concept.

### Redefining animation variables

A **KeyPath** targets content by its After Effects layer/group hierarchy (list of strings); supports wildcard `*` (single name) and globstar `**` (zero or more layers). **PropName** identifies the animatable property:

* `FillColor` (Color), `FillOpacity` (0-100), `StrokeColor` (Color), `StrokeOpacity` (0-100), `StrokeWidth` (float)
* `TrAnchor` ([x,y]), `TrPosition` ([x,y] point), `TrScale` ([x,y], 0-100 each), `TrRotation` (Angle), `TrOpacity` (0-100)

Set at design time via `<param path="..." property="..." value="..." />` inside `<lottie>`, or at runtime via `el.lottie.update(path, prop, value)`.

## behavior:masked-edit

Applied to: `<input type="masked">`, `<input|masked>`, and to the `<caption>` sub-element of `<input|date>` and `<input|time>`.

Accessed via the `.masked.` interface. Masked input editing - editable "islands" separated by static separator text. (No source confirms a `behavior:masked-text` alias — that name does not appear anywhere in docs/ or samples/.)

### Model

```html
<input|masked>
  <span>editable</span>
  separator
  <span>editable</span>
  separator
  ...
</input>
```

Current editable `<span>` has `:current`; a numeric span with out-of-range value gets `:invalid`.

### Attributes

| Attribute | Description |
|-----------|-------------|
| `value="text"` | Initial text value |
| `mask="mask"` | Mask definition string: `_` = any alphanumeric, `@` = any alpha, `#` = any numeric, `0` = numeric zero-padded on set; any other char is a static separator |

### Methods

```js
el.masked.selectGroup(group: int);
el.masked.selectAll();
el.masked.getGroupValue(group?: int): value;        // string|number|undefined, per group type
el.masked.setGroupValue(group: int|undefined, value): bool; // undefined clears the group
el.masked.groupType(group?: int): string;            // "_" text | "@" alpha | "#" number | "0" zero-padded number | "|" enumeration
```

### Properties

| Property | Description |
|----------|-------------|
| `masked.groupsCount: int` | read-only, number of editable groups |
| `masked.currentGroup: int` | read/write, current group index |
| `masked.value: array` | read/write, "raw value" - array of group values |
| `masked.mask` | read/write, string or array of definitions - programmatic mask structure |

Mask array entries are strings (static separators) or objects: `{ type: "#integer"|"#text"|"#enum", width: int, class?: string, min?, max?, step?: int, "leading-zero"?: bool, items?: ["case1",...], filter?: "a~z" }`.

### Events

| Event | Description |
|-------|-------------|
| `"change"` \| `"input"` | Posted when value changes |
| `"statechange"` | Posted when editor highlights a different editable group |

### Value

`string`, or `array of values` when the mask was defined via `this.masked.mask = [definitions]`.

### Example: IP4 address field

```html
<input|masked mask="000.000.000.000">
```

Or via a custom aspect for stricter per-octet limits:

```html
<input|masked.ip4 mask="000.000.000.000">
```
```css
input.ip4 { aspect:IP4 }
```
```js
function IP4() {
  const ipmask = [
    { type:"integer", width:3, min:0, max:255, "leading-zero":true }, ".",
    { type:"integer", width:3, min:0, max:255, "leading-zero":true }, ".",
    { type:"integer", width:3, min:0, max:255, "leading-zero":true }, ".",
    { type:"integer", width:3, min:0, max:255, "leading-zero":true } ];
  this.masked.mask = ipmask;
}
```

## behavior:time

Applied to: `<input type="time">`

Time input element. (Official docs are minimal/TBD for this behavior - no documented attributes/events/methods beyond the element association.)

## behavior:form

Applied to: `<form>`; can be applied to any container needing a "compound value".

Handles extended `<form>` functionality: classic web-form submission (when `action` is defined) and/or a compound-value container whose value is a name/value map of its named descendant elements.

### Model

Any DOM element with a `name` attribute inside the form participates in the form's value. Example:

```html
<form>
   First name: <input|text name="first" value="Foo">
   Last name: <input|text name="last" value="Bar">
</form>
```
yields `{ first: "Foo", last: "Bar" }`.

**Radio groups**: value is the `value` attribute of the checked radio in the group. **Checkboxes**: value is the `value` attribute if checked, else `undefined`. **Field groups**: a named container (e.g. `<div name="credentials">`) nests its named descendants into a sub-object:

```html
<form>
   <div name="credentials">
     User name: <input|text name="un" value="Peter">
     Password: <input|password name="pwd" value="12345">
   </div>
   Save login: <input|checkbox name="persistLogin" value="true" checked>
</form>
```
yields `{ credentials: { un: "Peter", pwd: "12345" }, persistLogin: true }`.

### Attributes

| Attribute | Description |
|-----------|-------------|
| `action` | URL to POST/GET form data to (required for web-form submission) |
| `target` | Name/id of frame to render the response into |
| `method` | `"post"` (default) or `"get"` |
| `enctype` | For `method="post"`: `"application/x-www-form-urlencoded"` (default) or `"multipart/form-data"` (required for `<input name="..." type="file">`) |

### Events

| Event | Description |
|-------|-------------|
| `"reset"` (FORM_RESET) | Fired by `<button|reset>` click; if not consumed, form resets inputs to defaults |
| `"submit"` (FORM_SUBMIT) | Fired by `<button|submit>` click; if not consumed, form POSTs/GETs to `action` |
| `"input"` / `"change"` (FORM_VALUE_CHANGED) | Fired when any inner input's `"change"` fires; re-dispatched as `"change"` on the form |

### Methods

```js
el.form.submit();  // submits to action URL if defined
el.form.reset();   // resets inputs to initial values
```

### Value

name/value map (object) keyed by descendant elements' `name` attributes.

### Handling in script

```js
var frm = document.$("form#some");
frm.on("change", function() { var formValue = this.value; /* ... */ });
document.on("change", "form#some", function(evt, form) { var formValue = form.value; /* ... */ });
```

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
| `<menu.popup>` | `menu` |
| `<a>` | `hyperlink` |
| `<video>` | `video` |
| `<details>` | `details` |
| `<output>` | `output` |
| `<widget virtual-list>` | `virtual-list` |
| `<widget type="pager">` / `<frame type="pager">` | `pager` |
| `<widget type="terminal">` / `<terminal>` | `terminal` |
| `<widget type="lottie">` / `<lottie>` | `lottie` |
| `<form>` | `form` |
| `<frameset>` | `frame-set` |
| `<frame history>` | `history` |
| `<label>` | `label` |
| `<toolbar><button>` | `clickable` |
| `<widget|vscrollbar>` / `<widget|hscrollbar>` | `scrollbar` |
| `<input type="masked">` | `masked-edit` |
| `<input type="time">` | `time` |
