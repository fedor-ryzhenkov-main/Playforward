import React from 'react';
import { Stack, Input, Button } from 'design-system/components';
import { useYoutubeDownload } from 'features/playforward/components/UploadModal/useYoutubeDownload';
import { UploadFormProps } from './types';
import { MetadataFields } from './MetadataFields';
import { UploadFormState } from './types';

interface YoutubeUploadFormProps extends UploadFormProps {
  setFormState: React.Dispatch<React.SetStateAction<UploadFormState>>;
}

export const YoutubeUploadForm: React.FC<YoutubeUploadFormProps> = ({
  formState,
  setFormState,
  onUpload,
  isSubmitting
}) => {
  const { handleDownload, isDownloading } = useYoutubeDownload({
    formState,
    setFormState
  });

  return (
    <Stack gap="md">
      <Stack gap="sm">
        <Input
          value={formState.youtubeUrl}
          onChange={(e) => setFormState(prev => ({ ...prev, youtubeUrl: e.target.value }))}
          placeholder="YouTube URL"
        />
        <Input
          value={formState.format}
          onChange={(e) => setFormState(prev => ({ ...prev, format: e.target.value }))}
          placeholder="Format (e.g., 'best', 'bestaudio')"
        />
        <Button 
          onClick={handleDownload}
          disabled={isDownloading || !formState.youtubeUrl}
        >
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </Stack>
      <MetadataFields
        formState={formState}
        setFormState={setFormState}
        onUpload={onUpload}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}; 