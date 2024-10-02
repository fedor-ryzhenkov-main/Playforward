import LibraryItem from '../models/LibraryItem';
import Playlist from '../models/Playlist';
import { BaseRepository } from '../repositories/BaseRepository';

/**
 * Service for managing hierarchical relationships between LibraryItems.
 */
export default class BaseService {
  private repository: BaseRepository<LibraryItem>;

  constructor(repository: BaseRepository<LibraryItem>) {
    this.repository = repository;
  }

  async getItem(id: string): Promise<LibraryItem | null> {
    return await this.repository.getById(id);
  }

  async getAllItems(type?: string): Promise<LibraryItem[]> {
    const all = await this.repository.getAll();
    if (type) {
      return all.filter((item) => item.type === type);
    }
    return all;
  }

  async addItem(item: LibraryItem): Promise<void> {
    await this.repository.add(item);
  }

  async deleteItem(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Updates an item and synchronizes parent-child relationships.
   * @param item The item to update.
   */
  async updateItem(item: LibraryItem): Promise<void> {
    const existingItem = await this.repository.getById(item.id);

    if (existingItem) {
      // If parentId has changed, update the old and new parents
      if (existingItem.parentId !== item.parentId) {
        if (existingItem.parentId) {
          const oldParent = await this.repository.getById(existingItem.parentId);
          if (oldParent && oldParent.type === 'playlist') {
            (oldParent as Playlist).items = (oldParent as Playlist).items.filter((id) => id !== item.id);
            await this.repository.update(oldParent);
          }
        }

        if (item.parentId) {
          const newParent = await this.repository.getById(item.parentId);
          if (newParent && newParent.type === 'playlist') {
            (newParent as Playlist).items.push(item.id);
            await this.repository.update(newParent);
          }
        }
      }

      // If children have changed, update the children's parentId
      if (existingItem.type === 'playlist') {
        const existingChildren = (existingItem as Playlist).items;
        const newChildren = (item as Playlist).items;

        // Find removed children
        const removedChildren = existingChildren.filter((id) => !newChildren.includes(id));
        for (const childId of removedChildren) {
          const child = await this.repository.getById(childId);
          if (child) {
            child.parentId = undefined;
            await this.repository.update(child);
          }
        }

        // Find added children
        const addedChildren = newChildren.filter((id) => !existingChildren.includes(id));
        for (const childId of addedChildren) {
          const child = await this.repository.getById(childId);
          if (child) {
            child.parentId = item.id;
            await this.repository.update(child);
          }
        }
      }
    }

    await this.repository.update(item);
  }
}