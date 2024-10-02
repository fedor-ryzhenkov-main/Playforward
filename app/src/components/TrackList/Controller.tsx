import React, { useState, useEffect, useCallback, useRef } from 'react';
import TrackListModel from './Model';
import TrackListView from './View';
import LibraryItem from '../../data/models/LibraryItem';
import Playlist from '../../data/models/Playlist';
import Track from '../../data/models/Track';

/**
 * Controller component that manages the TrackListModel and communicates with the TrackListView.
 */
const TrackListController: React.FC = () => {
  const modelRef = useRef(new TrackListModel());
  const model = modelRef.current;
  const [trackTree, setTrackTree] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState<string>('');
  const [searchTags, setSearchTags] = useState<string>('');

  /**
   * Loads the hierarchical tree structure from the model.
   */
  const loadTrackTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await model.getFilteredTree(searchName, searchTags);
      setTrackTree(items);
    } catch (err) {
      console.error('Error loading track tree:', err);
      setError('Failed to load track list.');
    } finally {
      setLoading(false);
    }
  }, [model, searchName, searchTags]);

  /**
   * Handles updates when data changes in the model.
   */
  const handleDataChanged = useCallback(() => {
    loadTrackTree();
  }, [loadTrackTree]);

  useEffect(() => {
    loadTrackTree();

    // Subscribe to data changes
    model.subscribe(handleDataChanged);

    // Cleanup subscription on unmount
    return () => {
      model.unsubscribe(handleDataChanged);
    };
  }, [loadTrackTree, handleDataChanged]);

  /**
   * Handles changes in the search name input.
   * @param name The new search name.
   */
  const handleSearchNameChange = (name: string) => {
    setSearchName(name);
  };

  /**
   * Handles changes in the search tags input.
   * @param tags The new search tags.
   */
  const handleSearchTagsChange = (tags: string) => {
    setSearchTags(tags);
  };

  /**
   * Handles the creation of a new playlist.
   */
  const handleCreatePlaylist = async (playlistName: string) => {
    try {
      await model.createPlaylist(playlistName);
      await loadTrackTree();
    } catch (err) {
      console.error('Error creating playlist:', err);
      alert('Failed to create playlist.');
    }
  };

  /**
   * Handles the upload of a new track.
   * @param file The audio file to upload.
   */
  const handleUploadTrack = async (file: File) => {
    try {
      await model.addTrack(file);
      await loadTrackTree();
    } catch (err) {
      console.error('Error uploading track:', err);
      alert('Failed to upload track.');
    }
  };

  return (
    <TrackListView
      trackTree={trackTree}
      loading={loading}
      error={error}
      searchName={searchName}
      searchTags={searchTags}
      onSearchNameChange={handleSearchNameChange}
      onSearchTagsChange={handleSearchTagsChange}
      onCreatePlaylist={handleCreatePlaylist}
      onUploadTrack={handleUploadTrack}
    />
  );
};

export default TrackListController;