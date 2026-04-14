/**
 * Base class for all reel templates.
 *
 * Subclasses must implement `getScenes()` which returns an array of scene objects.
 * Each scene: { duration, background, elements[] }
 */
class BaseTemplate {
  constructor(config = {}) {
    this.config = config;
    this.width  = config.width  || 1080;
    this.height = config.height || 1920;
    this.fps    = config.fps    || 30;
  }

  /** Returns the total video duration in seconds. */
  getTotalDuration() {
    return this.getScenes().reduce((sum, scene) => sum + scene.duration, 0);
  }

  /** Override in subclasses. Must return an array of scene objects. */
  getScenes() {
    throw new Error(`${this.constructor.name} must implement getScenes()`);
  }

  /** Returns renderer-compatible options. */
  getRendererOptions() {
    return { width: this.width, height: this.height, fps: this.fps };
  }
}

module.exports = BaseTemplate;
