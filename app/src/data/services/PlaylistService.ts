// app/src/services/PlaylistService.ts
import { PlaylistRepository } from '../repositories/PlaylistRepository';
import Playlist from '../models/Playlist';
import { v4 as uuidv4 } from 'uuid';
import Track from '../models/Track';

/**
 * Service for managing playlists.
 */
export default class PlaylistService {
  private repository: PlaylistRepository;

  constructor() {
    this.repository = new PlaylistRepository();
  }

  /**
   * Creates a new playlist.
   * @param name The name of the playlist.
   * @param parentId The optional parent playlist ID.
   * @param tracks The optional tracks to add to the playlist.
   */
  async createPlaylist(name: string, parentId?: string, tracks?: Track[]): Promise<void> {
    const playlist: Playlist = {
      id: uuidv4(),
      name,
      parentId,
      tracks: tracks || [],
    };
    await this.repository.add(playlist);
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    return this.repository.getById(id);
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    return this.repository.getAll();
  }

  async updatePlaylist(playlist: Playlist): Promise<void> {
    await this.repository.update(playlist);
  }

  async deletePlaylist(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getPlaylistTracks(id: string): Promise<Track[]> {
    return this.repository.getPlaylistTracks(id);
  }
}