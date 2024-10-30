import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'store';
import { loadTracks } from 'store/thunks/playerThunks';
import { List, ListItem, Text, Badge, Spinner, Alert, Flex, Box } from 'design-system/components';
import { selectTrack } from 'store/slices/playerSlice';
import { UploadButton } from '../UploadButton/UploadButton';
import { playSelectedTrack } from 'store/thunks/playerThunks';

export const TrackList = () => {
  const dispatch = useAppDispatch();
  const { tracks, loading, error, selectedTrackIndex } = useAppSelector(state => state.player);

  useEffect(() => {
    dispatch(loadTracks());
  }, [dispatch]);

  const handleTrackClick = (index: number) => {
    dispatch(selectTrack(index));
    dispatch(playSelectedTrack());
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" p={4}>
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert variant="error">{error}</Alert>
      </Box>
    );
  }

  if (!tracks.length) {
    return (
      <Flex flexDirection="column" alignItems="center" p={4} gap={4}>
        <Text variant="body" color="text.secondary">No tracks found</Text>
        <UploadButton />
      </Flex>
    );
  }

  return (
    <Flex flexDirection="column" gap={4} p={4}>
      <Flex justifyContent="flex-end">
        <UploadButton />
      </Flex>
      <List spacing={1}>
        {tracks.map((track, index) => (
          <ListItem
            key={track.id}
            selected={index === selectedTrackIndex}
            onClick={() => handleTrackClick(index)}
            p={2}
          >
            <Flex flexDirection="column" gap={2}>
              <Text variant="body" margin={0} color="text.primary">
                {track.name}
              </Text>
              
              {track.description && (
                <Text variant="body" margin={0} color="text.secondary">
                  {track.description}
                </Text>
              )}
              
              {track.tags.length > 0 && (
                <Flex gap={2} flexWrap="wrap">
                  {track.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              )}
            </Flex>
          </ListItem>
        ))}
      </List>
    </Flex>
  );
};
