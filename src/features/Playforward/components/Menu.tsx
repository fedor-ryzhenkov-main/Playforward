import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Stack, Button, Modal, Input, Text } from 'design-system/components';
import { uploadTrackAsync } from 'store/tracks/trackThunks';
import { AppDispatch } from 'store';
import { dbg } from 'utils/debug';
import { createPortal } from 'react-dom';

export const SideMenu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setName(file.name.replace(/\.[^/.]+$/, '')); // Set initial name without extension
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const trackId = await dispatch(uploadTrackAsync({
        file: selectedFile,
        name,
        description,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      })).unwrap();

      dbg.store(`Track uploaded successfully with ID: ${trackId}`);
      setIsUploadOpen(false);
      resetForm();
    } catch (error) {
      dbg.store(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setTags('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Stack 
        gap="sm" 
        className="h-screen bg-background-secondary w-12 p-2 border-r border-border"
      >
        <Button
          variant="ghost"
          shape="circle"
          size="sm"
          onClick={() => setIsUploadOpen(true)}
        >
          U
        </Button>
        <Button
          variant="ghost"
          shape="circle"
          size="sm"
          onClick={() => alert('Settings')}
        >
          S
        </Button>
        <Button
          variant="ghost"
          shape="circle"
          size="sm"
          onClick={() => alert('Help')}
        >
          H
        </Button>
      </Stack>

      {isUploadOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Modal 
            isOpen={isUploadOpen} 
            onClose={() => {
              setIsUploadOpen(false);
              resetForm();
            }}
            title="Upload Track"
            className="bg-background-primary rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <Stack gap="md" className="p-4">
              <div>
                <Text className="mb-2 text-sm">Audio File</Text>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="w-full"
                />
              </div>
              
              <div>
                <Text className="mb-2 text-sm">Name</Text>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Track name"
                />
              </div>

              <div>
                <Text className="mb-2 text-sm">Description</Text>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Track description"
                />
              </div>

              <div>
                <Text className="mb-2 text-sm">Tags</Text>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma-separated tags"
                />
              </div>

              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || !name.trim()}
              >
                Upload
              </Button>
            </Stack>
          </Modal>
        </div>,
        document.body
      )}
    </>
  );
}; 