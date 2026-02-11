# Sciter.js AI Skill Project

## Overview

This project is dedicated to creating an **AI SKILL.md** that teaches AI agents how to develop desktop applications using **Sciter.js**.

Sciter.js is an embeddable HTML/CSS/JS engine for modern UI development, distinct from standard web browsers (Chrome/V8) and Node.js. It uses the **QuickJS** engine and provides its own set of runtime APIs and CSS extensions tailored for desktop applications.

## Branch Structure

This repository maintains documentation for different versions of Sciter.js:

-   **Branch `5`**: Targets **Sciter.js 5.0** (Current Stable). Focuses on established APIs and patterns.
-   **Branch `6`**: Targets **Sciter.js 6.0** (Future/Beta). Focuses on upcoming features and changes in the new version.

## Key Differences & AI Context

AI agents must understand that Sciter.js is **NOT** a standard web environment or Node.js environment. Key distinctions include:

### 1. JavaScript Runtime (QuickJS)
-   **Engine**: Runs on **QuickJS**, not V8.
-   **Compliance**: Supports ES2020 standards comprehensively.
-   **Performance**: Optimized for small footprint and fast startup, not JIT-heavy operations.

### 2. CSS Layout & Extensions
-   **Flow Layout**: Sciter's native layout engine uses the `flow:` property (e.g., `flow: vertical`, `flow: horizontal`, `flow: stack`), which is often more concise and performant than Flexbox/Grid for desktop UI, though standard Flexbox/Grid are also supported.
-   **Units**: Supports **`dip`** (device-independent pixels) and **flex units** (`*`, `1*`, `2*`) natively in CSS for fluid sizing (e.g., `width: *` fills available space).
-   **Behaviors**: CSS `behavior:` property binds C++ or JS classes to DOM elements (e.g., `behavior: button` or `behavior: clickable`).
-   **Scripting**: CSS can include `priority: high` and other Sciter-specific attributes.

### 3. JSX & Reactor (Built-in)
-   **Native Support**: JSX and the **Reactor** component system (React-like) are built DIRECTLY into the engine. No Babel/Webpack transpilation is required for JSX.
-   **API**: Similar to React (`componentDidMount`, `render`, etc.), but implemented natively for performance.
-   **State Management**: Includes native observable/signal support.

### 4. System APIs (Vs Node.js)
-   **No Node Modules**: Does **NOT** support Node.js built-in modules like `fs`, `path`, `http` directly.
-   **`@sys` Module**: Uses the `@sys` module (based on libuv) for file system (`sys.fs`), sockets (`sys.net`), and process management.
    -   *Example*: Use `import * as sys from "@sys"` instead of `require('fs')`.
-   **`@env` Module**: Provides OS environment integration (paths, machine info, launch commands).
-   **`@sciter` Module**: Provides Sciter-specific runtime utilities (UUID, base64, etc.).

## Usage

This repository generates the `SKILL.md` file located in `skills/sciter-js/`. AI agents should consume that file to learn specific syntax, patterns, and best practices for generating Sciter.js code.

## Using with Design Skills

When using this skill alongside general **Frontend Design** advice (aesthetics, UX patterns), you must strictly prioritize Sciter's implementation rules.

**Prompt Pattern:**

> "Design a [Component] using [Frontend Style] aesthetics, but **IMPLEMENT** it using strict Sciter.js rules."

**Conflict Resolution Guide:**

| Concept | Frontend Design (Aesthetic) | Sciter.js (Implementation) |
| :--- | :--- | :--- |
| **Layout** | "Use Flexbox/Grid" | **CSS**: Use `flow: horizontal`, `flow: vertical`, or `flow: grid()`. Use flex units (`width: *`) instead of `flex-grow`. |
| **Sizing** | "Use `rem`/`em`" | **CSS**: Use `dip` (device-independent pixels). |
| **Components** | "Use React/Vue" | **JS**: Use native **Reactor** (`class X extends Element`). Native `componentUpdate()`. |
| **Interactive** | "Add event listeners" | **CSS/JS**: Use **Behaviors** (`behavior: button`, `behavior: clickable`) for native performance. |
| **Icons** | "Use SVG / FontAwesome" | **CSS**: Use `behavior: icon` or `list-style-image` with Sciter's efficient path rendering. |

**Rule of Thumb**: Use Frontend Design for *what it looks like*, use Sciter.js for *how it works*.
