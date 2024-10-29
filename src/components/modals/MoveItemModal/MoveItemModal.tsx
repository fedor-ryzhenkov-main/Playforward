import React, { useState, useEffect } from 'react';
import 'components/modals/MoveItemModal/MoveItemModal.css';
import LibraryItem from 'data/models/LibraryItem';
import BaseService from 'data/services/BaseService';
import Playlist from 'data/models/Playlist';
import TreeNode from 'data/models/TreeNode';

interface MoveItemModalProps {
  item: LibraryItem;
  onClose: () => void;
  onSubmit: (playlistId?: string) => void;
}

const MoveItemModal: React.FC<MoveItemModalProps> = ({ item, onClose, onSubmit }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [descendantIds, setDescendantIds] = useState<Set<string>>(new Set());
  const baseService = new BaseService();

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        // Build the tree using BaseService
        const tree = await baseService.buildTree();
        // Flatten the tree to get all playlists
        const allPlaylists = flattenPlaylists(tree);
        setPlaylists(allPlaylists);

        // If moving a playlist, get its descendant IDs to prevent circular references
        if (item.type === 'playlist') {
          const ids = getDescendantIds(tree, item.id);
          setDescendantIds(new Set(ids));
        } else {
          setDescendantIds(new Set());
        }
      } catch (error) {
        console.error('Error loading playlists:', error);
        alert('Failed to load playlists.');
      }
    };
    loadPlaylists();
  }, [item]);

  /**
   * Flattens the tree structure to extract all playlists.
   * @param nodes - The root nodes of the tree.
   * @returns An array of all playlists in the tree.
   */
  const flattenPlaylists = (nodes: TreeNode[]): Playlist[] => {
    const playlists: Playlist[] = [];

    const traverse = (nodeList: TreeNode[]) => {
      for (const node of nodeList) {
        if (node.item.type === 'playlist') {
          const playlist = node.item as Playlist;
          playlists.push(playlist);
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          }
        }
      }
    };

    traverse(nodes);
    return playlists;
  };

  /**
   * Retrieves all descendant IDs of a given playlist.
   * @param nodes - The root nodes of the tree.
   * @param playlistId - The ID of the playlist to find descendants for.
   * @returns An array of descendant IDs.
   */
  const getDescendantIds = (nodes: TreeNode[], playlistId: string): string[] => {
    const ids: string[] = [];

    const findNodeById = (nodeList: TreeNode[], id: string): TreeNode | null => {
      for (const node of nodeList) {
        if (node.item.id === id) {
          return node;
        } else if (node.children && node.children.length > 0) {
          const found = findNodeById(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const collectDescendantIds = (node: TreeNode) => {
      for (const child of node.children) {
        ids.push(child.item.id);
        if (child.children && child.children.length > 0) {
          collectDescendantIds(child);
        }
      }
    };

    const parentNode = findNodeById(nodes, playlistId);
    if (parentNode) {
      collectDescendantIds(parentNode);
    }

    return ids;
  };

  useEffect(() => {
    let filtered = playlists;

    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = playlists.filter((playlist) =>
        playlist.name.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (item.type === 'playlist') {
      // Exclude the item itself and its descendants to prevent moving into itself
      filtered = filtered.filter(
        (playlist) => playlist.id !== item.id && !descendantIds.has(playlist.id)
      );
    }

    setFilteredPlaylists(filtered);
  }, [searchTerm, playlists, item, descendantIds]);

  /**
   * Handles the move action when a playlist is selected.
   * @param playlistId - The ID of the selected playlist or undefined for root.
   */
  const handleMove = async (playlistId?: string) => {
    try {
      await baseService.moveItem(item.id, playlistId);
      onSubmit(playlistId);
    } catch (error) {
      console.error('Error moving item:', error);
      alert('Failed to move item. ' + (error as Error).message);
    }
  };

  /**
   * Renders the list of filtered playlists.
   * @returns JSX elements for the playlist list.
   */
  const renderPlaylistList = (): React.ReactNode => {
    return filteredPlaylists.map((playlist) => (
      <div key={playlist.id} className="playlist-item">
        <div className="playlist-name" onClick={() => handleMove(playlist.id)}>
          {playlist.name}
        </div>
      </div>
    ));
  };

  return (
    <div className="move-item-modal">
      <h2>Move Item to Playlist</h2>
      <input
        type="text"
        placeholder="Search Playlists"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="playlist-list">
        <div className="playlist-item">
          <div className="playlist-name" onClick={() => handleMove(undefined)}>
            No Playlist
          </div>
        </div>
        {renderPlaylistList()}
      </div>
      <div className="modal-buttons">
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default MoveItemModal;