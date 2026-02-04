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

// Send global events from C++ or JS:
// Window.send("custom-event", data);  // synchronous
// Window.post("custom-event", data);  // asynchronous
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
sciter.parseValue("0d2021-12-01"); // Date
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
await sys.fs.writeFile("path.txt", data);
await sys.fs.copyfile("src", "dst");
await sys.fs.unlink("path.txt");             // Delete file
await sys.fs.rename("old", "new");

// Sync versions
sys.fs.readFileSync("path.txt");
sys.fs.writeFileSync("path.txt", data);
```

#### Directory Operations

```js
await sys.fs.mkdir("folder", 0o755);
await sys.fs.rmdir("folder");
await sys.fs.readdir("folder");  // -> [{name, type}, ...]
await sys.fs.stat("path");       // -> stat object
await sys.fs.realpath("path");   // -> canonicalized path
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

```js
const socket = new sys.Socket(sys.AF_INET, sys.SOCK_STREAM);

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

```js
const socket = new sys.Socket(sys.AF_INET, sys.SOCK_DGRAM);

await socket.bind({ ip: "0.0.0.0", port: 8080 });
await socket.send(data, { ip: "127.0.0.1", port: 8080 });
const { data, addr } = await socket.recv();
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

// Drives
env.drives();         // -> ["C:", "D:"] on Windows

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

// Iterate
for (const [key, value] of root.usersByName) {
    console.log(key, value);
}
```

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
| `index.set(key, value)` | Add/update entry |
| `index.get(key)` | Get entry by key |
| `index.delete(key)` | Delete entry |
| `index.delete(key, value)` | Delete specific entry (for non-unique) |
| `for..of` | Iterate over entries |

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
