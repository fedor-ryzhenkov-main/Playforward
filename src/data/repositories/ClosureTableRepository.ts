import { getDB } from '../database/Database';
import { IClosureTableRepository, IRepository } from './Interfaces';
import ClosureEntry from '../models/ClosureEntry';

/**
 * Repository for managing Closure Table entries.
 */
export class ClosureTableRepository implements IClosureTableRepository{
  private storeName: 'closureTable' = 'closureTable';

  async add(entry: ClosureEntry): Promise<void> {
    const db = await getDB();
    await db.add(this.storeName, entry);
  }

  async update(entry: ClosureEntry): Promise<void> {
    const db = await getDB();
    await db.put(this.storeName, entry);
  }

  /**
   * Deletes a specific closure entry based on ancestorId and descendantId.
   * @param ancestorId The ancestor item's ID.
   * @param descendantId The descendant item's ID.
   */
  async delete(ancestorId: string, descendantId: string): Promise<void> {
    const db = await getDB();
    await db.delete(this.storeName, [ancestorId, descendantId]);
  }

  async getById(id: [string, string]): Promise<ClosureEntry | null> {
    const db = await getDB();
    return await db.get(this.storeName, id) as ClosureEntry | null;
  }

  async getAll(): Promise<ClosureEntry[]> {
    const db = await getDB();
    return db.getAll(this.storeName);
  }

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear(this.storeName);
  }

  /** 
   * Deletes a specific closure entry based on ancestorId and descendantId.
   * @param ancestorId The ancestor item's ID.
   * @param descendantId The descendant item's ID.
   */
  async deleteByAncestorDescendant(ancestorId: string, descendantId: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);

    try {
      await store.delete([ancestorId, descendantId]);
      await tx.done;
    } catch (error) {
      console.error('Error deleting closure entry:', error);
      throw new Error('Failed to delete closure entry');
    }
  }

  /**
   * Retrieves all ancestors of a given descendantId.
   * @param descendantId The descendant item's ID.
   * @returns An array of ClosureEntry representing ancestors.
   */
  async getAncestors(descendantId: string): Promise<ClosureEntry[]> {
    const db = await getDB();
    return db.getAllFromIndex(this.storeName, 'descendantId', descendantId);
  }

  /**
   * Retrieves all descendants of a given ancestorId.
   * @param ancestorId The ancestor item's ID.
   * @returns An array of ClosureEntry representing descendants.
   */
  async getDescendants(ancestorId: string): Promise<ClosureEntry[]> {
    const db = await getDB();
    return db.getAllFromIndex(this.storeName, 'ancestorId', ancestorId);
  }

  /** 
   * Deletes all descendants of a given ancestorId.
   * @param ancestorId The ancestor item's ID.
   */
  async deleteDescendants(ancestorId: string): Promise<void> {
    const db = await getDB();
    const descendants = await this.getDescendants(ancestorId);
    for (const descendant of descendants) {
      await this.delete(ancestorId, descendant.descendantId);
    }
  }

  /**
   * Deletes multiple closure entries in bulk.
   * @param entries An array of objects containing ancestorId and descendantId.
   */
  async deleteEntries(entries: { ancestorId: string; descendantId: string }[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);

    for (const entry of entries) {
      await store.delete([entry.ancestorId, entry.descendantId]);
    }

    await tx.done;
  }

  /**
   * Adds multiple closure entries in bulk.
   * @param entries An array of ClosureEntry objects to add.
   */
  async addEntries(entries: ClosureEntry[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);

    for (const entry of entries) {
      await store.add(entry);
    }

    await tx.done;
  }
}