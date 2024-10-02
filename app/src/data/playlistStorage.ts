import { getDB, emitDatabaseUpdated, uuidv4 } from './indexedDatabase';
import Playlist from '../models/playlist';

export const savePlaylistToIndexedDB = async (name: string, parentId: string | null = null): Promise<void> => {
  const db = await getDB();
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
      emitDatabaseUpdated();
      resolve();
    };
  });
};

export const getAllPlaylists = async (): Promise<Playlist[]> => {
  const db = await getDB();
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