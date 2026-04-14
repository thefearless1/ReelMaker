const easings = require('./easings');

/**
 * Computes the animated state of an element at a given local scene time.
 *
 * Each element may have an `animations` array. Each animation entry has:
 *   type       - animation type (see switch below)
 *   startTime  - seconds from scene start when the animation begins
 *   duration   - seconds the animation runs over
 *   easing     - key from easings.js (default: 'easeOutCubic')
 *   ...params  - type-specific parameters (distance, from, to, etc.)
 *
 * Returns a state object that the Renderer applies when drawing.
 */
class Animator {
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  static getProgress(currentTime, startTime, duration) {
    if (duration <= 0) return 1;
    if (currentTime < startTime) return 0;
    if (currentTime >= startTime + duration) return 1;
    return (currentTime - startTime) / duration;
  }

  static applyEasing(t, easingName = 'easeOutCubic') {
    const fn = easings[easingName];
    return fn ? fn(this.clamp(t, 0, 1)) : this.clamp(t, 0, 1);
  }

  static getElementState(element, localTime) {
    const state = {
      opacity:    element.opacity !== undefined ? element.opacity : 1,
      translateX: 0,
      translateY: 0,
      scale:      1,
      rotation:   element.rotation || 0,
      // widthProgress: used by 'expandWidth' animation on rect/line elements
    };

    if (!element.animations || element.animations.length === 0) return state;

    for (const anim of element.animations) {
      const rawProgress = this.getProgress(
        localTime,
        anim.startTime !== undefined ? anim.startTime : 0,
        anim.duration  !== undefined ? anim.duration  : 0.5
      );
      const p = this.applyEasing(rawProgress, anim.easing || 'easeOutCubic');

      switch (anim.type) {
        case 'fadeIn':
          state.opacity *= p;
          break;

        case 'fadeOut':
          state.opacity *= (1 - p);
          break;

        case 'slideInUp':
          state.translateY += this.lerp(anim.distance || 80, 0, p);
          break;

        case 'slideInDown':
          state.translateY += this.lerp(-(anim.distance || 80), 0, p);
          break;

        case 'slideInLeft':
          state.translateX += this.lerp(-(anim.distance || 80), 0, p);
          break;

        case 'slideInRight':
          state.translateX += this.lerp(anim.distance || 80, 0, p);
          break;

        case 'slideOutUp':
          state.translateY += this.lerp(0, -(anim.distance || 80), p);
          break;

        case 'slideOutDown':
          state.translateY += this.lerp(0, anim.distance || 80, p);
          break;

        case 'slideOutLeft':
          state.translateX += this.lerp(0, -(anim.distance || 80), p);
          break;

        case 'slideOutRight':
          state.translateX += this.lerp(0, anim.distance || 80, p);
          break;

        case 'scaleIn': {
          const from = anim.from !== undefined ? anim.from : 0;
          state.scale *= this.lerp(from, 1, p);
          break;
        }

        case 'scaleOut': {
          const to = anim.to !== undefined ? anim.to : 0;
          state.scale *= this.lerp(1, to, p);
          break;
        }

        case 'expandWidth':
          // Progressively reveals the width of a rect or line from 0 → full.
          state.widthProgress = p;
          break;

        default:
          break;
      }
    }

    return state;
  }
}

module.exports = Animator;
