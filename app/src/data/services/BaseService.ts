import LibraryItem from '../models/LibraryItem';
import Playlist from '../models/Playlist';
import Track from '../models/Track';
import { BaseRepository } from '../repositories/BaseRepository';

/**
 * Represents a resolved playlist with its child items.
 */
export interface ResolvedPlaylist extends Omit<Playlist, 'items'> {
  items: LibraryItem[];
  fullPath: string;
}

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

  /**
   * Deletes an item and its children recursively.
   * @param id The ID of the item to delete.
   */
  async deleteItem(id: string): Promise<void> {
    const item = await this.repository.getById(id);
    if (item) {
      // If the item is a playlist, delete its children recursively
      if (item.type === 'playlist') {
        const playlist = item as Playlist;
        for (const childId of playlist.items) {
          await this.deleteItem(childId);
        }
      }
      await this.repository.delete(id);
    }
  }

  /**
   * Updates an item and synchronizes parent-child relationships.
   * @param item The item to update.
   */
  async updateItem(item: LibraryItem | Track | Playlist): Promise<void> {
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

  /**
   * Builds a hierarchical tree structure from the given items.
   * @param items The flat array of LibraryItems.
   * @returns The hierarchical tree of LibraryItems.
   */
  async buildTree(items: LibraryItem[]): Promise<LibraryItem[]> {
    const itemMap = new Map<string, LibraryItem>();

    // Create a map of items by their ID
    items.forEach(item => itemMap.set(item.id, item));

    // Build the tree structure
    const rootItems: LibraryItem[] = [];
    for (const item of items) {
      if (!item.parentId) {
        rootItems.push(await this.resolveItem(item, itemMap));
      }
    }

    return rootItems;
  }

  /**
   * Recursively resolves a LibraryItem and its children.
   * @param item The LibraryItem to resolve.
   * @param itemMap A map of item IDs to LibraryItems.
   * @param parentPath The path to the parent item.
   * @returns The resolved LibraryItem with its children.
   */
  private async resolveItem(item: LibraryItem, itemMap: Map<string, LibraryItem>, parentPath: string = ''): Promise<LibraryItem | ResolvedPlaylist> {
    if (item.type === 'playlist') {
      const playlist = item as Playlist;
      const resolvedItems = await Promise.all(
        playlist.items
          .map(itemId => itemMap.get(itemId))
          .filter((child): child is LibraryItem => child !== undefined)
          .map(childItem => this.resolveItem(childItem, itemMap, `${parentPath}${playlist.name}/`))
      );

      const fullPath = `${parentPath}${playlist.name}`;
      return {
        ...playlist,
        items: resolvedItems,
        fullPath: fullPath,
      };
    }
    return item as Track;
  }
}