const BaseTemplate = require('./BaseTemplate');

/**
 * TopListTemplate – generates "Top N" countdown videos.
 *
 * Config shape:
 * {
 *   title:        string,           // e.g. "Mobile Apps for Video Editing"
 *   subtitle:     string,           // optional tagline under the big number
 *   brand:        string,           // optional channel handle shown on intro/outro
 *   outroTitle:   string,           // override "THAT'S THE LIST!"
 *   cta:          string,           // override "Like & Subscribe for more!"
 *   itemDuration: number,           // seconds per item scene (default 4)
 *   introDuration: number,          // seconds for intro (default 3.5)
 *   outroDuration: number,          // seconds for outro (default 3)
 *   items: [
 *     { rank: number, name: string, description?: string, badge?: string }
 *   ],
 *   style: {
 *     accentColor:     string,      // default '#FFD700'
 *     primaryColor:    string,      // default '#FFFFFF'
 *     subtitleColor:   string,      // default '#A0A8C8'
 *     fontFamily:      string,      // default 'sans-serif'
 *   }
 * }
 */
class TopListTemplate extends BaseTemplate {
  constructor(config) {
    super({ width: 1080, height: 1920, fps: 30, ...config });

    this.style = {
      accentColor:   '#FFD700',
      primaryColor:  '#FFFFFF',
      subtitleColor: '#A0A8C8',
      fontFamily:    'sans-serif',
      ...config.style,
    };

    this.W  = this.width;
    this.H  = this.height;
    this.cx = this.width / 2;
  }

  // ── Background ─────────────────────────────────────────────────────────────

  _bg() {
    return {
      type: 'gradient',
      direction: [0, 0, 0, 1],   // top→bottom
      stops: [
        { position: 0,    color: '#0C0A2A' },
        { position: 0.35, color: '#181040' },
        { position: 0.7,  color: '#0C1B42' },
        { position: 1,    color: '#060616' },
      ],
    };
  }

  // ── Divider bar helper ─────────────────────────────────────────────────────

  _divider(y, startTime = 0.4, width = 600) {
    return {
      type: 'rect',
      x: this.cx, y,
      width, height: 4,
      anchor: 'center',
      cornerRadius: 2,
      gradient: [
        { position: 0,   color: 'rgba(255,215,0,0)' },
        { position: 0.3, color: this.style.accentColor },
        { position: 0.7, color: this.style.accentColor },
        { position: 1,   color: 'rgba(255,215,0,0)' },
      ],
      animations: [
        { type: 'expandWidth', startTime, duration: 0.7, easing: 'easeOutCubic' },
        { type: 'fadeIn',      startTime, duration: 0.3, easing: 'linear' },
      ],
    };
  }

  // ── Progress dots ─────────────────────────────────────────────────────────

  _progressDots(activeIndex, totalItems) {
    const spacing  = 40;
    const dotR     = 7;
    const activeR  = 12;
    const totalW   = (totalItems - 1) * spacing;
    const startX   = this.cx - totalW / 2;
    const y        = this.H - 110;

    return Array.from({ length: totalItems }, (_, i) => ({
      type:   'circle',
      x:      startX + i * spacing,
      y,
      radius: i === activeIndex ? activeR : dotR,
      color:  i === activeIndex
        ? this.style.accentColor
        : 'rgba(255,255,255,0.2)',
      animations: [
        { type: 'fadeIn', startTime: 0.1 + i * 0.05, duration: 0.3 },
      ],
    }));
  }

  // ── Scenes ─────────────────────────────────────────────────────────────────

  _introScene() {
    const { title, subtitle, brand } = this.config;
    const itemCount = this.config.items.length;
    const duration  = this.config.introDuration || 3.5;

    return {
      duration,
      background: this._bg(),
      elements: [
        // Decorative top line
        this._divider(this.H * 0.21, 0.1, 750),

        // "TOP" label (ghost)
        {
          type: 'text', text: 'TOP',
          x: this.cx, y: this.H * 0.37,
          fontSize: 130, fontWeight: '900',
          fontFamily: this.style.fontFamily,
          color: 'rgba(255,255,255,0.15)',
          align: 'center', baseline: 'middle',
          animations: [
            { type: 'fadeIn',    startTime: 0,    duration: 0.5 },
            { type: 'slideInUp', startTime: 0,    duration: 0.5, distance: 50 },
          ],
        },

        // Giant count number
        {
          type: 'text', text: String(itemCount),
          x: this.cx, y: this.H * 0.46,
          fontSize: 360, fontWeight: '900',
          fontFamily: this.style.fontFamily,
          color: this.style.accentColor,
          align: 'center', baseline: 'middle',
          shadow: { blur: 80, color: 'rgba(255,215,0,0.35)', offsetX: 0, offsetY: 0 },
          animations: [
            { type: 'fadeIn',   startTime: 0.1, duration: 0.6 },
            { type: 'scaleIn',  startTime: 0.1, duration: 0.7, from: 0.55, easing: 'easeOutBack' },
          ],
        },

        // Middle divider
        this._divider(this.H * 0.585, 0.45),

        // Title
        {
          type: 'text', text: title.toUpperCase(),
          x: this.cx, y: this.H * 0.645,
          fontSize: 68, fontWeight: '800',
          fontFamily: this.style.fontFamily,
          color: this.style.primaryColor,
          align: 'center', baseline: 'middle',
          maxWidth: 920, lineHeight: 1.2,
          shadow: { blur: 20, color: 'rgba(0,0,0,0.8)', offsetX: 0, offsetY: 4 },
          animations: [
            { type: 'fadeIn',    startTime: 0.65, duration: 0.55 },
            { type: 'slideInUp', startTime: 0.65, duration: 0.55, distance: 50 },
          ],
        },

        // Subtitle
        ...(subtitle ? [{
          type: 'text', text: subtitle,
          x: this.cx, y: this.H * 0.74,
          fontSize: 40, fontWeight: '400',
          fontFamily: this.style.fontFamily,
          color: this.style.subtitleColor,
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 0.9, duration: 0.5 }],
        }] : []),

        // Bottom line
        this._divider(this.H * 0.79, 0.75, 750),

        // Brand handle
        ...(brand ? [{
          type: 'text', text: brand,
          x: this.cx, y: this.H * 0.88,
          fontSize: 36, fontFamily: this.style.fontFamily,
          color: 'rgba(255,255,255,0.35)',
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 1.1, duration: 0.5 }],
        }] : []),
      ],
    };
  }

  _itemScene(item, activeIndex, totalItems) {
    const duration = this.config.itemDuration || 4;

    return {
      duration,
      background: this._bg(),
      elements: [
        // Huge ghost rank (decorative, behind everything)
        {
          type: 'text', text: `#${item.rank}`,
          x: -60, y: this.H * 0.44,
          fontSize: 500, fontWeight: '900',
          fontFamily: this.style.fontFamily,
          color: 'rgba(255,215,0,0.05)',
          align: 'left', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 0, duration: 0.4 }],
        },

        // Rank label (prominent, centred)
        {
          type: 'text', text: `#${item.rank}`,
          x: this.cx, y: this.H * 0.345,
          fontSize: 210, fontWeight: '900',
          fontFamily: this.style.fontFamily,
          color: this.style.accentColor,
          align: 'center', baseline: 'middle',
          shadow: { blur: 60, color: 'rgba(255,215,0,0.45)', offsetX: 0, offsetY: 0 },
          animations: [
            { type: 'fadeIn',  startTime: 0,   duration: 0.4 },
            { type: 'scaleIn', startTime: 0,   duration: 0.55, from: 0.5, easing: 'easeOutBack' },
          ],
        },

        // Divider under rank
        this._divider(this.H * 0.49, 0.3, 520),

        // Item name
        {
          type: 'text', text: item.name,
          x: this.cx, y: this.H * 0.565,
          fontSize: 96, fontWeight: '800',
          fontFamily: this.style.fontFamily,
          color: this.style.primaryColor,
          align: 'center', baseline: 'middle',
          maxWidth: 930, lineHeight: 1.15,
          shadow: { blur: 20, color: 'rgba(0,0,0,0.9)', offsetX: 0, offsetY: 4 },
          animations: [
            { type: 'fadeIn',    startTime: 0.35, duration: 0.5 },
            { type: 'slideInUp', startTime: 0.35, duration: 0.5, distance: 55 },
          ],
        },

        // Description
        ...(item.description ? [{
          type: 'text', text: item.description,
          x: this.cx, y: this.H * 0.67,
          fontSize: 46, fontWeight: '400',
          fontFamily: this.style.fontFamily,
          color: this.style.subtitleColor,
          align: 'center', baseline: 'middle',
          maxWidth: 880, lineHeight: 1.4,
          animations: [{ type: 'fadeIn', startTime: 0.55, duration: 0.55 }],
        }] : []),

        // Badge pill
        ...(item.badge ? [
          // pill background
          {
            type: 'rect',
            x: this.cx, y: this.H * 0.765,
            width: 220, height: 64,
            anchor: 'center',
            cornerRadius: 32,
            color: 'rgba(255,215,0,0.14)',
            animations: [
              { type: 'fadeIn',  startTime: 0.65, duration: 0.35 },
              { type: 'scaleIn', startTime: 0.65, duration: 0.4,  from: 0.6, easing: 'easeOutBack' },
            ],
          },
          // badge text
          {
            type: 'text', text: item.badge,
            x: this.cx, y: this.H * 0.765,
            fontSize: 30, fontWeight: '700',
            fontFamily: this.style.fontFamily,
            color: this.style.accentColor,
            align: 'center', baseline: 'middle',
            animations: [{ type: 'fadeIn', startTime: 0.7, duration: 0.3 }],
          },
        ] : []),

        // Progress dots
        ...this._progressDots(activeIndex, totalItems),
      ],
    };
  }

  _outroScene() {
    const { outroTitle, cta, brand } = this.config;
    const duration = this.config.outroDuration || 3;

    return {
      duration,
      background: this._bg(),
      elements: [
        // Main outro heading
        {
          type: 'text', text: outroTitle || "THAT'S THE LIST!",
          x: this.cx, y: this.H * 0.34,
          fontSize: 96, fontWeight: '900',
          fontFamily: this.style.fontFamily,
          color: this.style.primaryColor,
          align: 'center', baseline: 'middle',
          maxWidth: 900, lineHeight: 1.15,
          shadow: { blur: 30, color: 'rgba(0,0,0,0.8)', offsetX: 0, offsetY: 4 },
          animations: [
            { type: 'fadeIn',  startTime: 0.1, duration: 0.55 },
            { type: 'scaleIn', startTime: 0.1, duration: 0.6,  from: 0.65, easing: 'easeOutBack' },
          ],
        },

        // Divider
        this._divider(this.H * 0.47, 0.4),

        // CTA text
        {
          type: 'text', text: cta || 'Like & Subscribe for more!',
          x: this.cx, y: this.H * 0.555,
          fontSize: 54, fontWeight: '600',
          fontFamily: this.style.fontFamily,
          color: this.style.accentColor,
          align: 'center', baseline: 'middle',
          maxWidth: 880, lineHeight: 1.3,
          animations: [{ type: 'fadeIn', startTime: 0.6, duration: 0.5 }],
        },

        // Subscribe button (red pill)
        {
          type: 'rect',
          x: this.cx, y: this.H * 0.66,
          width: 440, height: 104,
          anchor: 'center', cornerRadius: 52,
          color: '#E50000',
          animations: [
            { type: 'fadeIn',  startTime: 0.8, duration: 0.4 },
            { type: 'scaleIn', startTime: 0.8, duration: 0.45, from: 0.6, easing: 'easeOutBack' },
          ],
        },
        {
          type: 'text', text: 'SUBSCRIBE',
          x: this.cx, y: this.H * 0.66,
          fontSize: 44, fontWeight: '800',
          fontFamily: this.style.fontFamily,
          color: '#FFFFFF',
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 0.9, duration: 0.3 }],
        },

        // Brand handle
        ...(brand ? [{
          type: 'text', text: brand,
          x: this.cx, y: this.H * 0.84,
          fontSize: 38, fontFamily: this.style.fontFamily,
          color: 'rgba(255,255,255,0.35)',
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 1.0, duration: 0.5 }],
        }] : []),
      ],
    };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  getScenes() {
    const { items } = this.config;
    if (!items || items.length === 0) throw new Error('TopListTemplate requires at least one item');

    // Sort descending so we show the lowest rank first (e.g. #5 before #1)
    const sorted = [...items].sort((a, b) => b.rank - a.rank);

    return [
      this._introScene(),
      ...sorted.map((item, idx) => this._itemScene(item, idx, sorted.length)),
      this._outroScene(),
    ];
  }
}

module.exports = TopListTemplate;
