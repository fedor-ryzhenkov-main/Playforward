import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, MenuItem, Input } from 'design-system/components';
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
      <Menu
        ref={menuRef}
        style={{
          display: isOpen ? 'block' : 'none',
          position: 'fixed',
          top: y,
          left: x,
          zIndex: 1000,
        }}
      >
        {menu.type === 'default' && (
          <MenuItem onClick={handleUpload}>
            Upload Track
          </MenuItem>
        )}

        {menu.type === 'track' && menu.action === 'view' && (
          <>
            <MenuItem onClick={handleRenameClick}>
              Rename Track
            </MenuItem>
            <MenuItem onClick={handleEditDescriptionClick}>
              Edit Description
            </MenuItem>
            <MenuItem 
              onClick={handleDelete}
              className="text-error-main"
            >
              Delete Track
            </MenuItem>
          </>
        )}

        {menu.type === 'track' && menu.action === 'rename' && (
          <form onSubmit={handleRename} className="p-2">
            <Input
              ref={renameInputRef}
              defaultValue={track?.name || ''}
            />
          </form>
        )}

        {menu.type === 'track' && menu.action === 'editDescription' && (
          <form onSubmit={handleEditDescription} className="p-2">
            <Input
              ref={renameInputRef}
              defaultValue={track?.description || ''}
              placeholder="Enter description"
            />
          </form>
        )}
      </Menu>
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