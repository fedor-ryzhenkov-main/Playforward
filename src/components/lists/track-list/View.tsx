import React, { useRef, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import Track from 'data/models/Track';
import TrackItem from 'components/items/track-item/Controller';
import './Styles.css';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { navigateTrack, setTrackListFocus } from 'store/slices/playerSlice';
import { playSelectedTrack } from 'store/thunks/playerThunks';

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
  onTrackPlay: (track: Track) => void;
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
  onTrackPlay,
}) => {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const nameSearchRef = useRef<HTMLInputElement>(null);
  const tagSearchRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { selectedTrackIndex, isTrackListFocused } = useAppSelector(state => state.player);

  // Sort tracks alphabetically
  const sortedTracks = useMemo(() => {
    return [...tracks].sort((a, b) => a.name.localeCompare(b.name));
  }, [tracks]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onUploadTrack(files[0]);
      event.target.value = ''; // Reset input
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagSearchRef.current) {
      const newTag = tagSearchRef.current.value.trim();
      if (newTag) {
        const currentTags = searchTags ? searchTags.split(',').map(t => t.trim()) : [];
        if (!currentTags.includes(newTag)) {
          const updatedTags = [...currentTags, newTag].join(', ');
          onSearchTagsChange(updatedTags);
        }
        tagSearchRef.current.value = '';
      }
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTrackListFocused) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          dispatch(navigateTrack('up'));
          break;
        case 'ArrowDown':
          e.preventDefault();
          dispatch(navigateTrack('down'));
          break;
        case 'Enter':
          e.preventDefault();
          dispatch(playSelectedTrack());
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, isTrackListFocused]);

  // Handle focus
  const handleContainerFocus = () => {
    dispatch(setTrackListFocus(true));
  };

  const handleContainerBlur = () => {
    dispatch(setTrackListFocus(false));
  };

  // Search shortcuts
  const handleSearchShortcuts = (e: KeyboardEvent) => {
    if (e.key === 'f' && e.metaKey) {
      e.preventDefault();
      if (e.shiftKey) {
        tagSearchRef.current?.focus();
      } else {
        nameSearchRef.current?.focus();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleSearchShortcuts);
    return () => window.removeEventListener('keydown', handleSearchShortcuts);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="track-list-container"
      tabIndex={0}
      onFocus={handleContainerFocus}
      onBlur={handleContainerBlur}
    >
      <div className="track-list-header">
        <div className="search-container">
          <input
            ref={nameSearchRef}
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => onSearchNameChange(e.target.value)}
            className="search-input"
          />
          <input
            ref={tagSearchRef}
            type="text"
            placeholder="Search by tags..."
            value={searchTags}
            onChange={(e) => onSearchTagsChange(e.target.value)}
            onKeyDown={handleTagInput}
            className="search-input"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="upload-button"
        >
          Upload Track
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      <div className="track-list">
        {sortedTracks.map((track, index) => (
          <TrackItem
            key={track.id}
            track={track}
            isSelected={index === selectedTrackIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackListView;