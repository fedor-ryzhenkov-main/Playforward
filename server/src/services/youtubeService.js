const { spawn } = require('child_process');
const { EventEmitter } = require('events');

class YoutubeService {
  static downloadProcesses = new Map();

  static async initiateDownload(userId, url) {
    return new Promise((resolve, reject) => {
      const args = process.env.NODE_ENV === 'development' 
        ? [url]
        : [`--username=oauth+${userId}`, '--password=""', url];

      const process = spawn('yt-dlp', args);

      let authCode = null;
      let isAuthRequired = false;

      process.stderr.on('data', (data) => {
        const output = data.toString();
        console.log('yt-dlp stderr:', output);

        if (output.includes('enter code')) {
          isAuthRequired = true;
          authCode = output.match(/code\s+([A-Z0-9-]+)/)[1];

          resolve({
            status: 'auth_required',
            authCode
          });
        }
      });

      process.stdout.on('data', (data) => {
        console.log('yt-dlp stdout:', data.toString());
      });

      process.on('error', (error) => {
        console.error('yt-dlp process error:', error);
        reject(error);
      });

      process.on('close', (code) => {
        console.log('yt-dlp process closed with code:', code);
        
        if (code !== 0 && !isAuthRequired) {
          reject(new Error(`yt-dlp process exited with code ${code}`));
        }
        
        if (isAuthRequired) {
          this.downloadProcesses.set(userId, {
            process,
            authCode,
            status: 'auth_required'
          });
        }
      });
    });
  }

  static getDownloadStatus(userId) {
    const processInfo = this.downloadProcesses.get(userId);
    if (!processInfo) {
      return { status: 'not_found' };
    }
    return {
      status: processInfo.status,
      authCode: processInfo.authCode
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