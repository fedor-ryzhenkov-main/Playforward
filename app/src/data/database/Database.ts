import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';

interface MyDB extends DBSchema {
  libraryItems: {
    key: string;
    value: {
      id: string;
      name: string;
      type: 'track' | 'playlist';
      data?: ArrayBuffer;
      tags?: string[];
      description?: string;
    };
    indexes: { 'type': string };
  };
  closureTable: {
    key: [string, string]; // Composite key for ancestorId and descendantId
    value: {
      ancestorId: string;
      descendantId: string;
      depth: number;
    };
    indexes: {
      'ancestorId': string;
      'descendantId': string;
      'ancestor_descendant': [string, string];
    };
  };
}

let db: IDBPDatabase<MyDB>;

export async function getDB(): Promise<IDBPDatabase<MyDB>> {
  if (!db) {
    db = await openDB<MyDB>('myDatabase', 2, { // Incremented version to apply changes
      upgrade(database) {
        // Create 'libraryItems' store if it doesn't exist
        if (!database.objectStoreNames.contains('libraryItems')) {
          const libraryStore = database.createObjectStore('libraryItems', { keyPath: 'id' });
          libraryStore.createIndex('type', 'type');
        }

        // Create 'closureTable' store with composite keyPath if it doesn't exist
        if (!database.objectStoreNames.contains('closureTable')) {
          const closureStore = database.createObjectStore('closureTable', { keyPath: ['ancestorId', 'descendantId'] });
          closureStore.createIndex('ancestorId', 'ancestorId');
          closureStore.createIndex('descendantId', 'descendantId');
          closureStore.createIndex('ancestor_descendant', ['ancestorId', 'descendantId'], { unique: true });
        }
      },
    });
  }
  return db;
}

export { uuidv4 };