const BaseTemplate = require('./BaseTemplate');

/**
 * AppReviewTemplate — "Top N Apps" review reel.
 *
 * Each item scene shows:
 *   • Brand-coloured gradient background that mimics a blurred screenshot
 *   • Faux mobile-UI chrome (header bar + content cards) to reinforce the look
 *   • Dark gradient overlay for readability
 *   • Animated rank number, app name, award badge, key-feature quote,
 *     bullet-point pros, and price pill
 *
 * Config shape:
 * {
 *   title:         string,
 *   subtitle:      string,
 *   brand:         string,
 *   itemDuration:  number,   // seconds per item (default 6)
 *   introDuration: number,
 *   outroDuration: number,
 *   items: [{
 *     rank:     number,
 *     name:     string,
 *     award:    string,       // e.g. "Best Overall"
 *     quote:    string,       // highlighted pro / tagline
 *     features: string[],    // 2–3 bullet points
 *     price:    string,       // e.g. "Free · from $59.99/yr"
 *     colors: {
 *       primary:   string,   // top-left gradient stop
 *       secondary: string,   // bottom-right gradient stop
 *       accent:    string,   // highlight / award color
 *     }
 *   }]
 * }
 */
class AppReviewTemplate extends BaseTemplate {
  constructor(config) {
    super({ width: 1080, height: 1920, fps: 30, ...config });
    this.W  = this.width;
    this.H  = this.height;
    this.cx = this.width / 2;
    this.ff = (config.style && config.style.fontFamily) || 'sans-serif';
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _divider(y, startTime = 0.4, width = 700, color = 'rgba(255,255,255,0.5)') {
    return {
      type: 'rect',
      x: this.cx, y,
      width, height: 3,
      anchor: 'center',
      cornerRadius: 1,
      gradient: [
        { position: 0,   color: 'rgba(255,255,255,0)' },
        { position: 0.25, color },
        { position: 0.75, color },
        { position: 1,   color: 'rgba(255,255,255,0)' },
      ],
      animations: [
        { type: 'expandWidth', startTime, duration: 0.65, easing: 'easeOutCubic' },
        { type: 'fadeIn',      startTime, duration: 0.3 },
      ],
    };
  }

  _progressDots(activeIndex, total) {
    const spacing = 36;
    const startX  = this.cx - ((total - 1) * spacing) / 2;
    const y       = this.H - 90;
    return Array.from({ length: total }, (_, i) => ({
      type:   'circle',
      x:      startX + i * spacing,
      y,
      radius: i === activeIndex ? 10 : 6,
      color:  i === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.25)',
      animations: [{ type: 'fadeIn', startTime: 0.1 + i * 0.04, duration: 0.3 }],
    }));
  }

  // ── Faux-screenshot layer ──────────────────────────────────────────────────
  //
  // Draws semi-transparent phone-UI chrome (header + content cards) on top of
  // the brand-gradient so the scene evokes a blurred app screenshot.

  _fauxScreenshot(colors) {
    const els = [];
    const accent = colors.primary;

    // Status-bar notch strip
    els.push({
      type: 'rect', x: 0, y: 0,
      width: this.W, height: 80,
      color: 'rgba(0,0,0,0.55)',
      animations: [{ type: 'fadeIn', startTime: 0, duration: 0.5 }],
    });
    // Status bar icons (dots)
    [120, 900, 940, 980].forEach(x => els.push({
      type: 'circle', x, y: 40, radius: 6,
      color: 'rgba(255,255,255,0.35)',
      animations: [{ type: 'fadeIn', startTime: 0.1, duration: 0.4 }],
    }));

    // App top bar (toolbar with rounded shape suggestions)
    els.push({
      type: 'rect', x: 0, y: 80,
      width: this.W, height: 120,
      color: 'rgba(0,0,0,0.4)',
      animations: [{ type: 'fadeIn', startTime: 0, duration: 0.5 }],
    });
    // Faux search/title bar pill in toolbar
    els.push({
      type: 'rect', x: this.cx, y: 140,
      width: 680, height: 56,
      anchor: 'center', cornerRadius: 28,
      color: 'rgba(255,255,255,0.12)',
      animations: [{ type: 'fadeIn', startTime: 0.15, duration: 0.4 }],
    });

    // Three faux content cards
    const cardY = [240, 470, 680];
    const cardH = [185, 165, 130];
    cardY.forEach((y, i) => {
      // Card background
      els.push({
        type: 'rect', x: 60, y,
        width: this.W - 120, height: cardH[i],
        cornerRadius: 24,
        color: 'rgba(255,255,255,0.09)',
        animations: [{ type: 'fadeIn', startTime: 0.1 + i * 0.08, duration: 0.5 }],
      });
      // Card accent stripe
      els.push({
        type: 'rect', x: 60, y,
        width: 8, height: cardH[i],
        cornerRadius: 4,
        color: accent + '99',
        animations: [{ type: 'fadeIn', startTime: 0.2 + i * 0.08, duration: 0.4 }],
      });
      // Fake text lines inside the card
      [0.3, 0.55].forEach((frac, li) => {
        els.push({
          type: 'rect',
          x: 90, y: y + 30 + li * 50,
          width: (this.W - 180) * frac,
          height: 14,
          cornerRadius: 7,
          color: 'rgba(255,255,255,0.18)',
          animations: [{ type: 'fadeIn', startTime: 0.25 + i * 0.08, duration: 0.4 }],
        });
      });
    });

    // Bottom nav bar
    els.push({
      type: 'rect', x: 0, y: this.H - 130,
      width: this.W, height: 130,
      color: 'rgba(0,0,0,0.45)',
      animations: [{ type: 'fadeIn', startTime: 0, duration: 0.5 }],
    });
    // Nav dots
    [0.2, 0.4, 0.6, 0.8].forEach(frac => {
      els.push({
        type: 'circle',
        x: this.W * frac, y: this.H - 65,
        radius: 22,
        color: 'rgba(255,255,255,0.1)',
        animations: [{ type: 'fadeIn', startTime: 0.1, duration: 0.4 }],
      });
    });

    return els;
  }

  // ── Dark overlay (readability scrim) ──────────────────────────────────────

  _darkOverlay() {
    return {
      type: 'rect', x: 0, y: 0,
      width: this.W, height: this.H,
      gradient: [
        { position: 0,    color: 'rgba(0,0,0,0.0)' },
        { position: 0.28, color: 'rgba(0,0,0,0.25)' },
        { position: 0.42, color: 'rgba(0,0,0,0.82)' },
        { position: 1,    color: 'rgba(0,0,0,0.92)' },
      ],
      // gradient drawn top-to-bottom via x/y hack: we abuse rect gradient
      // (rect gradient is L→R in the renderer) so we rotate the rect 90°
      // via a vertical rect trick — instead, just use the background gradient.
      // Note: rect gradient in renderer is left-to-right; for top-to-bottom
      // we draw a full-width, full-height rect and use the bg gradient instead.
      // Workaround: use opacity + a fallback color.
      color: 'rgba(0,0,0,0)',  // overridden by gradient if supported
      animations: [{ type: 'fadeIn', startTime: 0, duration: 0.6 }],
    };
  }

  // ── Scenes ────────────────────────────────────────────────────────────────

  _introScene() {
    const { title, subtitle, brand } = this.config;
    const count    = this.config.items.length;
    const duration = this.config.introDuration || 3.5;

    return {
      name: 'Intro',
      duration,
      background: {
        type: 'gradient',
        direction: [0, 0, 0, 1],
        stops: [
          { position: 0,   color: '#050014' },
          { position: 0.4, color: '#100030' },
          { position: 0.8, color: '#0A1A3A' },
          { position: 1,   color: '#02020C' },
        ],
      },
      elements: [
        // Ghost "TOP" watermark
        {
          type: 'text', text: 'TOP',
          x: this.cx, y: this.H * 0.36,
          fontSize: 140, fontWeight: '900',
          fontFamily: this.ff,
          color: 'rgba(255,255,255,0.07)',
          align: 'center', baseline: 'middle',
          animations: [
            { type: 'fadeIn',    startTime: 0,   duration: 0.6 },
            { type: 'slideInUp', startTime: 0,   duration: 0.6, distance: 60 },
          ],
        },
        // Giant count
        {
          type: 'text', text: String(count),
          x: this.cx, y: this.H * 0.46,
          fontSize: 380, fontWeight: '900',
          fontFamily: this.ff,
          color: '#FFFFFF',
          align: 'center', baseline: 'middle',
          shadow: { blur: 80, color: 'rgba(120,80,255,0.5)', offsetX: 0, offsetY: 0 },
          animations: [
            { type: 'fadeIn',  startTime: 0.1, duration: 0.6 },
            { type: 'scaleIn', startTime: 0.1, duration: 0.75, from: 0.5, easing: 'easeOutBack' },
          ],
        },
        this._divider(this.H * 0.595, 0.45, 800),
        // Title
        {
          type: 'text', text: (title || 'Top Apps').toUpperCase(),
          x: this.cx, y: this.H * 0.655,
          fontSize: 66, fontWeight: '800',
          fontFamily: this.ff,
          color: '#FFFFFF',
          align: 'center', baseline: 'middle',
          maxWidth: 940, lineHeight: 1.2,
          shadow: { blur: 24, color: 'rgba(0,0,0,0.8)', offsetX: 0, offsetY: 4 },
          animations: [
            { type: 'fadeIn',    startTime: 0.65, duration: 0.5 },
            { type: 'slideInUp', startTime: 0.65, duration: 0.5, distance: 50 },
          ],
        },
        // Subtitle
        ...(subtitle ? [{
          type: 'text', text: subtitle,
          x: this.cx, y: this.H * 0.745,
          fontSize: 42, fontWeight: '400',
          fontFamily: this.ff,
          color: 'rgba(180,180,220,0.9)',
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 0.9, duration: 0.5 }],
        }] : []),
        this._divider(this.H * 0.81, 0.8, 800),
        // Brand
        ...(brand ? [{
          type: 'text', text: brand,
          x: this.cx, y: this.H * 0.875,
          fontSize: 36, fontFamily: this.ff,
          color: 'rgba(255,255,255,0.3)',
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 1.1, duration: 0.5 }],
        }] : []),
      ],
    };
  }

  _appScene(item, activeIndex, total) {
    const duration = this.config.itemDuration || 7;
    const { colors } = item;
    const src = item.screenshot || null;

    // ── Timing choreography (2-second entry) ──
    //
    //   0.00 – 0.35   image fades in (heavily blurred, "loading")
    //   0.00 – 1.00   blur animates 24 → 0 (sharpens as the image "resolves")
    //   1.00 – 1.40   clean hold, subtle ken-burns zoom continues
    //   1.40 – 2.00   blur re-animates 0 → 16 (soft focus behind content)
    //   1.40 – 2.00   scrim slides UP from below the fold, fading in
    //   2.00 +        text cascade (rank → name → award → quote → bullets → price)
    //   duration-0.30 short dip-to-black so the next item eases in cleanly
    const T = 2.00;

    // Vertical layout constants
    const rankY  = this.H * 0.435;
    const nameY  = this.H * 0.565;
    const awardY = this.H * 0.635;
    const divY   = this.H * 0.675;
    const quoteY = this.H * 0.73;
    const feat1Y = this.H * 0.812;
    const feat2Y = this.H * 0.858;
    const feat3Y = this.H * 0.904;
    const priceY = this.H * 0.952;

    const hasFeat2 = item.features.length > 1;
    const hasFeat3 = item.features.length > 2;

    // Single image element with animated blur. Positioned at screen centre
    // so the ken-burns scale pivots around the middle of the frame instead
    // of the top-left corner.
    const screenshotEls = src ? [
      {
        type: 'image', src,
        x: this.W / 2, y: this.H / 2,
        cover: true,
        animations: [
          // Gentle fade-in while heavily blurred — "image loading" feel
          { type: 'fadeIn',   startTime: 0,    duration: 0.35, easing: 'easeOutCubic' },
          // Sharpen: blur 24 → 0 over 1.0s. Composes additively with the
          // re-blur below (which is dormant until t=1.40).
          { type: 'blur',     startTime: 0,    duration: 1.00, from: 24, to: 0,  easing: 'easeOutCubic' },
          // Re-blur once the content scrim slides up
          { type: 'blur',     startTime: 1.40, duration: 0.60, from: 0,  to: 16, easing: 'easeInOutCubic' },
          // Continuous slow ken-burns zoom over the whole scene
          { type: 'scaleOut', startTime: 0,    duration,       to: 1.07, easing: 'linear' },
        ],
      },
    ] : [];

    // Dark scrim — slides UP from below the fold while fading in, so the
    // semi-transparent layer visibly enters the frame instead of just popping.
    const scrimEls = [
      {
        type: 'rect', x: 0, y: this.H * 0.30,
        width: this.W, height: this.H * 0.70,
        color: 'rgba(6,6,14,0.88)',
        animations: [
          { type: 'fadeIn',    startTime: 1.40, duration: 0.60, easing: 'easeOutCubic' },
          { type: 'slideInUp', startTime: 1.40, duration: 0.60, distance: 420, easing: 'easeOutCubic' },
        ],
      },
      // Thin brand-accent stripe that rides on the top edge of the scrim —
      // gives the slide-up a clear leading edge instead of a fuzzy fade.
      {
        type: 'rect', x: 0, y: this.H * 0.30,
        width: this.W, height: 3,
        gradient: [
          { position: 0,   color: 'rgba(255,255,255,0)' },
          { position: 0.5, color: `${colors.accent}CC` },
          { position: 1,   color: 'rgba(255,255,255,0)' },
        ],
        animations: [
          { type: 'fadeIn',    startTime: 1.50, duration: 0.50, easing: 'easeOutCubic' },
          { type: 'slideInUp', startTime: 1.40, duration: 0.60, distance: 420, easing: 'easeOutCubic' },
        ],
      },
    ];

    // Dip-to-black at the tail of every item scene so the next one
    // resolves out of darkness rather than hard-cutting in.
    const outroVeilEl = {
      type: 'rect', x: 0, y: 0,
      width: this.W, height: this.H,
      color: '#000000',
      animations: [
        { type: 'fadeIn', startTime: duration - 0.30, duration: 0.30, easing: 'easeInQuad' },
      ],
    };

    return {
      name: item.name,
      duration,
      background: { type: 'color', color: '#000000' },
      elements: [
        // ── Screenshot layers ──
        ...screenshotEls,
        ...scrimEls,

        // ── Rank ghost (decorative watermark) ──
        {
          type: 'text', text: `#${item.rank}`,
          x: -80, y: this.H * 0.42,
          fontSize: 540, fontWeight: '900',
          fontFamily: this.ff,
          color: `${colors.accent}12`,
          align: 'left', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: T, duration: 0.5 }],
        },

        // ── Rank number ──
        {
          type: 'text', text: `#${item.rank}`,
          x: this.cx, y: rankY,
          fontSize: 230, fontWeight: '900',
          fontFamily: this.ff,
          color: colors.accent,
          align: 'center', baseline: 'middle',
          shadow: { blur: 60, color: colors.accent + '55', offsetX: 0, offsetY: 0 },
          animations: [
            { type: 'fadeIn',  startTime: T,        duration: 0.45 },
            { type: 'scaleIn', startTime: T,        duration: 0.55, from: 0.5, easing: 'easeOutBack' },
          ],
        },

        // ── App name ──
        {
          type: 'text', text: item.name,
          x: this.cx, y: nameY,
          fontSize: 108, fontWeight: '800',
          fontFamily: this.ff,
          color: '#FFFFFF',
          align: 'center', baseline: 'middle',
          maxWidth: 960, lineHeight: 1.1,
          shadow: { blur: 30, color: 'rgba(0,0,0,0.9)', offsetX: 0, offsetY: 5 },
          animations: [
            { type: 'fadeIn',    startTime: T + 0.3, duration: 0.5 },
            { type: 'slideInUp', startTime: T + 0.3, duration: 0.5, distance: 60 },
          ],
        },

        // ── Award badge pill ──
        {
          type: 'rect',
          x: this.cx, y: awardY,
          width: 420, height: 66,
          anchor: 'center', cornerRadius: 33,
          color: `${colors.accent}22`,
          animations: [
            { type: 'fadeIn',  startTime: T + 0.5, duration: 0.35 },
            { type: 'scaleIn', startTime: T + 0.5, duration: 0.4, from: 0.5, easing: 'easeOutBack' },
          ],
        },
        {
          type: 'rect',
          x: this.cx, y: awardY,
          width: 418, height: 64,
          anchor: 'center', cornerRadius: 32,
          gradient: [
            { position: 0,   color: `${colors.accent}44` },
            { position: 0.5, color: `${colors.accent}22` },
            { position: 1,   color: `${colors.accent}44` },
          ],
          animations: [{ type: 'fadeIn', startTime: T + 0.5, duration: 0.35 }],
        },
        {
          type: 'text', text: `🏆 ${item.award}`,
          x: this.cx, y: awardY,
          fontSize: 32, fontWeight: '700',
          fontFamily: this.ff,
          color: colors.accent,
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: T + 0.55, duration: 0.3 }],
        },

        // ── Divider ──
        this._divider(divY, T + 0.65),

        // ── Key feature quote ──
        {
          type: 'text', text: `"${item.quote}"`,
          x: this.cx, y: quoteY,
          fontSize: 46, fontWeight: '400',
          fontFamily: this.ff,
          color: 'rgba(220,220,240,0.95)',
          align: 'center', baseline: 'middle',
          maxWidth: 900, lineHeight: 1.45,
          animations: [
            { type: 'fadeIn',    startTime: T + 0.75, duration: 0.55 },
            { type: 'slideInUp', startTime: T + 0.75, duration: 0.55, distance: 40 },
          ],
        },

        // ── Feature bullets ──
        {
          type: 'text', text: `▸  ${item.features[0]}`,
          x: 100, y: feat1Y,
          fontSize: 40, fontWeight: '400',
          fontFamily: this.ff,
          color: 'rgba(200,210,255,0.9)',
          align: 'left', baseline: 'middle',
          maxWidth: 900, lineHeight: 1.3,
          animations: [
            { type: 'fadeIn',      startTime: T + 1.0, duration: 0.45 },
            { type: 'slideInLeft', startTime: T + 1.0, duration: 0.45, distance: 60 },
          ],
        },
        ...(hasFeat2 ? [{
          type: 'text', text: `▸  ${item.features[1]}`,
          x: 100, y: feat2Y,
          fontSize: 40, fontWeight: '400',
          fontFamily: this.ff,
          color: 'rgba(200,210,255,0.9)',
          align: 'left', baseline: 'middle',
          maxWidth: 900, lineHeight: 1.3,
          animations: [
            { type: 'fadeIn',      startTime: T + 1.2, duration: 0.45 },
            { type: 'slideInLeft', startTime: T + 1.2, duration: 0.45, distance: 60 },
          ],
        }] : []),
        ...(hasFeat3 ? [{
          type: 'text', text: `▸  ${item.features[2]}`,
          x: 100, y: feat3Y,
          fontSize: 40, fontWeight: '400',
          fontFamily: this.ff,
          color: 'rgba(200,210,255,0.9)',
          align: 'left', baseline: 'middle',
          maxWidth: 900, lineHeight: 1.3,
          animations: [
            { type: 'fadeIn',      startTime: T + 1.4, duration: 0.45 },
            { type: 'slideInLeft', startTime: T + 1.4, duration: 0.45, distance: 60 },
          ],
        }] : []),

        // ── Price pill ──
        {
          type: 'rect',
          x: this.cx, y: priceY,
          width: 540, height: 62,
          anchor: 'center', cornerRadius: 31,
          color: 'rgba(255,255,255,0.12)',
          animations: [
            { type: 'fadeIn',  startTime: T + 1.6, duration: 0.35 },
            { type: 'scaleIn', startTime: T + 1.6, duration: 0.4, from: 0.7, easing: 'easeOutBack' },
          ],
        },
        {
          type: 'text', text: item.price,
          x: this.cx, y: priceY,
          fontSize: 31, fontWeight: '600',
          fontFamily: this.ff,
          color: 'rgba(255,255,255,0.75)',
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: T + 1.7, duration: 0.3 }],
        },

        // ── Progress dots ──
        ...this._progressDots(activeIndex, total),

        // ── Transition veil (dip-to-black at scene tail) ──
        outroVeilEl,
      ],
    };
  }

  _outroScene() {
    const { brand } = this.config;
    const duration = this.config.outroDuration || 3.5;

    return {
      name: 'Outro',
      duration,
      background: {
        type: 'gradient',
        direction: [0, 0, 0, 1],
        stops: [
          { position: 0,   color: '#050014' },
          { position: 0.5, color: '#100030' },
          { position: 1,   color: '#02020C' },
        ],
      },
      elements: [
        {
          type: 'text', text: "THAT'S THE LIST!",
          x: this.cx, y: this.H * 0.33,
          fontSize: 100, fontWeight: '900',
          fontFamily: this.ff,
          color: '#FFFFFF',
          align: 'center', baseline: 'middle',
          maxWidth: 920, lineHeight: 1.15,
          shadow: { blur: 40, color: 'rgba(120,80,255,0.5)', offsetX: 0, offsetY: 5 },
          animations: [
            { type: 'fadeIn',  startTime: 0.1, duration: 0.55 },
            { type: 'scaleIn', startTime: 0.1, duration: 0.6, from: 0.65, easing: 'easeOutBack' },
          ],
        },
        this._divider(this.H * 0.46, 0.4, 800),
        {
          type: 'text', text: 'Which one do you use?',
          x: this.cx, y: this.H * 0.535,
          fontSize: 58, fontWeight: '600',
          fontFamily: this.ff,
          color: 'rgba(180,180,255,0.9)',
          align: 'center', baseline: 'middle',
          maxWidth: 900, lineHeight: 1.3,
          animations: [{ type: 'fadeIn', startTime: 0.6, duration: 0.5 }],
        },
        {
          type: 'text', text: 'Comment below! 👇',
          x: this.cx, y: this.H * 0.61,
          fontSize: 48, fontWeight: '400',
          fontFamily: this.ff,
          color: 'rgba(200,200,255,0.7)',
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 0.8, duration: 0.5 }],
        },
        // Subscribe button
        {
          type: 'rect',
          x: this.cx, y: this.H * 0.7,
          width: 460, height: 110,
          anchor: 'center', cornerRadius: 55,
          color: '#E50000',
          animations: [
            { type: 'fadeIn',  startTime: 0.9, duration: 0.4 },
            { type: 'scaleIn', startTime: 0.9, duration: 0.45, from: 0.5, easing: 'easeOutBack' },
          ],
        },
        {
          type: 'text', text: 'SUBSCRIBE',
          x: this.cx, y: this.H * 0.7,
          fontSize: 46, fontWeight: '800',
          fontFamily: this.ff,
          color: '#FFFFFF',
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 1.0, duration: 0.3 }],
        },
        ...(brand ? [{
          type: 'text', text: brand,
          x: this.cx, y: this.H * 0.84,
          fontSize: 38, fontFamily: this.ff,
          color: 'rgba(255,255,255,0.3)',
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 1.1, duration: 0.5 }],
        }] : []),
      ],
    };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  getScenes() {
    const { items } = this.config;
    if (!items || items.length === 0) throw new Error('AppReviewTemplate requires at least one item');
    const sorted = [...items].sort((a, b) => a.rank - b.rank);
    return [
      this._introScene(),
      ...sorted.map((item, idx) => this._appScene(item, idx, sorted.length)),
    ];
  }
}

module.exports = AppReviewTemplate;
