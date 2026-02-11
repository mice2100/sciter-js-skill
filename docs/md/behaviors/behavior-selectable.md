# behavior: selectable

HTML selection behavior. It can be applied to any DOM block element to have "HTML selection" inside it. "HTML selection" support copying of selection in HTML clipboard (structural) format.

## Elements

Any block element that have attribute "selectable", for example:

```html
<section selectable>
   ... some HTML that can be selected and copied to clipboard ...
</section>
```

## Attributes

* `selectable` - boolean, "" | "true" | "false", enable/disable spell checking.

## Events

* `"statechange"` event - selection did change by the user. Posted (asynchronous) event.

## Commands

The `selectableElement.execCommand(command,attributes)` method executes navigation commands. The *command* string identifies command to execute:

* `"navigate:backward"` - one caret position backward;
* `"navigate:forward"` - one caret position forward;
* `"navigate:down"` - one caret position down ( arrow down key );
* `"navigate:up"` - one caret position up ( arrow up key );
* `"navigate:start"` - first caret position inside the selectable element;
* `"navigate:end"` - end caret position;
* `"navigate:line-end"` - end of line;
* `"navigate:line-start"` - start of line;
* `"navigate:para-end"` - paragraph end;
* `"navigate:para-start"` - paragraph start;
* `"navigate:word-end"` - word end;
* `"navigate:word-start"` - word start;
* `"navigate:page-down"` - page down;
* `"navigate:page-up"` - page up;


