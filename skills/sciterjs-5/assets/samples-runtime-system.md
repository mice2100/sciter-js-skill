# Samples: Runtime & System Patterns

Real-world idioms mined from the official `samples.sciter/` tree — covering `@sys`, `@sciter`, process
spawning, clipboard, zip, global events, module resolution, and an undocumented built-in testing
framework. Only genuinely new material not already in `SKILL.md` / `runtime-api-reference.md` is kept
here.

## Testing — undocumented `unit-test` framework (samples/unit-test/)

The samples ship a complete, reusable, Jest-like unit-test framework for Sciter apps. It is **not an
official Sciter API** — it's plain JS/CSS sample code (`unittest.js`, `unittest-module.js`,
`unittest-expect.js`, `unittest-utils.js`, `unittest-dom.js`, `unittest.css`, `unittest-window.htm`) that
can be copied wholesale into a project. Nothing like it exists elsewhere in the skill docs.

**How a test file is wired to a page** — via CSS `aspect:` binding a `<link rel="unittest">` element to
an exported `link()` function:

```css
/* unittest.css */
link[rel=unittest] { aspect: link url(unittest.js); }
```

```html
<link rel="unittest" href="my-tests.js" />
```

When the `<link>` element mounts, its `aspect: link` fires `unittest.js`'s exported `link()` with `this`
bound to the link element; it reads `this.attributes["href"]`, `fetch()`es that script's source text, and
`eval`s it inside a wrapper function that injects `expect`, `delay`, `test`, `testGroup`, `$expect`,
`$$expect` as free variables — so test files never `import` anything, they just call these globals:

```js
// my-tests.js — no imports needed, injected by the harness
test("Plus function", () => {
  expect(plus(1, 2)).equal(3);
});

testGroup("Shall Succeed", () => {
  test("initial state: expanded", () => {
    $expect("section.collapsible").state("collapsed").off();
  });
  test("click toggle", async () => {
    let section = $expect("section.collapsible");
    section.$("caption").click();
    await delay(400);
    section.state("collapsed").on();
  });
});
```

**Running the tests**: press `Ctrl+Shift+T` anywhere in the app (wired via a global `keydown` handler in
`unittest.js`) to pop up a floating `Window.TOOL_WINDOW` (`unittest-window.htm`) listing all registered
tests/groups as a checkbox tree; hitting **Run** executes selected tests and streams pass/fail into a log
pane. State (registered tests) is passed to the child window via `Window` constructor `parameters`:

```js
window = new Window({
  type: Window.TOOL_WINDOW,
  url: __DIR__ + "unittest-window.htm",
  state: Window.WINDOW_SHOWN,
  alignment: 9,
  parameters: { UnitTest: UnitTest }   // exposed as Window.this.parameters in the child
});
```
```js
// inside unittest-window.htm
const { UnitTest } = Window.this.parameters;
```

**API surface** (`unittest-module.js` / `unittest-expect.js` / `unittest-dom.js`):

| Function | Purpose |
|---|---|
| `test(name, fn)` | Register a test (fn may be `async`). Nests under current group. |
| `testGroup(name, fn)` | Register a named group; `fn` synchronously declares nested `test()`/`testGroup()` calls. |
| `expect(received)` | Returns an `Expect` object (Jest-style matcher chain). |
| `$expect(selector)` | DOM-aware `Expect`: wraps `srt.$(selector)`, adds `.state(name)`, `.attribute(name)`, `.click()`, `.changeValue(val)`, `.$(childSelector)` — each returns a new wrapped element for chaining. Throws a `TestError` if the element doesn't exist. |
| `$$expect(selector)` | `srt.$$(selector)` — multi-element query. |
| `delay(ms)` | `Promise`-based `setTimeout` wrapper, for waiting out CSS transitions/animations in UI tests. |
| `UnitTest.run(onTestStart, onTestEnd, onGroupStart)` | Drives execution, returns `{fail, succ, error}`. Stops at first *unexpected* (non-`TestError`) exception and shows it in a modal `<alert>`. |

`Expect` matchers observed: `.equal()`, `.not` (getter, returns negated `Expect`), `.closeTo(expected, precision)`,
`.defined()`, `.falsy()` / `.truthy()`, `.off()` / `.on()` (boolean-state sugar, used heavily for
`.state("collapsed").off()`), `.greater()/.greaterOrEqual()/.less()/.lessOrEqual()`, `.instanceOf()`,
`.Nan()`, `.Null()`, `.contain()` (substring or array-membership), `.haveLength()`, `.match(stringOrRegExp)`.

Failures throw a plain `TestError` object (`{message}`, not a real `Error`) caught by the runner and
reported inline in the log; any *other* exception is treated as a harness bug and surfaces a modal dialog
with the file/stack. `console.assert()` is used elsewhere in samples (e.g. `storage/notes.htm`) for
lightweight non-framework sanity checks — not part of this framework.

## Module Resolution (js-module-resolver/)

`sciter.setModuleUrlResolver(resolver)` resolver signature has a **third parameter** not shown in the
existing doc's example — `sourceDir` (the importing module's own directory, as opposed to `documentDir`,
the top-level document's directory):

```js
// custom-module-resolver.js — must be loaded/imported before any module that needs custom resolution
import * as srt from "@sciter";
const thisDir = __DIR__;

srt.setModuleUrlResolver((name, documentDir, sourceDir) => {
  return `${thisDir}node_modules/${name}/index.js`;   // npm-style resolution, no package.json parsing
});

document.on("beforeunload", e => {
  if (e.target === this) srt.setModuleUrlResolver(null);   // reset on unload
});
```
```html
<script|module src="custom-module-resolver.js" />
<script|module>
  import * as test from "foo";   // resolved via the custom resolver above -> node_modules/foo/index.js
</script>
```

Comment in the sample stresses **load order**: the resolver-setting module must be the first `<script>`
in `<head>` (its own `<script src="custom-module-resolver.js" />` appears before the module that imports
`"foo"`), otherwise later imports resolve before the custom resolver is installed.

`std-module-resolver.htm` imports a bare specifier `"bar"` with **no resolver set at all**, and it
resolves successfully against a sibling `modules/bar/index.js` directory — confirming Sciter has a
built-in default bare-specifier lookup convention (checks a `modules/<name>/index.js` folder relative to
the document) before falling back to failure, distinct from Node's `node_modules` convention.

## Process / Child Processes (process/spawn.htm)

`sys.spawn()` accepts the **array form** `[command, ...args]` as its first argument (in addition to the
`{command, args, cwd}` object form already documented):

```js
import * as sys from "@sys";
import * as env from "@env";

var cmd = env.PLATFORM == "Windows" ? "tracert" : "traceroute";
const proc = sys.spawn([cmd, "sciter.com"], { stdout: "pipe", stderr: "pipe" });

async function pipeReader(pipe) {
  try {
    while (pipe) {
      let text = await pipe.read();
      terminalView.write(sciter.decode(text));
    }
  } catch (e) {
    if (e.message != "socket is not connected") terminalView.write(e.message);
  }
}
pipeReader(proc.stdout);
pipeReader(proc.stderr);
await proc.wait();
```

Pattern notes: read loops on `proc.stdout`/`proc.stderr` just `await pipe.read()` in a `while(pipe)` loop
until it throws (closed pipe raises `"socket is not connected"`, which is expected/ignorable at EOF); the
`<terminal>` element (`document.$("terminal").terminal`) is used as a live console sink for ANSI-colored
output (`\x1b[31m` red / `\x1b[32m` green / `\x1b[0m` reset).

## Clipboard (clipboard/)

Intercepting/inspecting paste content by hooking the editor's own paste command instead of listening for
a generic `paste` DOM event — return `true` from the handler to mark it handled:

```js
document.$("htmlarea").on("^exec:edit:paste", function() {
  const clipboardData = Clipboard.read();
  out.innerText = JSON.stringify(clipboardData, null, "  ");
  return true;   // suppress default paste behavior after inspecting the data
});
```

`Clipboard.write({ image, text })` accepts an `image` field populated with a loaded `Graphics.Image`
(`await Graphics.Image.load(path)`) alongside/instead of `text` — writes an image+text clipboard payload
in one call (already documented at a basic level, but sample confirms `Graphics.Image.load()` is the
correct way to source clipboard image data, not `Image.load` bareword).

## Zip Archives (zip/)

**Programmatic archive creation** via `Zip.toData(generatorFn)` — not previously documented. The
generator function receives an index `n` and returns `[path, dataArrayBuffer]` or a falsy value to stop:

```js
import { fs } from "@sys";
import { encode } from "@sciter";

const content = [
  ["foo.txt", encode("foo")],
  ["bar.txt", encode("bar")],
  ["zoo/lorem.txt", encode(LOREM)],
];

function packArchive() {
  return Zip.toData(n => n < content.length && content[n]);   // -> ArrayBuffer of a valid .zip
}

const blob = packArchive();
const f = await fs.open(__DIR__ + "new.zip", "w");
await f.write(blob);
await f.close();
```

Password-protected archives: `Zip.openFile(path, "secret")` — same signature as `Zip.open(buffer,
password)`, just confirmed working end-to-end with `mountTo()`:

```js
const zip = Zip.openFile(__DIR__ + "test-secret.zip", "secret");
zip.mountTo("this://mounts/test/");
document.body.append(<frame src="this://mounts/test/main.htm" />);
```

Iterating a mounted/opened archive for a manifest UI:

```js
for (let zit of zip)
  items.push(<tr><td>{zit.path}</td><td>{zit.isDir ? "dir" : zit.data.byteLength}</td></tr>);
// binary item data feeds straight into an <img>:
<img state-value={ zip.item("images/image.png").data } />
```

## Global Events (global-events/)

Sample README frames this explicitly as Sciter's **built-in native PubSub** for two scenarios: (1)
decoupled sibling components that don't reference each other, (2) native C++ backend -> JS frontend
notifications via `frame::broadcast_event()`. Concrete component wiring:

```js
// Publisher (any element, any window)
class ComponentA extends Element {
  notifyOthers() { Window.post(new Event("app-wide-event")); }
}

// Subscriber
class ComponentB extends Element {
  counter = 0;
  componentDidMount() {
    this.onGlobalEvent("app-wide-event", () => this.componentUpdate({ counter: this.counter + 1 }));
  }
}
```

Lifecycle detail confirmed by the README (not stated elsewhere): global-event subscriptions use **weak
pointer semantics** — an element is automatically unsubscribed when removed from the DOM, so explicit
`offGlobalEvent()` cleanup is optional (but still available for early/manual unsubscribe, or
`this.offGlobalEvent()` with no args to drop all subscriptions at once).

## Runtime Misc

**`<script|module>` tag shorthand.** Several samples write `<script|module>` instead of
`<script type="module">` — Sciter's pipe-attribute-shorthand (`tag|value` == `tag type="value"`) works on
`<script>` tags too, and is used interchangeably with the verbose form throughout the samples.

**Two parallel sync-I/O naming conventions.** `sciter.d.ts` and the `@sys/fs/file-create.htm` sample show
a `$`-prefixed sync API family — `fs.$open`, `file.$write`, `file.$close`, `fs.$readfile`, `fs.$stat`,
`fs.$mkdir`, `fs.$rmdir`, `fs.$readdir` — which is a **different naming style** than the `fs.sync.*` /
`*Sync` forms already documented in `runtime-api-reference.md`. Both spellings appear in the wild;
prefer whichever the target Sciter build's `sciter.d.ts` actually declares (samples' own `.d.ts` only
lists the `$`-prefixed forms plus async, no `fs.sync.*` namespace):

```js
const file = sys.fs.$open(path, "w+", 0o666);
file.$write(srt.encode(text, "utf-8"));
file.$close();
```

**Recursive directory copy pattern** (`@sys/fs/fs-plus.js`), built from `fs.sync.*`/`fs.copyfile`
primitives — useful as a reusable utility:

```js
import { fs } from "@sys";
export async function copyDir(srcDir, dstDir) {
  drillDir(dstDir); // mkdir -p equivalent, walks path segments with fs.sync.stat/mkdir
  let fileCount = 0;
  for (let { name, type } of fs.sync.readdir(srcDir)) {
    const src = srcDir + '/' + name, dst = dstDir + '/' + name;
    if (type == fs.UV_DIRENT_DIR) fileCount += await copyDir(src, dst);
    else { await fs.copyfile(src, dst); ++fileCount; }
  }
  return fileCount;
}
```

**File watching keeps a live handle alive on the document** so it isn't GC'd:

```js
document.monitor = sys.fs.watch(URL.toPath(__DIR__), (path, event, status) => {
  document.body.append(<text>Change in {path} event {event} status {status}</text>);
});
```

**Named-pipe echo server loop shape** (`@sys/net/Pipe/`) — the canonical accept-loop idiom, and a BJSON
variant that (de)serializes each pipe message as a length-prefixed BJSON packet:

```js
var p = new sys.Pipe();
document.on("beforeunload", () => p.close());
p.bind('fooPipe');
p.listen();
while (true) {
  let conn = await p.accept();
  handleConnection(conn);   // fire-and-forget, don't await — loop keeps accepting
}

// BJSON variant inside handleConnection:
const bjson = new BJSON();
data = await conn.read();
bjson.unpack(data, json => conn.write(bjson.pack(json)));   // echo re-packed as BJSON
```

**Module-level `this` / `beforeunload` target check.** `custom-module-resolver.js` guards its cleanup
with `if (e.target === this)` inside a document-level `beforeunload` handler — a defensive check worth
copying when multiple frames/windows might share the same unload listener path.

## Code Linting (code-linting/)

The samples include ready-made lint configs for Sciter JS/JSX source, both flagging the same limitation:

- **`.eslintrc.json`** (plain ESLint + `eslint-plugin-html`, `google` style, JSX parsing enabled).
- **`.xo-config.json`** (XO — opinionated ESLint wrapper) declares the **Sciter global identifiers**
  linters must whitelist so they don't flag them as undefined:
  `__DIR__, document, location, Window, Element, Audio, Clipboard, CustomEvent, Graphics, fetch, post,
  printf, scanf, JSX, getComputedStyle, requestAnimationFrame, cancelAnimationFrame, devicePixelRatio`.
  It also declares `.htm`/`.html` as lintable extensions via the `html` plugin.
- **Known limitation (README)**: Sciter's JSX attribute shorthands — `.class`, `#id`, `|type` — are
  **not parseable by `acorn`** (the JS parser both ESLint and XO build on), e.g.
  `<section .myClass #myId>` crashes the linter; only the verbose `<section class="myClass" id="myId">`
  form lints cleanly. Worth knowing before recommending shorthand JSX in code that must pass CI linting.

## Extras

`extras/selectable-area.htm` demonstrates opt-in text selection scoping with the already-documented
`text-selection` CSS property, using a plain boolean attribute as the selector hook:

```css
[selectable]:not(:focus) { text-selection: currentcolor transparent; }
```
```html
<div selectable><p>This area is selectable.</p></div>
```
