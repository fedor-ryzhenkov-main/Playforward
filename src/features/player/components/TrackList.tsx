import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, List, ListItem, Text } from 'design-system/components';
import { TrackMetadata } from 'data/Track';
import { createTrackPlayer } from 'store/audio/audioThunks';
import { dbg } from 'utils/debug';
import { AppDispatch } from 'store';
import { openContextMenu } from 'store/contextMenuSlice';

interface TrackListProps {
  tracks: TrackMetadata[];
}

export const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleTrackClick = async (trackId: string) => {
    dbg.store(`Track clicked: ${trackId}`);
    try {
      await dispatch(createTrackPlayer(trackId)).unwrap();
      dbg.store('Playback started successfully');
    } catch (error) {
      dbg.store(`Playback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(openContextMenu({ 
      x: e.clientX, 
      y: e.clientY,
      menu: { type: 'track', action: 'view', targetId: trackId }
    }));
  };

  return (
    <List spacing="md">
      {tracks.map(track => (
        <ListItem
          key={track.id}
          interactive
          onClick={() => handleTrackClick(track.id)}
          onContextMenu={(e) => handleContextMenu(e, track.id)}
          bg="background.secondary"
          p={3}
          borderRadius="8px"
        >
          <Box>
            <Text variants={['subtitle']} mb={1}>
              {track.name}
            </Text>
            <Text variants={['caption']} color="text.secondary">
              {track.description ? track.description : '--'}
            </Text>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};