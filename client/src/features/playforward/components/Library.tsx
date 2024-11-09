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

/**
 * Library component displays and manages a list of tracks.
 * Allows editing of track name, description, and tags.
 */
export const Library: React.FC<TrackListProps> = ({ tracks }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [tagsInputValue, setTagsInputValue] = useState<string>('');
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
      const tagMatch =
        searchTags.length === 0 ||
        (track.tags &&
          searchTags.every(searchTag =>
            track.tags.some(tag => tag.toLowerCase().includes(searchTag))
          ));
      return nameMatch && tagMatch;
    });
  }, [tracks, nameSearch, tagSearch]);

  /**
   * Handles track playback toggle.
   */
  const handleClick = useCallback(
    async (trackId: string) => {
      try {
        const state = store.getState();
        const isTrackActive = state.audio.activeTrackIds.includes(trackId);

        if (isTrackActive) {
          getAudioEngine().togglePlayPause(trackId);
          dbg.store('Toggled playback state');
        } else {
          await dispatch(createTrackPlayer(trackId)).unwrap();
          dbg.store('Playback started successfully');
        }
      } catch (error) {
        dbg.store(
          `Playback failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    },
    [dispatch]
  );

  /**
   * Handles changes to track fields and dispatches updates.
   * For 'tags', it only updates when editing is complete.
   */
  const handleFieldChange = async (
    trackId: string,
    field: 'name' | 'description',
    value: string
  ) => {
    try {
      switch (field) {
        case 'name':
          await dispatch(
            renameTrackAsync({
              id: trackId,
              name: value,
            })
          ).unwrap();
          break;
        case 'description':
          await dispatch(
            updateDescriptionAsync({
              id: trackId,
              description: value,
            })
          ).unwrap();
          break;
      }
    } catch (error) {
      dbg.store(
        `Failed to update ${field}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  /**
   * Handles the change in the tags input field.
   * Updates local state without dispatching.
   */
  const handleTagsInputChange = (value: string) => {
    setTagsInputValue(value);
  };

  /**
   * Handles when the tags input loses focus or Enter is pressed.
   * Parses the tags and dispatches the update.
   */
  const handleTagsInputBlur = async (trackId: string) => {
    try {
      const tags = tagsInputValue
        .split(',')
        .map(tag => tag.trim())
        // Allow empty tags to be stored temporarily
        // .filter(tag => tag.length > 0); // Remove this line to include empty tags

      await dispatch(
        updateTagsAsync({
          id: trackId,
          tags: tags.filter(tag => tag.length > 0), // Filter out empty tags when saving
        })
      ).unwrap();
    } catch (error) {
      dbg.store(
        `Failed to update tags: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setEditingTrackId(null);
    }
  };

  /**
   * Renders an editable input field for a specific track and field.
   */
  const renderEditableField = (
    track: TrackMetadata,
    field: 'name' | 'description' | 'tags'
  ) => {
    const value =
      field === 'tags'
        ? track.tags?.join(', ') || ''
        : track[field] || '';

    if (field === 'tags') {
      const isEditing = editingTrackId === track.id;
      return (
        <div className="flex-shrink min-w-0">
          <Input
            value={isEditing ? tagsInputValue : value}
            onChange={e => handleTagsInputChange(e.target.value)}
            onBlur={() => handleTagsInputBlur(track.id)}
            onFocus={() => {
              setEditingTrackId(track.id);
              setTagsInputValue(value);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleTagsInputBlur(track.id);
                (e.target as HTMLInputElement).blur();
              }
            }}
            variant="unstyled"
            className={`p-0 bg-transparent w-auto min-w-[50px] ${
              'text-text-secondary text-sm'
            } focus:outline-none`}
            style={{ width: `${(isEditing ? tagsInputValue : value).length + 2}ch` }}
          />
        </div>
      );
    } else {
      return (
        <div className="flex-shrink min-w-0">
          <Input
            value={value}
            onChange={e => handleFieldChange(track.id, field, e.target.value)}
            variant="unstyled"
            className={`p-0 bg-transparent w-auto min-w-[50px] ${
              field === 'name' ? 'text-text-primary' : 'text-text-secondary text-sm'
            } focus:outline-none`}
            style={{ width: `${value.length + 2}ch` }}
            onClick={e => e.stopPropagation()} // Prevent playback triggers
          />
        </div>
      );
    }
  };

  /**
   * Renders a single track item with editable fields.
   */
  const renderTrackItem = (track: TrackMetadata) => {
    return (
      <ListItem
        key={track.id}
        interactive
        onClick={(e) => {
          // Only handle click if we didn't click on an input or button
          if (!(e.target as HTMLElement).closest('input, button')) {
            handleClick(track.id);
          }
        }}
        className="bg-background-secondary p-3 rounded-md group relative cursor-pointer"
        data-track-item
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={e => {
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
          <div className="flex items-center gap-1 flex-wrap">
            <Text className="text-text-secondary text-sm whitespace-nowrap">
              Tags:
            </Text>
            {renderEditableField(track, 'tags')}
          </div>
        </Stack>
      </ListItem>
    );
  };

  /**
   * Handles the deletion of a track after user confirmation.
   */
  const handleDeleteTrack = async (trackId: string) => {
    if (!window.confirm('Are you sure you want to delete this track?')) {
      return;
    }

    try {
      await dispatch(deleteTrackAsync(trackId)).unwrap();
      dbg.store('Track deleted successfully');
    } catch (error) {
      dbg.store(
        `Failed to delete track: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  return (
    <Stack gap="md" className="p-4">
      <Stack gap="sm">
        <div className="flex gap-4">
          <Input
            placeholder="Search by name..."
            value={nameSearch}
            onChange={e => setNameSearch(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Search by tags..."
            value={tagSearch}
            onChange={e => setTagSearch(e.target.value)}
            className="flex-1"
          />
        </div>
        {(nameSearch || tagSearch) && (
          <Text className="text-sm text-text-secondary">
            Found {filteredTracks.length}{' '}
            {filteredTracks.length === 1 ? 'track' : 'tracks'}
          </Text>
        )}
      </Stack>

      <List gap="sm">
        {filteredTracks.map(track => renderTrackItem(track))}
      </List>
    </Stack>
  );
};