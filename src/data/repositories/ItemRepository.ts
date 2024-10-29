import Track from 'data/models/Track';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface TrackDB extends DBSchema {
  tracks: {
    key: string;
    value: Track;
    indexes: { 'by-name': string };
  };
}

/**
 * Repository for managing tracks in IndexedDB.
 */
export class ItemRepository {
  private dbName = 'library';
  private version = 1;
  private db: IDBPDatabase<TrackDB> | null = null;

  /**
   * Opens the database connection.
   */
  private async openDB(): Promise<IDBPDatabase<TrackDB>> {
    if (!this.db) {
      this.db = await openDB<TrackDB>(this.dbName, this.version, {
        upgrade(db) {
          const store = db.createObjectStore('tracks', { keyPath: 'id' });
          store.createIndex('by-name', 'name');
        },
      });
    }
    return this.db;
  }

  /**
   * Adds a new track to the database.
   */
  async add(track: Track): Promise<void> {
    const db = await this.openDB();
    await db.add('tracks', track);
  }

  /**
   * Updates an existing track in the database.
   */
  async update(track: Track): Promise<void> {
    const db = await this.openDB();
    await db.put('tracks', track);
  }

  /**
   * Retrieves a track by its ID.
   */
  async getById(id: string): Promise<Track | null> {
    const db = await this.openDB();
    const track = await db.get('tracks', id);
    return track ?? null;
  }

  /**
   * Retrieves all tracks from the database.
   */
  async getAll(): Promise<Track[]> {
    const db = await this.openDB();
    return await db.getAll('tracks');
  }

  /**
   * Deletes a track from the database.
   */
  async delete(id: string): Promise<void> {
    const db = await this.openDB();
    await db.delete('tracks', id);
  }

  /**
   * Closes the database connection.
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}