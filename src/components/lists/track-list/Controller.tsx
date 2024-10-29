import React, { useCallback, useEffect, useRef, useState } from 'react';
import TrackListModel from './Model';
import TrackListView from './View';
import Track from 'data/models/Track';

/**
 * Controller component that manages the TrackListModel and communicates with the TrackListView.
 */
const TrackListController: React.FC = () => {
  const modelRef = useRef<TrackListModel>(new TrackListModel());
  const [tracks, setTracks] = useState<Track[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [searchTags, setSearchTags] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [loadedTracks, tags] = await Promise.all([
        modelRef.current.getTracks(searchName, searchTags),
        modelRef.current.getAllTags()
      ]);
      setTracks(loadedTracks);
      setAllTags(tags);
    } catch (err) {
      console.error('Error loading tracks:', err);
      setError('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  }, [searchName, searchTags]);

  useEffect(() => {
    // Subscribe to model changes
    const unsubscribe = modelRef.current.subscribe(() => {
      loadData();
    });

    // Initial load
    loadData();

    return () => {
      unsubscribe();
    };
  }, [loadData]);

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
   * Handles the upload of a new track.
   * @param file The audio file to upload.
   */
  const handleUploadTrack = async (file: File) => {
    try {
      await modelRef.current.addTrack(file);
    } catch (err) {
      console.error('Error uploading track:', err);
      setError('Failed to upload track');
    }
  };

  /**
   * Handles the import of tracks from a JSON file.
   * @param file The JSON file containing track data.
   */
  const handleImportTracks = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      await modelRef.current.importTracks(file);
      await loadData(); // Reload data after import
    } catch (err) {
      console.error('Error importing tracks:', err);
      setError('Failed to import tracks: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
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
    />
  );
};

export default TrackListController;