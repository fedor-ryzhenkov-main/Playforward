import { v4 as uuidv4 } from 'uuid';
import dbEventEmitter from '../utils/events/eventEmitters';

let db: IDBDatabase;

const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AudioDB', 2);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (event.oldVersion < 1) {
        const audioStore = db.createObjectStore('audioFiles', { keyPath: 'id' });
        audioStore.createIndex('name', 'name', { unique: false });
        audioStore.createIndex('playlistId', 'playlistId', { unique: false });
      }
      if (event.oldVersion < 2) {
        const playlistStore = db.createObjectStore('playlists', { keyPath: 'id' });
        playlistStore.createIndex('name', 'name', { unique: false });
        playlistStore.createIndex('parentId', 'parentId', { unique: false });
      }
    };
  });
};

const getDB = async (): Promise<IDBDatabase> => {
  if (!db) await initDB();
  return db;
};

const emitDatabaseUpdated = () => {
  dbEventEmitter.emit('databaseUpdated');
};

export { getDB, emitDatabaseUpdated, uuidv4 };