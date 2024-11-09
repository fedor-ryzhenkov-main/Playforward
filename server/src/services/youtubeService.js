const { spawn } = require('child_process');
const { EventEmitter } = require('events');

class YoutubeService {
  static downloadProcesses = new Map();

  static async initiateDownload(userId, url) {
    return new Promise((resolve, reject) => {
      const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
      
      const args = isDevelopment 
        ? [
            url,
            '--extract-audio',
            '--audio-format', 'mp3',
            '--audio-quality', '0',
            '-o', '-'
          ]
        : [
            `--username=oauth+${userId}`,
            '--password=""',
            url,
            '--extract-audio',
            '--audio-format', 'mp3',
            '--audio-quality', '0',
            '-o', '-'
          ];

      console.log('Spawning yt-dlp with args:', args);

      const ytDlp = spawn('yt-dlp', args);
      const chunks = [];

      ytDlp.stdout.on('data', (data) => {
        chunks.push(data);
        console.log('Received chunk of size:', data.length);
      });

      ytDlp.stderr.on('data', (data) => {
        const output = data.toString();
        console.log('yt-dlp stderr:', output);

        if (output.includes('enter code')) {
          const authCode = output.match(/code\s+([A-Z0-9-]+)/)[1];
          resolve({
            status: 'auth_required',
            authCode
          });
        }
      });

      ytDlp.on('error', (error) => {
        console.error('yt-dlp process error:', error);
        reject(error);
      });

      ytDlp.on('close', (code) => {
        console.log('yt-dlp process closed with code:', code);
        
        if (code === 0) {
          const buffer = Buffer.concat(chunks);
          resolve({
            status: 'completed',
            data: buffer
          });
        } else {
          reject(new Error(`yt-dlp process exited with code ${code}`));
        }
      });

      this.downloadProcesses.set(userId, {
        process: ytDlp,
        status: 'downloading'
      });
    });
  }

  static getDownloadStatus(userId) {
    const processInfo = this.downloadProcesses.get(userId);
    if (!processInfo) {
      return { status: 'not_found' };
    }
    return {
      status: processInfo.status
    };
  }

  static cleanupDownload(userId) {
    const processInfo = this.downloadProcesses.get(userId);
    if (processInfo && processInfo.process) {
      processInfo.process.kill();
    }
    this.downloadProcesses.delete(userId);
  }
}

module.exports = YoutubeService; 