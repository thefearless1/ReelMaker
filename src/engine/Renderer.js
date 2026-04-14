const { createCanvas, loadImage } = require('@napi-rs/canvas');
const Animator = require('./Animator');

/**
 * Node.js canvas renderer. Draws a single frame at a given timestamp.
 *
 * Resolution: 1080 × 1920 (portrait 9:16) by default.
 * All coordinate values in scene definitions use these pixel dimensions.
 */
class Renderer {
  constructor(options = {}) {
    this.width  = options.width  || 1080;
    this.height = options.height || 1920;
    this.fps    = options.fps    || 30;
    this._imageCache = new Map();
  }

  // ── Image loading ──────────────────────────────────────────────────────────

  async _loadImage(src) {
    if (this._imageCache.has(src)) return this._imageCache.get(src);
    const img = await loadImage(src);
    this._imageCache.set(src, img);
    return img;
  }

  async preloadImages(scenes) {
    const srcs = new Set();
    for (const scene of scenes) {
      if (scene.background?.type === 'image') srcs.add(scene.background.src);
      for (const el of scene.elements || []) {
        if (el.type === 'image' && el.src) srcs.add(el.src);
      }
    }
    await Promise.all([...srcs].map(s => this._loadImage(s)));
  }

  // ── Scene resolution ───────────────────────────────────────────────────────

  /** Returns the scene that's active at `time`, plus time elapsed within that scene. */
  _resolveScene(scenes, time) {
    let offset = 0;
    for (const scene of scenes) {
      if (time < offset + scene.duration) {
        return { scene, localTime: time - offset };
      }
      offset += scene.duration;
    }
    // Past the end – clamp to last scene
    const last = scenes[scenes.length - 1];
    return { scene: last, localTime: last.duration };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Renders one frame and returns a PNG Buffer. */
  async renderFrame(scenes, time) {
    const canvas = createCanvas(this.width, this.height);
    const ctx    = canvas.getContext('2d');

    const { scene, localTime } = this._resolveScene(scenes, time);

    await this._drawBackground(ctx, scene.background);

    for (const element of scene.elements || []) {
      await this._drawElement(ctx, element, localTime);
    }

    return canvas.toBuffer('image/png');
  }

  // ── Background drawing ─────────────────────────────────────────────────────

  async _drawBackground(ctx, bg) {
    ctx.save();

    if (!bg) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
      return;
    }

    switch (bg.type) {
      case 'color':
        ctx.fillStyle = bg.color;
        ctx.fillRect(0, 0, this.width, this.height);
        break;

      case 'gradient': {
        const grad = this._buildLinearGradient(ctx, bg);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);
        break;
      }

      case 'radialGradient': {
        const cx = (bg.cx || 0.5) * this.width;
        const cy = (bg.cy || 0.5) * this.height;
        const r0 = (bg.r0 || 0) * this.height;
        const r1 = (bg.r1 || 1) * this.height;
        const grad = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
        for (const s of bg.stops) grad.addColorStop(s.position, s.color);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);
        break;
      }

      case 'image': {
        const img = await this._loadImage(bg.src);
        ctx.drawImage(img, 0, 0, this.width, this.height);
        break;
      }
    }

    ctx.restore();
  }

  _buildLinearGradient(ctx, bg) {
    let x0 = 0, y0 = 0, x1 = 0, y1 = this.height;
    if (bg.direction === 'horizontal') { x1 = this.width; y1 = 0; }
    else if (Array.isArray(bg.direction)) {
      [x0, y0, x1, y1] = bg.direction.map((v, i) =>
        v * (i % 2 === 0 ? this.width : this.height)
      );
    }
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const s of bg.stops) grad.addColorStop(s.position, s.color);
    return grad;
  }

  // ── Element drawing ────────────────────────────────────────────────────────

  async _drawElement(ctx, element, localTime) {
    const state = Animator.getElementState(element, localTime);
    if (state.opacity <= 0.001) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, state.opacity));

    const x = element.x + state.translateX;
    const y = element.y + state.translateY;

    if (state.scale !== 1 || state.rotation !== 0) {
      ctx.translate(x, y);
      if (state.rotation) ctx.rotate((state.rotation * Math.PI) / 180);
      if (state.scale !== 1) ctx.scale(state.scale, state.scale);
      ctx.translate(-x, -y);
    }

    switch (element.type) {
      case 'text':   await this._drawText(ctx, element, x, y); break;
      case 'rect':        this._drawRect(ctx, element, x, y, state); break;
      case 'circle':      this._drawCircle(ctx, element, x, y); break;
      case 'image':  await this._drawImage(ctx, element, x, y); break;
      case 'line':        this._drawLine(ctx, element, x, y, state); break;
    }

    ctx.restore();
  }

  // Text ─────────────────────────────────────────────────────────────────────

  async _drawText(ctx, el, x, y) {
    const fontSize   = el.fontSize   || 48;
    const fontWeight = el.fontWeight || 'normal';
    const fontFamily = el.fontFamily || 'sans-serif';

    ctx.font         = `${fontWeight} ${fontSize}px "${fontFamily}"`;
    ctx.fillStyle    = el.color     || '#fff';
    ctx.textAlign    = el.align     || 'center';
    ctx.textBaseline = el.baseline  || 'middle';

    if (el.shadow) {
      ctx.shadowBlur    = el.shadow.blur    || 0;
      ctx.shadowColor   = el.shadow.color   || 'rgba(0,0,0,0.5)';
      ctx.shadowOffsetX = el.shadow.offsetX || 0;
      ctx.shadowOffsetY = el.shadow.offsetY || 0;
    }

    const lineHeight  = fontSize * (el.lineHeight || 1.3);
    const lines       = this._wrapText(ctx, el.text || '', el.maxWidth);
    const totalHeight = lines.length * lineHeight;
    const startY      = el.verticalAlign === 'middle' ? y - totalHeight / 2 + lineHeight / 2 : y;

    if (el.stroke) {
      ctx.strokeStyle = el.stroke.color || '#000';
      ctx.lineWidth   = el.stroke.width || 2;
      ctx.lineJoin    = 'round';
    }

    lines.forEach((line, i) => {
      const ly = startY + i * lineHeight;
      if (el.stroke) ctx.strokeText(line, x, ly);
      ctx.fillText(line, x, ly);
    });
  }

  _wrapText(ctx, text, maxWidth) {
    if (!maxWidth) return [text];
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  // Rect ─────────────────────────────────────────────────────────────────────

  _drawRect(ctx, el, x, y, state) {
    const fullW = el.width  || 100;
    const h     = el.height || 10;
    const r     = el.cornerRadius || 0;

    // expandWidth animation narrows the rect from its anchored position
    const w = state.widthProgress !== undefined ? fullW * state.widthProgress : fullW;

    const drawX = el.anchor === 'center' ? x - w / 2 : x;
    const drawY = el.anchor === 'center' ? y - h / 2 : y;

    if (el.gradient) {
      const grad = ctx.createLinearGradient(drawX, 0, drawX + w, 0);
      for (const s of el.gradient) grad.addColorStop(s.position, s.color);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = el.color || '#fff';
    }

    if (r > 0) {
      ctx.beginPath();
      ctx.moveTo(drawX + r, drawY);
      ctx.lineTo(drawX + w - r, drawY);
      ctx.arcTo(drawX + w, drawY, drawX + w, drawY + h, r);
      ctx.lineTo(drawX + w, drawY + h - r);
      ctx.arcTo(drawX + w, drawY + h, drawX + w - r, drawY + h, r);
      ctx.lineTo(drawX + r, drawY + h);
      ctx.arcTo(drawX, drawY + h, drawX, drawY + h - r, r);
      ctx.lineTo(drawX, drawY + r);
      ctx.arcTo(drawX, drawY, drawX + r, drawY, r);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(drawX, drawY, w, h);
    }
  }

  // Circle ───────────────────────────────────────────────────────────────────

  _drawCircle(ctx, el, x, y) {
    const radius = el.radius || 20;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = el.color || '#fff';
    ctx.fill();
    if (el.stroke) {
      ctx.strokeStyle = el.stroke.color || '#000';
      ctx.lineWidth   = el.stroke.width || 2;
      ctx.stroke();
    }
  }

  // Image ────────────────────────────────────────────────────────────────────

  async _drawImage(ctx, el, x, y) {
    const img  = await this._loadImage(el.src);
    const w    = el.width  || img.width;
    const h    = el.height || img.height;
    const drawX = el.anchor === 'center' ? x - w / 2 : x;
    const drawY = el.anchor === 'center' ? y - h / 2 : y;

    if (el.cornerRadius) {
      ctx.save();
      this._clipRoundRect(ctx, drawX, drawY, w, h, el.cornerRadius);
      ctx.clip();
    }

    ctx.drawImage(img, drawX, drawY, w, h);

    if (el.cornerRadius) ctx.restore();
  }

  _clipRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // Line ─────────────────────────────────────────────────────────────────────

  _drawLine(ctx, el, x, y, state) {
    const progress = state.widthProgress !== undefined ? state.widthProgress : 1;
    const x2 = el.x2 !== undefined ? el.x2 : x + (el.length || 100);
    const y2 = el.y2 !== undefined ? el.y2 : y;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (x2 - x) * progress, y + (y2 - y) * progress);
    ctx.strokeStyle = el.color    || '#fff';
    ctx.lineWidth   = el.width    || 2;
    if (el.lineCap) ctx.lineCap  = el.lineCap;
    ctx.stroke();
  }
}

module.exports = Renderer;
