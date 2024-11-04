import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { uploadTrackAsync } from 'store/tracks/trackThunks';
import { AppDispatch } from 'store';
import { dbg } from 'utils/debug';
import { UploadFormState } from 'features/playforward/components/UploadModal/types';

interface UseUploadFormProps {
  onClose: () => void;
}

export const useUploadForm = ({ onClose }: UseUploadFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [uploadType, setUploadType] = useState<'local' | 'youtube'>('local');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<UploadFormState>({
    name: '',
    description: '',
    tags: '',
    selectedFile: null,
    youtubeUrl: '',
    format: 'best'
  });

  const resetForm = () => {
    setFormState({
      name: '',
      description: '',
      tags: '',
      selectedFile: null,
      youtubeUrl: '',
      format: 'best'
    });
  };

  const handleUpload = async () => {
    if (!formState.selectedFile) return;

    setIsSubmitting(true);
    try {
      const trackId = await dispatch(uploadTrackAsync({
        file: formState.selectedFile,
        name: formState.name,
        description: formState.description,
        tags: formState.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      })).unwrap();

      dbg.store(`Track uploaded successfully with ID: ${trackId}`);
      onClose();
      resetForm();
    } catch (error) {
      dbg.store(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    uploadType,
    setUploadType,
    formState,
    setFormState,
    handleUpload,
    resetForm,
    isSubmitting
  };
}; 