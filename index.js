#!/usr/bin/env node
/**
 * ReelMaker CLI
 *
 * Commands:
 *   node index.js generate   — render frames + compile video (requires FFmpeg)
 *   node index.js frames     — render PNG frames only (no FFmpeg needed)
 *   node index.js preview    — start the browser preview server
 *
 * To customise the video, create reel.config.js in this directory.
 */

const path          = require('path');
const fs            = require('fs');
const Renderer      = require('./src/engine/Renderer');
const VideoExporter = require('./src/engine/VideoExporter');
const TopListTemplate = require('./src/templates/TopListTemplate');

// ── Example config ─────────────────────────────────────────────────────────
// Copy this to reel.config.js and edit it to customise your video.

const EXAMPLE_CONFIG = {
  title:    'Mobile Apps for Video Editing',
  subtitle: 'Ranked & Reviewed 2024',
  brand:    '@YourChannel',
  // outroTitle: "THAT'S THE LIST!",
  // cta: 'Like & Subscribe for more!',
  itemDuration:  4,
  introDuration: 3.5,
  outroDuration: 3,
  style: {
    accentColor:   '#FFD700',
    primaryColor:  '#FFFFFF',
    subtitleColor: '#A0A8C8',
    fontFamily:    'sans-serif',
  },
  items: [
    { rank: 5, name: 'CapCut',          description: 'AI-powered free editor with zero learning curve', badge: 'FREE' },
    { rank: 4, name: 'VN Video Editor', description: 'Clean UI, no watermark, pro results',              badge: 'FREE' },
    { rank: 3, name: 'InShot',          description: 'The go-to app for quick social clips',             badge: 'FREE' },
    { rank: 2, name: 'KineMaster',      description: 'Pro multi-track timeline on mobile',               badge: 'FREEMIUM' },
    { rank: 1, name: 'LumaFusion',      description: 'The undisputed gold standard for mobile editing',  badge: 'PAID' },
  ],
};

// ── Load config ────────────────────────────────────────────────────────────

function loadConfig() {
  const customPath = path.join(__dirname, 'reel.config.js');
  if (fs.existsSync(customPath)) {
    console.log('Using reel.config.js');
    return require(customPath);
  }
  console.log('No reel.config.js found — using built-in example.');
  return EXAMPLE_CONFIG;
}

// ── Commands ───────────────────────────────────────────────────────────────

async function cmdGenerate(framesOnly = false) {
  const config   = loadConfig();
  const template = new TopListTemplate(config);
  const scenes   = template.getScenes();
  const duration = template.getTotalDuration();
  const opts     = template.getRendererOptions();

  console.log(`Template: ${config.title}`);
  console.log(`Duration: ${duration.toFixed(1)}s  |  Scenes: ${scenes.length}  |  Resolution: ${opts.width}×${opts.height}`);

  const renderer = new Renderer(opts);
  await renderer.preloadImages(scenes);

  const exporter = new VideoExporter();
  const outDir   = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });

  if (framesOnly) {
    const framesDir = path.join(outDir, 'frames');
    await exporter.saveFrames(renderer, scenes, duration, framesDir);
    console.log(`Frames saved to: ${framesDir}`);
  } else {
    const outputPath = path.join(outDir, 'reel.mp4');
    await exporter.exportVideo(renderer, scenes, duration, outputPath);
  }
}

function cmdPreview() {
  require('./src/preview/server');
}

// ── Entrypoint ─────────────────────────────────────────────────────────────

const cmd = process.argv[2] || 'preview';

switch (cmd) {
  case 'generate':
    cmdGenerate(false).catch(err => { console.error(err); process.exit(1); });
    break;
  case 'frames':
    cmdGenerate(true).catch(err => { console.error(err); process.exit(1); });
    break;
  case 'preview':
    cmdPreview();
    break;
  default:
    console.error(`Unknown command: ${cmd}`);
    console.error('Usage: node index.js [generate|frames|preview]');
    process.exit(1);
}
