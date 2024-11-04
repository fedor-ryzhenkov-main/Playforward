import React from 'react';
import { Stack, Button } from 'design-system/components';
import { useDispatch } from 'react-redux';
import { openModal } from 'store/modal/modalSlice';
import { Upload } from 'features/playforward/components/Upload';

/**
 * Side menu component providing access to main application functions
 */
export const SideMenu: React.FC = () => {
  const dispatch = useDispatch();

  const handleUploadClick = () => {
    dispatch(
      openModal({
        type: 'UPLOAD',
        props: {
          title: 'Upload Track',
        },
      })
    );
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
          onClick={handleUploadClick}
          aria-label="Upload Track"
        >
          U
        </Button>
        <Button
          variant="ghost"
          shape="circle"
          size="sm"
          onClick={() => alert('Settings')}
          aria-label="Settings"
        >
          S
        </Button>
        <Button
          variant="ghost"
          shape="circle"
          size="sm"
          onClick={() => alert('Help')}
          aria-label="Help"
        >
          H
        </Button>
      </Stack>
    </>
  );
}; 