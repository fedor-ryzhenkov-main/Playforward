const { spawn } = require('child_process');
const { EventEmitter } = require('events');

class YoutubeService {
  static downloadProcesses = new Map();

  static async initiateDownload(userId, url) {
    return new Promise((resolve, reject) => {
      const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
      
      const args = [
        ...(isDevelopment ? [] : [`--username=oauth+${userId}`, '--password=""']),
        url,
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '-o', '-'  // Output to stdout
      ];

      console.log('Spawning yt-dlp with args:', args);

      const ytDlp = spawn('yt-dlp', args);
      const chunks = [];

      ytDlp.stdout.on('data', (data) => {
        chunks.push(data);
        console.log('Received chunk of size:', data.length);
        
        // Update process status with download progress
        const processInfo = this.downloadProcesses.get(userId);
        if (processInfo) {
          processInfo.chunks = chunks;
          processInfo.status = 'downloading';
        }
      });

      ytDlp.stderr.on('data', (data) => {
        const output = data.toString();
        console.log('yt-dlp stderr:', output);

        if (output.includes('enter code')) {
          const authCode = output.match(/code\s+([A-Z0-9-]+)/)[1];
          this.downloadProcesses.set(userId, {
            process: ytDlp,
            chunks: chunks,
            status: 'auth_required',
            authCode
          });
          resolve({
            status: 'auth_required',
            authCode
          });
        }
      });

      ytDlp.on('error', (error) => {
        console.error('yt-dlp process error:', error);
        this.downloadProcesses.delete(userId);
        reject(error);
      });

      ytDlp.on('close', (code) => {
        console.log('yt-dlp process closed with code:', code);
        
        if (code === 0) {
          const buffer = Buffer.concat(chunks);
          const processInfo = this.downloadProcesses.get(userId);
          if (processInfo) {
            processInfo.status = 'completed';
            processInfo.data = buffer;
          }
          
          if (!isDevelopment && !processInfo?.authCode) {
            resolve({ status: 'completed', data: buffer });
          }
        } else {
          this.downloadProcesses.delete(userId);
          reject(new Error(`yt-dlp process exited with code ${code}`));
        }
      });
    });
  }

  static getDownloadStatus(userId) {
    const processInfo = this.downloadProcesses.get(userId);
    if (!processInfo) {
      return { status: 'not_found' };
    }

    if (processInfo.status === 'completed' && processInfo.data) {
      const data = processInfo.data;
      this.downloadProcesses.delete(userId); // Cleanup after sending data
      return {
        status: 'completed',
        data
      };
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