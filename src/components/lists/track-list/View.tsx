import React, { useEffect, useRef, useMemo } from 'react';
import Track from 'data/models/Track';
import TrackItem from 'components/items/track-item/Controller';
import './Styles.css';
import { ContextMenuItem, useContextMenu } from 'contexts/ContextMenuContext';
import { v4 as uuidv4 } from 'uuid';
import { useTagSearch } from 'hooks/useTagSearch';

interface TrackListViewProps {
  tracks: Track[];
  loading: boolean;
  error: string | null;
  searchName: string;
  searchTags: string;
  allTags: string[];
  onSearchNameChange: (name: string) => void;
  onSearchTagsChange: (tags: string) => void;
  onUploadTrack: (file: File) => void;
}

const TrackListView: React.FC<TrackListViewProps> = ({
  tracks,
  loading,
  error,
  searchName,
  searchTags,
  allTags,
  onSearchNameChange,
  onSearchTagsChange,
  onUploadTrack,
}) => {
  const { registerMenuItems, unregisterMenuItems } = useContextMenu();
  const contextMenuId = useRef(`tracklist-${uuidv4()}`);
  const tagSearchRef = useRef<HTMLInputElement>(null);

  const {
    isTagSearchActive,
    setIsTagSearchActive,
    currentTags,
    inputValue,
    setInputValue,
    handleTagInput,
    removeTag
  } = useTagSearch({ onSearchTagsChange, allTags });

  // Focus tag input when search becomes active
  useEffect(() => {
    if (isTagSearchActive && tagSearchRef.current) {
      tagSearchRef.current.focus();
    }
  }, [isTagSearchActive]);

  // Sort tracks alphabetically
  const sortedTracks = useMemo(() => {
    return [...tracks].sort((a, b) => a.name.localeCompare(b.name));
  }, [tracks]);

  const handleUploadTrack = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        await onUploadTrack(target.files[0]);
      }
    };
    fileInput.click();
  };

  useEffect(() => {
    const menuItems: ContextMenuItem[] = [
      {
        type: 'action',
        label: 'Upload Track',
        onClick: handleUploadTrack,
      }
    ];

    registerMenuItems(contextMenuId.current, menuItems);

    return () => {
      unregisterMenuItems(contextMenuId.current);
    };
  }, [registerMenuItems, unregisterMenuItems]);

  return (
    <div className="track-list-container" data-contextmenu-id={contextMenuId.current}>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => onSearchNameChange(e.target.value)}
        />
        
        <div className={`tag-search ${isTagSearchActive ? 'active' : ''}`}>
          <div className="tag-list">
            {currentTags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button onClick={() => removeTag(tag)}>&times;</button>
              </span>
            ))}
          </div>
          <input
            ref={tagSearchRef}
            type="text"
            placeholder={isTagSearchActive ? "Enter tag and press Enter" : "Press Cmd+Shift+F to search by tags"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleTagInput}
            list="available-tags"
          />
          <datalist id="available-tags">
            {allTags.map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      
      <div className="track-list">
        {sortedTracks.map(track => (
          <TrackItem key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
};

export default TrackListView;