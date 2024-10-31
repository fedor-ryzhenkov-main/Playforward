import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'store';
import { loadTracksAsync } from 'store/trackThunks';
import { dbg } from 'utils/debug';
import { openContextMenu } from 'store/contextMenuSlice';
import { TrackList } from 'features/player/components/TrackList';
import { ContextMenu } from 'features/player/components/ContextMenu';
import { TrackPlayer } from 'features/player/components/TrackPlayer';
import { Box, Flex } from 'design-system/components';

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
    dispatch(openContextMenu({ x: e.clientX, y: e.clientY }));
  };

  return (
    <Flex
      flexDirection="column"
      height="100vh"
      bg="background.primary"
      onContextMenu={handleContextMenu}
    >
      <Box 
        as="main"
        flex={1}
        p={6}
        maxWidth="800px"
        width="100%"
        mx="auto"
      >
        <TrackList tracks={tracks} />
        {activeTrackIds.map(trackId => (
          <Box key={trackId} mt={4}>
            <TrackPlayer trackId={trackId} />
          </Box>
        ))}
      </Box>
      <ContextMenu />
    </Flex>
  );
};

export default PlayerComponent;