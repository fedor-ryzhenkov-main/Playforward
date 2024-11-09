const { spawn } = require('child_process');
const trackModel = require('../models/trackModel');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

class YoutubeService {
  static downloadProcesses = new Map();

  static async initiateDownload(userId, url, metadata) {
    // Validate metadata first
    if (!metadata?.name) {
      throw new Error('Track name is required');
    }

    return new Promise((resolve, reject) => {
      const trackId = uuidv4();
      const outputPath = `/tmp/${trackId}.mp3`;
      
      const args = [
        url,
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '-o', outputPath
      ];

      const ytDlp = spawn('yt-dlp', args);
      
      ytDlp.stderr.on('data', (data) => {
        const output = data.toString();
        console.log('yt-dlp stderr:', output);
        
        if (output.includes('enter code')) {
          const authCode = output.match(/code\s+([A-Z0-9-]+)/)[1];
          this.downloadProcesses.set(userId, {
            process: ytDlp,
            status: 'auth_required',
            authCode,
            trackId,
            metadata: {
              id: trackId,
              name: metadata.name,
              description: metadata.description || '',
              tags: metadata.tags || []
            },
            outputPath
          });
          resolve({ status: 'auth_required', authCode });
        }
      });

      ytDlp.stdout.on('data', (data) => {
        console.log('yt-dlp stdout:', data.toString());
      });

      ytDlp.on('close', async (code) => {
        console.log('yt-dlp process closed with code:', code);
        const processInfo = this.downloadProcesses.get(userId);
        
        if (code === 0) {
          try {
            // First check if the file exists and is readable
            await fs.access(outputPath);
            const audioBuffer = await fs.readFile(outputPath);

            // Create track record only after successful download
            const track = await trackModel.createTrack(userId, {
              id: trackId,
              name: metadata.name,
              description: metadata.description || '',
              tags: metadata.tags || []
            });
            
            if (!track) {
              throw new Error('Failed to create track record');
            }

            // Save the audio data
            await trackModel.saveAudio(trackId, audioBuffer);
            
            // Clean up the temporary file
            await fs.unlink(outputPath);
            
            // Update process status
            if (processInfo) {
              processInfo.status = 'completed';
              processInfo.trackId = trackId;
            }

            // If no auth was required, resolve immediately
            if (!processInfo?.authCode) {
              resolve({ status: 'completed', trackId });
            }
          } catch (error) {
            console.error('Error processing download:', error);
            
            // Clean up on error
            try {
              await fs.unlink(outputPath);
            } catch (unlinkError) {
              console.error('Failed to clean up temporary file:', unlinkError);
            }
            
            reject(error);
          }
        } else {
          // Clean up process info on failure
          this.downloadProcesses.delete(userId);
          reject(new Error(`yt-dlp process exited with code ${code}`));
        }
      });

      ytDlp.on('error', (error) => {
        console.error('yt-dlp process error:', error);
        this.downloadProcesses.delete(userId);
        reject(error);
      });
    });
  }

  static async getDownloadStatus(userId) {
    const processInfo = this.downloadProcesses.get(userId);
    
    if (!processInfo) {
      return { status: 'not_found' };
    }

    if (processInfo.status === 'completed') {
      // Verify track exists before returning success
      const track = await trackModel.getTrack(processInfo.trackId, userId);
      if (!track) {
        this.downloadProcesses.delete(userId);
        return { status: 'error', message: 'Track not found' };
      }

      this.downloadProcesses.delete(userId);
      return { 
        status: 'completed', 
        trackId: processInfo.trackId 
      };
    }

    return {
      status: processInfo.status,
      authCode: processInfo.authCode
    };
  }

  static async cleanupDownload(userId) {
    const processInfo = this.downloadProcesses.get(userId);
    if (processInfo) {
      if (processInfo.process) {
        processInfo.process.kill();
      }
      if (processInfo.outputPath) {
        try {
          await fs.unlink(processInfo.outputPath);
        } catch (error) {
          console.error('Failed to clean up temporary file:', error);
        }
      }
      this.downloadProcesses.delete(userId);
    }
  }
}

module.exports = YoutubeService; 