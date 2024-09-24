import { v4 as uuidv4 } from 'uuid';
import Track from '../models/track';
import Playlist from '../models/playlist'; // Add this line
import dbEventEmitter from '../utils/events/eventEmitters';

let db: IDBDatabase;

const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AudioDB', 2); // Update version to 2
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

export const saveAudioToIndexedDB = async (file: File): Promise<void> => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const transaction = db.transaction(['audioFiles'], 'readwrite');
      const store = transaction.objectStore('audioFiles');
      const request = store.put({
        id: uuidv4(),
        name: file.name,
        type: file.type,
        data: event.target?.result,
        tags: [],
        description: ''
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        dbEventEmitter.emit('databaseUpdated');
        resolve();
      };
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const deleteAudioFromIndexedDB = async (key: string): Promise<void> => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audioFiles'], 'readwrite');
    const store = transaction.objectStore('audioFiles');
    const request = store.delete(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbEventEmitter.emit('databaseUpdated');
      resolve();
    };
  });
};

export const getAudioFromIndexedDB = async (key: string): Promise<Track | undefined> => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audioFiles'], 'readonly');
    const store = transaction.objectStore('audioFiles');
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

export const updateTrack = async (id: string, name: string, tags: string[], description: string): Promise<void> => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audioFiles'], 'readwrite');
    const store = transaction.objectStore('audioFiles');
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const file = request.result;
      file.name = name;
      file.tags = tags;
      file.description = description;
      const updateRequest = store.put(file);
      updateRequest.onerror = () => reject(updateRequest.error);
      updateRequest.onsuccess = () => {
        dbEventEmitter.emit('databaseUpdated');
        resolve();
      };
    };
  });
};

export const getAllAudioKeys = async (): Promise<Track[]> => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audioFiles'], 'readonly');
    const store = transaction.objectStore('audioFiles');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

export const clearAllAudioFiles = async (): Promise<void> => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audioFiles'], 'readwrite');
    const store = transaction.objectStore('audioFiles');
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbEventEmitter.emit('databaseUpdated');
      resolve();
    };
  });
};

// Add functions to handle playlists
export const savePlaylistToIndexedDB = async (name: string, parentId: string | null): Promise<void> => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['playlists'], 'readwrite');
    const store = transaction.objectStore('playlists');
    const request = store.put({
      id: uuidv4(),
      name,
      parentId
    });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbEventEmitter.emit('databaseUpdated');
      resolve();
    };
  });
};

export const getAllPlaylists = async (): Promise<Playlist[]> => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['playlists'], 'readonly');
    const store = transaction.objectStore('playlists');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};