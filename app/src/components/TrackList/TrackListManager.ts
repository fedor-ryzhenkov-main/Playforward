// app/src/components/TrackList/TrackListManager.ts
import TrackService from '../../data/services/TrackService';
import PlaylistService from '../../data/services/PlaylistService';
import Track from '../../data/models/Track';
import Playlist from '../../data/models/Playlist';

export interface TreeNode {
  id: string;
  type: 'track' | 'playlist';
  data: Track | Playlist;
  children: TreeNode[];
}

/**
 * Manages the track and playlist tree structure.
 */
export default class TrackListManager {
  private trackService: TrackService;
  private playlistService: PlaylistService;
  public tracks: Track[] = [];
  public playlists: Playlist[] = [];
  private searchName: string = '';
  private searchTags: string = '';

  constructor() {
    this.trackService = new TrackService();
    this.playlistService = new PlaylistService();
  }

  async loadData(): Promise<void> {
    this.tracks = await this.trackService.getAllTracks();
    this.playlists = await this.playlistService.getAllPlaylists();
  }

  /**
   * Sets the search criteria for track names.
   * @param searchName The name to search for.
   */
  setSearchName(searchName: string): void {
    this.searchName = searchName;
  }

  /**
   * Sets the search criteria for track tags.
   * @param searchTags The tags to search for.
   */
  setSearchTags(searchTags: string): void {
    this.searchTags = searchTags;
  }

  /**
   * Builds a tree structure of playlists and tracks.
   * @returns An array of root TreeNodes.
   */
  buildTree(): TreeNode[] {
    const playlistMap = new Map<string, TreeNode>();
    const trackMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    for (const playlist of this.playlists) {
      const node: TreeNode = {
        id: playlist.id,
        type: 'playlist',
        data: playlist,
        children: [],
      };
      playlistMap.set(playlist.id, node);
    }

    for (const node of Array.from(playlistMap.values())) {
      const playlist = node.data as Playlist;
      if (playlist.parentId && playlistMap.has(playlist.parentId)) {
        playlistMap.get(playlist.parentId)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }

    // Create TreeNodes for tracks
    for (const track of this.tracks) {
      const node: TreeNode = {
        id: track.id,
        type: 'track',
        data: track,
        children: [],
      };
      trackMap.set(track.id, node);

      if (track.playlistId && playlistMap.has(track.playlistId)) {
        playlistMap.get(track.playlistId)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }

    return rootNodes;
  }

  /**
   * Filters the tree based on search criteria.
   * @returns An array of filtered root TreeNodes.
   */
  getFilteredTree(): TreeNode[] {
    const filterByNameAndTags = (track: Track): boolean => {
      const nameMatch = track.name
        .toLowerCase()
        .includes(this.searchName.toLowerCase());
      const tagsMatch =
        this.searchTags === '' ||
        track.tags.some((tag) =>
          tag.toLowerCase().includes(this.searchTags.toLowerCase())
        );
      return nameMatch && tagsMatch;
    };

    const filterTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.type === 'track') {
          const track = node.data as Track;
          return filterByNameAndTags(track) ? node : null;
        } else {
          const playlist = node.data as Playlist;
          const nameMatch = playlist.name.toLowerCase().includes(this.searchName.toLowerCase());
          const filteredChildren = filterTree(node.children);
          if (nameMatch || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
          return null;
        }
      }).filter((node): node is TreeNode => node !== null);
    };

    const tree = this.buildTree();
    return filterTree(tree);
  }

  /**
   * Moves a track to a new playlist.
   * @param trackId The ID of the track to move.
   * @param targetPlaylistId The ID of the target playlist.
   */
  async moveTrack(trackId: string, targetPlaylistId?: string): Promise<void> {
    const track = this.tracks.find((t) => t.id === trackId);
    if (track) {
      track.playlistId = targetPlaylistId;
      await this.trackService.updateTrack(track);
    }
  }

  /**
   * Moves a playlist to a new parent playlist.
   * @param playlistId The ID of the playlist to move.
   * @param targetParentId The ID of the target parent playlist.
   */
  async movePlaylist(playlistId: string, targetParentId?: string): Promise<void> {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (playlist) {
      playlist.parentId = targetParentId;
      await this.playlistService.updatePlaylist(playlist);
    }
  }

  /**
   * Deletes a track.
   * @param trackId The ID of the track to delete.
   */
  async deleteTrack(trackId: string): Promise<void> {
    this.tracks = this.tracks.filter((t) => t.id !== trackId);
    await this.trackService.deleteTrack(trackId);
  }

  /**
   * Deletes a playlist and its descendants.
   * @param playlistId The ID of the playlist to delete.
   */
  async deletePlaylist(playlistId: string): Promise<void> {
    const deleteRecursive = async (id: string) => {
      // Delete child playlists
      const childPlaylists = this.playlists.filter((p) => p.parentId === id);
      for (const child of childPlaylists) {
        await deleteRecursive(child.id);
      }

      // Delete tracks in this playlist
      const tracksToDelete = this.tracks.filter((t) => t.playlistId === id);
      for (const track of tracksToDelete) {
        await this.deleteTrack(track.id);
      }

      // Remove playlist
      this.playlists = this.playlists.filter((p) => p.id !== id);
      await this.playlistService.deletePlaylist(id);
    };

    await deleteRecursive(playlistId);
  }
}