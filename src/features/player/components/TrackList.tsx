import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Text } from 'design-system/components';
import { TrackMetadata } from 'data/Track';
import { createTrackPlayer } from 'store/audioThunks';
import { dbg } from 'utils/debug';
import { AppDispatch } from 'store';

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

  return (
    <Box>
      {tracks.map(track => (
        <Box
          key={track.id}
          onClick={() => handleTrackClick(track.id)}
          sx={{
            cursor: 'pointer',
            p: 2,
            '&:hover': { backgroundColor: 'background.accent' }
          }}
        >
          <Text variants={['body']}>{track.name}</Text>
        </Box>
      ))}
    </Box>
  );
};