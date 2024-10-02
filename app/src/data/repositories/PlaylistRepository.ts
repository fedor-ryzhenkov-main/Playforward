// app/src/data/repositories/PlaylistRepository.ts
import { BaseRepository } from './BaseRepository';
import Playlist from '../models/Playlist';
import Track from '../models/Track'; // Ensure Track is imported as a value

/**
 * Repository for managing Playlist entities.
 */
export class PlaylistRepository extends BaseRepository<Playlist> {

  constructor() {
    super('playlists'); // The name of the object store for playlists
  }

  async getPlaylistItems(id: string): Promise<(Track | Playlist)[]> {
    const playlist = await this.getById(id);
    if (!playlist) {
      return [];
    }
    return playlist.items
  }
}