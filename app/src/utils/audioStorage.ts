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
      db.createObjectStore('audioFiles', { keyPath: 'id' });
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
        id: `audio_${Date.now()}_${file.name}`,
        name: file.name,
        type: file.type,
        data: event.target?.result,
      });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
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
      request.onsuccess = () => resolve();
    });
  };

export const getAudioFromIndexedDB = async (key: string): Promise<Blob | null> => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audioFiles'], 'readonly');
    const store = transaction.objectStore('audioFiles');
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const file = request.result;
      if (file) {
        resolve(new Blob([file.data], { type: file.type }));
      } else {
        resolve(null);
      }
    };
  });
};

export const getAllAudioKeys = async (): Promise<string[]> => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audioFiles'], 'readonly');
    const store = transaction.objectStore('audioFiles');
    const request = store.getAllKeys();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as string[]);
  });
};