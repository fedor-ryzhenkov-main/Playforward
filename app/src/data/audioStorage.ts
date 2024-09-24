
import { v4 as uuidv4 } from 'uuid';
import Track from '../models/track';
import dbEventEmitter from '../utils/events/eventEmitters';

let db: IDBDatabase;

const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AudioDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.createObjectStore('audioFiles', { keyPath: 'id' });
      store.createIndex('name', 'name', { unique: false });
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