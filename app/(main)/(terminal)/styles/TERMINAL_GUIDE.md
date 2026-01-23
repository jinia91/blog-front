# Retro CRT Terminal Design System

An authentic retro terminal design system with phosphor glow, scanlines, and CRT effects.

## Quick Start

### Basic Terminal Container

```jsx
<div className="terminal-container terminal-classic terminal-padded">
  <p className="terminal-text terminal-glow">
    Hello, World!<span className="terminal-cursor-block"></span>
  </p>
</div>
```

## Color Themes

Apply one theme class to your container:

| Theme | Class | Description |
|-------|-------|-------------|
| Classic Green | `terminal-theme-green` | IBM 5151 phosphor green |
| Amber | `terminal-theme-amber` | Warm amber monitor |
| Blue | `terminal-theme-blue` | Commodore 64 style |
| White | `terminal-theme-white` | Modern monochrome |
| Phosphor Green | `terminal-theme-phosphor` | Bright Apple II green |
| Apple | `terminal-theme-apple` | Classic Apple II |

## CRT Effects

### Phosphor Glow

```jsx
<p className="terminal-glow">Standard glow</p>
<p className="terminal-glow-strong">Intense glow</p>
<p className="terminal-glow-subtle">Subtle glow</p>
```

### Screen Curvature

```jsx
<div className="terminal-curved">Subtle curve</div>
<div className="terminal-curved-strong">Strong curve</div>
```

### Scanlines

```jsx
<div className="terminal-scanlines">Standard scanlines</div>
<div className="terminal-scanlines-thick">Thick scanlines</div>
<div className="terminal-scanlines-animated">Moving scanlines</div>
```

### Vignette

```jsx
<div className="terminal-vignette">Standard vignette</div>
<div className="terminal-vignette-strong">Strong vignette</div>
```

### Additional Effects

```jsx
<div className="terminal-flicker">Subtle flicker</div>
<div className="terminal-bloom">Phosphor bloom</div>
<div className="terminal-noise">Film grain</div>
<div className="terminal-reflection">Glass reflection</div>
```

## Cursors

### Cursor Types

```jsx
<span className="terminal-cursor-block"></span>     {/* █ block */}
<span className="terminal-cursor-underline"></span> {/* _ underline */}
<span className="terminal-cursor-bar"></span>       {/* | bar */}
```

### Cursor Variants

```jsx
<span className="terminal-cursor-block terminal-cursor-solid">
  {/* Non-blinking */}
</span>
```

## Text Styles

### Prompt Styles

```jsx
<p className="terminal-prompt">Command here</p>
<p className="terminal-prompt-dos">DOS command</p>
<p className="terminal-prompt-unix">Unix command</p>
<p className="terminal-prompt-c64">C64 style</p>
```

### Text Enhancements

```jsx
<p className="terminal-text">Standard terminal text</p>
<p className="terminal-text-bold">Bold with extra glow</p>
```

## Boot Sequence

```jsx
<div className="terminal-boot-container">
  <p className="terminal-boot-text">SYSTEM INITIALIZING...</p>
  <p className="terminal-boot-text" style={{ animationDelay: '2.5s' }}>
    LOADING MODULES...
  </p>
  <p className="terminal-boot-text-fast" style={{ animationDelay: '4s' }}>
    READY.
  </p>
</div>
```

## Bezel & Chrome

Add a monitor frame around your terminal:

```jsx
<div className="terminal-bezel">
  <div className="terminal-screen terminal-classic">
    {/* Your terminal content */}
  </div>
</div>
```

```jsx
<div className="terminal-bezel-thick">
  {/* Thicker retro bezel */}
</div>
```

## Power LED

```jsx
<div className="terminal-power-led"></div>          {/* Green */}
<div className="terminal-power-led-amber"></div>    {/* Amber */}
```

## Preset Combinations

Pre-configured combinations for common looks:

```jsx
<div className="terminal-classic">
  {/* Green phosphor + glow + scanlines + vignette + curve */}
</div>

<div className="terminal-amber-monitor">
  {/* Amber theme with CRT effects */}
</div>

<div className="terminal-commodore">
  {/* Commodore 64 style */}
</div>

<div className="terminal-apple-ii">
  {/* Apple II style */}
</div>

<div className="terminal-modern-retro">
  {/* Modern minimal retro */}
</div>
```

## Complete Example

```jsx
<div className="terminal-bezel">
  <div className="terminal-screen terminal-theme-green terminal-curved terminal-scanlines terminal-vignette terminal-noise terminal-glow terminal-padded">

    {/* Power LED */}
    <div className="absolute top-4 right-4">
      <div className="terminal-power-led"></div>
    </div>

    {/* Boot sequence */}
    <div className="terminal-boot-container mb-4">
      <p className="terminal-boot-text">
        RETRO TERMINAL v1.0
      </p>
      <p className="terminal-boot-text" style={{ animationDelay: '2s' }}>
        COPYRIGHT 1985 ACME CORP
      </p>
      <p className="terminal-boot-text" style={{ animationDelay: '3.5s' }}>
        64K RAM SYSTEM  38911 BASIC BYTES FREE
      </p>
    </div>

    {/* Terminal content */}
    <div className="space-y-2">
      <p className="terminal-prompt terminal-text">
        LIST<span className="terminal-cursor-block"></span>
      </p>
      <p className="terminal-text terminal-glow-subtle">
        10 PRINT "HELLO WORLD"
      </p>
      <p className="terminal-text terminal-glow-subtle">
        20 GOTO 10
      </p>
    </div>
  </div>
</div>
```

## CSS Variables

Customize the effects by overriding CSS variables:

```css
.my-custom-terminal {
  --terminal-fg: #00ff00;
  --terminal-bg: #0a0a0a;
  --terminal-glow: #00ff00;
  --terminal-scanline-opacity: 0.15;
  --terminal-vignette-strength: 0.8;
}
```

## Accessibility

All animations respect `prefers-reduced-motion`. When reduced motion is enabled:
- Flicker effects are disabled
- Scanline animations stop
- Boot animations are disabled
- Cursors remain solid

## Performance Tips

1. **Use preset combinations** rather than stacking many individual effects
2. **Avoid `terminal-bloom` on large areas** (uses filter, can be GPU-intensive)
3. **Use `terminal-scanlines`** instead of `terminal-scanlines-animated` for better performance
4. **Limit `terminal-noise-animated`** to smaller elements

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS custom properties required
- CSS filters for bloom effect
- Animation support for full experience

## Examples by Use Case

### Command Line Interface
```jsx
<div className="terminal-classic terminal-padded">
  <p className="terminal-prompt-unix terminal-text">
    npm run dev<span className="terminal-cursor-bar"></span>
  </p>
</div>
```

### Retro Game
```jsx
<div className="terminal-commodore terminal-bordered terminal-padded">
  <p className="terminal-text-bold terminal-glow-strong">
    GAME OVER
  </p>
  <p className="terminal-text">SCORE: 42000</p>
</div>
```

### System Monitor
```jsx
<div className="terminal-amber-monitor terminal-padded">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="terminal-text-bold">CPU: 42%</p>
      <p className="terminal-text-bold">MEM: 3.2GB</p>
    </div>
  </div>
</div>
```

### Nostalgic Blog
```jsx
<div className="terminal-modern-retro terminal-padded">
  <h1 className="terminal-text-bold terminal-glow text-2xl mb-4">
    Welcome to my blog
  </h1>
  <p className="terminal-text">
    Est. 2025<span className="terminal-cursor-underline"></span>
  </p>
</div>
```
