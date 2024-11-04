import { useState } from 'react';
import { UploadFormState } from './types';
import { dbg } from 'utils/debug';

interface UseYoutubeDownloadProps {
  formState: UploadFormState;
  setFormState: React.Dispatch<React.SetStateAction<UploadFormState>>;
}

export const useYoutubeDownload = ({ formState, setFormState }: UseYoutubeDownloadProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!formState.youtubeUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: formState.youtubeUrl, 
          format: formState.format || 'bestaudio' 
        }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const file = new File([blob], 'youtube-audio.mp3', { type: 'audio/mp3' });
      
      // Extract video title from URL or use default
      let name = 'YouTube Audio';
      try {
        const urlObj = new URL(formState.youtubeUrl);
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          // You could make an additional API call here to get the video title
          // For now, we'll use a generic name + video ID
          name = `YouTube Audio - ${videoId}`;
        }
      } catch (e) {
        dbg.store('Failed to parse YouTube URL for title');
      }

      setFormState(prev => ({
        ...prev,
        selectedFile: file,
        name: name
      }));
      
      dbg.store('YouTube download completed successfully');
    } catch (error) {
      dbg.store(`YouTube download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    handleDownload,
    isDownloading
  };
}; 