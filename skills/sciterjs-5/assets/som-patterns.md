# SOM_PASSPORT Patterns Reference

Complete reference for Sciter Object Model (SOM) passport patterns and C++/JS bridging.

> **⚠️ Verification caveat.** This repo's ground truth (`docs/md/`, `samples/`) is JS-focused and contains no C++ SDK header/reference material — a fact-check pass could only confirm the basic `SOM_PASSPORT_BEGIN_EX`/`SOM_FUNCS`/`SOM_FUNC`/`SOM_PROPS`/`SOM_RO_VIRTUAL_PROP`/`BEGIN_FUNCTION_MAP`/`FUNCTION_1`/`END_FUNCTION_MAP` macros directly (via real working code in `startup/src/mainWnd.h` and `assets/template/src/mainWnd.h`). Everything else below — `sciter::value` conversion helpers, async/Promise patterns, and asset-lifecycle methods — could not be checked against any source in this repo and should be verified against the actual Sciter C++ SDK headers before relying on exact names/signatures.

## SOM_PASSPORT Basics

### Basic Function Exposure

```cpp
class MyClass : public sciter::om::asset<MyClass> {
public:
    // Simple function
    std::string greet(const std::string& name) {
        return "Hello, " + name;
    }

    // Multiple arguments
    int add(int a, int b) {
        return a + b;
    }

    SOM_PASSPORT_BEGIN_EX(assetInterface, MyClass)
        SOM_FUNCS(
            SOM_FUNC(greet)
            SOM_FUNC(add)
        )
    SOM_PASSPORT_END
};
```

### Properties (Read/Write)

```cpp
class MyClass : public sciter::om::asset<MyClass> {
    std::string m_name;

public:
    // Getter
    std::string get_name() { return m_name; }

    // Setter
    void set_name(const std::string& val) { m_name = val; }

    SOM_PASSPORT_BEGIN_EX(assetInterface, MyClass)
        SOM_PROPS(
            SOM_PROP(name, get_name, set_name)
        )
    SOM_PASSPORT_END
};
```

### Read-Only Virtual Properties

```cpp
class MyClass : public sciter::om::asset<MyClass> {
public:
    int get_windowHandle() {
        return (int)(intptr_t)get_hwnd();
    }

    int get_version() {
        return 100;
    }

    SOM_PASSPORT_BEGIN_EX(assetInterface, MyClass)
        SOM_PROPS(
            SOM_RO_VIRTUAL_PROP(windowHandle, get_windowHandle)
            SOM_RO_VIRTUAL_PROP(version, get_version)
        )
    SOM_PASSPORT_END
};
```

### Named Functions (BEGIN_FUNCTION_MAP)

```cpp
class MyClass : public sciter::window {
public:
    BEGIN_FUNCTION_MAP
        FUNCTION_0("noArgs", noArgsFunction)
        FUNCTION_1("oneArg", oneArgFunction)
        FUNCTION_2("twoArgs", twoArgsFunction)
        FUNCTION_V("varArgs", varArgsFunction)
    END_FUNCTION_MAP

    sciter::value noArgsFunction() {
        return sciter::value("no args");
    }

    sciter::value oneArgFunction(sciter::value arg1) {
        return arg1;
    }

    sciter::value twoArgsFunction(sciter::value arg1, sciter::value arg2) {
        // Process two arguments
        return sciter::value();
    }

    sciter::value varArgsFunction(const sciter::value& argv, unsigned int argc) {
        // argv is an array of arguments
        return sciter::value();
    }
};
```

## Value Conversion Patterns

### Creating Values

```cpp
// Primitives
sciter::value v_int(42);
sciter::value v_float(3.14f);
sciter::value v_bool(true);
sciter::value v_str(L"Hello");
sciter::value v_str_utf8("UTF-8 string");

// Empty/null
sciter::value v_null; // undefined
sciter::value v_undefined = sciter::value::make_undefined();
```

### Objects

```cpp
sciter::value obj;
obj.set_item("name", sciter::value("John"));
obj.set_item("age", sciter::value(30));
obj.set_item("active", sciter::value(true));

// Nested objects
sciter::value address;
address.set_item("city", sciter::value("NYC"));
obj.set_item("address", address);
```

### Arrays

```cpp
// From vector
std::vector<sciter::value> vec;
vec.push_back(sciter::value(1));
vec.push_back(sciter::value(2));
vec.push_back(sciter::value(3));
sciter::value arr = sciter::value::from_list(vec);

// Using make_array
sciter::value arr2 = sciter::value::make_array(
    sciter::value("a"),
    sciter::value("b"),
    sciter::value("c")
);
```

### Map (Key-Value Object)

```cpp
std::map<std::string, sciter::value> map;
map["key1"] = sciter::value("value1");
map["key2"] = sciter::value("value2");
sciter::value obj = sciter::value::from_map(map);
```

### Date/Time

```cpp
// Current time
sciter::value now = sciter::value::make_date(time(nullptr));

// Specific time
sciter::value date = sciter::value::make_date(timestamp);
```

### Currency

```cpp
sciter::value money = sciter::value::make_currency(1234.56, "USD");
```

## Reading Values from JS

### Type Checking

```cpp
sciter::value val = /* from JS */;

if (val.is_undefined()) { }
if (val.is_null()) { }
if (val.is_bool()) { }
if (val.is_int()) { }
if (val.is_float()) { }
if (val.is_string()) { }
if (val.is_date()) { }
if (val.is_currency()) { }
if (val.is_object()) { }
if (val.is_array()) { }
if (val.is_function()) { }
if (val.is_bytes()) { }
if (val.is_asset()) { }
```

### Getting Primitive Values

```cpp
int i = val.get<int>();
double d = val.get<double>();
bool b = val.get<bool>();
std::wstring ws = val.get<std::wstring>();
std::string s = val.get<std::string>(); // UTF-8
```

### Accessing Objects

```cpp
if (val.is_object()) {
    sciter::value keys = val.get_keys();
    sciter::value prop = val.get_item("property");

    // Check if key exists
    bool hasKey = val.get_item("key").is_undefined();
}
```

### Accessing Arrays

```cpp
if (val.is_array()) {
    int len = val.length();
    for (int i = 0; i < len; i++) {
        sciter::value item = val.get_item(i);
    }
}
```

## Calling JS Functions

### Calling Global JS Function

```cpp
sciter::value result = call_function("functionName", arg1, arg2);
```

### Calling Element Method

```cpp
sciter::dom::element el = ...;
sciter::value result = el.call_method("methodName", args);
```

### Calling Function Value

```cpp
sciter::value func = /* get function from somewhere */;
sciter::value result = func.call(arg1, arg2);
```

## Event Handling

### Sending Events to JS

```cpp
// Synchronous
sciter::dom::element::root_element().send_event(
    CUSTOM_EVENT_TYPE,
    sciter::value::make_asset(data)
);

// Asynchronous (post)
sciter::dom::element::root_element().post_event(
    CUSTOM_EVENT_TYPE,
    sciter::value::make_asset(data)
);
```

### Subscribing to DOM Events

Override event handlers in window or behavior class:

```cpp
virtual bool handle_event(HELEMENT he, BEHAVIOR_EVENT_PARAMS& params) {
    switch (params.cmd) {
        case BUTTON_CLICK:
            // Handle button click
            return true;
        case EDIT_VALUE_CHANGED:
            // Handle text input change
            return true;
        case SUBMIT:
            // Handle form submission
            return true;
    }
    return false;
}
```

## Async Operations

### Promise Pattern

```cpp
class NativePromise : public sciter::om::asset<NativePromise> {
    sciter::value m_resolver;
    sciter::value m_rejector;

public:
    sciter::value then(sciter::value resolver, sciter::value rejector) {
        m_resolver = resolver;
        m_rejector = rejector;
        return this;
    }

    void resolve(const sciter::value& result) {
        if (!m_resolver.is_undefined()) {
            m_resolver.call(result);
        }
    }

    void reject(const sciter::value& error) {
        if (!m_rejector.is_undefined()) {
            m_rejector.call(error);
        }
    }

    SOM_PASSPORT_BEGIN_EX(assetInterface, NativePromise)
        SOM_FUNCS(SOM_FUNC(then))
    SOM_PASSPORT_END
};
```

### Returning Promise from Native Function

```cpp
sciter::value asyncFunction() {
    auto* promise = new NativePromise();
    promise->asset_add_ref();

    // Start async operation...
    std::thread([promise]() {
        // Do work
        promise->resolve(sciter::value("result"));
        promise->asset_release();
    }).detach();

    return sciter::value::wrap_asset(promise);
}
```

## Asset Lifecycle

### Reference Counting

```cpp
class MyAsset : public sciter::om::asset<MyAsset> {
public:
    MyAsset() {
        asset_add_ref(); // Increment ref count
    }

    ~MyAsset() {
        // Cleanup
    }
};
```

### Exposing Asset to JS

```cpp
// Wrap existing asset
sciter::value val = sciter::value::make_asset(myAssetInstance);

// Create and wrap
auto* asset = new MyAsset();
asset->asset_add_ref();
sciter::value val = sciter::value::wrap_asset(asset);
```

## Thread Safety

### GUI Thread Operations

Always update UI from GUI thread:

```cpp
// From worker thread
sciter::application::yield([]() {
    // This runs on GUI thread
    updateUI();
});
```

### Thread-Safe Value Access

Use `sciter::value` copies when passing between threads. Values are immutable when created.
