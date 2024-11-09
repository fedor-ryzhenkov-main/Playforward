/**
 * Service for handling YouTube downloads using yt-dlp
 */
import { dbg } from '@utils/debug';

interface DownloadOptions {
  format?: string;
  onProgress?: (progress: number) => void;
}

interface DownloadResponse {
  status: 'auth_required' | 'completed' | 'downloading' | 'error';
  authCode?: string;
  data?: ArrayBuffer;
  progress?: number;
}

export class YtDlpService {
  private static readonly API_URL = process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? window.location.origin + '/server'
      : 'http://localhost:3001');

  /**
   * Validates a YouTube URL
   * @param url - The URL to validate
   * @returns boolean indicating if the URL is valid
   */
  private static isValidYouTubeUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['youtube.com', 'youtu.be', 'www.youtube.com'].includes(urlObj.hostname);
    } catch {
      return false;
    }
  }

  /**
   * Initiates a video download using yt-dlp
   * @param url - The YouTube video URL
   * @param options - Download options including format and progress callback
   * @returns Promise with the download result as a Blob
   * @throws Error if the download fails or times out
   */
  public static async downloadVideo(
    url: string,
    options: DownloadOptions = {}
  ): Promise<Blob | null> {
    if (!this.isValidYouTubeUrl(url)) {
      throw new Error('Invalid YouTube URL');
    }

    try {
      dbg.store('Initiating YouTube download...');
      
      const response = await fetch(`${this.API_URL}/youtube/download/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Download failed: ${errorText}`);
      }

      const data: DownloadResponse = await response.json();
      dbg.store('Download response:', data);

      if (data.status === 'auth_required') {
        window.open('https://www.google.com/device', '_blank');
        alert(`Please enter this code on the Google device page: ${data.authCode}`);
        return await this.pollDownloadStatus(options.onProgress);
      }

      return null;
    } catch (error) {
      dbg.store(`Download error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Polls the server for download status and data
   * @param onProgress - Optional callback for download progress
   * @returns Promise with the downloaded audio as a Blob
   */
  private static async pollDownloadStatus(
    onProgress?: (progress: number) => void,
    interval = 1000
  ): Promise<Blob | null> {
    let attempts = 0;
    const maxAttempts = 300; // 5 minutes maximum

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${this.API_URL}/youtube/download/status`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to get download status');
        }

        const data: DownloadResponse = await response.json();
        dbg.store('Download status:', data);

        if (data.progress && onProgress) {
          onProgress(data.progress);
        }

        if (data.status === 'completed' && data.data) {
          // Convert the ArrayBuffer to a Blob
          return new Blob([new Uint8Array(data.data)], { type: 'audio/mpeg' });
        }

        if (data.status === 'error') {
          throw new Error('Download failed on server');
        }

        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
      } catch (error) {
        dbg.store(`Status check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    }

    throw new Error('Download timed out');
  }

  /**
   * Checks if the server is available
   * @returns Promise<boolean>
   */
  public static async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/health`, {
        credentials: 'include',
      });
      const data = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }
}