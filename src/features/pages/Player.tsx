import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'store';
import { loadTracksAsync } from 'store/tracks/trackThunks';
import { dbg } from 'utils/debug';
import { openContextMenu } from 'store/contextMenuSlice';
import { TrackList } from 'features/player/components/TrackList';
import { ContextMenu } from 'features/player/components/ContextMenu';
import { TrackPlayer } from 'features/player/components/TrackPlayer';
import { Box, Container, Grid, Text } from 'design-system/components';

const PlayerComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeTrackIds = useSelector((state: RootState) => state.audio.activeTrackIds);
  const tracks = useSelector((state: RootState) => state.tracks.trackList);

  useEffect(() => {
    dbg.store('Player mounted, loading tracks...');
    dispatch(loadTracksAsync());
  }, [dispatch]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!(e.target as HTMLElement).closest('[data-track-item]')) {
      dispatch(openContextMenu({ 
        x: e.clientX, 
        y: e.clientY,
        menu: { type: 'default' }
      }));
    }
  };

  return (
    <Box 
      height="100vh" 
      bg="background.primary" 
      onContextMenu={handleContextMenu}
    >
      <Container>
        <Grid
          gridTemplateColumns={['1fr', '1fr', '1fr 1fr']}
          gap={4}
          py={6}
        >
          {/* Left Column - Track List */}
          <Box>
            <Text variants={['title']} mb={4}>
              Available Tracks
            </Text>
            <Box
              bg="background.secondary"
              p={4}
              borderRadius="8px"
            >
              <TrackList tracks={tracks} />
            </Box>
          </Box>

          {/* Right Column - Active Players */}
          <Box>
            <Text variants={['title']} mb={4}>
              Active Players
            </Text>
            <Box
              bg="background.secondary"
              p={4}
              borderRadius="8px"
            >
              {activeTrackIds.length === 0 ? (
                <Text color="text.secondary">
                  No active players
                </Text>
              ) : (
                activeTrackIds.map(trackId => (
                  <Box key={trackId} mb={4} last-child={{ mb: 0 }}>
                    <TrackPlayer trackId={trackId} />
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Grid>
      </Container>
      <ContextMenu />
    </Box>
  );
};

export default PlayerComponent;