import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { removePlayer } from 'store/slices/playerSlice';
import { TrackList } from 'features/player/components/Tracklist/TrackList';
import TrackPlayer from 'features/player/components/TrackPlayer/Controller';
import { Box, Flex } from 'design-system/components';

const PlayerComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const activePlayers = useAppSelector(state => state.player.activePlayers);
  const selectedTrack = useAppSelector(state => {
    const { tracks, selectedTrackIndex } = state.player;
    return selectedTrackIndex >= 0 ? tracks[selectedTrackIndex] : null;
  });

  useEffect(() => {
    return () => {
      if (document.visibilityState === 'hidden') {
        Object.keys(activePlayers).forEach(trackId => {
          dispatch(removePlayer(trackId));
        });
      }
    };
  }, []);

  return (
    <Flex
      flexDirection="column"
      height="100vh"
      bg="background.primary"
    >
      <Box 
        as="main"
        flex={1}
        p={6}
        maxWidth="800px"
        width="100%"
        mx="auto"
      >
        <TrackList />
        {selectedTrack && (
          <Box mt={4}>
            <TrackPlayer 
              trackId={selectedTrack.id}
              isSelected={true}
            />
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default PlayerComponent;