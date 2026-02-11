# Sciter C++ Integration Reference

When building Sciter apps with a native C++ backend, use this reference alongside the main [SKILL.md](./SKILL.md).

## Architecture Pattern

### C++ Entry Point (uimain)

Always use `uimain()` as entry point — never `main()` or `WinMain()`:

```cpp
int uimain(std::function<int()> run) {
    // 1. Configure script runtime options
    UINT script_options = ALLOW_FILE_IO | ALLOW_SOCKET_IO | ALLOW_SYSINFO;
    SciterSetOption(nullptr, SCITER_SET_SCRIPT_RUNTIME_FEATURES, script_options);

    // 2. Load resources (archive or local file)
    sciter::string appBaseUrl;
#ifdef LOCAL_MODE
    appBaseUrl = Path2Url(GetAppPath() + L"/ui/main.htm");
#else
    sciter::archive::instance().open(aux::elements_of(resources));
    appBaseUrl = WSTR("this://app/main.htm");
#endif

    // 3. Create window and set as global asset
    sciter::om::hasset<mainWnd> pMainWnd = new mainWnd();
    SciterSetGlobalAsset(pMainWnd);

    // 4. Load UI
    pMainWnd->load(appBaseUrl.c_str());

    return run();
}
```

### Window Class Pattern

All window classes must:
1. Extend `sciter::window`
2. Use constructor with window flags: `SW_TITLEBAR | SW_RESIZEABLE | SW_CONTROLS | SW_MAIN | SW_ENABLE_DEBUG`
3. Define asset interface via `SOM_PASSPORT`

```cpp
class mainWnd : public sciter::window {
public:
    mainWnd() : window(SW_TITLEBAR | SW_RESIZEABLE | SW_CONTROLS | SW_MAIN | SW_ENABLE_DEBUG) {}

    // Native functions exposed to JS
    std::string stringSum(const std::string a, const std::string b) { return a + "+" + b; }

    // Virtual properties
    int get_windowHandle() { return (int)(intptr_t)get_hwnd(); }

    // Asset interface - call as Window.this.assetInterface.functionName()
    SOM_PASSPORT_BEGIN_EX(assetInterface, mainWnd)
        SOM_FUNCS(SOM_FUNC(stringSum))
        SOM_PROPS(SOM_RO_VIRTUAL_PROP(windowHandle, get_windowHandle))
    SOM_PASSPORT_END

    // Alternative: named call handler
    BEGIN_FUNCTION_MAP
    FUNCTION_1("xcallTest", xcallTest);
    END_FUNCTION_MAP

    sciter::value xcallTest(sciter::value data) {
        return data.get<int>() * 2;
    }
};
```

## C++ to JS Communication

### SOM_PASSPORT Pattern (Recommended)

Expose methods via `SOM_PASSPORT` — call from JS as `Window.this.assetInterface.methodName()`:

```cpp
SOM_PASSPORT_BEGIN_EX(assetInterface, mainWnd)
    SOM_FUNCS(
        SOM_FUNC(method1)
        SOM_FUNC(method2)
    )
    SOM_PROPS(
        SOM_RO_VIRTUAL_PROP(propName, get_propName)
    )
SOM_PASSPORT_END
```

### BEGIN_FUNCTION_MAP Pattern

For named calls via `Window.this.xcall("name", args...)`:

```cpp
BEGIN_FUNCTION_MAP
    FUNCTION_1("functionName", cppFunction)
END_FUNCTION_MAP
```

### Value Conversion

```cpp
// Primitives
sciter::value val_int(42);
sciter::value val_str(L"Hello");
sciter::value val_bool(true);

// Objects
sciter::value obj;
obj.set_item("key", value);

// Arrays
std::vector<sciter::value> vec;
sciter::value arr = sciter::value::from_list(vec);
```

## JS to C++ Communication

```javascript
// SOM_PASSPORT exposed
let result = Window.this.assetInterface.stringSum("a", "b");

// BEGIN_FUNCTION_MAP
let result = Window.this.xcall("xcallTest", 42);

// Access virtual properties
let handle = Window.this.assetInterface.windowHandle;
```

## Custom C++ Behaviors

```cpp
struct MyBehavior : public sciter::event_handler {
    virtual bool subscription(HELEMENT he, UINT& event_groups) {
        event_groups = HANDLE_DRAW | HANDLE_TIMER;
        return true;
    }

    virtual void attached(HELEMENT he) { /* ... */ }
    virtual void detached(HELEMENT he) { /* ... */ }
    virtual bool handle_timer(HELEMENT he, TIMER_PARAMS& params) { /* ... */ }
    virtual bool handle_draw(HELEMENT he, DRAW_PARAMS& params) { /* ... */ }

    SOM_PASSPORT_BEGIN_EX(assetInterface, MyBehavior)
        SOM_FUNCS(SOM_FUNC(start))
    SOM_PASSPORT_END
};
```

## Async Operations with Promises

```cpp
class NativePromise : public sciter::om::asset<NativePromise> {
    sciter::value resolver;
    sciter::value rejector;

public:
    sciter::value then(sciter::value r, sciter::value rej) {
        resolver = r;
        rejector = rej;
        return this;
    }

    void resolve(const sciter::value& result) {
        resolver.call(result);
    }
};
```

## Build Configuration

### CMake Requirements

- Minimum CMake 3.20.0
- C++17 standard
- Platform-specific configurations for macOS/Windows

```cmake
add_definitions(-DUNICODE -D_UNICODE)
if(LOCALMODE)
    add_definitions(-DLOCAL_MODE)
endif()

find_package(spdlog CONFIG REQUIRED)
find_package(fmt CONFIG REQUIRED)
```

### Resource Loading

**Local Mode (Development):**
```cpp
#define LOCAL_MODE
```

**Archive Mode (Production):**
```cpp
#include "resources.cpp"
sciter::archive::instance().open(aux::elements_of(resources));
appBaseUrl = WSTR("this://app/main.htm");
```

## gsciter (Minimal Integration)

For a simpler approach — single source file, all platforms:

```cpp
#include "sciter-x-window.hpp"

class gSciter: public sciter::window {
public:
    gSciter() : window(SW_TITLEBAR | SW_RESIZEABLE | SW_CONTROLS | SW_MAIN) {}
};

int uimain(std::function<int()> run) {
    ::SciterSetOption(NULL, SCITER_SET_SCRIPT_RUNTIME_FEATURES,
                      ALLOW_FILE_IO | ALLOW_SOCKET_IO | ALLOW_EVAL | ALLOW_SYSINFO);

    sciter::archive::instance().open(aux::elements_of(resources));

    sciter::om::hasset<gSciter> pwin = new gSciter();
    pwin->load(WSTR("this://app/default.htm"));

    return run();
}
```

| Use Case | Approach |
|----------|----------|
| Simple browser-style apps | gsciter pattern |
| Complex native integration | Full window class + SOM_PASSPORT |
