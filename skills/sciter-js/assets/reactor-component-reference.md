# Reactor (JSX) Component Reference

Complete reference for Sciter's built-in Reactor: JSX, components, and virtual DOM.

## What is Reactor?

Reactor is Sciter's **native** implementation of React-like features:
- **JSX** - Built into the language (no transpilation needed)
- **Virtual DOM** - `element.patch(jsx)` for efficient DOM updates

Unlike ReactJS, Reactor is:
- Native to SciterJS (no library to load)
- Lightweight (just JSX + `patch()`)
- Integrated with real DOM elements

---

## JSX Basics

### JSX Literals

```js
// JSX is a native part of SciterJS
const element = <div>Hello World</div>;

// Fragments
const fragment = <>
  <div>One</div>
  <div>Two</div>
</>;

// With expressions
const name = "World";
const greeting = <div>Hello {name}</div>;
```

### Spread Attributes

```js
const props = { id: "myId", class: "my-class" };
const element = <div {...props}>Content</div>;
```

### Attribute Quoting

```js
// CSS class
const el = <div .header>...</div>;

// ID
const el = <div #main>...</div>;

// Combined
const el = <div #main .header.active>...</div>;

// Dynamic class
const active = true;
const el = <div class={active ? "active" : ""}>...</div>;
```

### Event Handlers

```js
// Inline
<button onclick="handler()">Click</button>

// With reference
<button click={handler}>Click</button>

// Stop propagation
<button click={evt => { evt.stopPropagation(); handler(); }}>
  Click
</button>
```

---

## Function Components

Simplest way to create components:

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// Usage
document.body.patch(<Welcome name="World" />);
```

### Component Parameters

```js
function MyComponent(props, kids, parent) {
  // props: attributes object
  // kids: array of child VNodes
  // parent: parent DOM element

  return <div>
    {props.title}
    {kids}  // Render children
  </div>;
}

// Usage:
<MyComponent title="Header">
  <div>Child content</div>
</MyComponent>
```

### Destructuring Props

```js
function Button({ label, variant = "primary", onClick }) {
  return <button class={`btn btn-${variant}`} click={onClick}>
    {label}
  </button>;
}

// Usage
<Button label="Click me" variant="danger" click={() => console.log("clicked")} />
```

---

## Class Components

Extending Element for full lifecycle control:

```js
class Clock extends Element {
  time = new Date();

  componentDidMount() {
    this.timer(1000, () => {
      this.componentUpdate({ time: new Date() });
      return true;
    });
  }

  render() {
    return <div>
      <h2>It is {this.time.toLocaleTimeString()}</h2>
    </div>;
  }
}
```

### Constructor

```js
class MyComponent extends Element {
  constructor(props, kids, parent) {
    super();  // Always call super() first
    // Initialize state
    this.count = 0;
    // Don't call render() here
  }
}
```

### The `this()` Method

Called when props/kids change:

```js
class MyComponent extends Element {
  this(props, kids) {
    // Process new props and kids
    super.this(props, kids);  // Call super for default processing

    // Store for later use
    this.props = props;
    this.kids = kids;
  }

  render() {
    return <div>{this.props.title}</div>;
  }
}
```

### Required Methods

| Method | Required | Purpose |
|--------|----------|---------|
| `render()` | Yes | Return JSX virtual DOM |
| `constructor()` | No | Initialize state |
| `this()` | No | Process props/kids |

---

## Component Lifecycle

### Lifecycle Order

```
1. constructor(props, kids)
2. this(props, kids)
3. render(props, kids)
4. componentDidMount()  // Real DOM ready
```

### Update Lifecycle

```
Parent re-renders OR componentUpdate() called:
1. this(props, kids)  // if parent update
2. render(props, kids)
3. componentDidUpdate()  // only if componentUpdate() caused it
```

### Unmount

```
1. componentWillUnmount()
2. Element removed from DOM
```

### Lifecycle Methods in Detail

```js
class LifecycleDemo extends Element {
  constructor() {
    super();
    console.log("1. constructor");
  }

  this(props, kids) {
    console.log("2. this() - props changed");
    super.this(props, kids);
  }

  render() {
    console.log("3. render()");
    return <div>Demo</div>;
  }

  componentDidMount() {
    console.log("4. componentDidMount - DOM ready");
    // Setup timers, subscriptions
  }

  componentDidUpdate() {
    console.log("5. componentDidUpdate - after update");
    // Post-render adjustments (focus, scroll)
  }

  componentWillUnmount() {
    console.log("6. componentWillUnmount - cleanup");
    // Stop timers, remove subscriptions
  }
}
```

---

## State Management

### Component State Pattern

```js
class Counter extends Element {
  count = 0;  // State property

  componentDidMount() {
    this.renderContent();
  }

  increment() {
    // WRONG: Direct mutation
    // this.count++;

    // CORRECT: Use componentUpdate
    this.componentUpdate({ count: this.count + 1 });
  }

  renderContent() {
    this.patch(<div>
      <span>Count: {this.count}</span>
      <button click={() => this.increment()}>+</button>
    </div>);
  }

  render() {
    return <div>
      <span>Count: {this.count}</span>
      <button click={() => this.componentUpdate({ count: this.count + 1 })}>
        +
      </button>
    </div>;
  }
}
```

### componentUpdate() Behavior

```js
// componentUpdate merges properties
this.componentUpdate({ count: 1 });
this.componentUpdate({ name: "Test" });
// Both count and name are updated in single render

// Without arguments, just triggers render
this.componentUpdate();
```

---

## Rendering and Patching

### element.patch(jsx)

Primary method for DOM updates:

```js
// Initial render
const root = document.$("#root");
root.patch(<div>Hello</div>);

// Update
root.patch(<div>Hello World</div>);

// Replace entire content
root.patch(<>
  <h1>Title</h1>
  <p>Content</p>
</>);
```

### element.content(jsx)

Replace element's content:

```js
// Replaces all children
el.content(<div>New Content</div>);

// Appends JSX
el.content(<div>Additional</div>);
```

### Efficient Updates

```js
function Timer() {
  const time = new Date().toLocaleTimeString();
  return <div>{time}</div>;
}

// Only text node is updated, not entire div
setInterval(() => {
  document.$("#timer").patch(<Timer />);
}, 1000);
```

---

## Lists and Keys

### Rendering Lists

```js
function List({ items }) {
  return <ul>
    {items.map(item => <li>{item.name}</li>)}
  </ul>;
}

// Usage
<List items={[
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" }
]} />
```

### Using Keys

```js
function TodoList({ todos }) {
  return <ul>
    {todos.map(todo =>
      <li key={todo.id}>
        {todo.text}
      </li>
    )}
  </ul>;
}
```

**Why keys matter:** Keys help Reactor identify which items changed:

```js
// WITHOUT keys - entire list re-renders
{items.map(item => <li>{item.name}</li>)}

// WITH keys - only changed items update
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

---

## Component Composition

### Parent-Child Communication

```js
// Parent passes data via props
function Parent() {
  const data = { name: "John", age: 30 };
  return <Child {...data} />;
}

function Child({ name, age }) {
  return <div>{name} is {age} years old</div>;
}
```

### Child to Parent (Callback)

```js
function Parent() {
  function handleMessage(message) {
    console.log("Child says:", message);
  }

  return <Child onSend={handleMessage} />;
}

function Child({ onSend }) {
  return <button click={() => onSend("Hello from child")}>
    Send Message
  </button>;
}
```

### Slots (Children)

```js
function Card({ title, children }) {
  return <div .card>
    <h3>{title}</h3>
    <div .content>{children}</div>
  </div>;
}

// Usage
<Card title="Welcome">
  <p>This is the card content</p>
  <button>Action</button>
</Card>
```

---

## Conditional Rendering

### Inline Conditionals

```js
function Welcome({ user }) {
  return <div>
    {user ? <h1>Welcome, {user.name}</h1> : <h1>Please log in</h1>}
  </div>;
}
```

### Element Variables

```js
function WarningBanner({ warn }) {
  if (!warn) {
    return null;
  }

  return <div .warning>Warning!</div>;
}
```

### Short-circuit Evaluation

```js
function Messages({ messages }) {
  return <div>
    {messages.length > 0 && <h2>You have {messages.length} messages</h2>}
    {messages.map(msg => <p>{msg}</p>)}
  </div>;
}
```

---

## DOM Component vs Reactor Component

### DOM Component (prototype)

```css
my-widget {
  prototype: MyWidget url(widget.js);
}
```

```js
// widget.js
class MyWidget extends Element {
  componentDidMount() {
    // Initialize DOM structure
    this.content(<div>Widget Content</div>);
  }

  ["on click"]() {
    console.log("clicked");
  }
}
```

**Use when:** Creating reusable UI elements with custom behavior

### Reactor Component

```js
class MyComponent extends Element {
  render() {
    return <div>Component Content</div>;
  }
}

// Usage
document.body.patch(<MyComponent />);
```

**Use when:** Functional components, state-driven UI

---

## Reactor vs ReactJS Differences

| Feature | ReactJS | Sciter Reactor |
|---------|---------|---------------|
| JSX | Requires transpiler | Native to language |
| `this` in components | Separate from DOM | IS the DOM element |
| State | `useState()` hook | Direct properties |
| Updates | `setState()` | `componentUpdate()` |
| Virtual DOM | In JS library | Native implementation |
| Bundle size | ~100KB | Zero (built-in) |

---

## Common Patterns

### Higher-Order Component

```js
function withLoading(WrappedComponent) {
  return function(props) {
    if (props.loading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
}

// Usage
const UserProfileWithLoading = withLoading(UserProfile);
<UserProfileWithLoading loading={true} />
```

### Render Props

```js
function DataProvider({ children, fetchData }) {
  const [data, setData] = componentState(null);

  componentDidMount() {
    fetchData().then(setData);
  }

  return children(data);
}

// Usage
<DataProvider fetchData={() => fetch("/api/data")}>
  {data => data ? <Display data={data} /> : <div>Loading</div>}
</DataProvider>
```

### Compound Components

```js
function Tabs({ children, activeTab }) {
  return <div .tabs>
    {children.map(child =>
      child.patch({ activeTab })
    )}
  </div>;
}

function Tab({ label, activeTab, current }) {
  const isActive = activeTab === current;
  return <button class={isActive ? "active" : ""}>
    {label}
  </button>;
}

// Usage
<Tabs activeTab="home">
  <Tab current="home" label="Home" />
  <Tab current="about" label="About" />
</Tabs>
```

---

## Signals (Reactive State)

### Basic Signal

```js
import { signal, computed, effect } from "@reactor";

const count = signal(0);
const doubled = computed(() => count.value * 2);

effect(() => {
  console.log(`Count: ${count.value}, Doubled: ${doubled.value}`);
});

count.value++;  // Triggers effect
```

### Signal in Component

```js
class Counter extends Element {
  count = signal(0);

  render() {
    return <div>
      <span>Count: {this.count.value}</span>
      <button click={() => this.count.value++}>
        Increment
      </button>
    </div>;
  }
}
```

---

## Internationalization (i18n)

### Built-in i18n

```js
// Define translations
const translations = {
  en: { greeting: "Hello" },
  zh: { greeting: "你好" },
  ja: { greeting: "こんにちは" }
};

// Use in JSX
function Greeting({ lang }) {
  return <div>
    ~{ translations[lang].greeting }~
  </div>;
}

// At runtime
Window.this.setLocale("zh");
```

---

## Best Practices

### DO

```js
// Use keys for lists
{items.map(item => <li key={item.id}>{item.name}</li>)}

// Use componentUpdate for state changes
this.componentUpdate({ value: newValue });

// Destructure props
function Button({ label, onClick }) { }

// Use fragments
<><div>One</div><div>Two</div></>
```

### DON'T

```js
// Don't mutate state directly
this.value = 1;  // WRONG

// Don't forget keys in lists
{items.map(item => <li>{item.name}</li>)}  // WRONG

// Don't create functions in render
<button click={() => this.doSomething()} />  // Creates new function each render

// Instead, bind once or use class methods
["on click"]() { this.doSomething(); }
```
