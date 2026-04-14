/**
 * Preview server — serves the browser-based live canvas preview.
 *
 * Usage:  node src/preview/server.js [port]
 *
 * The server reads `reel.config.js` from the project root (or falls back to
 * the built-in example) and exposes the scene data as JSON so the browser
 * renderer can replay the animation in real-time.
 */

const http   = require('http');
const fs     = require('fs');
const path   = require('path');

// When invoked directly: node src/preview/server.js [port]
// When required from index.js: argv[2] is "preview", so ignore it
const _argPort = parseInt(process.argv[2], 10);
const PORT     = (Number.isFinite(_argPort) ? _argPort : null)
              ?? parseInt(process.env.PORT || '3000', 10);
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const PUBLIC_DIR   = path.join(__dirname, 'public');

// ── Load config ────────────────────────────────────────────────────────────

function loadConfig() {
  const configPath = path.join(PROJECT_ROOT, 'reel.config.js');
  if (fs.existsSync(configPath)) {
    // Clear all local module caches (not node_modules) so template edits are
    // picked up without restarting the server.
    Object.keys(require.cache).forEach(key => {
      if (!key.includes('node_modules')) delete require.cache[key];
    });
    return require(configPath);
  }

  // Built-in example
  const TopListTemplate = require('../templates/TopListTemplate');
  const tpl = new TopListTemplate({
    title:    'Mobile Apps for Video Editing',
    subtitle: 'Ranked & Reviewed 2024',
    brand:    '@YourChannel',
    items: [
      { rank: 5, name: 'CapCut',        description: 'AI-powered free editor, zero learning curve', badge: 'FREE' },
      { rank: 4, name: 'VN Video Editor', description: 'Clean UI with no watermark', badge: 'FREE' },
      { rank: 3, name: 'InShot',        description: 'Perfect for beginners & social clips', badge: 'FREE' },
      { rank: 2, name: 'KineMaster',    description: 'Pro multi-track editing on mobile', badge: 'FREEMIUM' },
      { rank: 1, name: 'LumaFusion',    description: 'The undisputed gold standard', badge: 'PAID' },
    ],
  });

  return {
    rendererOptions: tpl.getRendererOptions(),
    scenes:          tpl.getScenes(),
    totalDuration:   tpl.getTotalDuration(),
  };
}

// ── MIME types ─────────────────────────────────────────────────────────────

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
};

// ── Request handler ────────────────────────────────────────────────────────

function handler(req, res) {
  const url = req.url.split('?')[0];

  // API: scene data (re-loaded on every request so edits are live)
  if (url === '/api/scenes') {
    try {
      const data = loadConfig();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Static files from public/
  const filePath = url === '/' ? path.join(PUBLIC_DIR, 'index.html')
                               : path.join(PUBLIC_DIR, url);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end(); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext  = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

// ── Start ──────────────────────────────────────────────────────────────────

http.createServer(handler).listen(PORT, () => {
  console.log(`\nReel preview running at http://localhost:${PORT}`);
  console.log('The canvas animates in real-time in your browser.');
  console.log('Edit reel.config.js then reload the page to see changes.\n');
});
