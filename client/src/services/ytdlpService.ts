/**
 * Service for handling YouTube downloads using yt-dlp
 */
import { dbg } from '@utils/debug';

interface DownloadOptions {
  format?: string;
  onProgress?: (progress: number) => void;
}

export class YtDlpService {
  private static readonly API_URL = process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3001');

  private static readonly TIMEOUT = 5 * 60 * 1000; // 5 minutes

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
    const { format = 'bestaudio', onProgress } = options;

    // Validate URL
    if (!this.isValidYouTubeUrl(url)) {
      throw new Error('Invalid YouTube URL');
    }

    try {
      dbg.store(`Starting download from ${url} with format ${format}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(`${this.API_URL}/api/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format }),
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        window.location.href = `${this.API_URL}/auth/youtube`;
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        dbg.store(`Download failed: ${errorText}`);
        throw new Error(`Download failed: ${errorText}`);
      }

      // Handle download progress if callback provided
      if (onProgress && response.body) {
        const reader = response.body.getReader();
        const contentLength = +(response.headers.get('Content-Length') ?? 0);
        let receivedLength = 0;
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;
          onProgress(contentLength ? (receivedLength / contentLength) * 100 : 0);
        }

        const blob = new Blob(chunks);
        dbg.store(`Download completed: ${blob.size} bytes`);
        return blob;
      }

      const blob = await response.blob();
      dbg.store(`Download completed: ${blob.size} bytes`);
      return blob;

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          dbg.store('Download timed out');
          throw new Error('Download timed out');
        }
        dbg.store(`Download error: ${error.message}`);
        throw error;
      }
      dbg.store('Unknown download error occurred');
      throw new Error('Unknown download error occurred');
    }
  }

  /**
   * Checks if the server is available
   * @returns Promise<boolean>
   */
  public static async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/api/health`, {
        credentials: 'include',
      });
      const data = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }
}