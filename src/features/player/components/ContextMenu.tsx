import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Text } from 'design-system/components';
import { RootState, AppDispatch } from 'store';
import { closeContextMenu } from 'store/contextMenuSlice';
import { uploadTrackAsync } from 'store/tracks/trackThunks';
import { dbg } from 'utils/debug';

export const ContextMenu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, x, y } = useSelector((state: RootState) => state.contextMenu);

  const handleUpload = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent menu from closing immediately
    dbg.store('Context menu upload button clicked');
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    dbg.store('File input change event triggered');
    const file = e.target.files?.[0];
    if (file) {
      dbg.store(`File selected: ${file.name} (${file.size} bytes)`);
      try {
        dbg.store('Dispatching uploadTrackAsync...');
        await dispatch(uploadTrackAsync(file)).unwrap();
        dbg.store('Upload completed successfully');
      } catch (error) {
        if (error instanceof Error) {
          dbg.store(`Upload failed: ${error.message}`);
        } else {
          dbg.store('Upload failed with unknown error');
        }
      }
    } else {
      dbg.store('No file selected');
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
    dispatch(closeContextMenu());
  };

  if (!isOpen) return null;

  return (
    <>
      <Box
        position="fixed"
        top={y}
        left={x}
        bg="background.secondary"
        borderRadius="md"
        boxShadow="md"
        p={2}
        zIndex={1000}
      >
        <Text
          as="div"
          variants={['body']}
          onClick={handleUpload}
          sx={{
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'background.accent' },
            p: 2,
          }}
        >
          Upload Track
        </Text>
      </Box>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
};