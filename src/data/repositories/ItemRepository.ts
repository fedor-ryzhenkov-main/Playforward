import { getDB } from '../database/Database';
import { IRepository } from './Interfaces';
import LibraryItem from '../models/LibraryItem';

/**
 * Repository for managing LibraryItem entities.
 */
export class ItemRepository implements IRepository<LibraryItem> {
  private storeName: 'libraryItems' = 'libraryItems';

  async add(item: LibraryItem): Promise<void> {
    const db = await getDB();
    await db.add(this.storeName, item);
  }

  /**
   * Updates an existing item in the repository.
   * @param item The item with updated properties.
   */
  async update(item: LibraryItem): Promise<void> {
    const db = await getDB();
    await db.put(this.storeName, item);
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(this.storeName, id);
  }

  async getById(id: string): Promise<LibraryItem | null> {
    const db = await getDB();
    return await db.get(this.storeName, id) as LibraryItem | null;
  }

  async getAll(): Promise<LibraryItem[]> {
    const db = await getDB();
    return db.getAll(this.storeName);
  }

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear(this.storeName);
  }
}