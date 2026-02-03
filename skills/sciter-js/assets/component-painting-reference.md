# Element Extension & Animation Reference

Complete guide for extending Element class and implementing custom painting/animation.

## Part 1: Extending Element Class

Creating custom components by extending the built-in Element class.

### Basic Element Extension

```js
class MyComponent extends Element {
  // Class constructor (optional)
  constructor() {
    super();  // Always call super()
    // Initialize properties here
    this.value = 0;
  }

  // Called when component is mounted to DOM
  componentDidMount() {
    // Initialize timers, subscriptions, etc.
    // DOM methods are available at this point
  }

  // Called before component is removed from DOM
  componentWillUnmount() {
    // Cleanup: stop timers, remove subscriptions
  }

  // Render JSX content (for Reactor components)
  render() {
    return <div>
      <span>Value: {this.value}</span>
      <button #btn>Increment</button>
    </div>;
  }

  // Event handler (special syntax)
  ["on click at #btn"]() {
    this.value++;
    this.componentUpdate({ value: this.value });
  }
}
```

### CSS Assignment

Use `prototype` property to attach your class to elements:

```css
my-widget {
  prototype: MyWidget url(my-widget.js);
}

/* Or for specific elements */
.user-card {
  prototype: UserCard url(users.js);
}
```

### Component Lifecycle Summary

| Method | When Called | Purpose |
|--------|-------------|---------|
| `constructor()` | Object creation | Initialize properties |
| `componentDidMount()` | After DOM attachment | Setup timers, subscriptions |
| `componentWillUnmount()` | Before DOM removal | Cleanup resources |
| `this(props,kids)` | Props/kids received | Process new data |
| `render()` | Update needed | Return JSX virtual DOM |
| `componentUpdate(data)` | Called manually | Trigger re-render with new data |

### Event Handler Syntax

```js
class MyComponent extends Element {
  // Basic event
  ["on click"]() {
    console.log("clicked");
  }

  // Event with parameter
  ["on click"](evt) {
    console.log(evt.target);
  }

  // Event with selector (delegation)
  ["on click at button.close"]() {
    // Only clicks on button.close inside this component
  }

  // :root selector (component itself)
  ["on click at :root"]() {
    // Click on the component element itself
  }

  // Immediate child selector
  ["on click at :root > button"]() {
    // Only immediate button children
  }
}
```

### DOM Manipulation

```js
class MyComponent extends Element {
  componentDidMount() {
    // Method 1: Using JSX (React-style)
    this.content(<>
      <div>Hello <b>World</b></div>
      <button>Action</button>
    </>);

    // Method 2: Using DOM methods
    const div = document.createElement("div");
    div.textContent = "Hello";
    this.appendChild(div);

    // Method 3: Direct innerHTML
    this.innerHTML = "<div>Hello</div>";
  }
}
```

---

## Part 2: Custom Painting with paintContent()

Using Graphics API for immediate mode rendering and animation.

### Paint Layers

Element provides 4 paint hooks for different rendering layers:

```js
class MyComponent extends Element {
  // Behind background color
  paintBackground(gfx) {
    // Draw behind element's background
  }

  // On top of background, below content - MOST COMMON
  paintContent(gfx) {
    // Main custom drawing area
  }

  // On top of content
  paintForeground(gfx) {
    // Draw overlays
  }

  // On top of everything (borders, outlines)
  paintOutline(gfx) {
    // Draw decorative outlines
  }
}
```

### Basic Custom Painting

```js
class DrawWidget extends Element {
  componentDidMount() {
    // Start animation loop
    this.timer(16, () => this.animate());
  }

  animate() {
    this.refresh();  // Schedule repaint
    return true;     // Keep timer running
  }

  paintContent(gfx) {
    const { width, height } = this.box("dimension");

    // Clear background
    gfx.clearRect(0, 0, width, height);

    // Draw shapes
    gfx.fillStyle = Color.rgb(0.2, 0.4, 0.8);
    gfx.fillRect(10, 10, 100, 50);

    // Draw text
    gfx.fillStyle = Color.rgb(1, 1, 1);
    gfx.fillText("Hello!", 20, 40);
  }
}
```

### Animated Progress Bar

```js
class ProgressBar extends Element {
  progress = 0;  // 0 to 1

  componentDidMount() {
    this.timer(16, () => {
      this.progress += 0.01;
      if (this.progress > 1) this.progress = 0;
      this.refresh();
      return true;
    });
  }

  paintContent(gfx) {
    const { width, height } = this.box("dimension");

    // Background
    gfx.fillStyle = Color.rgb(0.9, 0.9, 0.9);
    gfx.fillRect(0, 0, width, height);

    // Progress fill
    gfx.fillStyle = Color.rgb(0.2, 0.6, 0.2);
    gfx.fillRect(0, 0, width * this.progress, height);

    // Border
    gfx.strokeStyle = Color.rgb(0.3, 0.3, 0.3);
    gfx.lineWidth = 1;
    gfx.strokeRect(0, 0, width, height);

    // Text
    const percent = Math.round(this.progress * 100);
    const text = new Graphics.Text(`${percent}%`, "font: 12px system");

    gfx.draw(text, {
      x: width / 2,
      y: height / 2,
      alignment: 5,  // center
      fill: Color.rgb(1, 1, 1)
    });
  }
}
```

### Rotating Animation

```js
class Spinner extends Element {
  angle = 0;

  componentDidMount() {
    this.timer(16, () => {
      this.angle += 0.05;
      this.refresh();
      return true;
    });
  }

  paintContent(gfx) {
    const { width, height } = this.box("dimension");

    // Save state before transform
    gfx.save();

    // Move to center
    gfx.translate(width / 2, height / 2);

    // Rotate
    gfx.rotate(this.angle);

    // Draw spinner
    const path = new Graphics.Path();
    path.moveTo(0, -20);
    path.arc(0, 0, 20, 0, Math.PI * 1.5);

    gfx.lineCap = "round";
    gfx.lineWidth = 4;
    gfx.strokeStyle = Color.rgb(0.3, 0.6, 1.0);
    gfx.stroke(path);

    // Restore state
    gfx.restore();
  }
}
```

### Gradient Animation

```js
class GradientBox extends Element {
  offset = 0;

  componentDidMount() {
    this.timer(50, () => {
      this.offset = (this.offset + 0.01) % 1;
      this.refresh();
      return true;
    });
  }

  paintContent(gfx) {
    const { width, height } = this.box("dimension");

    // Create animated gradient
    const brush = Graphics.Brush.createLinearGradient(
      this.offset * width, 0,
      (this.offset + 1) * width, 0
    );
    brush.addColorStop(0, Color.rgb(1, 0, 0));
    brush.addColorStop(0.5, Color.rgb(0, 1, 0));
    brush.addColorStop(1, Color.rgb(0, 0, 1));

    gfx.fillStyle = brush;
    gfx.fillRect(0, 0, width, height);
  }
}
```

### Particle System

```js
class ParticleSystem extends Element {
  particles = [];

  componentDidMount() {
    // Initialize particles
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * 300,
        y: Math.random() * 200,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 2
      });
    }

    this.timer(16, () => this.animate());
  }

  animate() {
    const { width, height } = this.box("dimension");

    // Update particles
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    }

    this.refresh();
    return true;
  }

  paintContent(gfx) {
    const { width, height } = this.box("dimension");

    // Clear with semi-transparent black for trails
    gfx.fillStyle = Color.rgb(0, 0, 0, 0.1);
    gfx.fillRect(0, 0, width, height);

    // Draw particles
    for (const p of this.particles) {
      gfx.fillStyle = Color.hsv(Math.random() * 360, 1, 1);
      gfx.beginPath();
      gfx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      gfx.fill();
    }
  }
}
```

---

## Part 3: Advanced Painting Techniques

### Layer Clipping

```js
class ClippedWidget extends Element {
  paintContent(gfx) {
    const { width, height } = this.box("dimension");

    // Clip to rounded rectangle
    const clipPath = new Graphics.Path();
    clipPath.roundRect(10, 10, width - 20, height - 20, 10);

    gfx.pushLayer(clipPath);

    // Content is clipped to rounded rect
    for (let i = 0; i < 10; i++) {
      gfx.fillStyle = Color.hsv(i * 36, 0.7, 0.9);
      gfx.fillRect(10, i * 20, width - 20, 18);
    }

    gfx.popLayer();
  }
}
```

### Text Effects

```js
class TextEffects extends Element {
  paintContent(gfx) {
    // Create styled text
    const text = new Graphics.Text("Sciter", "font: 48px system");

    // Shadow
    gfx.fillStyle = Color.rgb(0, 0, 0, 0.3);
    gfx.draw(text, { x: 52, y: 52 });

    // Gradient fill
    const brush = Graphics.Brush.createLinearGradient(0, 0, 200, 0);
    brush.addColorStop(0, Color.rgb(1, 0, 0));
    brush.addColorStop(1, Color.rgb(0, 0, 1));

    gfx.draw(text, {
      x: 50,
      y: 50,
      fill: brush
    });
  }
}
```

### Image Sprites

```js
class SpriteRenderer extends Element {
  frame = 0;

  componentDidMount() {
    this.spriteSheet = null;

    Graphics.Image.load("sprites.png").then(img => {
      this.spriteSheet = img;
      this.timer(100, () => {
        this.frame = (this.frame + 1) % 4;
        this.refresh();
        return true;
      });
    });
  }

  paintContent(gfx) {
    if (!this.spriteSheet) return;

    const spriteSize = 32;
    const x = this.frame * spriteSize;

    // Draw sprite from sheet
    gfx.draw(this.spriteSheet, {
      x: 0,
      y: 0,
      width: spriteSize,
      height: spriteSize,
      srcX: x,
      srcY: 0,
      srcWidth: spriteSize,
      srcHeight: spriteSize
    });
  }
}
```

### Offscreen Rendering

```js
class CachedRenderer extends Element {
  cached = null;

  componentDidMount() {
    // Pre-render complex content
    this.cached = new Graphics.Image(200, 100, (g) => {
      // Expensive drawing happens once
      for (let i = 0; i < 100; i++) {
        g.fillStyle = Color.hsv(i * 3.6, 0.7, 0.9);
        g.fillRect(i * 2, 0, 2, 100);
      }
    });
  }

  paintContent(gfx) {
    // Draw cached image (much faster)
    gfx.draw(this.cached, { x: 0, y: 0 });
  }
}
```

---

## Part 4: Common Patterns

### Combining Reactor + Custom Painting

```js
class HybridComponent extends Element {
  state = { value: 50 };
  dragging = false;

  // Reactor-style JSX rendering for structure
  render() {
    return <div .hybrid>
      <label>Value: {this.state.value}</label>
      <input #slider type="hslider" min="0" max="100" value={this.state.value} />
    </div>;
  }

  componentDidMount() {
    // Subscribe to input changes
    this.$("#slider").on("change", () => {
      this.state.value = parseInt(this.$("#slider").value);
      this.componentUpdate();
      this.refresh();  // Trigger paintContent repaint
    });
  }

  // Custom painting for visualization
  paintContent(gfx) {
    const { width, height } = this.box("dimension");
    const barHeight = (this.state.value / 100) * height;

    // Draw visual bar
    const hue = (this.state.value / 100) * 120;  // 0-120 (red to green)
    gfx.fillStyle = Color.hsv(hue, 0.7, 0.9);
    gfx.fillRect(0, height - barHeight, width, barHeight);
  }
}
```

### Interactive Canvas

```js
class InteractiveCanvas extends Element {
  points = [];

  componentDidMount() {
    this.on("mousedown", (evt) => {
      this.points.push({ x: evt.x, y: evt.y });
      this.refresh();
    });
  }

  paintContent(gfx) {
    const { width, height } = this.box("dimension");

    // Draw grid
    gfx.strokeStyle = Color.rgb(0.8, 0.8, 0.8);
    gfx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      gfx.beginPath();
      gfx.moveTo(x, 0);
      gfx.lineTo(x, height);
      gfx.stroke();
    }

    // Draw points and lines
    if (this.points.length > 0) {
      gfx.fillStyle = Color.rgb(1, 0, 0);
      gfx.strokeStyle = Color.rgb(0, 0, 1);
      gfx.lineWidth = 2;

      gfx.beginPath();
      gfx.moveTo(this.points[0].x, this.points[0].y);
      for (const p of this.points) {
        gfx.lineTo(p.x, p.y);
        gfx.fillRect(p.x - 3, p.y - 3, 6, 6);
      }
      gfx.stroke();
    }
  }
}
```

---

## Tips and Best Practices

### Performance

1. **Use `refresh()` to schedule repaint** - don't call paint methods directly
2. **Pre-render static content** to offscreen images
3. **Avoid creating new objects in paint loop** - reuse paths, brushes
4. **Use `requestAnimationFrame` equivalent** - `this.timer(16, fn)` for ~60fps

### Debugging

```js
class DebugWidget extends Element {
  paintContent(gfx) {
    const { width, height } = this.box("dimension");

    // Debug: draw box outline
    gfx.strokeStyle = Color.rgb(1, 0, 0);
    gfx.lineWidth = 1;
    gfx.strokeRect(0, 0, width, height);

    // Debug: draw dimensions
    gfx.fillStyle = Color.rgb(0, 0, 0);
    gfx.font = "10px monospace";
    gfx.fillText(`${width}x${height}`, 5, 15);
  }
}
```

### Common Mistakes

| Wrong | Right |
|-------|--------|
| Direct property mutation: `this.val = 1` | Use `componentUpdate({ val: 1 })` |
| Forgetting `super()` in constructor | Always call `super()` first |
| Creating Graphics objects in loop | Create once, reuse |
| Not calling `refresh()` after state change | Always `refresh()` to repaint |
| Using `this` before componentDidMount | DOM methods only available after mount |
