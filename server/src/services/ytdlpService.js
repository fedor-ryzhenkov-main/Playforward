const { spawn } = require('child_process');
const { EventEmitter } = require('events');

class YoutubeService {
  static async initiateDownload(userId, url) {
    return new Promise((resolve, reject) => {
      const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
      const args = [
        ...(isDevelopment ? [] : [`--username=oauth+${userId}`, '--password=""']),
        url,
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '--print', 'after_move:filepath',
        '-o', '%(title)s.%(ext)s'
      ];

      console.log('Starting download with args:', args);

      const ytDlp = spawn('yt-dlp', args);
      let outputFilePath = '';

      ytDlp.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log('yt-dlp stdout:', output);
        if (output && !output.includes('[download]')) {
          outputFilePath = output;
        }
      });

      ytDlp.stderr.on('data', (data) => {
        const output = data.toString();
        console.log('yt-dlp stderr:', output);

        if (output.includes('enter code')) {
          const authCode = output.match(/code\s+([A-Z0-9-]+)/)[1];
          this.downloadProcesses.set(userId, {
            process: ytDlp,
            status: 'auth_required',
            authCode,
            outputFilePath
          });
          resolve({ status: 'auth_required', authCode });
        }
      });

      ytDlp.on('close', async (code) => {
        console.log('yt-dlp process closed with code:', code);
        
        if (code === 0 && outputFilePath) {
          try {
            const fs = require('fs');
            const data = await fs.promises.readFile(outputFilePath);
            const processInfo = this.downloadProcesses.get(userId);
            
            if (processInfo) {
              processInfo.status = 'completed';
              processInfo.data = data;
            }

            // Clean up the temporary file
            await fs.promises.unlink(outputFilePath);
            
            if (!isDevelopment && !processInfo?.authCode) {
              resolve({ status: 'completed', data });
            }
          } catch (error) {
            console.error('Error reading downloaded file:', error);
            reject(error);
          }
        } else {
          reject(new Error(`yt-dlp process exited with code ${code}`));
        }
      });

      ytDlp.on('error', (error) => {
        console.error('yt-dlp process error:', error);
        reject(error);
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
      this.downloadProcesses.delete(userId);
      return {
        status: 'completed',
        data: data
      };
    }

    return {
      status: processInfo.status,
      authCode: processInfo.authCode
    };
  }
}

module.exports = YoutubeService;