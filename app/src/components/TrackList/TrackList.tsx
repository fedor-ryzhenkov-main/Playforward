import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import TrackListManager, { TreeNode } from './TrackListManager';
import TrackItem from './TrackItem';
import PlaylistItem from './PlaylistItem';
import EventDispatcher from '../../data/events/EventDispatcher';
import './TrackList.css';
import Track from '../../data/models/Track';
import Playlist from '../../data/models/Playlist';
import TrackService from '../../data/services/TrackService';
import PlaylistService from '../../data/services/PlaylistService';
import { useContextMenuRegistration } from '../../contexts/ContextMenuContext';

const TrackList: React.FC = () => {
  const [manager] = useState(new TrackListManager());
  const [filteredTree, setFilteredTree] = useState<TreeNode[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { registerMenuItems } = useContextMenuRegistration();
  const trackService = new TrackService();
  const playlistService = new PlaylistService();

  const updateFilteredTree = useCallback(() => {
    const tree = manager.getFilteredTree();
    setFilteredTree(tree);
  }, [manager]);

  const loadData = useCallback(async () => {
    await manager.loadData();
    setTracks(manager.tracks);
    setPlaylists(manager.playlists);
    updateFilteredTree();
  }, [manager, updateFilteredTree]);

  const handleDataReload = useCallback(debounce(() => {
    loadData();
  }, 300), [loadData]);

  useEffect(() => {
    loadData();

    EventDispatcher.getInstance().subscribe('dataChanged', handleDataReload);

    return () => {
      EventDispatcher.getInstance().unsubscribe('dataChanged', handleDataReload);
    };
  }, [loadData, handleDataReload]);

  const handleSearchNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    manager.setSearchName(event.target.value);
    updateFilteredTree();
  };

  const handleSearchTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    manager.setSearchTags(event.target.value);
    updateFilteredTree();
  };

  const renderTreeNodes = (nodes: TreeNode[]): React.ReactNode => {
    return nodes.map((node) => {
      const handleNodeContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        // Optional: Implement context menu for playlist operations
      };

      if (node.type === 'playlist') {
        const playlist = node.data as Playlist;
        return (
          <PlaylistItem
            key={playlist.id}
            playlist={playlist}
            tracks={tracks}
            subPlaylists={playlists}
          />
        );
      } else {
        const track = node.data as Track;
        return (
          <TrackItem key={track.id} track={track} />
        );
      }
    });
  };

  const handleCreatePlaylist = useCallback(() => {
    const playlistName = prompt('Enter playlist name:');
    if (playlistName) {
      playlistService.createPlaylist(playlistName).then(() => {
        manager.loadData().then(() => updateFilteredTree());
      }).catch((error) => {
        console.error('Error creating playlist:', error);
        alert('Failed to create playlist.');
      });
    }
  }, [playlistService, manager]);

  const handleUploadTrack = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        console.log('Uploading track:', file);
        try {
          await trackService.addTrack(file);
          manager.loadData().then(() => updateFilteredTree());
        } catch (error) {
          console.error('Error uploading track:', error);
          alert('Failed to upload track.');
        }
      }
    };
    fileInput.click();
  }, [trackService, manager]);

  useEffect(() => {
    const handleAggregateContextMenu = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.registerMenuItems === 'function') {
        customEvent.detail.registerMenuItems([
          {
            label: 'Upload Track',
            onClick: handleUploadTrack,
          },
          {
            label: 'Create Playlist',
            onClick: handleCreatePlaylist,
          },
        ]);
      }
    };

    const element = document.querySelector('.track-list-container');
    element?.addEventListener('contextmenu-aggregate', handleAggregateContextMenu);

    return () => {
      element?.removeEventListener('contextmenu-aggregate', handleAggregateContextMenu);
    };
  }, [registerMenuItems, handleUploadTrack, handleCreatePlaylist]);

  return (
    <div className="track-list-container" id="track-list-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name"
          onChange={handleSearchNameChange}
        />
        <input
          type="text"
          placeholder="Search by tags"
          onChange={handleSearchTagsChange}
        />
      </div>
      <div className="track-list">
        {renderTreeNodes(filteredTree)}
      </div>
      <div className="context-menu-hint">
          Click with the right button to open context menu
      </div>
    </div>
  );
};

export default TrackList;