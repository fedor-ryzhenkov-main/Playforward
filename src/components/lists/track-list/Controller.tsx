import React, { useState, useEffect, useCallback, useRef } from 'react';
import TrackListModel from './Model';
import TrackListView from './View';
import TreeNode from 'data/models/TreeNode';

/**
 * Controller component that manages the TrackListModel and communicates with the TrackListView.
 */
const TrackListController: React.FC = () => {
  const modelRef = useRef<TrackListModel | null>(null);
  if (modelRef.current === null) {
    modelRef.current = new TrackListModel();
  }
  const model = modelRef.current;
  const [trackTree, setTrackTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState<string>('');
  const [searchTags, setSearchTags] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Loads the hierarchical tree structure from the model.
   */
  const loadTrackTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await model.getFilteredTree(searchName, searchTags);
      console.log('items', items);
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
    loadTrackTree();
  };

  /**
   * Handles changes in the search tags input.
   * @param tags The new search tags.
   */
  const handleSearchTagsChange = (tags: string) => {
    setSearchTags(tags);
    loadTrackTree();
  };

  /**
   * Handles the creation of a new playlist.
   * @param playlistName The name of the new playlist.
   */
  const handleCreatePlaylist = async (playlistName: string) => {
    try {
      await model.createPlaylist(playlistName);
      // No need to manually load the tree as the event will trigger it
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
      // No need to manually load the tree as the event will trigger it
    } catch (err) {
      console.error('Error uploading track:', err);
      alert('Failed to upload track.');
    }
  };

  /**
   * Handles exporting the library data.
   */
  const handleExportData = async () => {
    try {
      await model.exportData();
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data.');
    }
  };

  /**
   * Handles importing the library data.
   */
  const handleImportData = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handles file selection for importing data.
   * @param event The file input change event.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await model.importData(file);
        // No need to manually load the tree as the event will trigger it
      } catch (err) {
        console.error('Error importing data:', err);
        alert('Failed to import data.');
      } 
    }
  };

  return (
    <div>
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
        onExportData={handleExportData}
        onImportData={handleImportData}
      />
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default TrackListController;