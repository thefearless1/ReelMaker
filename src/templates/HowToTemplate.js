const BaseTemplate = require('./BaseTemplate');

/**
 * HowToTemplate — step-by-step tutorial / explainer format.
 *
 * Config shape:
 * {
 *   hook: {
 *     badge:    string,   // pill label, e.g. "AI AGENT"
 *     title:    string,
 *     subtitle: string,
 *     brand:    string,   // optional channel handle
 *   },
 *   problems: [
 *     { label: string, title: string, description: string, stat?: string }
 *   ],
 *   steps: [
 *     {
 *       number:      number,
 *       title:       string,
 *       description: string,
 *       image?:      string,   // URL or local path — used as blurred bg
 *       tip?:        string,   // small callout text
 *     }
 *   ],
 *   results: [
 *     { value: string, label: string }
 *   ],
 *   outro: {
 *     title?: string,
 *     cta?:   string,
 *     brand?: string,
 *   },
 *   style: {
 *     accentColor:    string,   // default '#00D4FF'
 *     accentSecondary:string,   // default '#7B2FFF'
 *     primaryColor:   string,
 *     subtitleColor:  string,
 *     fontFamily:     string,
 *   }
 * }
 */
class HowToTemplate extends BaseTemplate {
  constructor(config) {
    super({ width: 1080, height: 1920, fps: 30, ...config });

    this.style = {
      accentColor:     '#00D4FF',
      accentSecondary: '#7B2FFF',
      primaryColor:    '#FFFFFF',
      subtitleColor:   '#8A9BB0',
      warnColor:       '#FF6B35',
      fontFamily:      'sans-serif',
      ...config.style,
    };

    this.W  = this.width;
    this.H  = this.height;
    this.cx = this.width / 2;
  }

  // ── Shared helpers ─────────────────────────────────────────────────────────

  _darkBg() {
    return {
      type: 'gradient',
      direction: [0, 0, 0, 1],
      stops: [
        { position: 0,    color: '#070B18' },
        { position: 0.45, color: '#0D1429' },
        { position: 1,    color: '#060910' },
      ],
    };
  }

  _imageBg(src) {
    return { type: 'image', src };
  }

  // Semi-transparent overlay to darken image backgrounds
  _overlay(opacity = 0.86) {
    return {
      type: 'rect',
      x: 0, y: 0,
      width: this.W, height: this.H,
      color: `rgba(6, 9, 22, ${opacity})`,
    };
  }

  // Horizontal accent divider with gradient fade-out on edges
  _line(y, startTime = 0.2, color, width = 520) {
    return {
      type: 'rect',
      x: this.cx, y,
      width, height: 3,
      anchor: 'center',
      cornerRadius: 2,
      gradient: [
        { position: 0,   color: 'rgba(0,212,255,0)' },
        { position: 0.3, color: color || this.style.accentColor },
        { position: 0.7, color: color || this.style.accentColor },
        { position: 1,   color: 'rgba(0,212,255,0)' },
      ],
      animations: [
        { type: 'expandWidth', startTime, duration: 0.65, easing: 'easeOutCubic' },
        { type: 'fadeIn',      startTime, duration: 0.3 },
      ],
    };
  }

  // Pill badge — two rects (outer bg + inner glow) + text
  _badge(text, x, y, startTime = 0, color) {
    const c = color || this.style.accentColor;
    return [
      {
        type: 'rect',
        x, y,
        width: Math.max(260, text.length * 18 + 60), height: 68,
        anchor: 'center',
        cornerRadius: 34,
        color: 'rgba(0,212,255,0.12)',
        animations: [
          { type: 'fadeIn',  startTime,       duration: 0.4 },
          { type: 'scaleIn', startTime,       duration: 0.45, from: 0.6, easing: 'easeOutBack' },
        ],
      },
      {
        type: 'text',
        text,
        x, y,
        fontSize: 30, fontWeight: '700',
        fontFamily: this.style.fontFamily,
        color: c,
        align: 'center', baseline: 'middle',
        animations: [
          { type: 'fadeIn', startTime: startTime + 0.1, duration: 0.3 },
        ],
      },
    ];
  }

  // Large stat block used in results scene
  _statBlock(value, label, x, y, startTime) {
    return [
      {
        type: 'rect',
        x, y,
        width: 900, height: 160,
        anchor: 'center',
        cornerRadius: 20,
        color: 'rgba(0,212,255,0.07)',
        animations: [
          { type: 'fadeIn',    startTime, duration: 0.4 },
          { type: 'slideInUp', startTime, duration: 0.45, distance: 40 },
        ],
      },
      {
        type: 'text',
        text: value,
        x, y: y - 28,
        fontSize: 88, fontWeight: '900',
        fontFamily: this.style.fontFamily,
        color: this.style.accentColor,
        align: 'center', baseline: 'middle',
        shadow: { blur: 30, color: 'rgba(0,212,255,0.4)', offsetX: 0, offsetY: 0 },
        animations: [
          { type: 'fadeIn',    startTime: startTime + 0.1, duration: 0.4 },
          { type: 'slideInUp', startTime: startTime + 0.1, duration: 0.45, distance: 30 },
        ],
      },
      {
        type: 'text',
        text: label,
        x, y: y + 52,
        fontSize: 36, fontWeight: '500',
        fontFamily: this.style.fontFamily,
        color: this.style.subtitleColor,
        align: 'center', baseline: 'middle',
        animations: [
          { type: 'fadeIn', startTime: startTime + 0.2, duration: 0.4 },
        ],
      },
    ];
  }

  // ── Scenes ─────────────────────────────────────────────────────────────────

  _hookScene() {
    const { hook } = this.config;

    return {
      duration: this.config.hookDuration || 3,
      background: this._darkBg(),
      elements: [
        // Top accent line
        this._line(this.H * 0.16, 0.1, this.style.accentColor, 700),

        // Badge
        ...this._badge(hook.badge || 'HOW TO', this.cx, this.H * 0.25, 0.15),

        // Main title
        {
          type: 'text',
          text: hook.title.toUpperCase(),
          x: this.cx, y: this.H * 0.42,
          fontSize: 88, fontWeight: '900',
          fontFamily: this.style.fontFamily,
          color: this.style.primaryColor,
          align: 'center', baseline: 'middle',
          maxWidth: 920, lineHeight: 1.15,
          shadow: { blur: 24, color: 'rgba(0,0,0,0.9)', offsetX: 0, offsetY: 4 },
          animations: [
            { type: 'fadeIn',    startTime: 0.3, duration: 0.55 },
            { type: 'slideInUp', startTime: 0.3, duration: 0.55, distance: 55 },
          ],
        },

        // Middle line
        this._line(this.H * 0.57, 0.55),

        // Subtitle
        {
          type: 'text',
          text: hook.subtitle,
          x: this.cx, y: this.H * 0.65,
          fontSize: 48, fontWeight: '400',
          fontFamily: this.style.fontFamily,
          color: this.style.subtitleColor,
          align: 'center', baseline: 'middle',
          maxWidth: 880, lineHeight: 1.4,
          animations: [
            { type: 'fadeIn',    startTime: 0.65, duration: 0.5 },
            { type: 'slideInUp', startTime: 0.65, duration: 0.5, distance: 35 },
          ],
        },

        // Bottom line
        this._line(this.H * 0.8, 0.75, this.style.accentColor, 700),

        // Brand
        ...(hook.brand ? [{
          type: 'text',
          text: hook.brand,
          x: this.cx, y: this.H * 0.88,
          fontSize: 36, fontFamily: this.style.fontFamily,
          color: 'rgba(255,255,255,0.3)',
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 0.9, duration: 0.5 }],
        }] : []),
      ],
    };
  }

  _problemScene(problem, index) {
    const duration = this.config.problemDuration || 3.5;
    const isFirst  = index === 0;

    return {
      duration,
      background: this._darkBg(),
      elements: [
        // Top label
        this._line(this.H * 0.14, 0.05, this.style.warnColor, 600),
        ...this._badge(problem.label || 'THE CHALLENGE', this.cx, this.H * 0.22, 0.1, this.style.warnColor),

        // Problem title
        {
          type: 'text',
          text: problem.title,
          x: this.cx, y: this.H * 0.42,
          fontSize: 84, fontWeight: '900',
          fontFamily: this.style.fontFamily,
          color: this.style.primaryColor,
          align: 'center', baseline: 'middle',
          maxWidth: 900, lineHeight: 1.2,
          shadow: { blur: 20, color: 'rgba(0,0,0,0.9)', offsetX: 0, offsetY: 4 },
          animations: [
            { type: 'fadeIn',    startTime: 0.25, duration: 0.5 },
            { type: 'slideInUp', startTime: 0.25, duration: 0.5, distance: 50 },
          ],
        },

        // Divider
        this._line(this.H * 0.565, 0.5, this.style.warnColor, 460),

        // Description
        {
          type: 'text',
          text: problem.description,
          x: this.cx, y: this.H * 0.65,
          fontSize: 46, fontWeight: '400',
          fontFamily: this.style.fontFamily,
          color: this.style.subtitleColor,
          align: 'center', baseline: 'middle',
          maxWidth: 880, lineHeight: 1.45,
          animations: [{ type: 'fadeIn', startTime: 0.55, duration: 0.55 }],
        },

        // Stat callout
        ...(problem.stat ? [
          {
            type: 'rect',
            x: this.cx, y: this.H * 0.81,
            width: 820, height: 100,
            anchor: 'center',
            cornerRadius: 16,
            color: `rgba(255, 107, 53, 0.12)`,
            animations: [
              { type: 'fadeIn',  startTime: 0.7, duration: 0.4 },
              { type: 'scaleIn', startTime: 0.7, duration: 0.4, from: 0.85 },
            ],
          },
          {
            type: 'text',
            text: problem.stat,
            x: this.cx, y: this.H * 0.81,
            fontSize: 40, fontWeight: '600',
            fontFamily: this.style.fontFamily,
            color: this.style.warnColor,
            align: 'center', baseline: 'middle',
            animations: [{ type: 'fadeIn', startTime: 0.8, duration: 0.35 }],
          },
        ] : []),
      ],
    };
  }

  _stepScene(step, index) {
    const duration   = this.config.stepDuration || 4.5;
    const stepNum    = step.number || index + 1;
    const totalSteps = this.config.steps.length;
    const hasImage   = !!step.image;

    // Layout: badge → image card (if any) → divider → title → description → tip
    const imageCardY  = this.H * 0.32;
    const imageCardH  = 490;
    const imageCardW  = 960;
    const dividerY    = hasImage ? this.H * 0.52 : this.H * 0.38;
    const titleY      = hasImage ? this.H * 0.605 : this.H * 0.46;
    const descY       = hasImage ? this.H * 0.715 : this.H * 0.58;
    const tipY        = hasImage ? this.H * 0.845 : this.H * 0.72;

    return {
      duration,
      background: this._darkBg(),
      elements: [
        // Step badge
        ...this._badge(`STEP ${stepNum} OF ${totalSteps}`, this.cx, this.H * 0.1, 0.1),

        // Interface screenshot as a floating card
        ...(hasImage ? [
          // Card glow / border
          {
            type: 'rect',
            x: this.cx, y: imageCardY,
            width: imageCardW + 6, height: imageCardH + 6,
            anchor: 'center', cornerRadius: 19,
            color: 'rgba(0,212,255,0.25)',
            animations: [
              { type: 'fadeIn',  startTime: 0.1, duration: 0.5 },
              { type: 'scaleIn', startTime: 0.1, duration: 0.55, from: 0.88, easing: 'easeOutCubic' },
            ],
          },
          // Screenshot
          {
            type: 'image',
            src: step.image,
            x: this.cx, y: imageCardY,
            width: imageCardW, height: imageCardH,
            anchor: 'center', cornerRadius: 16,
            animations: [
              { type: 'fadeIn',  startTime: 0.15, duration: 0.5 },
              { type: 'scaleIn', startTime: 0.15, duration: 0.55, from: 0.88, easing: 'easeOutCubic' },
            ],
          },
          // "Tungsten TotalAgility" caption under card
          {
            type: 'text',
            text: 'Tungsten TotalAgility',
            x: this.cx, y: imageCardY + imageCardH / 2 + 38,
            fontSize: 26, fontFamily: this.style.fontFamily,
            color: 'rgba(0,212,255,0.35)',
            align: 'center', baseline: 'middle',
            animations: [{ type: 'fadeIn', startTime: 0.5, duration: 0.4 }],
          },
        ] : []),

        // Divider
        this._line(dividerY, 0.3),

        // Step title
        {
          type: 'text',
          text: step.title,
          x: this.cx, y: titleY,
          fontSize: hasImage ? 74 : 82, fontWeight: '800',
          fontFamily: this.style.fontFamily,
          color: this.style.primaryColor,
          align: 'center', baseline: 'middle',
          maxWidth: 920, lineHeight: 1.2,
          shadow: { blur: 20, color: 'rgba(0,0,0,0.95)', offsetX: 0, offsetY: 4 },
          animations: [
            { type: 'fadeIn',    startTime: 0.35, duration: 0.5 },
            { type: 'slideInUp', startTime: 0.35, duration: 0.5, distance: 45 },
          ],
        },

        // Description
        {
          type: 'text',
          text: step.description,
          x: this.cx, y: descY,
          fontSize: hasImage ? 40 : 44, fontWeight: '400',
          fontFamily: this.style.fontFamily,
          color: this.style.subtitleColor,
          align: 'center', baseline: 'middle',
          maxWidth: 880, lineHeight: 1.4,
          animations: [{ type: 'fadeIn', startTime: 0.5, duration: 0.55 }],
        },

        // Tip callout
        ...(step.tip ? [
          {
            type: 'rect',
            x: this.cx, y: tipY,
            width: 860, height: 100,
            anchor: 'center', cornerRadius: 14,
            color: 'rgba(123,47,255,0.15)',
            animations: [{ type: 'fadeIn', startTime: 0.65, duration: 0.4 }],
          },
          {
            type: 'text',
            text: `💡  ${step.tip}`,
            x: this.cx, y: tipY,
            fontSize: 33, fontWeight: '500',
            fontFamily: this.style.fontFamily,
            color: '#B088FF',
            align: 'center', baseline: 'middle',
            maxWidth: 800, lineHeight: 1.3,
            animations: [{ type: 'fadeIn', startTime: 0.75, duration: 0.4 }],
          },
        ] : []),
      ],
    };
  }

  _resultScene() {
    const { results = [] } = this.config;
    const duration = this.config.resultDuration || 4;
    const spacing  = 220;
    const startY   = this.H * 0.35;

    return {
      duration,
      background: this._darkBg(),
      elements: [
        this._line(this.H * 0.14, 0.05, this.style.accentColor, 650),
        ...this._badge('THE RESULT', this.cx, this.H * 0.22, 0.1),

        // Result stat blocks stacked vertically
        ...results.flatMap((r, i) =>
          this._statBlock(r.value, r.label, this.cx, startY + i * spacing, 0.2 + i * 0.2)
        ),

        this._line(this.H * 0.9, 0.7, this.style.accentColor, 650),
      ],
    };
  }

  _outroScene() {
    const outro   = this.config.outro || {};
    const duration = this.config.outroDuration || 3;

    return {
      duration,
      background: this._darkBg(),
      elements: [
        {
          type: 'text',
          text: outro.title || 'START BUILDING TODAY',
          x: this.cx, y: this.H * 0.34,
          fontSize: 90, fontWeight: '900',
          fontFamily: this.style.fontFamily,
          color: this.style.primaryColor,
          align: 'center', baseline: 'middle',
          maxWidth: 900, lineHeight: 1.15,
          shadow: { blur: 30, color: 'rgba(0,0,0,0.8)', offsetX: 0, offsetY: 4 },
          animations: [
            { type: 'fadeIn',  startTime: 0.1, duration: 0.55 },
            { type: 'scaleIn', startTime: 0.1, duration: 0.6, from: 0.65, easing: 'easeOutBack' },
          ],
        },

        this._line(this.H * 0.47, 0.4),

        {
          type: 'text',
          text: outro.cta || 'Like & Subscribe for more AI tutorials!',
          x: this.cx, y: this.H * 0.56,
          fontSize: 50, fontWeight: '600',
          fontFamily: this.style.fontFamily,
          color: this.style.accentColor,
          align: 'center', baseline: 'middle',
          maxWidth: 880, lineHeight: 1.35,
          animations: [{ type: 'fadeIn', startTime: 0.55, duration: 0.5 }],
        },

        // Subscribe button
        {
          type: 'rect',
          x: this.cx, y: this.H * 0.67,
          width: 440, height: 104,
          anchor: 'center', cornerRadius: 52,
          color: '#E50000',
          animations: [
            { type: 'fadeIn',  startTime: 0.75, duration: 0.4 },
            { type: 'scaleIn', startTime: 0.75, duration: 0.45, from: 0.6, easing: 'easeOutBack' },
          ],
        },
        {
          type: 'text',
          text: 'SUBSCRIBE',
          x: this.cx, y: this.H * 0.67,
          fontSize: 44, fontWeight: '800',
          fontFamily: this.style.fontFamily,
          color: '#FFFFFF',
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 0.85, duration: 0.3 }],
        },

        ...(outro.brand ? [{
          type: 'text',
          text: outro.brand,
          x: this.cx, y: this.H * 0.84,
          fontSize: 38, fontFamily: this.style.fontFamily,
          color: 'rgba(255,255,255,0.3)',
          align: 'center', baseline: 'middle',
          animations: [{ type: 'fadeIn', startTime: 1.0, duration: 0.5 }],
        }] : []),
      ],
    };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  getScenes() {
    const { problems = [], steps = [] } = this.config;
    return [
      this._hookScene(),
      ...problems.map((p, i) => this._problemScene(p, i)),
      ...steps.map((s, i) => this._stepScene(s, i)),
      this._resultScene(),
      this._outroScene(),
    ];
  }
}

module.exports = HowToTemplate;
