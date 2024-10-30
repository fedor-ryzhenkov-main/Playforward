import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';

interface TrackDB extends DBSchema {
  tracks: {
    key: string;
    value: {
      id: string;
      name: string;
      tags: string[];
      description?: string;
      audio?: ArrayBuffer;
    };
    indexes: { 
      'by-name': string;
      'by-tags': string[];
    };
  };
}

let db: IDBPDatabase<TrackDB>;

/**
 * Gets or initializes the database connection.
 * @returns Promise<IDBPDatabase<MyDB>> Database instance
 */
export async function getDB(): Promise<IDBPDatabase<TrackDB>> {
  if (!db) {
    db = await openDB<TrackDB>('musicLibrary', 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('tracks')) {
          const trackStore = database.createObjectStore('tracks', { keyPath: 'id' });
          trackStore.createIndex('by-name', 'name');
          trackStore.createIndex('by-tags', 'tags', { multiEntry: true });
        }
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
    db = null as unknown as IDBPDatabase<TrackDB>;
  }
}

export { uuidv4 };