import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Input, Stack, Text } from 'design-system/components';
import { YtDlpService } from 'services/ytdlpService';
import { closeModal } from 'store/modal/modalSlice';
import { uploadTrackAsync } from 'store/tracks/trackThunks';
import { AppDispatch } from 'store';
import { dbg } from 'utils/debug';

interface UploadProps {
  title?: string;
}

interface TrackMetadata {
  name: string;
  description: string;
  tags: string[];
}

export const Upload: React.FC<UploadProps> = ({ title }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [uploadType, setUploadType] = useState<'local' | 'youtube'>('local');
  const [file, setFile] = useState<File | null>(null);
  const [youtubeURL, setYoutubeURL] = useState('');
  const [metadata, setMetadata] = useState<TrackMetadata>({
    name: '',
    description: '',
    tags: [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setMetadata((prev) => ({
        ...prev,
        name: selectedFile.name.replace(/\.[^/.]+$/, ''),
      }));
    }
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      setMetadata((prev) => ({
        ...prev,
        tags: value.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0),
      }));
    } else {
      setMetadata((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setError(null);

    try {
      if (uploadType === 'local' && file) {
        dbg.store('Starting local file upload...');
        await dispatch(uploadTrackAsync({
          file,
          name: metadata.name,
          description: metadata.description,
          tags: metadata.tags,
        })).unwrap();
      } else if (uploadType === 'youtube' && youtubeURL) {
        dbg.store('Starting YouTube download...');
        const audioBlob = await YtDlpService.downloadVideo(youtubeURL);

        if (!audioBlob) {
          throw new Error('Failed to download audio');
        }

        const blob = new Blob([audioBlob], { type: 'audio/mpeg' });
        const youtubeFile = new File([blob], `${metadata.name}.mp3`, {
          type: 'audio/mpeg',
        });

        dbg.store('Starting upload of downloaded YouTube audio...');
        await dispatch(uploadTrackAsync({
          file: youtubeFile,
          name: metadata.name,
          description: metadata.description,
          tags: metadata.tags,
        })).unwrap();
      }

      dispatch(closeModal());
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      dbg.store(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Stack direction="vertical" gap="md">
      <div>
        <label>
          <input
            type="radio"
            value="local"
            checked={uploadType === 'local'}
            onChange={() => setUploadType('local')}
          />
          Local File
        </label>
        <label>
          <input
            type="radio"
            value="youtube"
            checked={uploadType === 'youtube'}
            onChange={() => setUploadType('youtube')}
          />
          YouTube URL
        </label>
      </div>

      {uploadType === 'local' ? (
        <Input type="file" onChange={handleFileChange} />
      ) : (
        <Input
          type="url"
          value={youtubeURL}
          onChange={(e) => setYoutubeURL(e.target.value)}
          placeholder="Enter YouTube URL"
        />
      )}

      <Input
        name="name"
        placeholder="Track Name"
        value={metadata.name}
        onChange={handleMetadataChange}
      />
      <Input
        name="description"
        placeholder="Description"
        value={metadata.description}
        onChange={handleMetadataChange}
      />
      <Input
        name="tags"
        placeholder="Tags (comma-separated)"
        value={metadata.tags.join(', ')}
        onChange={handleMetadataChange}
      />

      {error && <Text color="error">{error}</Text>}

      <Button 
        variant="primary" 
        onClick={handleUpload} 
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </Button>
    </Stack>
  );
};