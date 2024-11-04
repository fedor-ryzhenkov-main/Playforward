import React, { useRef } from 'react';
import { Stack, Input, Text, Button } from 'design-system/components';
import { UploadFormProps } from './types';
import { MetadataFields } from './MetadataFields';
import { UploadFormState } from './types';

interface LocalUploadFormProps extends UploadFormProps {
  setFormState: React.Dispatch<React.SetStateAction<UploadFormState>>;
}

export const LocalUploadForm: React.FC<LocalUploadFormProps> = ({
  formState,
  setFormState,
  onUpload,
  isSubmitting
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormState(prev => ({
        ...prev,
        selectedFile: file,
        name: file.name.replace(/\.[^/.]+$/, '')
      }));
    }
  };

  return (
    <Stack gap="md">
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
        className="w-full"
      />
      <MetadataFields
        formState={formState}
        setFormState={setFormState}
        onUpload={onUpload}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}; 