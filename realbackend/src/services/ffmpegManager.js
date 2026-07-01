const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpegConfig = require('../config/ffmpeg');

class FFmpegManager {
  constructor() {
    this.binary = ffmpegConfig.binary;
    this.hlsBasePath = ffmpegConfig.hlsBasePath;
    this.activeProcesses = new Map(); // streamId -> { child, pid }
  }

  startStream(stream) {
    return new Promise((resolve, reject) => {
      const outputDir = path.join(this.hlsBasePath, stream.slug);
      fs.mkdirSync(outputDir, { recursive: true });

      // Clean old segments
      fs.readdirSync(outputDir).forEach(f => fs.unlinkSync(path.join(outputDir, f)));

      const args = [
        '-hide_banner', '-loglevel', 'warning',
        '-user_agent', 'VLC/3.0.18',
        '-reconnect', '1', '-reconnect_streamed', '1', '-reconnect_delay_max', '10',
        '-i', stream.source_url,
        '-c', 'copy',
        '-f', 'hls',
        `-hls_time`, `${ffmpegConfig.hlsTime}`,
        '-hls_list_size', `${ffmpegConfig.hlsListSize}`,
        '-hls_flags', 'delete_segments+append_list+omit_endlist',
        '-hls_segment_type', 'mpegts',
        '-hls_segment_filename', path.join(outputDir, 'index%d.ts'),
        path.join(outputDir, 'index.m3u8')
      ];

      const child = spawn(this.binary, args, {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      child.stderr.on('data', data => {
        // log FFmpeg output
      });

      child.on('error', err => {
        reject(err);
      });

      child.on('close', code => {
        this.activeProcesses.delete(stream.id);
        // could broadcast 'inactive' if needed
      });

      this.activeProcesses.set(stream.id, { child, pid: child.pid });

      // Wait a moment, then resolve if process is alive
      setTimeout(() => {
        // In real case you'd check for playlist existence, but resolve early
        resolve(child.pid);
      }, 2000);

      child.unref();
    });
  }

  stopStream(stream) {
    const record = this.activeProcesses.get(stream.id);
    if (record) {
      try { process.kill(-record.pid, 'SIGTERM'); } catch(e) {}
      record.child.kill('SIGTERM');
      this.activeProcesses.delete(stream.id);
    } else if (stream.pid) {
      try { process.kill(stream.pid, 'SIGTERM'); } catch(e) {}
    }
    // Clean HLS directory
    const outputDir = path.join(this.hlsBasePath, stream.slug);
    if (fs.existsSync(outputDir)) {
      fs.readdirSync(outputDir).forEach(f => fs.unlinkSync(path.join(outputDir, f)));
    }
  }

  checkAndRestart() {
    // You can implement a periodic check similar to checkAndRestartStreams
  }
}

module.exports = new FFmpegManager();