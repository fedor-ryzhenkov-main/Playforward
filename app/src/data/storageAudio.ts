import { getDB, emitDatabaseUpdated, uuidv4 } from './indexedDatabase';
import Track from '../models/track';

export const saveTrackToIndexedDB = async (file: File): Promise<void> => {
  const db = await getDB();
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
        description: '',
        playlistId: null
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        emitDatabaseUpdated();
        resolve();
      };
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const deleteTrackFromIndexedDB = async (key: string): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audioFiles'], 'readwrite');
    const store = transaction.objectStore('audioFiles');
    const request = store.delete(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      emitDatabaseUpdated();
      resolve();
    };
  });
};

export const getTrackFromIndexedDB = async (key: string): Promise<Track | undefined> => {
  const db = await getDB();
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
  const db = await getDB();
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
        emitDatabaseUpdated();
        resolve();
      };
    };
  });
};

export const getAllTrackKeys = async (): Promise<Track[]> => {
  const db = await getDB();
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

export const deleteAllTracks = async (): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audioFiles'], 'readwrite');
    const store = transaction.objectStore('audioFiles');
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      emitDatabaseUpdated();
      resolve();
    };
  });
};