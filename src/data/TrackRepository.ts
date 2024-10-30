import { Track } from 'data/Track';
import { getDB } from 'data/Database';

/**
 * Repository for managing tracks in IndexedDB.
 */
export class TrackRepository {
  /**
   * Adds a new track to the database.
   */
  async add(track: Track, audio: ArrayBuffer): Promise<Track> {
    const db = await getDB();
    await db.put('tracks', {
      ...track.toJSON(),
      audio
    });
    track.setAudio(audio);
    return track;
  }

  /**
   * Retrieves a track by its ID.
   */
  async getTrack(id: string): Promise<Track | null> {
    const db = await getDB();
    const data = await db.get('tracks', id);
    if (!data) return null;
    
    const track = Track.fromJSON(data);
    if (data.audio) {
      track.setAudio(data.audio);
    }
    return track;
  }

  /**
   * Retrieves all tracks.
   */
  async getAll(): Promise<Track[]> {
    const db = await getDB();
    const tracks = await db.getAll('tracks');
    return tracks.map(data => Track.fromJSON(data));
  }

  /**
   * Deletes a track from the database.
   */
  async delete(id: string): Promise<string> {
    const db = await getDB();
    await db.delete('tracks', id);
    return id;
  }

  /**
   * Clears all tracks from the database.
   */
  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('tracks');
  }

  /**
   * Search tracks by tag.
   */
  async searchByTag(tag: string): Promise<Track[]> {
    const db = await getDB();
    const index = db.transaction('tracks').store.index('by-tags');
    const keyRange = IDBKeyRange.only(tag);
    const tracks = await index.getAll(keyRange);
    return tracks.map(data => Track.fromJSON(data));
  }

  /**
   * Search tracks by name.
   */
  async searchByName(name: string): Promise<Track[]> {
    const db = await getDB();
    const index = db.transaction('tracks').store.index('by-name');
    const tracks = await index.getAll(name);
    return tracks.map(data => Track.fromJSON(data));
  }
}