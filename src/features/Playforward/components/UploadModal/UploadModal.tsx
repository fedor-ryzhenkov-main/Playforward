import React from 'react';
import { Modal, Stack, Tabs, TabsList, TabsTrigger, TabsContent } from 'design-system/components';
import { LocalUploadForm } from 'features/playforward/components/UploadModal/LocalUploadForm';
import { YoutubeUploadForm } from 'features/playforward/components/UploadModal/YoutubeUploadForm';
import { useUploadForm } from 'features/playforward/components/UploadModal/useUploadForm';
import { createPortal } from 'react-dom';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const {
    uploadType,
    setUploadType,
    handleUpload,
    resetForm,
    formState,
    setFormState,
    isSubmitting
  } = useUploadForm({ onClose });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Modal 
        isOpen={isOpen} 
        onClose={() => {
          onClose();
          resetForm();
        }}
        title="Upload Track"
        className="bg-background-primary rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <Stack gap="md" className="p-4">
          <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as 'local' | 'youtube')}>
            <TabsList>
              <TabsTrigger value="local">Local File</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
            </TabsList>

            <TabsContent value="local">
              <LocalUploadForm
                formState={formState}
                setFormState={setFormState}
                onUpload={handleUpload}
                isSubmitting={isSubmitting}
              />
            </TabsContent>

            <TabsContent value="youtube">
              <YoutubeUploadForm
                formState={formState}
                setFormState={setFormState}
                onUpload={handleUpload}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
          </Tabs>
        </Stack>
      </Modal>
    </div>,
    document.body
  );
}; 