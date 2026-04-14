# ReelMaker — Template System Reference

A canvas-based engine for generating short portrait videos (1080×1920, 9:16) suitable for YouTube Shorts, Instagram Reels, and TikTok.

---

## Quick Start

```bash
# Install dependencies (see Prerequisites below)
npm install

# Live browser preview (no FFmpeg needed)
node index.js preview
# → open http://localhost:3000

# Export PNG frames only (no FFmpeg needed)
node index.js frames

# Compile full MP4 (requires FFmpeg)
node index.js generate
```

Output is written to `output/`.

---

## Prerequisites

### @napi-rs/canvas (for frame rendering)
Uses prebuilt binaries — no system libraries required.

```bash
npm install
```

### FFmpeg (for video export only)
```bash
brew install ffmpeg        # macOS
sudo apt install ffmpeg    # Ubuntu
```

If FFmpeg is not installed, `node index.js frames` exports raw PNG frames that you can compile manually or import into any video editor.

---

## Customising Your Video

Create `reel.config.js` in the project root. The file must export either:
- a plain config object (used with `TopListTemplate`), or
- `{ rendererOptions, scenes, totalDuration }` for a fully custom scene graph.

### Example: `reel.config.js` with TopListTemplate

```js
const TopListTemplate = require('./src/templates/TopListTemplate');

const template = new TopListTemplate({
  title:    'Productivity Apps You Need in 2024',
  subtitle: 'Tested & Ranked',
  brand:    '@YourChannel',
  cta:      'Drop your favourite in the comments!',

  itemDuration:  4,     // seconds each item is shown
  introDuration: 3.5,
  outroDuration: 3,

  style: {
    accentColor:   '#00D4FF',   // swap gold for blue
    primaryColor:  '#FFFFFF',
    subtitleColor: '#90A0B8',
    fontFamily:    'sans-serif',
  },

  items: [
    { rank: 5, name: 'Notion',    description: 'All-in-one workspace',         badge: 'FREEMIUM' },
    { rank: 4, name: 'Obsidian',  description: 'Offline, markdown-first notes', badge: 'FREE' },
    { rank: 3, name: 'Todoist',   description: 'Best-in-class task manager',    badge: 'FREEMIUM' },
    { rank: 2, name: 'Raycast',   description: 'Supercharged command palette',  badge: 'FREE' },
    { rank: 1, name: 'Linear',    description: 'Issues, cycles, roadmaps',      badge: 'FREEMIUM' },
  ],
});

module.exports = {
  rendererOptions: template.getRendererOptions(),
  scenes:          template.getScenes(),
  totalDuration:   template.getTotalDuration(),
};
```

---

## Architecture

```
ReelMaker/
├── index.js                  CLI entry point
├── reel.config.js            Your custom config (create this)
├── output/                   Generated frames and video
└── src/
    ├── engine/
    │   ├── easings.js        Easing functions (linear, easeOutCubic, easeOutBack…)
    │   ├── Animator.js       Computes per-frame element state from animation defs
    │   ├── Renderer.js       Node.js canvas renderer — outputs PNG buffers
    │   └── VideoExporter.js  Saves frames, calls FFmpeg to compile MP4
    ├── templates/
    │   ├── BaseTemplate.js   Abstract base — subclass this for new templates
    │   └── TopListTemplate.js "Top N" countdown template
    └── preview/
        ├── server.js         HTTP server that serves scene data + static files
        └── public/
            └── index.html    Browser canvas renderer + playback UI
```

---

## Scene Graph Format

The engine works with an array of **scenes**. Each scene covers a time range; the renderer picks the active scene for each frame and applies element animations using the local time within that scene.

```js
const scenes = [
  {
    duration: 3.5,                     // seconds this scene lasts

    background: {
      type: 'gradient',                // 'color' | 'gradient' | 'radialGradient' | 'image'
      direction: [0, 0, 0, 1],        // [x0,y0,x1,y1] as fractions of canvas size
      stops: [
        { position: 0,   color: '#0C0A2A' },
        { position: 1,   color: '#060616' },
      ],
    },

    elements: [
      {
        type: 'text',
        text: 'Hello World',
        x: 540, y: 960,               // pixels (canvas is 1080×1920)
        fontSize: 80,
        fontWeight: '800',
        fontFamily: 'sans-serif',
        color: '#FFFFFF',
        align: 'center',              // left | center | right
        baseline: 'middle',           // top | middle | bottom | alphabetic
        maxWidth: 900,                // wraps text if wider
        lineHeight: 1.3,
        shadow: { blur: 20, color: 'rgba(0,0,0,0.8)', offsetX: 0, offsetY: 4 },
        animations: [
          { type: 'fadeIn',    startTime: 0,   duration: 0.5, easing: 'easeOutCubic' },
          { type: 'slideInUp', startTime: 0,   duration: 0.6, distance: 60 },
        ],
      },
    ],
  },
];
```

---

## Element Types

| type     | Required props                     | Notes |
|----------|------------------------------------|-------|
| `text`   | `text`, `x`, `y`                  | Supports word-wrap via `maxWidth` |
| `rect`   | `x`, `y`, `width`, `height`       | `anchor:'center'` centres on x,y; supports `gradient` array |
| `circle` | `x`, `y`, `radius`                | Optional `stroke: { color, width }` |
| `image`  | `x`, `y`, `src`                   | `anchor:'center'`; `cornerRadius` for rounded corners |
| `line`   | `x`, `y`, `x2`, `y2`             | Or use `length` instead of `x2`/`y2` |

---

## Animation Types

All animations share these base fields:

| field       | type   | default          | description |
|-------------|--------|------------------|-------------|
| `type`      | string | —                | Animation name (see below) |
| `startTime` | number | `0`              | Seconds from scene start |
| `duration`  | number | `0.5`            | Seconds the animation runs |
| `easing`    | string | `'easeOutCubic'` | Key from easings.js |

### Available animation types

| type           | extra params             | description |
|----------------|--------------------------|-------------|
| `fadeIn`       | —                        | Opacity 0 → 1 |
| `fadeOut`      | —                        | Opacity 1 → 0 |
| `slideInUp`    | `distance` (px, def 80)  | Slides element up into position |
| `slideInDown`  | `distance`               | Slides element down into position |
| `slideInLeft`  | `distance`               | Slides in from left |
| `slideInRight` | `distance`               | Slides in from right |
| `slideOutUp`   | `distance`               | Slides element upward off screen |
| `slideOutDown` | `distance`               | Slides element downward off screen |
| `scaleIn`      | `from` (def 0)           | Scale from `from` → 1 |
| `scaleOut`     | `to` (def 0)             | Scale from 1 → `to` |
| `expandWidth`  | —                        | Grows `rect`/`line` width from 0 → full |

Animations are cumulative — stack multiple on one element:

```js
animations: [
  { type: 'fadeIn',    startTime: 0,   duration: 0.4 },
  { type: 'slideInUp', startTime: 0,   duration: 0.5, distance: 60 },
  { type: 'fadeOut',   startTime: 2.5, duration: 0.4 },
]
```

---

## Available Easing Functions

| name            | feel |
|-----------------|------|
| `linear`        | constant speed |
| `easeInQuad`    | accelerates in |
| `easeOutQuad`   | decelerates out |
| `easeInOutQuad` | smooth both ends |
| `easeInCubic`   | stronger accelerate |
| `easeOutCubic`  | ★ default — snappy decelerate |
| `easeOutBack`   | slight overshoot / bounce back |
| `easeOutElastic`| spring-like overshoot |
| `easeOutBounce` | bounces at the end |

---

## Creating a Custom Template

Extend `BaseTemplate` and implement `getScenes()`:

```js
const BaseTemplate = require('./src/templates/BaseTemplate');

class SlideshowTemplate extends BaseTemplate {
  constructor(config) {
    super({ width: 1080, height: 1920, fps: 30, ...config });
  }

  getScenes() {
    return this.config.slides.map((slide, i) => ({
      duration: slide.duration || 3,
      background: { type: 'color', color: slide.bgColor || '#000' },
      elements: [
        {
          type: 'image',
          src: slide.image,
          x: 540, y: 960,
          width: 1080, height: 1920,
          anchor: 'center',
          animations: [{ type: 'fadeIn', startTime: 0, duration: 0.5 }],
        },
        {
          type: 'text',
          text: slide.caption,
          x: 540, y: 1700,
          fontSize: 60,
          color: '#fff',
          maxWidth: 900,
          animations: [
            { type: 'fadeIn',    startTime: 0.3, duration: 0.5 },
            { type: 'slideInUp', startTime: 0.3, duration: 0.5, distance: 40 },
          ],
        },
      ],
    }));
  }
}

module.exports = SlideshowTemplate;
```

---

## Background Types

```js
// Solid colour
{ type: 'color', color: '#1a1a2e' }

// Linear gradient (direction as [x0,y0,x1,y1] fractions)
{ type: 'gradient', direction: [0,0,0,1], stops: [...] }

// Horizontal gradient
{ type: 'gradient', direction: 'horizontal', stops: [...] }

// Radial gradient (values are fractions of canvas size)
{ type: 'radialGradient', cx: 0.5, cy: 0.3, r0: 0, r1: 0.8, stops: [...] }

// Image fill
{ type: 'image', src: './assets/background.jpg' }
```

---

## Renderer & VideoExporter API

```js
const Renderer      = require('./src/engine/Renderer');
const VideoExporter = require('./src/engine/VideoExporter');

const renderer = new Renderer({ width: 1080, height: 1920, fps: 30 });

// Pre-warm the image cache (optional but recommended)
await renderer.preloadImages(scenes);

// Render a single frame → returns a PNG Buffer
const pngBuffer = await renderer.renderFrame(scenes, 2.5); // t = 2.5s

// Full export
const exporter = new VideoExporter();

// Save frames only
await exporter.saveFrames(renderer, scenes, totalDuration, './output/frames');

// Save frames + compile MP4 (requires FFmpeg)
await exporter.exportVideo(renderer, scenes, totalDuration, './output/reel.mp4', {
  preset: 'medium',  // FFmpeg preset: ultrafast, fast, medium, slow
  crf: 20,           // Quality: 0 (best) – 51 (worst). 18–23 is typical.
});
```
