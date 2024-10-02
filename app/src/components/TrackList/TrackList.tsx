import React, { useState, useEffect } from 'react';
import TrackListManager, { TreeNode } from './TrackListManager';
import TrackItem from './TrackItem'; 
import { removeFileExtension } from '../../utils/files/removeFileExtension';
import './TrackList.css';
import Track from '../../data/models/Track';
import Playlist from '../../data/models/Playlist';
import TrackService from '../../data/services/TrackService';

const TrackList: React.FC = () => {
  const [manager] = useState(new TrackListManager());
  const [filteredTree, setFilteredTree] = useState<TreeNode[]>([]);
  const trackService = new TrackService();

  useEffect(() => {
    const loadData = async () => {
      await manager.loadData();
      updateFilteredTree();
    };
    loadData();
  }, [manager]);

  const updateFilteredTree = () => {
    const tree = manager.getFilteredTree();
    setFilteredTree(tree);
  };

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
      const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        // Implement context menu logic here
      };

      if (node.type === 'playlist') {
        const playlist = node.data as Playlist;
        return (
          <div key={node.id} className="playlist-node" onContextMenu={handleContextMenu}>
            <div className="playlist-header">
              <span>{playlist.name}</span>
            </div>
            <div className="playlist-children">
              {renderTreeNodes(node.children)}
            </div>
          </div>
        );
      } else {
        const track = node.data as Track;
        return (
          <TrackItem key={track.id} track={track} trackService={trackService} />
        );
      }
    });
  };

  return (
    <div className="track-list-container">
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
    </div>
  );
};

export default TrackList;