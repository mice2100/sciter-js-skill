# Sciter Built-in Behaviors Reference

Behaviors are native DOM element controllers attached via CSS. Each behavior exposes its API through a **namespaced interface** on the element: `element.{behavior}.method()`.

```css
div.editable {
  behavior: edit;
  white-space: pre;
  overflow-x: hidden-scroll;
}
```
```js
let el = document.$("div.editable");
el.edit.selectRange(0, 10); // access via behavior namespace
```

---

## Buttons

### behavior:button

Applied to: `<button>`, `<input type="button">`, `<input type="reset">`, `<input type="submit">`

Standard focusable, clickable button.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `value` | Caption text for `<input type="button">` |
| `name` | Form field name |

**Events:**

| Event | Type | Description |
|-------|------|-------------|
| `"click"` | Posted | Mouse down/up or `spacebar` press |
| `"press"` | Sync | Mouse down or `spacebar` down (fires before `"click"`) |

**Value:** `true`/`false` (read-only, reflects pressed state)

**States:** `:hover`, `:active`, `:focus`, `:disabled`

```js
// Event handling
btn.onclick = function() { ... };
btn.on("click", function() { ... });
document.on("click", "button#some", function() { ... });
```

---

### behavior:clickable

Applied to: `<button>` inside `<toolbar>` (by default)

Lightweight non-focusable click handler. Same as `behavior:button` but does not receive keyboard focus.

**Events:** `"click"` (posted), `"press"` (sync)

---

### behavior:hyperlink

Applied to: `<a href="...">`

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `href` | URL to navigate to |
| `target` | ID of `<frame>` to load content into |
| `target="@system"` | Opens URL in OS default application (browser, notepad, etc.) |

**Events:** `"click"` / HYPERLINK_CLICK — if not consumed, the nearest document handles URL loading.

```js
// Class method handler pattern
class MyComponent extends Element {
  ["on click at a#some"](evt, a) { ... }
}
```

---

### behavior:check

Applied to: `<input type="checkbox">`, `<button type="checkbox">`

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `checked` | Initial checked state |
| `name` | Form field name |
| `value` | Value reported when checked (used by `behavior:form`) |
| `as` | Type casting: `"string"`, `"integer"`, `"float"`, `"numeric"`, `"auto"` |
| `mixed` | Allows undetermined (tri-state) mode |

**Events:** `"input"`/`"change"` (posted), `"press"` (sync)

**Value:**
- Direct: `true` / `false` / `null` (null for mixed/undetermined)
- In form: reports `value` attribute content if checked, `undefined` if not

**States:** `:checked`, `:focus`, `:disabled`

---

### behavior:radio

Applied to: `<input type="radio">`, `<button type="radio">`

Radio buttons with the **same `name`** form a mutual-exclusion group.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `checked` | Initial checked state |
| `name` | Group name — radios with same name are one group |
| `value` | Value reported by the group when this radio is checked |
| `as` | Type casting: `"string"`, `"integer"`, `"float"`, `"numeric"`, `"auto"` |

**Events:** `"click"` (posted), `"change"`/`"input"` (posted)

**Value:** `true`/`false` for individual element. In a `<form>`, the group reports the `value` of the `:checked` element.

---

### behavior:label

Applied to: `<label>`, `<label for="...">`

Redirects mouse events to labeled element (focus/click).

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `for` | ID of the input element this label targets |

```html
<label>Click me <input|text></label>
<label for="buddy">And me too</label> <input|text id="buddy">
```

---

## Editors

### behavior:edit

Applied to: `<input type="text">`, `<input>` (default)

Single-line text input. Can be applied to **any element** with `flow:text` and `white-space:pre`.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `value` | Initial text value |
| `size` | Intrinsic width in characters |
| `maxlength` | Maximum character count |
| `filter` | Character filter expression. Example: `".@0~9a~zA~Z"` allows alphanumeric, `.` and `@`. Prepend `^` to exclude: `filter="^.,-"` allows all except `.`, `,`, `-` |
| `placeholder` | Text shown when empty. Style with **`:empty`** CSS pseudo-class |
| `readonly` | Read-only mode |
| `spellcheck` | `"yes"` to enable spell checking |

**Events:**

| Event | Type | Description |
|-------|------|-------------|
| `"input"` / `"change"` | Posted | Value changed by user |
| `"changing"` | Sync | Value **about to** change. `event.reason`: `BY_INS_CHAR`(3), `BY_INS_CHARS`(4), `BY_DEL_CHAR`(5), `BY_DEL_CHARS`(6). `event.data`: r/w string of chars to insert |

**CSS Styling:**

```css
input:empty { color: #999; }  /* placeholder style */
```

**Properties** (`element.edit.*`):

| Property | Type | Description |
|----------|------|-------------|
| `edit.selectionStart` | int | Start of selection or caret position |
| `edit.selectionEnd` | int | End of selection or caret position |
| `edit.selectionText` | string | Selected text or `""` |
| `edit.isStandalone` | bool | r/w. If `true`, arrow keys are always consumed (won't navigate away) |

**Methods** (`element.edit.*`):

```js
element.edit.selectAll();
element.edit.selectRange(start, end);  // end excluded
element.edit.removeText();             // remove selection
element.edit.insertText("text");       // insert at caret, replaces selection
element.edit.appendText("text");       // append at end
```

**Value:** string

**Key combos:** LEFT/RIGHT (±CTRL/SHIFT), HOME, END, BACKSPACE, DELETE, CTRL+A/X/V/Z, CTRL+INS/SHIFT+INS, CTRL+SHIFT+LEFT/RIGHT (BiDi switch)

---

### behavior:password

Applied to: `<input type="password">`

Same as `behavior:edit` with character masking. Supports all `edit.*` attributes (`filter`, `placeholder`/`:empty`, `maxlength`, etc.) and all `element.edit.*` methods/properties.

**Additional Attributes:**

| Attribute | Description |
|-----------|-------------|
| `passwordChar` | Custom mask character (default: `•`) |

---

### behavior:masked-edit

Applied to: `<input type="masked">`, `<input|masked>`

Masked input with editable "islands" separated by static text.

**DOM Model:**
```html
<input|masked>
  <span>editable</span>    <!-- :current on focused span -->
  separator
  <span>editable</span>    <!-- :invalid on bad value -->
  ...
</input>
```

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `value` | Initial text value |
| `mask` | Mask string: `_` = any alnum, `@` = alpha, `#` = numeric, `0` = numeric zero-padded, others = separators |

**Properties** (`element.masked.*`):

| Property | Type | Description |
|----------|------|-------------|
| `masked.groupsCount` | int | Number of editable groups |
| `masked.currentGroup` | int | r/w, current group index |
| `masked.value` | array | r/w, raw array of group values |
| `masked.mask` | string\|array | r/w, mask definition as string or array of field definitions |

**Methods** (`element.masked.*`):

```js
element.masked.selectGroup(groupIndex);
element.masked.selectAll();
element.masked.getGroupValue(group);   // undefined = current group
element.masked.setGroupValue(group, value);
element.masked.groupType(group);       // "_", "@", "#", "0", "|"
```

**Programmatic mask (IP4 example):**
```js
element.masked.mask = [
  { type:"integer", width:3, min:0, max:255, "leading-zero":true }, ".",
  { type:"integer", width:3, min:0, max:255, "leading-zero":true }, ".",
  { type:"integer", width:3, min:0, max:255, "leading-zero":true }, ".",
  { type:"integer", width:3, min:0, max:255, "leading-zero":true }
];
```

Field definition object keys: `type` (`#integer`, `#text`, `#enum`), `width`, `class`, `min`/`max`/`step`, `leading-zero`, `items` (for enum), `filter`.

**Events:** `"change"`/`"input"` (value changed), `"statechange"` (different group focused)

---

### behavior:integer

Applied to: `<input type="integer">`

**DOM Model** (created on init):
```html
<input>
  <caption />       <!-- behavior:edit with numeric filter -->
  <button.plus />   <!-- only if step attr defined -->
  <button.minus />  <!-- only if step attr defined -->
</input>
```
All sub-elements get `:synthetic` state flag.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `value` | Initial integer value |
| `min` | Minimum value |
| `max` | Maximum value |
| `step` | Step increment (creates ±buttons if defined) |
| `placeholder` / `novalue` | Empty state text. Style with `:empty` |
| `readonly` | Read-only mode |

**Events:** `"input"`/`"change"` (posted), `"changing"` (sync)

**Value:** integer or `undefined`

**Methods:** N/A directly, but `<caption>` sub-element has `behavior:edit` methods.

---

### behavior:decimal

Applied to: `<input type="decimal">`

Same DOM model and attributes as `behavior:integer` but for floating-point values.

**Value:** float or `undefined`

---

### behavior:number

Applied to: `<input type="number">`

Accepts both integer and floating-point. Same DOM model, attributes, and events as `behavior:integer`/`behavior:decimal`.

---

### behavior:textarea

Applied to: `<textarea>`

Multi-line text input.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `value` | Initial text |
| `rows` | Visible rows |
| `cols` | Visible columns |
| `maxlength` | Maximum character count |
| `filter` | Character filter (same syntax as `behavior:edit`) |
| `placeholder` / `novalue` | Empty state text. Style with `:empty` |
| `readonly` | Read-only mode |
| `spellcheck` | Enable spell checking |

**Properties** (`element.textarea.*`):

| Property | Type | Description |
|----------|------|-------------|
| `textarea.selectionStart` | int | Selection start |
| `textarea.selectionEnd` | int | Selection end |
| `textarea.selectionText` | string | Selected text |

**Methods** (`element.textarea.*`):

```js
element.textarea.selectAll();
element.textarea.selectRange(start, end);
element.textarea.appendText("text");
element.textarea.insertText("text");   // replaces selection
element.textarea.removeText();         // removes selection
```

**Events:** `"input"`/`"change"` (posted), `"changing"` (sync)

**Value:** string

---

### behavior:plaintext

Applied to: `<plaintext>` (code/plain-text multiline editor)

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `readonly` | Read-only mode |
| `spellcheck` | Enable spell checking |
| `content-style` | URL of CSS file for content styling |

**DOM Model:**
```html
<plaintext>
  <text>Line 1</text>
  <text>Line 2</text>
</plaintext>
```

**Properties** (`element.plaintext.*`):

| Property | Type | Description |
|----------|------|-------------|
| `plaintext.content` | string/array | r/w. Read: string with `\r\n`. Write: string or array of strings |
| `plaintext.lines` | int | Number of lines |
| `plaintext.selectionStart` | [line, pos] | Array: [lineNumber, positionInLine] |
| `plaintext.selectionEnd` | [line, pos] | Array: [lineNumber, positionInLine] |
| `plaintext.selectionText` | string | Selected text |

**Methods** (`element.plaintext.*`):

```js
element.plaintext.load(url);
element.plaintext.save(fileUrl);
element.plaintext.selectRange(startLine, startPos, endLine, endPos);
element.plaintext.selectAll();
element.plaintext.appendLine(text);         // string or array
element.plaintext.insertLine(at, text);     // at index
element.plaintext.removeLine(at [, count]);
element.plaintext.update(tctx => { ... });  // transactional update (same as htmlarea)
```

**Line access:**
```js
let firstLine = el.plaintext.children[0];
for (let line of el.plaintext.children) { ... }
```

**Commands** (via `execCommand`):

- `"edit:cut"`, `"edit:copy"`, `"edit:paste"`, `"edit:selectall"`, `"edit:undo"`, `"edit:redo"`
- `"edit:delete-next"`, `"edit:delete-prev"`, `"edit:delete-word-next"`, `"edit:delete-word-prev"`
- `"edit:insert-break"`, `"edit:insert-text"`
- `"navigate:backward"`, `"navigate:forward"`, `"navigate:word-start"`, `"navigate:word-end"`, `"navigate:up"`, `"navigate:down"`, `"navigate:line-start"`, `"navigate:line-end"`, `"navigate:start"`, `"navigate:end"`

**Events:** `"input"`/`"change"` (posted), `"changing"` (sync)

**Value:** string

---

### behavior:richtext (htmlarea)

Applied to: `<htmlarea>`

WYSIWYG HTML editor. Supports two content models: HTML fragment and full document (like `<frame>`).

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `readonly` | Read-only mode |
| `content-style` | URL of CSS file applied to editor content |
| `spellcheck` | `"true"`/`"false"` |

**HTML fragment vs full document:**
```html
<!-- Fragment mode -->
<htmlarea>
  <h2>Content</h2>
  <p>Paragraph</p>
</htmlarea>

<!-- Document mode -->
<htmlarea>
  <html><body><h2>Content</h2></body></html>
</htmlarea>
```

**Events:** `"change"` (posted), `"changing"` (sync)

**Properties:**
- `htmlarea.url` — r/w, URL of loaded document

**Methods:**

```js
element.htmlarea.load(url);
element.htmlarea.load(html, baseUrl);  // from string/ArrayBuffer
element.htmlarea.save(fileUrl);
element.htmlarea.loadEmpty();
element.htmlarea.sourceToContent(html, url, selStart, selEnd);
let [html, url, selStart, selEnd] = element.htmlarea.contentToSource();
```

**Commands** (via `element.execCommand()`):

```js
// Common editing
element.execCommand("edit:cut");
element.execCommand("edit:copy");
element.execCommand("edit:paste");
element.execCommand("edit:selectall");
element.execCommand("edit:undo");
element.execCommand("edit:redo");

// HTML-specific
element.execCommand("edit:insert-break");      // ENTER
element.execCommand("edit:insert-soft-break");  // SHIFT+ENTER → <br>
element.execCommand("edit:insert-text", "text");
element.execCommand("edit:insert-html", "<b>HTML</b>");

// Formatting
element.execCommand("format:apply-span:b|strong");
element.execCommand("format:apply-span:font", {color:"#F00"});  // with attributes
element.execCommand("format:toggle-span:i|em");
element.execCommand("format:toggle-list:ul");   // ul, ol, or dl
element.execCommand("format:toggle-pre");
element.execCommand("format:indent");
element.execCommand("format:unindent");
element.execCommand("format:morph-block:p");     // change block tag
element.execCommand("format:unwrap-element:blockquote");

// Table operations (when selection is inside a table)
element.execCommand("edit:insert-table-row:before");
element.execCommand("edit:insert-table-row:after");
element.execCommand("edit:insert-table-column:before");
element.execCommand("edit:insert-table-column:after");
element.execCommand("edit:merge-table-cells");
element.execCommand("edit:delete-table-rows");
element.execCommand("edit:delete-table-columns");
element.execCommand("edit:split-table-cells");
```

**Transactional Updates:**

```js
element.htmlarea.update(tctx => {
  tctx.setAttribute(el, "class", "highlight");
  tctx.removeAttribute(el, "class");
  tctx.setTag(el, "li");           // change tag
  tctx.setText(node, "new text");
  tctx.insertHTML(node, offset, "<b>text</b>");  // → [node, offset]
  tctx.insertText(node, offset, "text");
  tctx.insertNode(node, offset, newNode);
  tctx.deleteSelection();
  tctx.deleteRange(n1, o1, n2, o2);
  tctx.deleteNode(node);
  tctx.split(node, offset, untilElement);
  tctx.wrap(n1, o1, n2, o2, wrapperElement);
  tctx.unwrap(element);
  tctx.execCommand(command, params);
  return true;  // commit (false to discard)
});
```

**Keyboard shortcuts:**

| Key | Action |
|-----|--------|
| `CTRL+B` | Bold |
| `CTRL+I` | Italic |
| `CTRL+U` | Underline |
| `CTRL+D` | Code `<code>` |
| `CTRL+1-6` | Heading `<h1>`-`<h6>` |
| `CTRL+0` | Paragraph `<p>` |
| `CTRL+NUMPAD7` | Preformatted `<pre>` |
| `CTRL+NUMPAD+` | Indent |
| `CTRL+NUMPAD-` | Unindent |
| `CTRL+NUMPAD.` | Ordered list `<ol>` |
| `CTRL+NUMPAD*` | Unordered list `<ul>` |
| `CTRL+NUMPAD/` | Definition list `<dl>` |

**Value:** string (HTML content, alias of `.html` property)

---

## Selects

### behavior:select

Applied to: `<select>`, `<select type="select">`, `<select type="multiple">`, `<select type="checkmarks">`, `<select type="tree">`, `<select type="tree-checkmarks">`

**Types:**

| Type | Description |
|------|-------------|
| `select` | Single-select list |
| `multiple` / `select-multiple` | Multi-select with CTRL/SHIFT click |
| `checkmarks` / `select-checkmarks` | Multi-select with checkmarks |
| `tree` | Hierarchical tree view |
| `tree-checkmarks` | Tree with checkmarks |

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `size` | Number of visible items |
| `multiple` | Enable multi-selection (alias for `type="multiple"`) |
| `novalue` / `placeholder` | Text when no selection. Style with `:empty` |
| `as` | Type casting for option values |
| `editable` | Allow type-to-search filtering |

**Events:**

| Event | Type | Description |
|-------|------|-------------|
| `"input"` / `"change"` | Posted | Selection changed |
| `"changing"` | Sync | Selection about to change |

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `value` | any | Selected value (single) or array of values (multiple) |
| `options` | collection | Option elements collection |

**Value:** For single-select: value of `<option>`. For multi-select: array of values. Honors `as=` type casting.

**States:** `:current` on currently highlighted option, `:checked` on selected options.

---

### behavior:select-dropdown

Applied to: `<select type="dropdown">`

Dropdown select with popup list.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `novalue` / `placeholder` | Text when no selection. Style with `:empty` |
| `editable` | Makes the caption editable for type-to-filter |
| `as` | Type casting |

**Events:** `"input"`/`"change"` (posted), `"changing"` (sync)

**States:** `:popup` on the element when dropdown is open.

---

## Date/Time

### behavior:calendar

Applied to: `<input type="calendar">`

Inline calendar with four view modes.

**View Modes:** century → years → months → **days** (default). Each mode renders a `<table>`. Click navigates between modes.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `value` | Initial date, ISO 8601: `"YYYY-MM-DD"` |
| `mode` | Initial view: `"days"`, `"months"`, `"years"`, `"century"` |
| `firstdayofweek` | `0`=Sunday, `1`=Monday, etc. |

**Events:**

| Event | Type | Description |
|-------|------|-------------|
| `"input"` / `"change"` | Posted | Date selected |
| `"statechange"` | Posted | View mode or month/year changed |

**Properties** (`element.calendar.*`):

| Property | Type | Description |
|----------|------|-------------|
| `calendar.mode` | string | r/w, current view mode |

**Methods:**

```js
element.calendar.stepDown([n]);  // decrement (day/month/year/decade depending on mode)
element.calendar.stepUp([n]);    // increment
```

**Value:** `Date` or `undefined`

---

### behavior:date

Applied to: `<input type="date">`

Date input with **dropdown popup calendar**.

**DOM Model** (created on init):
```html
<input>
  <caption>         <!-- behavior:masked applied -->
    <span.year>
    <span.month>
    <span.day>
  </caption>
  <button>           <!-- triggers popup calendar -->
</input>
```

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `value` | Initial date: `"YYYY-MM-DD"` |
| `timezone` | `"local"` or `"+HH:MM"` / `"-HH:MM"` |
| `firstdayofweek` | `0`=Sunday, `1`=Monday, etc. |

**Events:** `"input"`/`"change"` (posted)

**Value:** `Date` or `undefined`

---

### behavior:time

Applied to: `<input type="time">`

Time input element. (Minimal documentation in source — uses masked edit internally.)

---

## Containers

### behavior:form

Applied to: `<form>`

Compound value container. Value is a **JSON map** of name/value pairs from named child elements.

**Value formation example:**
```html
<form>
  First: <input|text name="first" value="Foo">
  Last: <input|text name="last" value="Bar">
</form>
```
→ Value: `{ first: "Foo", last: "Bar" }`

**Radio groups:** shared `name` → single value (the checked radio's `value`).
**Checkboxes:** value is `value` attr if checked, `undefined` if not.

**Field groups** (nested named containers form sub-objects):
```html
<form>
  <div name="credentials">
    <input|text name="un" value="Peter">
    <input|password name="pwd" value="12345">
  </div>
  <input|checkbox name="persist" value="true" checked>
</form>
```
→ Value: `{ credentials: { un: "Peter", pwd: "12345" }, persist: true }`

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `action` | URL for form submission |
| `target` | Frame ID for response |
| `method` | `"post"` (default) or `"get"` |
| `enctype` | `"application/x-www-form-urlencoded"` (default) or `"multipart/form-data"` |

**Events:**

| Event | Type | Description |
|-------|------|-------------|
| `"reset"` | Sync | `<button type="reset">` clicked. If not consumed, resets to defaults |
| `"submit"` | Sync | `<button type="submit">` clicked. If not consumed, posts to `action` URL |
| `"input"` / `"change"` | Posted | Any child input changed |

**Methods:**

```js
element.form.submit();  // submit to action URL
element.form.reset();   // reset all inputs to defaults
```

**Value:** object — name/value map of all named children.

---

### behavior:frame

Applied to: `<frame>`, `<iframe>`

Sub-document container. Can be applied to **any block element**.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `src` | URL of document to load |
| `content-style` | URL of CSS to apply on top of document's styles |

**States:** `:busy` — set during document loading (style loading state with CSS).

**Events:**

| Event | Type | Description |
|-------|------|-------------|
| `"newdocument"` | - | New document created but empty |
| `"complete"` | - | Document fully loaded, DOM ready |

**Properties** (`element.frame.*`):

| Property | Type | Description |
|----------|------|-------------|
| `frame.document` | Document | Read-only, loaded document |
| `frame.mediaVars` | object | r/w, media variables for the document |
| `frame.url` | string | r/w, URL of loaded document |

**Methods** (`element.frame.*`):

```js
element.frame.loadFile(url);
element.frame.loadHtml(html, baseUrl);       // html: string | ArrayBuffer
element.frame.loadEmpty();
element.frame.saveFile(fileUrl);             // save as UTF-8
element.frame.saveBytes();                    // → ArrayBuffer (UTF-8)
```

---

### behavior:frame-set

Applied to: `<frameset>`

Resizable pane container with splitters.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `cols` | Comma-separated column widths (supports flex units: `"120px,*"`) |
| `rows` | Comma-separated row heights |

```html
<frameset cols="120px,*">
  <div id="sidebar">...</div>
  <splitter/>
  <frame id="content">...</frame>
</frameset>
```

**Properties:**
- `element.frameset.state` : array — r/w, current widths/heights. Use to persist UI layout state.

---

### behavior:pager

Applied to: `<frame type="pager">`, `<frame|pager>`

Print and print preview functionality.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `src` | URL of document to print/preview |
| `page-template` | URL of page template document |

**Events:**

| Event | Description |
|-------|-------------|
| `"pagination-start"` | Pagination started |
| `"pagination-page"` | Page `event.reason` (page number) paginated |
| `"pagination-end"` | Pagination complete |

**Properties** (`element.pager.*`):

| Property | Type | Description |
|----------|------|-------------|
| `pager.pages` | int | Read-only, total pages |
| `pager.page` | int | r/w, current page |
| `pager.document` | Document | Read-only, loaded document reference |
| `pager.documentName` | string | r/w, name shown in print queue |

**Methods** (`element.pager.*`):

```js
element.pager.loadFile(docUrl [, templateUrl]);
element.pager.loadHtml(html, baseUrl [, templateUrl]);  // html: string | ArrayBuffer
element.pager.selectPrinterDialog();    // system "Select Printer" dialog
element.pager.selectDefaultPrinter();
element.pager.selectPrinter(printerId);
let printers = element.pager.printers();
// → [{ id, name, shareName, comment, location, isDefault }, ...]
element.pager.print([arrayOfPageNumbers]);  // e.g. [1,3,5]
```

---

## Outputs

### behavior:output

Applied to: `<output>`

Formatted output with locale-aware rendering.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `type` | Formatter: `"text"`, `"integer"`, `"decimal"`, `"currency"`, `"date"`, `"date-local"`, `"time"`, `"time-local"` |
| `value` | Value to format |
| `name` | Form field name |
| `novalue` | Text when no value is set |
| `timezone` | `"local"` or `"+HH:MM"` / `"-HH:MM"` |

**States:** `:invalid` if value cannot be converted to declared type.

**Styling negative values:**
```css
output[negative] { color: red; }  /* 'negative' attr set automatically */
```

**Value:** `any`, formatted according to `type`.

---

### behavior:progress

Applied to: `<progress>`, `<meter>`

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `max` | Maximum value (default: `1.0`) |
| `value` | Current progress (`0.0` ... `max`) |
| `name` | Form field name |

> If no `max` and no `value` are defined → renders **infinite animation** (indeterminate).

**Value:** `float` in `[0.0 ... max]`

---

### behavior:video

Applied to: `<video>`

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `src` | URL of video file (starts playback immediately if provided) |
| `sizing` | `"contain"` (default, full frame visible) or `"cover"` (fills box, may clip) |

**Properties** (`element.video.*`):

| Property | Type | Description |
|----------|------|-------------|
| `video.isPlaying` | bool | Read-only, playback active |
| `video.isEnded` | bool | Read-only, reached end |
| `video.duration` | float | Read-only, seconds (0 if unknown) |
| `video.position` | float | r/w, position in seconds |
| `video.width` / `video.height` | int | Read-only, native frame dimensions |
| `video.renderingBox` | [x,y,w,h] | Read-only, video rect relative to content box |
| `video.audioVolume` | float | r/w, `0.0` (mute) to `1.0` (0dB) |
| `video.audioBalance` | float | r/w, `-1.0` (left) to `+1.0` (right) |

**Methods:**

```js
element.video.load(url);   // load without autoplay
element.video.unload();
element.video.play();
element.video.stop();
```

**Events:**

| Event | Description |
|-------|-------------|
| `"videoready"` | Loaded, width/height/duration available |
| `"videostart"` | First frame rendered |
| `"videostop"` | Playback stopped |

---

### behavior:lottie

Applied to: `<lottie>`

Lottie/After Effects animation player.

**HTML:**
```html
<lottie src="animation.json" autoplay loop>
  <param path="**" property="FillColor" value="#FF0000" />
</lottie>
```

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `src` | URL of Lottie JSON file |
| `autoplay` | Start immediately after loading |
| `loop` | Repeat playback |

**Properties** (`element.lottie.*`):

| Property | Type | Description |
|----------|------|-------------|
| `lottie.playing` | bool | Read-only, is playing |
| `lottie.speed` | float | r/w, speed multiplier (default `1.0`) |
| `lottie.loop` | bool | r/w, loop playback |
| `lottie.frame` | int | r/w, current frame `[0..frames)` |
| `lottie.frames` | int | Read-only, total frames |
| `lottie.position` | float | r/w, position `0.0..1.0` |
| `lottie.duration` | duration | Read-only, total duration |
| `lottie.markers` | array | Read-only, `[[tagName, startFrame, endFrame], ...]` |

**Methods:**

```js
element.lottie.load(url);
element.lottie.play([firstFrame, lastFrame]);  // optional range
element.lottie.stop();
element.lottie.update(keyPath, propName, value);
```

**Property redefinition** (`update()` or `<param>`):

KeyPath wildcards: `*` (single level), `**` (any depth).

PropName values: `FillColor`, `FillOpacity`, `StrokeColor`, `StrokeOpacity`, `StrokeWidth`, `TrAnchor`, `TrPosition`, `TrScale`, `TrRotation`, `TrOpacity`.

**Events:** `"animationstart"`, `"animationloop"`, `"animationend"`

---

## Lists

### behavior:virtual-list

Applied to: any element with `behavior:virtual-list` in CSS (no default element).

Sliding-window scrollable list for **large datasets**. Uses fixed number of DOM elements.

```css
div.list {
  behavior: virtual-list;
  overflow-y: scroll;
}
```

> Use `vertical-align: bottom` CSS to start scrolled to end.

**Events:**

| Event | Description |
|-------|-------------|
| `"contentrequired"` | Behavior needs more elements. `event.data`: `{ where: int, start: int, length: int }` |

`where`: `0` = replace, `-1` = add before, `1` = add after.

Handler must return: `{ morebefore: int, moreafter: int }` to set scrollbar.

**Properties** (`element.vlist.*`):

| Property | Type | Description |
|----------|------|-------------|
| `vlist.firstVisibleItem` | Element | First visible element |
| `vlist.lastVisibleItem` | Element | Last visible element |
| `vlist.firstVisibleItemIndex` | int | Index of first visible |
| `vlist.lastVisibleItemIndex` | int | Index of last visible |
| `vlist.firstBufferIndex` | int | Records before sliding window |
| `vlist.lastBufferIndex` | int | Last buffer index |
| `vlist.itemsBefore` | int | r/w, items before buffer |
| `vlist.itemsAfter` | int | r/w, items after buffer |
| `vlist.itemsTotal` | int | Read-only, total items |
| `vlist.slidingWindowSize` | int | r/w, DOM elements in window (ideally 2× visible items) |

**Methods:**

```js
element.vlist.navigateTo(target);
// target: int (record#), "start", "end", "pagenext", "pageprior", "itemnext", "itemprior"

element.vlist.advanceTo(recNo);    // → Element (animated scroll)
element.vlist.scrollBy(pixels);    // → boolean
```

---

### behavior:expandable-list

Applied to: any element with `behavior:expandable-list` in CSS.

Accordion — only **one item `:expanded`** at a time.

**DOM Model:**
```html
<div.list>
  <section default>          <!-- 'default' attr = initially expanded -->
    <caption>A</caption>     <!-- click toggles expand/collapse -->
    <div>...details...</div>
  </section>
  <section>
    <caption>B</caption>
    <div>...details...</div>
  </section>
</div>
```

Click on `<caption>` sets item to `:expanded`, all others to `:collapsed`.

**Events:** `"expand"` (posted, target = item), `"collapse"` (posted, target = item)

---

## Menu

### behavior:menu

Applied to: `<menu class="context">`, `<menu class="popup">`

Popup menu with hierarchical sub-menus.

**DOM Model:**
```html
<menu.popup>
  <li id="open">Open <span.accesskey>Ctrl+O</span></li>
  <hr>  <!-- separator -->
  <li>Recent Files
    <menu>  <!-- sub-menu -->
      <li>File1.htm</li>
    </menu>
  </li>
</menu>
```

Any element with `role="menu-item"` is treated as selectable (not just `<li>`).

**To show menu:**
```js
menuOwnerElement.popup(menuElement, x, y);
```

**States:** `:owns-popup` on owner element, `:popup` on `<menu>` when shown.

**Events:** `"click"` — `event.target` is the clicked menu item.

```js
document.on("click", "menu#ctx > li#open", function(evt) { ... });
```

---

### behavior:menu-bar

Applied to: (no default element — use with CSS)

Horizontal application menu bar.

**DOM Model:**
```html
<ul id="menu-bar">
  <li>
    <caption>File</caption>
    <menu>
      <li id="file-open">Open <span.accesskey>Ctrl+O</span></li>
      <li id="file-save">Save <span.accesskey>Ctrl+S</span></li>
    </menu>
  </li>
  ...
</ul>
```

**States:** `:owns-popup` on owner `<li>`, `:popup` on `<menu>`.

**Events:** `"click"` with `event.target` = menu item.

---

## Auxiliary

### behavior:scrollbar

Applied to: `<widget|vscrollbar>`, `<widget|hscrollbar>`

**Standalone** (non-element-attached) scrollbar.

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `for` | CSS selector of element to scroll (external scrollbar binding) |

**Properties** (`element.scrollbar.*`):

| Property | Type | Description |
|----------|------|-------------|
| `scrollbar.position` | int | r/w, current position |
| `scrollbar.min` | int | Read-only |
| `scrollbar.max` | int | Read-only |
| `scrollbar.page` | int | Read-only, also controls slider size |
| `scrollbar.step` | int | Read-only, arrow button increment |

**Methods:**
```js
element.scrollbar.values(position, min, max, page, step);
```

**Events (non-bubbling):**
- `"scroll-step-plus"`, `"scroll-step-minus"`
- `"scroll-page-plus"`, `"scroll-page-minus"`
- `"scroll-slider-press"`, `"scroll-slider-release"`
- `"change"` — bubbling, after value changes

**Value:** integer in `[min...max]`

---

### behavior:details

Applied to: `<details>`

Collapsible section. Click on `<summary>` or `<caption>` toggles `:expanded`/`:collapsed`.

Can be applied to **any element**:

```css
li { behavior: details; }
li > p { visibility: none; }
li:expanded > p { visibility: visible; }
```
```html
<li>
  <caption>Summary</caption>
  <p>Details</p>
</li>
```

**Attributes:** `open` — initial expanded state (`"true"` or `"false"`)

**Events:** `"expand"` (posted), `"collapse"` (posted)

**States:** `:expanded`, `:collapsed`

---

### behavior:history

Applied to: `<frame history>` (frame with `history` attribute)

Navigation history (back/forward) for frames. Can also be applied to `<frameset>`.

**Methods:**

```js
element.back();      // → true|false
element.forward();   // → true|false
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `length` | int | Backward history depth |
| `forwardLength` | int | Forward history depth |

**Events:** `"historystatechange"` — navigation stack changed.

---

### behavior:selectable

Applied to: (no default element — assign via CSS)

Enables HTML range selection (text selection) on an element.

```css
div.selectable { behavior: selectable; }
```

---

### behavior:terminal

Applied to: `<widget type="terminal">`

Terminal/console emulation.

```html
<widget type="terminal" />
```

**Properties** (`element.terminal.*`):

| Property | Type | Description |
|----------|------|-------------|
| `terminal.caret` | [col, row] | r/w, cursor position |
| `terminal.rows` | int | Read-only, terminal rows |
| `terminal.columns` | int | Read-only, terminal columns |

**Methods:**

```js
element.terminal.write(text);
element.terminal.writeln(text);
element.terminal.clear();
```

**Events:** `"termevent"` — user input event.

---

### behavior:slider

Applied to: `<input type="hslider">`, `<input type="vslider">`

Slider control. (Minimal documentation in source — uses same attributes as numeric inputs: `min`, `max`, `step`, `value`.)

**Events:** `"input"`/`"change"` (posted)

**Value:** numeric

---

## Quick Reference Table

| Element | Default Behavior | API Namespace |
|---------|------------------|---------------|
| `<button>` | `button` | — |
| `<input type="button">` | `button` | — |
| `<input type="text">` / `<input>` | `edit` | `element.edit.*` |
| `<input type="password">` | `password` | `element.edit.*` |
| `<input type="masked">` | `masked-edit` | `element.masked.*` |
| `<input type="number">` | `number` | — (use caption's `edit.*`) |
| `<input type="decimal">` | `decimal` | — (use caption's `edit.*`) |
| `<input type="integer">` | `integer` | — (use caption's `edit.*`) |
| `<input type="date">` | `date` | — |
| `<input type="calendar">` | `calendar` | `element.calendar.*` |
| `<input type="time">` | `time` | — |
| `<input type="hslider">` | `slider` | — |
| `<input type="vslider">` | `slider` | — |
| `<input type="checkbox">` | `check` | — |
| `<input type="radio">` | `radio` | — |
| `<select>` | `select` | — |
| `<select type="dropdown">` | `select-dropdown` | — |
| `<textarea>` | `textarea` | `element.textarea.*` |
| `<plaintext>` | `plaintext` | `element.plaintext.*` |
| `<htmlarea>` | `htmlarea` | `element.htmlarea.*` |
| `<form>` | `form` | `element.form.*` |
| `<frame>` / `<iframe>` | `frame` | `element.frame.*` |
| `<frameset>` | `frame-set` | `element.frameset.*` |
| `<a href>` | `hyperlink` | — |
| `<label>` | `label` | — |
| `<output>` | `output` | — |
| `<progress>` / `<meter>` | `progress` | — |
| `<video>` | `video` | `element.video.*` |
| `<lottie>` | `lottie` | `element.lottie.*` |
| `<details>` | `details` | — |
| `<menu class="popup">` | `menu` | — |
| toolbar > `<button>` | `clickable` | — |
| `<frame type="pager">` | `pager` | `element.pager.*` |
| `<widget|vscrollbar>` | `scrollbar` | `element.scrollbar.*` |
| `<widget type="terminal">` | `terminal` | `element.terminal.*` |
| `<frame history>` | `history` | — |
