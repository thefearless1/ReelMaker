const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

/**
 * Exports rendered frames to a video file via FFmpeg.
 * Falls back to frame-only export if FFmpeg is not installed.
 */
class VideoExporter {
  constructor(options = {}) {
    this.ffmpegPath = options.ffmpegPath || 'ffmpeg';
  }

  _ffmpegAvailable() {
    try {
      execSync(`${this.ffmpegPath} -version`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Renders all frames to a directory as PNG files.
   * @returns {{ framesDir, totalFrames, padLength }}
   */
  async saveFrames(renderer, scenes, totalDuration, framesDir) {
    fs.mkdirSync(framesDir, { recursive: true });

    const totalFrames = Math.ceil(totalDuration * renderer.fps);
    const padLength   = String(totalFrames).length;

    console.log(`\nRendering ${totalFrames} frames at ${renderer.fps}fps (${Math.round(totalDuration)}s)...`);

    for (let i = 0; i < totalFrames; i++) {
      const t      = i / renderer.fps;
      const buffer = await renderer.renderFrame(scenes, t);
      const name   = `frame_${String(i).padStart(padLength, '0')}.png`;
      fs.writeFileSync(path.join(framesDir, name), buffer);

      if (i % renderer.fps === 0 || i === totalFrames - 1) {
        const pct = Math.round((i / totalFrames) * 100);
        process.stdout.write(`\r  ${pct}% — frame ${i + 1}/${totalFrames}`);
      }
    }

    process.stdout.write('\n');
    console.log('Frame rendering complete.\n');

    return { framesDir, totalFrames, padLength };
  }

  /**
   * Renders all frames then compiles them into an MP4 with FFmpeg.
   * If FFmpeg is not found, frames are left on disk with instructions.
   */
  async exportVideo(renderer, scenes, totalDuration, outputPath, options = {}) {
    const tmpDir = path.join(path.dirname(outputPath), '.reel_frames');

    try {
      const { padLength } = await this.saveFrames(renderer, scenes, totalDuration, tmpDir);

      if (!this._ffmpegAvailable()) {
        console.warn('FFmpeg not found — frames are in:', tmpDir);
        console.warn('To compile manually:');
        console.warn(
          `  ffmpeg -framerate ${renderer.fps} -i "${tmpDir}/frame_%0${padLength}d.png"` +
          ` -c:v libx264 -pix_fmt yuv420p "${outputPath}"`
        );
        return;
      }

      console.log('Compiling with FFmpeg...');

      const args = [
        '-y',
        '-framerate', String(renderer.fps),
        '-i', path.join(tmpDir, `frame_%0${padLength}d.png`),
        '-c:v', 'libx264',
        '-preset', options.preset || 'medium',
        '-crf', String(options.crf ?? 20),
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        outputPath,
      ];

      const result = spawnSync(this.ffmpegPath, args, { stdio: 'inherit' });
      if (result.status !== 0) throw new Error(`FFmpeg exited with code ${result.status}`);

      console.log('Video saved to:', outputPath);
    } finally {
      if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}

module.exports = VideoExporter;
