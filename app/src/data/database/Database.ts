import { v4 as uuidv4 } from 'uuid';

let db: IDBDatabase;

const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('libraryDatabase', 2);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (event.oldVersion < 1) {
        db.createObjectStore('libraryObjectStore', { keyPath: 'id' });
      }
    };
  });
};
const getDB = async (): Promise<IDBDatabase> => {
  if (!db) await initDB();
  return db;
};

export { getDB, uuidv4 };
