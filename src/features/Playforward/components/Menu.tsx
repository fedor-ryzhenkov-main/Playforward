import React from 'react';
import { Stack, Button } from 'design-system/components';
import { UploadModal } from 'features/playforward/components/UploadModal/UploadModal';
import { useModal } from 'hooks/useModal';

/**
 * Side menu component providing access to main application functions
 */
export const SideMenu: React.FC = () => {
  const { isOpen, open, close } = useModal();

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
          onClick={open}
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

      <UploadModal isOpen={isOpen} onClose={close} />
    </>
  );
}; 