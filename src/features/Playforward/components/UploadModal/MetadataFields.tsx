import React from 'react';
import { Stack, Input, Text, Button } from 'design-system/components';
import { UploadFormState } from './types';

interface MetadataFieldsProps {
  formState: UploadFormState;
  setFormState: React.Dispatch<React.SetStateAction<UploadFormState>>;
  onUpload: () => Promise<void>;
  isSubmitting: boolean;
}

export const MetadataFields: React.FC<MetadataFieldsProps> = ({
  formState,
  setFormState,
  onUpload,
  isSubmitting
}) => {
  return (
    <Stack gap="md">
      <div>
        <Text className="mb-2 text-sm">Name</Text>
        <Input
          value={formState.name}
          onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Track name"
        />
      </div>

      <div>
        <Text className="mb-2 text-sm">Description</Text>
        <Input
          value={formState.description}
          onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Track description"
        />
      </div>

      <div>
        <Text className="mb-2 text-sm">Tags</Text>
        <Input
          value={formState.tags}
          onChange={(e) => setFormState(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="Comma-separated tags"
        />
      </div>

      <Button 
        onClick={onUpload}
        disabled={isSubmitting || !formState.selectedFile || !formState.name.trim()}
      >
        {isSubmitting ? 'Uploading...' : 'Upload'}
      </Button>
    </Stack>
  );
}; 