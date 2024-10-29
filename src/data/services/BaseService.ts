import LibraryItem from '../models/LibraryItem';
import ClosureEntry from '../models/ClosureEntry';
import { ItemRepository } from '../repositories/ItemRepository';
import { ClosureTableRepository } from '../repositories/ClosureTableRepository';
import EventDispatcher from '../events/EventDispatcher';
import TreeNode from '../models/TreeNode';

/**
 * Service for managing library items using the Closure Table approach.
 */
export default class BaseService {
  private itemRepository: ItemRepository;
  private closureRepository: ClosureTableRepository;

  constructor() {
    this.itemRepository = new ItemRepository();
    this.closureRepository = new ClosureTableRepository();
  }

  /**
   * Retrieves an item from the library by its ID.
   * @param id The ID of the item to retrieve.
   * @returns A Promise that resolves to the LibraryItem if found, or null if not found.
   */
  async getItem(id: string): Promise<LibraryItem | null> {
    try {
      const item = await this.itemRepository.getById(id);
      return item;
    } catch (error) {
      console.error(`Error retrieving item with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Adds a new item to the library.
   * @param item The item to add.
   */
  async addItem(item: LibraryItem): Promise<void> {
    await this.itemRepository.add(item);

    // Add self-reference in the closure table
    const selfEntry: ClosureEntry = {
      ancestorId: item.id,
      descendantId: item.id,
      depth: 0,
    };
    await this.closureRepository.add(selfEntry);

    // Emit dataChanged event
    EventDispatcher.getInstance().emit('dataChanged', { action: 'add', item });
  }

  /**
   * Updates an existing item in the library.
   * @param item The item with updated properties.
   */
  async updateItem(item: LibraryItem): Promise<void> {
    await this.itemRepository.update(item);

    // Emit dataChanged event
    EventDispatcher.getInstance().emit('dataChanged', { action: 'update', item });
  }

  /**
   * Deletes an item and all its descendants from the library.
   * @param itemId The ID of the item to delete.
   */
  async deleteItem(itemId: string): Promise<void> {
    // Find all descendants
    const descendants = await this.closureRepository.getDescendants(itemId);

    // Delete closure entries and items
    for (const descendant of descendants) {
      await this.itemRepository.delete(descendant.descendantId);
      await this.closureRepository.deleteByAncestorDescendant(
        descendant.ancestorId,
        descendant.descendantId
      );
    }

    // Emit dataChanged event
    EventDispatcher.getInstance().emit('dataChanged', { action: 'delete', id: itemId });
  }

  /**
   * Moves an item to a new parent.
   * @param itemId The ID of the item to move.
   * @param newParentId Optional new parent ID (undefined for root).
   */
  async moveItem(itemId: string, newParentId?: string): Promise<void> {
    // Step 1: Prevent moving an item under itself or its descendants
    if (newParentId) {
      const isDescendant = await this.isDescendant(itemId, newParentId);
      if (isDescendant || itemId === newParentId) {
        throw new Error('Cannot move an item under itself or its descendant.');
      }
    }

    // Step 2: Get all ancestors of the item being moved
    const oldAncestors = await this.closureRepository.getAncestors(itemId);
    console.log('oldAncestors', oldAncestors);

    // Step 3: Get all descendants of the item being moved (including itself)
    const descendants = await this.closureRepository.getDescendants(itemId);
    console.log('descendants', descendants);

    // Delete old closure entries
    const entriesToDelete = oldAncestors
      .filter(ancestor => ancestor.ancestorId !== itemId)
      .flatMap(ancestor => descendants.map(descendant => ({
        ancestorId: ancestor.ancestorId,
        descendantId: descendant.descendantId,
      })));
    
    await this.closureRepository.deleteEntries(entriesToDelete);

    // Insert new closure entries
    if (newParentId) {
      const newParentAncestors = await this.closureRepository.getAncestors(newParentId);
      const newEntries: ClosureEntry[] = [];

      for (const ancestor of newParentAncestors) {
        for (const descendant of descendants) {
          // Check if the relationship already exists
          const existingEntry = await this.closureRepository.getById([ancestor.ancestorId, descendant.descendantId]);
          if (!existingEntry) {
            newEntries.push({
              ancestorId: ancestor.ancestorId,
              descendantId: descendant.descendantId,
              depth: ancestor.depth + descendant.depth + 1,
            });
          }
        }
      }

      // Include self-relations if they don't exist
      for (const descendant of descendants) {
        const existingSelfRelation = await this.closureRepository.getById([descendant.descendantId, descendant.descendantId]);
        if (!existingSelfRelation) {
          newEntries.push({
            ancestorId: descendant.descendantId,
            descendantId: descendant.descendantId,
            depth: 0,
          });
        }
      }

      await this.closureRepository.addEntries(newEntries);
    } else {
      // Moving to root: only add self-relations if they don't exist
      const selfEntries = [];
      for (const descendant of descendants) {
        const existingSelfRelation = await this.closureRepository.getById([descendant.descendantId, descendant.descendantId]);
        if (!existingSelfRelation) {
          selfEntries.push({
            ancestorId: descendant.descendantId,
            descendantId: descendant.descendantId,
            depth: 0,
          });
        }
      }
      await this.closureRepository.addEntries(selfEntries);
    }

    // Emit dataChanged event
    EventDispatcher.getInstance().emit('dataChanged', { action: 'move', itemId, newParentId });
  }

  /**
   * Checks if one item is a descendant of another.
   * @param ancestorId The potential ancestor ID.
   * @param descendantId The potential descendant ID.
   * @returns True if descendantId is a descendant of ancestorId.
   */
  private async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    const ancestors = await this.closureRepository.getAncestors(descendantId);
    return ancestors.some((entry) => entry.ancestorId === ancestorId);
  }

  /**
   * Retrieves all items from the library.
   * @returns An array of all LibraryItems.
   */
  async getAllItems(): Promise<LibraryItem[]> {
    return await this.itemRepository.getAll();
  }

  /**
   * Builds the hierarchical tree from the Closure Table.
   * @returns An array of root LibraryItems with nested children.
   */
  async buildTree(): Promise<TreeNode[]> {
    const allItems = await this.itemRepository.getAll();
    console.log('allItems', allItems);
    const closureEntries = await this.closureRepository.getAll();
    console.log('closureEntries', closureEntries);

    const itemMap: Map<string, TreeNode> = new Map();
    allItems.forEach((item) => {
      itemMap.set(item.id, new TreeNode(item));
    });
    console.log('itemMap', itemMap);

    // Process closure entries to establish parent-child relationships
    closureEntries
      .filter((entry) => entry.depth === 1)
      .forEach((entry) => {
        const parent = itemMap.get(entry.ancestorId);
        const child = itemMap.get(entry.descendantId);
        if (parent && child && parent.item.type === 'playlist' && parent.item.id !== child.item.id) {
          parent.children.push(child);
        }
      });
    console.log('closureEntries', closureEntries);
    
    // Identify root items (items with no ancestors other than themselves)
    const rootItems = allItems.filter((item) => {
      const ancestors = closureEntries.filter(
        (entry) => entry.descendantId === item.id && entry.ancestorId !== item.id
      );
      return ancestors.length === 0; // No ancestors other than self
    });
    console.log('rootItems', rootItems);

    if (rootItems.length === 0) {
      console.warn('No root items found. This might indicate an issue with the closure table.');
    }

    return rootItems.map((root) => {
      const rootNode = itemMap.get(root.id);
      if (!rootNode) {
        console.error(`Root item with id ${root.id} not found in itemMap`);
        throw new Error(`Root item with id ${root.id} not found in itemMap`);
      }
      return rootNode;
    });
  }

  /**
   * Deletes all items from the library.
   */
  async deleteAllItems(): Promise<void> {
    await this.itemRepository.clear();
    await this.closureRepository.clear();

    // Emit dataChanged event
    EventDispatcher.getInstance().emit('dataChanged', { action: 'clear' });
  }

  async getAllClosureEntries(): Promise<ClosureEntry[]> {
    return this.closureRepository.getAll();
  }

  async deleteAllClosureEntries(): Promise<void> {
    await this.closureRepository.clear();
  }

  async addClosureEntry(entry: any): Promise<void> {
    await this.closureRepository.add(entry);
  }
}