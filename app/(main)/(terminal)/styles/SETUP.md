# Setup Instructions

## Installation Complete

The Retro CRT Terminal Design System has been installed in your project.

## Files Created

```
app/(main)/(terminal)/styles/
├── terminal.css                (13KB) - Core CSS design system
├── TERMINAL_GUIDE.md           (6.9KB) - Comprehensive usage guide
├── example-component.tsx       (9.9KB) - React component examples
├── demo.html                   (19KB) - Visual showcase
├── test-integration.tsx        (6.5KB) - Integration test page
├── README.md                   (9.5KB) - Project documentation
└── SETUP.md                    (this file)
```

## Integration Status

✅ `terminal.css` imported in `src/styles/globals.css`  
✅ All CSS classes available globally  
✅ Works with existing Tailwind CSS  
✅ Compatible with Next.js 13+ App Router  

## Quick Test

### Option 1: Use the HTML Demo

```bash
open app/\(main\)/\(terminal\)/styles/demo.html
```

### Option 2: Create a Test Page

Copy `test-integration.tsx` to your app directory:

```bash
cp app/\(main\)/\(terminal\)/styles/test-integration.tsx app/terminal-test/page.tsx
```

Then visit: `http://localhost:3000/terminal-test`

### Option 3: Use in Any Component

```jsx
import React from 'react';

export default function MyComponent() {
  return (
    <div className="terminal-classic terminal-padded">
      <p className="terminal-text terminal-glow">
        Hello, Retro World!<span className="terminal-cursor-block"></span>
      </p>
    </div>
  );
}
```

## Preset Classes (Copy & Paste Ready)

```html
<!-- Classic IBM PC green monitor -->
<div class="terminal-classic terminal-padded">
  <p class="terminal-text terminal-glow">Your text here</p>
</div>

<!-- Amber CRT monitor -->
<div class="terminal-amber-monitor terminal-padded">
  <p class="terminal-text terminal-glow">Your text here</p>
</div>

<!-- Commodore 64 -->
<div class="terminal-commodore terminal-padded">
  <p class="terminal-text-bold terminal-glow-strong">Your text here</p>
</div>

<!-- Apple II -->
<div class="terminal-apple-ii terminal-padded">
  <p class="terminal-text terminal-glow">Your text here</p>
</div>

<!-- Modern minimal retro -->
<div class="terminal-modern-retro terminal-padded">
  <p class="terminal-text terminal-glow-subtle">Your text here</p>
</div>
```

## Using React Components

1. Copy `example-component.tsx` to your components directory
2. Import and use:

```jsx
import { ClassicTerminal, TerminalText, TerminalPrompt } from '@/components/terminal';

export default function Page() {
  return (
    <ClassicTerminal>
      <TerminalText>Welcome!</TerminalText>
      <TerminalPrompt cursorType="bar" />
    </ClassicTerminal>
  );
}
```

## CSS Variables for Customization

Override these in your component or CSS file:

```css
.my-terminal {
  --terminal-fg: #00ff00;              /* Text color */
  --terminal-bg: #0a0a0a;              /* Background */
  --terminal-glow: #00ff00;            /* Glow color */
  --terminal-scanline-opacity: 0.1;    /* Scanline darkness (0-1) */
  --terminal-vignette-strength: 0.6;   /* Edge darkness (0-1) */
}
```

## Next Steps

1. ✅ Read `TERMINAL_GUIDE.md` for detailed documentation
2. ✅ Check `example-component.tsx` for React examples
3. ✅ Open `demo.html` to see all effects visually
4. ✅ Test with `test-integration.tsx` in your app

## Troubleshooting

### Styles not loading?

Check that `src/styles/globals.css` contains:

```css
@import '../../../app/(main)/(terminal)/styles/terminal.css';
```

### Effects not visible?

1. Ensure parent has a background color
2. Check browser console for CSS errors
3. Verify CSS is being loaded in DevTools

### Animations not working?

Check if `prefers-reduced-motion` is enabled in system settings.

### Cursor not blinking?

Make sure you're using the correct cursor class:
- `terminal-cursor-block`
- `terminal-cursor-underline`
- `terminal-cursor-bar`

## Support

- **Full Documentation**: See `TERMINAL_GUIDE.md`
- **Examples**: See `example-component.tsx`
- **Visual Reference**: Open `demo.html`

## Design System Overview

**6 Color Themes**
- Classic Green, Amber, Blue, White, Phosphor, Apple

**Core Effects**
- Phosphor Glow (3 intensities)
- Scanlines (standard, thick, animated)
- Screen Curvature (subtle, strong)
- Vignette (standard, strong)
- Film Grain & Noise
- Flicker & Bloom
- Glass Reflection

**3 Cursor Types**
- Block (█)
- Underline (_)
- Bar (|)

**4 Prompt Styles**
- Generic (>)
- Unix ($)
- DOS (C:\>)
- Commodore (READY.)

**5 Preset Combinations**
- terminal-classic
- terminal-amber-monitor
- terminal-commodore
- terminal-apple-ii
- terminal-modern-retro

## Performance

All effects are CSS-based and GPU-accelerated. No JavaScript required for basic usage.

## Accessibility

Respects `prefers-reduced-motion` - all animations disabled for users who need them.

---

**Installation Complete** 🎉

Start using the retro terminal design system in your components!
