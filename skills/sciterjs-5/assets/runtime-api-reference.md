# Sciter JS Runtime API Reference

Complete reference for Sciter-specific JavaScript modules: `@sciter`, `@sys`, `@env`, `@debug`, `@storage`.

## Module `@sciter`

Sciter-specific functions and utilities.

```js
import * as sciter from "@sciter";
// or import specific functions
import { on, off, once, $, $$ } from "@sciter";
```

### Constants

| Constant | Type | Description |
|----------|------|-------------|
| `VERSION` | string | Engine version "X.X.X.X" |
| `REVISION` | string | SVN build revision |
| `QUICKJS_VERSION` | string | QuickJS engine version |

### Event Functions

#### `on(event, selector?, handler)`
jQuery-style event subscription.
```js
sciter.on("click", "button.class", function(evt, target) {
    // this = element handler attached to
    // target = element matching selector
});

// Capture phase (starts with ^)
sciter.on("^click", handler);

// Namespaced events
sciter.on("click.myns", handler);
```

#### `off(event)` / `off(handler)`
Unsubscribe event handlers.
```js
sciter.off("click");        // by name
sciter.off(".myns");        // by namespace
sciter.off(handler);        // by function reference
```

#### `once(event, selector?, handler)`
Same as `on()` but auto-unsubscribes after first call.

#### `onGlobalEvent(name, handler)` / `offGlobalEvent(name)`
Subscribe to application-wide events across all windows.
```js
sciter.onGlobalEvent("custom-event", (data) => {
    console.log("Global event received:", data);
});

// Send global events from C++ or JS (both take an Event object, not a string+data pair):
// Window.send(new Event("custom-event", { data }));  // synchronous
// Window.post(new Event("custom-event", { data }));  // asynchronous
```

### DOM Query Functions

#### `$(selector)`
Returns first matched element.
```js
const el = sciter.$("button.main");
```

#### `$$(selector)`
Returns array of matched elements.
```js
const buttons = sciter.$$("button");
```

### Module Import

#### `import(path)` - Synchronous import
```js
const module = sciter.import('my-module.js');
```

#### `setModuleUrlResolver(resolver)` - Custom module resolution
```js
sciter.setModuleUrlResolver((name, documentDir) => {
    return `${documentDir}node_modules/${name}/index.js`;
});
```

#### `loadLibrary(name)` - Load native extension
```js
const sqlite = sciter.loadLibrary("sciter-sqlite");
```

### Value Parsing

#### `parseValue(string)` - JSON++ parsing
```js
sciter.parseValue("true");      // true
sciter.parseValue("1234n");     // BigInt 1234
sciter.parseValue("0xFF");      // 255 (hex)
sciter.parseValue("2021-12-01"); // Date (no prefix)
sciter.parseValue("12px");      // Length object
sciter.parseValue("1rad");      // Angle object
sciter.parseValue("{foo: bar; baz: 1}"); // object (semicolon separator)
```

### Encoding/Compression

```js
// Text encoding/decoding
sciter.encode(text, "utf-8");   // -> ArrayBuffer
sciter.decode(bytes, "utf-8");  // -> string

// Compression (gz, gzip, lzf)
sciter.compress(buffer, "lzf");
sciter.decompress(buffer, "lzf");

// Base64
sciter.toBase64(buffer);        // -> string
sciter.fromBase64(str);         // -> ArrayBuffer

// Hashes
sciter.md5(buffer);             // -> string
sciter.crc32(buffer);           // -> integer
```

### Utility Functions

```js
sciter.uuid();                  // Generate UUID
sciter.devicePixels(100);       // CSS to device pixels
sciter.devicePixels("2in");     // Inches to pixels
sciter.devicePixels(100, "width"); // Axis-specific
```

---

## Module `@sys`

Node.js-style runtime functions built on libuv.

```js
import * as sys from "@sys";
```

### File System (`sys.fs`)

#### File Operations

```js
// Async (returns Promise)
await sys.fs.readFile("path.txt");           // -> ArrayBuffer
await sys.fs.copyfile("src", "dst");
await sys.fs.unlink("path.txt");             // Delete file
await sys.fs.rename("old", "new");

// Sync versions
sys.fs.readFileSync("path.txt");
```

There is no documented `sys.fs.writeFile()`. Writing goes through `fs.open()` + the `File` instance's `write()` method instead (see below):

```js
const file = await sys.fs.open("path.txt", "w");
await file.write(data);
await file.close();
```

> **Naming caution:** the `sciter.d.ts` type definitions shipped in the samples SDK declare sync variants with a **`$` prefix on the same function name** — `fs.$open`, `fs.$stat`, `fs.$lstat`, `fs.$mkdir`, `fs.$rmdir`, `fs.$readdir`, and `file.$read`/`file.$write`/`file.$close` on the `File` class — NOT `xxxSync()` or a `fs.sync.*` namespace. Treat `$`-prefixed names as the current, authoritative sync API; the `Sync`-suffix and `fs.sync.*` forms below are as documented in the prose docs but unconfirmed against `sciter.d.ts` — verify against your SDK build if a sync call fails.

#### Directory Operations

```js
await sys.fs.mkdir("folder", 0o755);
await sys.fs.rmdir("folder");
await sys.fs.readdir("folder");  // -> Dir (async-iterable list of {name, type})
await sys.fs.stat("path");       // -> stat object
await sys.fs.lstat("path");      // -> stat object (does not follow symlinks)
await sys.fs.realpath("path");   // -> canonicalized path
await sys.fs.mkdtemp("prefixXXXXXX");  // -> path of created temp dir (last 6 chars of template must be "XXXXXX")
await sys.fs.mkstemp("prefixXXXXXX");  // -> creates unique temp file
await sys.fs.chmod("path", 0o644);

// Sync counterparts (per sciter.d.ts): fs.$mkdir, fs.$rmdir, fs.$lstat, fs.$readdir (-> plain array, not Dir)
// (prose docs also describe fs.mkdirSync/fs.chmodSync/fs.readdirSync-style names — prefer the $-prefixed forms, see caution above)
```

#### `fs.open()` and the `File` class

```js
const file = await sys.fs.open("path.txt", "r" /* or "a","a+","w","w+","r+","wx","ax",... [, mode] */);
// sync (per sciter.d.ts): const file = sys.fs.$open(path, flags [, mode]);

await file.read([lengthToRead, filePosition]);   // -> Promise(Uint8Array)
file.$read([lengthToRead, filePosition]);        // -> Uint8Array (sync)

await file.write(stringOrArrayBufferOrTypedArray [, filePosition]); // -> Promise(bytesWritten:int)
file.$write(data [, filePosition]);              // -> int (sync)

await file.close();      // Promise(undefined)
file.$close();           // sync

file.fileno();           // -> int, native file descriptor
await file.stat();       // -> Promise(stat object), same shape as fs.stat()
file.path;                // string, path file was opened with
```

Flags for `fs.open()`: `'r'` (default, read, error if missing), `'r+'` (read/write, error if missing), `'w'` (write, create/truncate), `'wx'` (write, fail if exists), `'w+'`/`'wx+'`, `'a'`/`'ax'` (append, create if missing), `'a+'`/`'ax+'`, `'rs+'` (read/write, bypass local FS cache — for NFS mounts).

#### `fs.Dir` class — directory visitor

Returned by `fs.readdir()` (async). Supports async-iteration and manual walking:

```js
const dir = await sys.fs.readdir("folder");
for await (const { name, type } of dir) {
  // name: local file name+ext; type: ORed fs.UV_DIRENT_* flags
}
// or manually:
dir.path;      // original path
dir.next();    // advance
dir.close();   // release the handle
```

#### `copyfile()` flags

```js
await sys.fs.copyfile(src, dst, sys.fs.UV_FS_COPYFILE_EXCL);       // error if dst exists
await sys.fs.copyfile(src, dst, sys.fs.UV_FS_COPYFILE_FICLONE);      // reflink if supported, else falls back to copy
await sys.fs.copyfile(src, dst, sys.fs.UV_FS_COPYFILE_FICLONE_FORCE); // reflink or error (no fallback)
```

#### File Watching

```js
const watch = sys.fs.watch("path", (path, events) => {
    if (events & 0x01) console.log("renamed:", path);
    if (events & 0x02) console.log("changed:", path);
});
// Later: watch.close();
```

#### Path Utilities

```js
const [dir, file] = sys.fs.splitpath("/path/to/file.txt");
// dir = "/path/to", file = "file.txt"
```

#### Stat Structure

```js
{
    st_dev, st_ino, st_mode, st_nlink, st_uid, st_gid,
    st_size, st_blksize, st_blocks,
    st_atime, st_mtime, st_ctime, st_birthtime,
    isFile, isDirectory, isSymbolicLink
}
```

#### Type Flags

```js
sys.fs.S_IFDIR    // Directory
sys.fs.S_IFCHR    // Character device
sys.fs.S_IFBLK    // Block device
sys.fs.S_IFREG    // Regular file
sys.fs.S_IFLNK    // Symbolic link
sys.fs.S_IFSOCK   // Socket
sys.fs.S_IFIFO    // FIFO
```

### Network (TCP/UDP)

#### TCP Socket

> **⚠️ Unverified constructor.** `docs/md/JS.runtime/module-sys.md` documents the TCP socket *instance* methods below, but never shows how to construct one — no `new sys.Socket(...)` call, and no `AF_INET`/`SOCK_STREAM` constants appear anywhere in docs/ or samples/. Only `new sys.Pipe()` has a documented/sample-confirmed constructor for `@sys` networking. Treat the constructor line below as unconfirmed; the method calls that follow ARE documented.

```js
const socket = new sys.Socket(/* constructor unconfirmed */);

await socket.connect({ ip: "127.0.0.1", port: 8080 });
await socket.write(data);
const data = await socket.read();

// Server
await socket.bind({ ip: "0.0.0.0", port: 8080 });
await socket.listen();
const client = await socket.accept();

socket.close();
```

#### UDP Socket

> **⚠️ Unverified constructor** — see note above; the methods below are documented, the constructor is not.

```js
const socket = new sys.Socket(/* constructor unconfirmed */);

await socket.bind({ ip: "0.0.0.0", port: 8080 });
await socket.send(data, { ip: "127.0.0.1", port: 8080 });
const { data, addr } = await socket.recv();
```

#### Pipe (IPC)

Named-pipe/Unix-domain-socket style IPC. Same shape as TCP sockets but bind/connect take a name string instead of `{ip,port}`:

```js
const p = new sys.Pipe();
await p.connect("fooapp");        // Promise
console.log(p.getpeername());     // string

p.bind("fooapp");
p.listen([backlog]);
const client = await p.accept();  // Promise(Pipe)

p.read();                          // Promise(data)
p.write(data);                     // TypedArray | ArrayBuffer
p.getsockname();                   // string
p.fileno();
p.close();
```

#### TTY primitives

```js
tty.read();
tty.write(data);
tty.setMode(mode);
tty.getWinSize();   // -> terminal window size
tty.fileno();
tty.close();
```

### Process Execution (`sys.spawn`)

```js
const process = sys.spawn({
    command: "executable",
    args: ["arg1", "arg2"],
    cwd: "/working/dir"
});

process.pid;           // Process ID
await process.wait();  // Wait for completion
process.stdin.write(data);
const out = await process.stdout.read();
process.kill();
```

### Environment Utilities

```js
sys.cwd();             // Current working directory
sys.homedir();         // User home directory
sys.tmpdir();          // Temp directory
sys.exepath();         // Executable path

sys.getenv("VAR");     // Get env var
sys.setenv("VAR", "value");
sys.unsetenv("VAR");

sys.environ();         // All env vars as object
sys.uname();           // OS info
sys.hrtime();          // High-resolution time
sys.gettimeofday();    // Current time
sys.isatty(fd);        // Is TTY?
sys.random(bytes);     // Random bytes
```

---

## Module `@env`

Operating system and environment information.

```js
import * as env from "@env";
```

### Constants

| Constant | Type | Description |
|----------|------|-------------|
| `OS` | string | Full OS name, e.g., "Windows-11" |
| `PLATFORM` | string | Platform: "Windows", "OSX", "Linux", "Android" |
| `DEVICE` | string | "desktop" or "mobile" |

### Functions

```js
// Locale
env.language();        // "en", "zh", etc.
env.country();         // "US", "CN", etc.

// System info
env.userName();        // Current user name
env.machineName();     // Computer name
env.domainName();      // Network domain

// Command line
env.arguments();       // -> ["arg1", "arg2"]

// Launch applications
env.launch("https://sciter.com");  // Open URL
env.launch("/path/to/file.pdf");   // Open file

// Path resolution
env.home("relative/path");         // Resolve from exe dir
env.homeURL("relative/path");      // As file:// URL

// Well-known folders
env.path("desktop");       // Desktop folder
env.path("documents");     // Documents folder
env.path("downloads");     // Downloads folder
env.path("appdata");       // App data folder
env.path("home");          // Home folder
env.path("applications");  // Program files
env.path("root");          // File system root
env.path("music");         // Music folder
env.path("videos");        // Videos folder
env.path("pictures");      // Pictures folder


// Environment variables
env.variable("PATH");         // Get env var
env.variable("PATH", "value"); // Set env var
env.variable("PATH", null);   // Unset env var

// Execute command
env.exec("scapp.exe", "main.html");
```

---

## Module `@debug`

Debugging functions for Sciter Inspector integration.

```js
import * as debug from "@debug";
```

### Enabling Debug Mode

**C++:**
```cpp
SciterSetOption(nullptr, SCITER_SET_DEBUG_MODE, TRUE);
```

**Scapp:**
```bash
scapp main.htm --debug
```

**uSciter:** Click the cog icon to launch Inspector.

### Functions

#### Exception Handling

```js
debug.setUnhandledExceptionHandler((err) => {
    console.error(err.toString() + "\n" + err.stack);
});
```

#### Console Output Redirection

```js
debug.setConsoleOutputHandler((subsystem, severity, msg) => {
    log(subsystem, severity, msg);
    return true;
});
```

#### Call Stack Inspection

```js
const frame = debug.callStackAt(0);
// {
//   isNative: false,
//   functionName: "myFunction",
//   functionLineNo: 42,
//   fileName: "script.js",
//   lineNo: 45
// }
```

#### Element Inspection

```js
const uid = debug.getUIDofElement(el);
const el2 = debug.getElementByUID(uid);
debug.highlightElement(el);
debug.getStyleRulesOfElement(el);
```

#### Debug Helpers

```js
debug.setResourceArrivalHandler(fn);
debug.setBreakpointHandler(fn);
debug.setBreakpoints(...);
debug.containerId();
debug.objectKind(obj);
debug.sublimatedValue(val, expanded);
debug.sublimatedValueElements();
debug.frameVariables(frameId);
```

---

## Module `@storage`

Persistent key-value storage with indexing capabilities. Ideal for local data persistence.

```js
import * as Storage from "@storage";
import * as env from "@env";
```

### Opening a Database

```js
// Open or create database
const storage = Storage.open(env.path("documents") + "/myapp.db");
```

### Root Object and Initialization

```js
function initDb(storage) {
    storage.root = {
        version: 1,
        notesByDate: storage.createIndex("date", false), // non-unique index
        notesById: storage.createIndex("string", true)   // unique index
    };
    return storage.root;
}

// Get root or initialize if new
var root = storage.root || initDb(storage);
```

### Creating Indexed Collections

```js
// Create index
// createIndex(type, unique)
// types: "string", "date", "integer", etc.
// unique: true for unique keys, false for duplicates

const usersByName = storage.createIndex("string", true);
const usersByEmail = storage.createIndex("string", true);
const logsByDate = storage.createIndex("date", false);
```

### Working with Data

```js
// Add to index
root.usersByName.set("John Doe", userObject);
root.logsByDate.set(new Date(), logEntry);

// Get from index
const user = root.usersByName.get("John Doe");

// Delete from index
root.usersByName.delete("John Doe");

// Iterate — for(of) on an Index yields the stored OBJECTS (not [key,value] pairs),
// in ascending key order:
for (const user of root.usersByName) {
    console.log(user);
}
```

> Note: `index.get(key)` on a **unique** index returns a single object (or `null`/`undefined`). On a **non-unique** index it returns an **array** of objects under that key (empty array if none).

### Registering Classes with Storage

```js
class Note {
    constructor(text, date, id) {
        this.id = id || Sciter.uuid();
        this.date = date || new Date();
        this.text = text;

        // Add to storage indexes
        let root = storage.root;
        root.notesByDate.set(this.date, this);
        root.notesById.set(this.id, this);

        storage.commit();
    }

    delete() {
        let root = storage.root;
        root.notesByDate.delete(this.date, this);
        root.notesById.delete(this.id);
    }

    static getById(id) {
        return storage.root.notesById.get(id);
    }

    static all() {
        return root.notesByDate;
    }
}

// Register class so storage can restore prototypes
storage.registerClass(Note);
```

### Transaction Management

```js
// Manual commit
storage.commit();

// Close database (on page unload)
document.on("beforeunload", function() {
    root = undefined;
    storage.close();
});
```

### Complete Example: Notes Database

```js
import * as Storage from "@storage";
import * as env from "@env";

function initDb(storage) {
    storage.root = {
        version: 1,
        notesByDate: storage.createIndex("date", false),
        notesById: storage.createIndex("string", true)
    };
    return storage.root;
}

var storage = Storage.open(env.path("documents") + "/notes.db");
var root = storage.root || initDb(storage);

export class Note {
    constructor(text, date, id) {
        this.id = id || Sciter.uuid();
        this.date = date || new Date();
        this.text = text;

        let root = storage.root;
        root.notesByDate.set(this.date, this);
        root.notesById.set(this.id, this);
        storage.commit();

        document.post(new Event("new-note", { bubbles: true, data: this }));
    }

    delete() {
        let root = storage.root;
        root.notesByDate.delete(this.date, this);
        root.notesById.delete(this.id);
    }

    static getById(id) {
        return storage.root.notesById.get(id);
    }

    static all() {
        return root.notesByDate;
    }
}

storage.registerClass(Note);
```

### Storage Methods

| Method | Description |
|--------|-------------|
| `Storage.open(path)` | Open or create database file |
| `storage.close()` | Close database |
| `storage.commit()` | Commit changes to disk |
| `storage.createIndex(type, unique)` | Create indexed collection |
| `storage.registerClass(Class)` | Register class for prototype restoration |
| `storage.root` | Root object (initialize on first use) |

### Index Methods

| Method | Description |
|--------|-------------|
| `index.set(key, obj [, replace])` | Insert `obj` under `key`. For non-unique indexes with a duplicate key, `replace:true` replaces the existing item. Returns `true`/`false`. |
| `index.get(key)` | Get entry by key — single object for unique index, array of objects for non-unique index |
| `index.delete(key [, obj])` | Delete entry. `obj` required for non-unique indexes (to identify which item under that key); optional for unique indexes. Returns `true`/`false`. |
| `index.select(minKey, maxKey [, ascending=true [, startInclusive [, endInclusive]]])` | Returns an iterator over the range `[minKey..maxKey]`. Either bound can be `null` meaning "from first"/"to last". Use in `for..of`. |
| `index.clear()` | Removes all items, makes the index empty |
| `for..of index` | Iterate all entries in ascending key order (yields objects, not `[key,value]` pairs) |

### Index Properties

| Property | Description |
|----------|-------------|
| `index.length` | read-only integer, number of items in the index |
| `index.unique` | read-only boolean, `true` if declared as a unique index |
| `index.type` | read-only string, key type declared at creation: `"string"`, `"integer"`, `"long"`, `"float"`, `"date"` |

### Range Queries with `select()`

```js
// Get today's notes, newest first:
function getTodayNotes(storage) {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const notes = [];
    // ascending=false -> descending (newest first)
    for (const note of storage.root.notesByDate.select(yesterday, now, false)) {
        notes.push(note);
    }
    return notes;
}

// Unbounded range — from the very first key up to "today":
for (const note of storage.root.notesByDate.select(null, new Date())) { /* ... */ }
```

### Persistence Architecture (How It Works)

Storage is built on a modified DyBase engine integrated into QuickJS — every persistable JS object/array can carry a hidden persistence pointer. Key points:

- Only plain **Objects** and **Arrays** (plus `Storage.Index`) are persistable; functions/classes are never stored — only the *name* of a registered class is stored alongside instance data.
- Each persistent object is in one of four states: `JS_NOT_PERSISTENT`, `JS_PERSISTENT_DORMANT` (unloaded proxy-reference — no data in memory yet), `JS_PERSISTENT_LOADED` (data fetched from DB into the heap), `JS_PERSISTENT_MODIFIED` (changed by script, pending commit).
- Right after `storage.root` is read, nested collections are **not** loaded — they're lazy proxy-references. Touching a property (`root.parent.name`) transparently fetches that sub-object from disk into the heap.
- You never see or manage these proxy states directly — they're internal. Script only ever sees ordinary objects/arrays/indexes.
- **Auto-commit**: when the heap fills up, GC runs and replaces unreferenced persistent entities with dormant proxies again; any pending modifications are flushed (committed) to disk *at that point*. GC timing is not controllable by script.
- **Manual commit**: call `storage.commit()` after critical/complex changes to force an immediate synchronous save without waiting for GC.
- Limits: max ~2^32 persistent entities; each string/blob (ArrayBuffer) item can be up to 2^32 bytes.

---

## JS Unit Types (Length / Angle / Duration)

Sciter's JS parser accepts CSS-style unit literals directly as number+unit tokens (`12px`, `2rad`, `20ms`), producing special numeric-like objects. These types are used throughout the DOM/Graphics/CSS APIs (e.g. `style.width`, `document.timer()`).

### Length

```js
const width = 12px;
const fontSize = 10pt;
```

Units: `px`, `pt`, `em`, `ch`, `rem`, `ex`, `in`, `cm`, `mm`, `pc`, `vw`, `vh`, `vmin`, `vmax`, `pct`. Sciter-specific: `ppx` (physical/device pixels, always integer), `dip` (device-independent pixel, 1/96 inch — equals `px` in default config), `fx` (flex unit: `1fx` in script === `1*`/`width:*` in CSS).

Properties: `length.quantity:number` (e.g. `12` for `12px`), `length.units:string` (e.g. `"px"`).
Methods: `length.valueOf():number` (returns pixels), `length.toString():string`.

Static constructors: `Length.px(n)`, `Length.em(n)`, `Length.ex(n)`, `Length.pct(n)`, `Length.fx(n)`, `Length.in(n)`, `Length.cm(n)`, `Length.mm(n)`, `Length.pt(n)`, `Length.pc(n)`, `Length.dip(n)`, `Length.percentOfWidth(n)`, `Length.percentOfHeight(n)`, `Length.vw(n)`, `Length.vh(n)`, `Length.vmin(n)`, `Length.vmax(n)`, `Length.rem(n)`, `Length.ppx(n)`, `Length.ch(n)` — all return `length` values.

```js
Length.morph(from:Length, to:Length, ratio:0..1 [, element]):length
// interpolates from -> to; ratio 0 returns `from`, ratio 1 returns `to`
```

### Angle

```js
const sector = 12deg;
const rotation = 2rad;
```

Units: `rad` (radian), `deg` (degree), `grad` (gradian, 1/400 of full circle), `turn` (`1turn == 360deg`). `90deg == 100grad == 1.508rad`.

Properties: `angle.quantity`, `angle.units`. Methods: `angle.valueOf():number` (returns radians), `angle.toString()`.

Static constructors: `Angle.rad(n)`, `Angle.deg(n)`, `Angle.grad(n)`, `Angle.turn(n)`.

### Duration

```js
document.timer(20ms, function() { /* ... */ });
```

Units: `ms`, `s` (`mn`/`hr`/`da` are planned but not yet implemented).

Properties: `duration.quantity`, `duration.units`. Methods: `duration.valueOf():number` (returns milliseconds), `duration.toString()`.

Static constructors: `Duration.s(n)`, `Duration.ms(n)`.

### Common operators (Length / Angle / Duration all support)

```js
a * n     // multiply by number
a / n     // divide by number
a + b     // sum of two same-type values
a - b     // subtraction
a == b, a < b, a > b, a <= b, a >= b   // comparison
+a, -a    // unary plus/minus
++a, a++, --a, a--                     // increment/decrement
```

> Related 2D/color types documented elsewhere in this skill: `Point(x,y)`, `Size(w,h)`, `Rect(point,size)`, and `Color.RGB()`/`Color.rgb()` — see the Graphics API reference.

---

## Clipboard

```js
// Global `Clipboard` namespace — no import needed.

Clipboard.read(): ClipboardDataObject          // full data object (see below)
Clipboard.readText(): string | undefined       // text only, undefined if none

Clipboard.write(data: ClipboardDataObject): boolean
Clipboard.writeText(text: string): boolean

Clipboard.has(type: string): boolean
// type is one of: "text" | "html" | "image" | "file" | "json" | "link"
```

### Clipboard Data Object

Plain JS object, all fields optional:

```js
{
  text: "plain text",
  html: "<b>html fragment</b>",
  json: { any: "json-serializable value" },
  file: ["path0", "path1", ...],                     // list of file paths
  link: { caption: "Sciter", url: "https://sciter.com" },
  image: someGraphicsImage,                            // Graphics.Image object
}
```

```js
// Example: copy rich text + plain fallback
Clipboard.write({ text: "Hello", html: "<b>Hello</b>" });

// Example: paste handler
document.on("paste", (evt) => {
  if (Clipboard.has("image")) {
    const { image } = Clipboard.read();
    // use image...
  } else {
    const text = Clipboard.readText();
  }
});
```

---

## Fetch — Sciter-Specific Extensions

Sciter's `fetch()` follows the standard [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) shape (`fetch(url|Request, options): Promise(Response)`), plus these extras:

### Options extras

```js
fetch(url, {
  method: "GET",              // "GET" | "POST" | ...
  headers: { ... },           // string -> string map
  cache: "no-cache" | "reload" | "default",
  body: ...,                  // standard Fetch API body
  sync: true,                 // Sciter extra: perform SYNCHRONOUS retrieval
                               // (useful for local/resource data where blocking is fine)
});
```

### Request object — extra methods (beyond standard properties `cache`, `headers`, `method`, `url`)

```js
request.context   // requested data type: "html"|"image"|"style"|"cursor"|"script"|"data"|"font"|"audio"

request.abort()                           // try to abort the in-flight request
request.progress((bytesLoaded, totalBytes) => { /* ... */ });   // download progress callback
request.fulfill(data: ArrayBuffer, mime: string [, status: integer]);  // fake a server response
request.reject(status: integer);          // fake a server error/rejection
```

### Response object — extra property

```js
response.aborted   // boolean, true if request.abort() ended this request
```

> Note: with local `file://`/`home://` resources, response status codes come from the OS, not HTTP.

### Cancelable request pattern

```js
let request = new Request(url, options);

document.on("click", "button#abort", () => request.abort());

try {
  const response = await fetch(request);
  if (response.ok) { /* handle response */ }
  else if (response.status == 404) { /* not found */ }
} catch (response) {
  if (response.aborted) { /* user cancelled */ }
  else { /* other error, see response.status */ }
}
```

---

## Intl / i18n (Runtime Formatting APIs)

> This is distinct from **JSX i18n** (`@"..."`, `JSX_translateText`, compile-time translation hooks) documented elsewhere in this skill. These are runtime `Intl.*` and `Date`/`Number` locale-formatting methods.

### `Intl.NumberFormat`

```js
const nf = new Intl.NumberFormat(lang, { style: "currency" | "decimal" });
// lang: "xx" or "xx-yy" ISO language[-country], e.g. "de-AT"
nf.format(number): string
```

### `Intl.DateTimeFormat`

```js
const df = new Intl.DateTimeFormat(lang, options);  // options currently unused
df.format(date: Date): string

// Sciter-specific: render a month calendar view as HTML (like <input type="calendar">)
df.monthView(year: int, month: int /* 0..11 */, {
  today: Date,                // marks that day with .today class
  firstDayOfWeek: int,
  dayOfWeekLength: int,
  showWeekDays: bool,
  showMonth: bool,
  showYear: bool,
  dayClass: (day, month, year) => "class1.class2",   // extra dot-separated classes per cell
  dayContent: (day, month, year) => "innerHTML",       // custom cell content
}): string
```

### `Intl.Collator`

```js
const c = new Intl.Collator(lang, { sensitivity: "base" | "accent" | "case" | "variant" });
c.compare(a: string, b: string): -1 | 0 | 1
```

### `date.toLocaleDateString([locale], [options])` / `date.toLocaleTimeString([locale], [options])`

```js
date.toLocaleDateString(undefined, {
  timeZone: "UTC",                 // optional, treat date as UTC
  dateStyle: "short" | "long",     // system-default formatting
  format: "yyyy-MM-dd",            // or custom pattern, see field tables below
});
```

Date format fields: `d`/`dd` (day), `ddd`/`dddd` (weekday abbrev/full), `M`/`MM` (month digits), `MMM`/`MMMM` (month name abbrev/full), `y`/`yy`/`yyyy`/`yyyyy` (year), `g`/`gg` (era string).

Time format fields: `h`/`hh` (12h hour), `H`/`HH` (24h hour), `m`/`mm` (minutes), `s`/`ss` (seconds), `t`/`tt` (AM/PM marker, short/long).

### `number.toLocaleString([locale], [options])`

```js
n.toLocaleString(undefined, {
  style: "number" | "currency",
  maximumFractionDigits: 2,
  currency: "USD",
});
```

---

## Asset Class

`Asset` represents **native scriptable objects** defined by the host application or loadable native extensions (Sciter plugins/DLLs, e.g. sciter-sqlite). It has **no predefined instance properties or methods of its own** — everything is defined entirely in native code per asset class.

```js
Asset.instanceOf(obj, assetClassName: string): bool   // true if obj is a native asset of that class
Asset.typeOf(assetObj): string                          // native class name of the asset

// Example: sciter-sqlite's db.exec() returns a native "Recordset" asset
let rs = db.exec("select * from stocks order by price");
if (Asset.instanceOf(rs, "Recordset")) showRecordset(rs);
if (rs instanceof Asset && Asset.typeOf(rs) === "Recordset") showRecordset(rs);
```

---

## Comparison with Node.js

| Feature | Sciter `@sys` | Node.js |
|---------|---------------|---------|
| Async model | Promise (async/await) | Callback (historically) |
| File read | `await fs.readfile()` | `fs.readFile()` callback |
| Socket | `sys.Socket` class | `net.Socket` class |
| Spawn | `sys.spawn()` | `child_process.spawn()` |
| OS info | `@env` module | `os` module |
| Path | `sys.fs.splitpath()` | `path` module |

## Sciter-Specific Features

| Feature | Description |
|---------|-------------|
| `Window.send()` | Synchronous global event |
| `Window.post()` | Asynchronous global event |
| `sciter.onGlobalEvent()` | Cross-window communication |
| `sciter.devicePixels()` | DPI-aware pixel conversion |
| `sciter.parseValue()` | JSON++ with units |
| `sys.fs.watch()` | File/directory monitoring |
| `env.launch()` | Open URLs and files |
| `Graphics` | 2D drawing (see Graphics API reference) |
