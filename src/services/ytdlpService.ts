/**
 * Service for handling YouTube downloads using yt-dlp
 */
export class YtDlpService {
    private static readonly API_URL = 'http://localhost:3001/api';
  
    /**
     * Initiates a video download using yt-dlp
     * @param url - The YouTube video URL
     * @param format - The desired format (default: 'best')
     * @returns Promise with the download result as a Blob
     */
    public static async downloadVideo(url: string, format: string = 'best'): Promise<Blob> {
      try {
        const response = await fetch(`${this.API_URL}/download`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, format }),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Download failed: ${errorText}`);
        }
  
        return await response.blob();
      } catch (error) {
        console.error('Download error:', error);
        throw error;
      }
    }
  }