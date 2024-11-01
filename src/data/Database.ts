import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SerializedTrack } from './models/Track';

interface MusicLibraryDB extends DBSchema {
  tracks: {
    key: string;
    value: SerializedTrack;
    indexes: { 
      'by-name': string;
      'by-tags': string[];
    };
  };
  audio: {
    key: string;
    value: {
      id: string;
      data: ArrayBuffer;
      lastModified: number;
    };
  };
}

const DB_VERSION = 1;
let db: IDBPDatabase<MusicLibraryDB>;

/**
 * Gets or initializes the database connection.
 * @returns Promise<IDBPDatabase<MusicLibraryDB>> Database instance
 */
export async function getDB(): Promise<IDBPDatabase<MusicLibraryDB>> {
  if (!db) {
    db = await openDB<MusicLibraryDB>('musicLibrary', DB_VERSION, {
      upgrade(database) {
        // Create tracks store with indexes
        const trackStore = database.createObjectStore('tracks', { keyPath: 'id' });
        trackStore.createIndex('by-name', 'name');
        trackStore.createIndex('by-tags', 'tags', { multiEntry: true });

        // Create audio store
        database.createObjectStore('audio', { keyPath: 'id' });
      },
    });
  }
  return db;
}

/**
 * Closes the database connection.
 */
export async function closeDB(): Promise<void> {
  if (db) {
    db.close();
    db = null as unknown as IDBPDatabase<MusicLibraryDB>;
  }
}