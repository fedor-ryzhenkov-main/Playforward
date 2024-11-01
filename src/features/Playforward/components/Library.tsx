import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { List, ListItem, Stack, Text, Input, Button } from 'design-system/components';
import { TrackMetadata } from 'data/models/Track';
import { createTrackPlayer } from 'store/audio/audioThunks';
import { updateDescriptionAsync, renameTrackAsync, updateTagsAsync, deleteTrackAsync } from 'store/tracks/trackThunks';
import { dbg } from 'utils/debug';
import { AppDispatch } from 'store';
import store from 'store';
import { getAudioEngine } from 'store/audio/audioMiddleware';

interface TrackListProps {
  tracks: TrackMetadata[];
}

export const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'name' | 'description' | 'tags' | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const preventClickRef = useRef(false);
  
  // Search states
  const [nameSearch, setNameSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  // Filter tracks based on search criteria
  const filteredTracks = useMemo(() => {
    const searchTags = tagSearch
      .toLowerCase()
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    return tracks.filter(track => {
      const nameMatch = track.name.toLowerCase().includes(nameSearch.toLowerCase());
      const tagMatch = searchTags.length === 0 || (
        track.tags && 
        searchTags.every(searchTag => 
          track.tags.some(tag => tag.toLowerCase().includes(searchTag))
        )
      );
      return nameMatch && tagMatch;
    });
  }, [tracks, nameSearch, tagSearch]);

  const handleClick = useCallback((trackId: string) => {
    if (editingTrackId || preventClickRef.current) return;

    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (!preventClickRef.current) {
        try {
          const state = store.getState();
          const isTrackActive = state.audio.activeTrackIds.includes(trackId);
          
          if (isTrackActive) {
            // Track exists, toggle playback
            getAudioEngine().togglePlayPause(trackId);
            dbg.store('Toggled playback state');
          } else {
            // Create new player
            await dispatch(createTrackPlayer(trackId)).unwrap();
            dbg.store('P    layback started successfully');
          }
        } catch (error) {
          dbg.store(`Playback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      setClickTimer(null);
    }, 200);

    setClickTimer(timer);
  }, [dispatch, editingTrackId, clickTimer]);

  const handleDoubleClick = useCallback((e: React.MouseEvent, track: TrackMetadata, field: 'name' | 'description' | 'tags') => {
    e.stopPropagation();
    preventClickRef.current = true;
    
    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
    }

    setEditingTrackId(track.id);
    setEditingField(field);
    setEditingValue(
      field === 'tags' 
        ? track.tags?.join(', ') || ''
        : track[field] || ''
    );

    // Reset prevent click after a short delay
    setTimeout(() => {
      preventClickRef.current = false;
    }, 100);
  }, [clickTimer]);

  const handleSubmit = async () => {
    if (!editingTrackId || !editingField) return;

    try {
      switch (editingField) {
        case 'name':
          await dispatch(renameTrackAsync({
            id: editingTrackId,
            name: editingValue
          })).unwrap();
          break;
        case 'description':
          await dispatch(updateDescriptionAsync({
            id: editingTrackId,
            description: editingValue
          })).unwrap();
          break;
        case 'tags':
          const tags = editingValue
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
          await dispatch(updateTagsAsync({
            id: editingTrackId,
            tags
          })).unwrap();
          break;
      }
    } catch (error) {
      dbg.store(`Failed to update ${editingField}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setEditingTrackId(null);
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setEditingTrackId(null);
      setEditingField(null);
    }
  };

  const renderEditableField = (track: TrackMetadata, field: 'name' | 'description' | 'tags') => {
    const isEditing = editingTrackId === track.id && editingField === field;
    const value = field === 'tags' 
      ? track.tags?.join(', ') || '--'
      : track[field] || '--';

    if (isEditing) {
      return (
        <Input
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSubmit}
          autoFocus
          variant="unstyled"
          className="text-sm bg-transparent p-0 text-text-secondary focus:outline-none"
        />
      );
    }

    return (
      <Text 
        className={`${field === 'name' ? 'text-text-primary' : 'text-text-secondary text-sm'}`}
        onDoubleClick={(e) => handleDoubleClick(e, track, field)}
      >
        {value}
      </Text>
    );
  };

  const renderTrackItem = (track: TrackMetadata) => {
    return (
      <ListItem
        key={track.id}
        interactive
        onClick={() => handleClick(track.id)}
        className="bg-background-secondary p-3 rounded-md group relative"
        data-track-item
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteTrack(track.id);
          }}
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete track"
        >
          ×
        </Button>

        <Stack gap="xs">
          {renderEditableField(track, 'name')}
          {renderEditableField(track, 'description')}
          <div className="flex items-center gap-1">
            <Text className="text-text-secondary text-sm">Tags:</Text>
            {renderEditableField(track, 'tags')}
          </div>
        </Stack>
      </ListItem>
    );
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!window.confirm('Are you sure you want to delete this track?')) {
      return;
    }

    try {
      await dispatch(deleteTrackAsync(trackId)).unwrap();
      dbg.store('Track deleted successfully');
    } catch (error) {
      dbg.store(`Failed to delete track: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Stack gap="md" className="p-4">
      <Stack gap="sm">
        <div className="flex gap-4">
          <Input
            placeholder="Search by name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Search by tags..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            className="flex-1"
          />
        </div>
        {(nameSearch || tagSearch) && (
          <Text className="text-sm text-text-secondary">
            Found {filteredTracks.length} tracks
          </Text>
        )}
      </Stack>

      <List gap="sm">
        {filteredTracks.map(track => renderTrackItem(track))}
      </List>
    </Stack>
  );
};