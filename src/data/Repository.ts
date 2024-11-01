import { Track, SerializedTrack } from 'data/models/Track';
import { getDB } from 'data/Database';
import { dbg } from 'utils/debug';

/**
 * Represents a track record in the database
 */
interface TrackRecord extends SerializedTrack {
  audio?: ArrayBuffer;
}

/**
 * Repository for managing tracks in IndexedDB.
 * Handles the persistence and retrieval of Track entities and their audio data.
 */
/**
 * Repository for managing tracks in IndexedDB.
 * Handles the persistence and retrieval of Track entities and their audio data.
 * Implements the singleton pattern to ensure only one instance exists.
 */
export class Repository {
  private static instance: Repository | null = null;

  private constructor() {}

  /**
   * Gets the singleton instance of TrackRepository.
   * Creates a new instance if one doesn't exist.
   */
  public static getInstance(): Repository {
    if (!Repository.instance) {
      Repository.instance = new Repository();
    }
    return Repository.instance;
  }

  /**
   * Adds or updates a track in the database.
   * @throws {Error} If database operation fails
   */
  async save(track: Track, audio?: ArrayBuffer): Promise<Track> {
    dbg.db(`Saving track ${track.id}`);
    const db = await getDB();
    const tx = db.transaction(['tracks', 'audio'], 'readwrite');

    try {
      dbg.db('Saving track metadata...');
      await tx.objectStore('tracks').put(track.serialize());

      if (audio) {
        dbg.db(`Saving audio data (${audio.byteLength} bytes)...`);
        await tx.objectStore('audio').put({
          id: track.id,
          data: audio,
          lastModified: Date.now()
        });
        track.setAudio(audio);
        dbg.db('Audio data saved successfully');
      }

      await tx.done;
      dbg.db(`Track ${track.id} saved successfully`);
      return track;
    } catch (error) {
      if (error instanceof Error) {
        dbg.db(`Failed to save track: ${error.message}`);
      } else {
        dbg.db('Failed to save track: Unknown error');
      }
      throw error;
    }
  }

  /**
   * Retrieves a track's audio data by its ID.
   * @throws {Error} If track not found
   */
  async getAudio(id: string): Promise<ArrayBuffer> {
    dbg.db(`Fetching audio for track ${id}`);
    const db = await getDB();
    const audioRecord = await db.get('audio', id);
    
    if (!audioRecord?.data) {
      dbg.db(`Audio not found for track ${id}`);
      throw new Error(`Audio not found for track ${id}`);
    }
    
    dbg.db(`Retrieved audio data (${audioRecord.data.byteLength} bytes)`);
    return audioRecord.data;
  }

  /**
   * Retrieves a track by its ID.
   */
  async getTrack(id: string): Promise<Track | null> {
    const db = await getDB();
    const record = await db.get('tracks', id) as TrackRecord | undefined;
    
    if (!record) return null;
    
    const track = Track.fromSerialized(record);
    if (record.audio) {
      track.setAudio(record.audio);
    }
    return track;
  }

  /**
   * Retrieves all tracks (without audio data).
   */
  async getAll(): Promise<Track[]> {
    const db = await getDB();
    const records = await db.getAll('tracks') as TrackRecord[];
    return records.map(record => Track.fromSerialized(record));
  }

  /**
   * Deletes a track and its audio data from the database.
   */
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('tracks', id);
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
    const records = await index.getAll(keyRange) as TrackRecord[];
    return records.map(record => Track.fromSerialized(record));
  }

  /**
   * Search tracks by name.
   */
  async searchByName(name: string): Promise<Track[]> {
    const db = await getDB();
    const index = db.transaction('tracks').store.index('by-name');
    const records = await index.getAll(name) as TrackRecord[];
    return records.map(record => Track.fromSerialized(record));
  }
}