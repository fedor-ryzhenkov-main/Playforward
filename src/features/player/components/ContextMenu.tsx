import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Text, Input } from 'design-system/components';
import { RootState, AppDispatch } from 'store';
import { closeContextMenu, openContextMenu } from 'store/contextMenuSlice';
import { uploadTrackAsync, renameTrackAsync, deleteTrackAsync, updateDescriptionAsync } from 'store/tracks/trackThunks';
import { dbg } from 'utils/debug';

export const ContextMenu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, x, y, menu } = useSelector((state: RootState) => state.contextMenu);
  
  const track = useSelector((state: RootState) => 
    menu.type === 'track' ? state.tracks.trackList.find(t => t.id === menu.targetId) : null
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        dispatch(closeContextMenu());
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (menu.type === 'track' && menu.action === 'rename' && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [menu]);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (menu.type === 'track' && renameInputRef.current?.value) {
      try {
        await dispatch(renameTrackAsync({ 
          id: menu.targetId, 
          name: renameInputRef.current.value 
        })).unwrap();
        dbg.store(`Track ${menu.targetId} renamed successfully`);
      } catch (error) {
        dbg.store(`Failed to rename track: ${error}`);
      }
      dispatch(closeContextMenu());
    }
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (menu.type === 'track') {
      dispatch(openContextMenu({
        x,
        y,
        menu: { ...menu, action: 'rename' }
      }));
    }
  };

  const handleUpload = (e: React.MouseEvent) => {
    e.preventDefault();
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (menu.type === 'track') {
      try {
        await dispatch(deleteTrackAsync(menu.targetId)).unwrap();
        dbg.store(`Track ${menu.targetId} deleted successfully`);
      } catch (error) {
        dbg.store(`Failed to delete track: ${error}`);
      }
      dispatch(closeContextMenu());
    }
  };

  const handleEditDescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (menu.type === 'track' && renameInputRef.current?.value) {
      try {
        await dispatch(updateDescriptionAsync({ 
          id: menu.targetId, 
          description: renameInputRef.current.value 
        })).unwrap();
        dbg.store(`Track ${menu.targetId} description updated successfully`);
      } catch (error) {
        dbg.store(`Failed to update description: ${error}`);
      }
      dispatch(closeContextMenu());
    }
  };

  const handleEditDescriptionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (menu.type === 'track') {
      dispatch(openContextMenu({
        x,
        y,
        menu: { ...menu, action: 'editDescription' }
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Box
        ref={menuRef}
        position="fixed"
        top={y}
        left={x}
        bg="background.secondary"
        borderRadius="md"
        boxShadow="md"
        p={2}
        zIndex={1000}
        minWidth="200px"
      >
        {menu.type === 'default' && (
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
        )}

        {menu.type === 'track' && menu.action === 'view' && (
          <>
            <Text
              as="div"
              variants={['body']}
              onClick={handleRenameClick}
              sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'background.accent' },
                p: 2,
              }}
            >
              Rename Track
            </Text>
            <Text
              as="div"
              variants={['body']}
              onClick={handleEditDescriptionClick}
              sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'background.accent' },
                p: 2,
              }}
            >
              Edit Description
            </Text>
            <Text
              as="div"
              variants={['body']}
              onClick={handleDelete}
              sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'background.accent' },
                color: 'error.main',
                p: 2,
              }}
            >
              Delete Track
            </Text>
          </>
        )}

        {menu.type === 'track' && menu.action === 'rename' && (
          <form onSubmit={handleRename}>
            <Input
              ref={renameInputRef}
              defaultValue={track?.name || ''}
              sx={{
                width: '100%',
                p: 2,
              }}
            />
          </form>
        )}

        {menu.type === 'track' && menu.action === 'editDescription' && (
          <form onSubmit={handleEditDescription}>
            <Input
              ref={renameInputRef}
              defaultValue={track?.description || ''}
              placeholder="Enter description"
              sx={{
                width: '100%',
                p: 2,
              }}
            />
          </form>
        )}
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