import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { loadTracks, playTrack, uploadTrack } from 'store/thunks/playerThunks';
import { setSearchName, setSearchTags } from 'store/slices/playerSlice';
import TrackListView from './View';
import Track from 'data/models/Track';

const TrackListController: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    tracks,
    allTags,
    loading,
    error,
    searchName,
    searchTags,
  } = useAppSelector(state => state.player);

  // Initial load
  useEffect(() => {
    dispatch(loadTracks({ searchName, searchTags }));
  }, [dispatch, searchName, searchTags]);

  const handleSearchNameChange = (name: string) => {
    dispatch(setSearchName(name));
  };

  const handleSearchTagsChange = (tags: string) => {
    dispatch(setSearchTags(tags));
  };

  const handleUploadTrack = async (file: File) => {
    try {
      await dispatch(uploadTrack(file)).unwrap();
    } catch (err) {
      console.error('Error uploading track:', err);
    }
  };

  const handleTrackPlay = (track: Track) => {
    dispatch(playTrack(track));
  };

  return (
    <TrackListView
      tracks={tracks}
      loading={loading}
      error={error}
      searchName={searchName}
      searchTags={searchTags}
      allTags={allTags}
      onSearchNameChange={handleSearchNameChange}
      onSearchTagsChange={handleSearchTagsChange}
      onUploadTrack={handleUploadTrack}
      onTrackPlay={handleTrackPlay}
    />
  );
};

export default TrackListController;