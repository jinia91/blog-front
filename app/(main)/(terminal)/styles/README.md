# Retro CRT Terminal Design System

An authentic retro terminal design system for modern web applications, featuring phosphor glow, scanlines, screen curvature, and other classic CRT monitor effects.

## Features

- **6 Authentic Color Themes** - Green phosphor, amber, blue, white, and Apple II styles
- **Phosphor Glow Effects** - Multiple intensity levels with authentic text glow
- **Scanline Rendering** - Horizontal raster lines with optional animation
- **Screen Curvature** - Subtle barrel distortion like real CRT monitors
- **Vignette Effect** - Edge falloff for authentic monitor darkness
- **Multiple Cursor Styles** - Block, underline, and bar cursors with blinking
- **Boot Sequences** - Typewriter-style system initialization text
- **Film Grain & Noise** - Subtle texture overlays for aged monitor feel
- **Performance Optimized** - CSS-based effects, minimal JavaScript
- **Accessibility** - Respects `prefers-reduced-motion`
- **Tailwind Compatible** - Works seamlessly with Tailwind CSS

## Quick Start

### 1. Import the Styles

The terminal.css is already imported in your `globals.css`:

```css
@import '../../../app/(main)/(terminal)/styles/terminal.css';
```

### 2. Basic Usage

```jsx
<div className="terminal-classic terminal-padded">
  <p className="terminal-text terminal-glow">
    Hello, World!<span className="terminal-cursor-block"></span>
  </p>
</div>
```

### 3. Using React Components

```jsx
import { ClassicTerminal, TerminalPrompt, TerminalText } from './styles/example-component';

export default function MyPage() {
  return (
    <ClassicTerminal>
      <TerminalText>Welcome to the retro terminal</TerminalText>
      <TerminalPrompt cursorType="block" />
    </ClassicTerminal>
  );
}
```

## Files

| File | Purpose |
|------|---------|
| `terminal.css` | Core CSS design system (13KB) |
| `TERMINAL_GUIDE.md` | Comprehensive usage documentation |
| `example-component.tsx` | React component examples |
| `demo.html` | Visual showcase of all effects |
| `README.md` | This file |

## Color Themes

| Theme Class | Colors | Inspired By |
|-------------|--------|-------------|
| `terminal-theme-green` | Green on black | IBM 5151 |
| `terminal-theme-amber` | Amber on dark brown | Classic amber monitors |
| `terminal-theme-blue` | Cyan on dark blue | Commodore 64 |
| `terminal-theme-white` | White on black | Modern terminals |
| `terminal-theme-phosphor` | Bright green on black | Apple II |
| `terminal-theme-apple` | Light green on black | Apple II refined |

## Core Effects

### Phosphor Glow
```html
<p class="terminal-glow">Standard glow</p>
<p class="terminal-glow-strong">Intense glow</p>
<p class="terminal-glow-subtle">Subtle glow</p>
```

### Scanlines
```html
<div class="terminal-scanlines">Standard scanlines</div>
<div class="terminal-scanlines-thick">Thick scanlines</div>
<div class="terminal-scanlines-animated">Moving scanlines</div>
```

### Screen Curvature
```html
<div class="terminal-curved">Subtle curve</div>
<div class="terminal-curved-strong">Strong curve</div>
```

### Vignette
```html
<div class="terminal-vignette">Edge darkening</div>
<div class="terminal-vignette-strong">Strong vignette</div>
```

### Additional Effects
```html
<div class="terminal-noise">Film grain</div>
<div class="terminal-flicker-subtle">Power fluctuation</div>
<div class="terminal-bloom">Phosphor bloom</div>
<div class="terminal-reflection">Glass reflection</div>
```

## Cursor Styles

```html
<span class="terminal-cursor-block"></span>     <!-- █ -->
<span class="terminal-cursor-underline"></span> <!-- _ -->
<span class="terminal-cursor-bar"></span>       <!-- | -->
```

All cursors blink by default. Add `terminal-cursor-solid` to disable blinking.

## Prompt Styles

```html
<p class="terminal-prompt">Command</p>           <!-- > Command -->
<p class="terminal-prompt-unix">Command</p>      <!-- $ Command -->
<p class="terminal-prompt-dos">Command</p>       <!-- C:\> Command -->
<p class="terminal-prompt-c64">Command</p>       <!-- READY.\n> Command -->
```

## Preset Combinations

Pre-configured combinations for common retro looks:

```html
<!-- Classic IBM PC green phosphor monitor -->
<div class="terminal-classic">
  <!-- Green + glow + scanlines + vignette + curve -->
</div>

<!-- Amber CRT monitor -->
<div class="terminal-amber-monitor">
  <!-- Amber theme with full CRT effects -->
</div>

<!-- Commodore 64 -->
<div class="terminal-commodore">
  <!-- Blue + strong glow + border -->
</div>

<!-- Apple II -->
<div class="terminal-apple-ii">
  <!-- Bright green + thick scanlines -->
</div>

<!-- Modern minimal retro -->
<div class="terminal-modern-retro">
  <!-- White + subtle effects -->
</div>
```

## React Components

### Terminal
```jsx
<Terminal theme="green" effects={['glow', 'scanlines', 'vignette']}>
  <TerminalText>Hello, World!</TerminalText>
</Terminal>
```

### Terminal with Monitor Frame
```jsx
<TerminalMonitor theme="amber" showPowerLed>
  <BootSequence messages={[
    'SYSTEM STARTING...',
    'LOADING MODULES...',
    'READY.'
  ]} />
  <TerminalPrompt cursorType="block" />
</TerminalMonitor>
```

### Typewriter Effect
```jsx
<TypewriterText
  text="Welcome to the retro terminal..."
  speed={50}
/>
```

### Interactive Terminal
```jsx
<InteractiveTerminal />
```

See `example-component.tsx` for full component implementations.

## Customization

Override CSS variables to customize colors and effects:

```css
.my-custom-terminal {
  --terminal-fg: #00ff00;
  --terminal-bg: #0a0a0a;
  --terminal-glow: #00ff00;
  --terminal-scanline-opacity: 0.15;
  --terminal-vignette-strength: 0.8;
}
```

## Complete Example

```jsx
import { TerminalMonitor, BootSequence, CommandOutput, TerminalPrompt } from './styles/example-component';

export default function TerminalPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <TerminalMonitor theme="green" bezelThickness="thick" showPowerLed>

        {/* Boot sequence */}
        <BootSequence messages={[
          'RETRO OS v1.0',
          'COPYRIGHT 2026 JINN CORP',
          '128K RAM SYSTEM READY'
        ]} />

        {/* Command output */}
        <CommandOutput
          command="ls -la"
          output={[
            'drwxr-xr-x  5 user  staff   160 Jan 23 22:00 .',
            '-rw-r--r--  1 user  staff  1024 Jan 23 21:45 README.txt',
            '-rwxr-xr-x  1 user  staff  4096 Jan 23 20:15 app.exe'
          ]}
        />

        {/* Active prompt */}
        <TerminalPrompt cursorType="bar" promptStyle="unix" />

      </TerminalMonitor>
    </div>
  );
}
```

## Accessibility

All animations and effects respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disables flicker, scanline animation, boot typewriter, and cursor blinking */
}
```

Users who have enabled reduced motion will see static versions of all effects.

## Performance Considerations

1. **Use preset combinations** instead of stacking many individual effect classes
2. **Avoid `terminal-bloom`** on large areas (uses CSS filters)
3. **Prefer `terminal-scanlines`** over `terminal-scanlines-animated`
4. **Limit `terminal-noise-animated`** to smaller elements
5. All effects use CSS transforms and filters for GPU acceleration

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **CSS Features Required**:
  - CSS Custom Properties (variables)
  - CSS Filters (for bloom effect)
  - CSS Animations
  - Radial gradients
  - Multiple box-shadows

## Design Philosophy

This design system prioritizes **authenticity over perfection**. The effects are calibrated to recreate the actual visual characteristics of CRT monitors from the 1980s and early 1990s:

- **Phosphor glow**: Based on P1, P3, and P4 phosphor types
- **Scanlines**: Match the horizontal raster pattern of 240p-480p displays
- **Screen curvature**: Subtle barrel distortion typical of curved CRT glass
- **Vignette**: Phosphor brightness falloff at screen edges
- **Color themes**: Authentic monitor phosphor colors (not idealized)

## Inspiration

- IBM 5151 Green Phosphor Monitor
- Amber CRT terminals (late 1970s - early 1980s)
- Commodore 64 (blue background, blocky cursor)
- Apple II (bright green text)
- DOS era PCs
- Classic Unix terminals

## Demo

Open `demo.html` in a browser to see all effects in action:

```bash
open app/\(main\)/\(terminal\)/styles/demo.html
```

Or use a local server:

```bash
npx serve app/\(main\)/\(terminal\)/styles/
```

## Examples by Use Case

### Blog Post Header
```jsx
<ClassicTerminal>
  <TerminalText glow="strong" className="text-2xl font-bold">
    Welcome to my blog
  </TerminalText>
  <TerminalText>Est. 2026</TerminalText>
</ClassicTerminal>
```

### Code Block
```jsx
<AmberMonitor>
  <TerminalText className="font-mono">
    <span className="opacity-60">// Example code</span><br/>
    function hello() &#123;<br/>
    &nbsp;&nbsp;console.log("Hello, World!");<br/>
    &#125;
  </TerminalText>
</AmberMonitor>
```

### Loading State
```jsx
<Terminal theme="blue" effects={['glow', 'flicker']}>
  <TerminalText>
    Loading<span className="terminal-cursor-block"></span>
  </TerminalText>
</Terminal>
```

### Error Message
```jsx
<Terminal theme="amber" effects={['glow', 'scanlines']}>
  <TerminalText glow="strong">ERROR: Connection timeout</TerminalText>
  <TerminalText>Please try again later</TerminalText>
</Terminal>
```

## License

Part of the blog-front project.

## Support

For issues or questions about the terminal design system:
1. Check `TERMINAL_GUIDE.md` for detailed documentation
2. Review `example-component.tsx` for implementation examples
3. Open `demo.html` to see all effects visually
