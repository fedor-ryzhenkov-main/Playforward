import { saveAs } from 'file-saver';
import Track from 'data/models/Track';
import Playlist from 'data/models/Playlist';
import LibraryItem from 'data/models/LibraryItem';
import BaseService from 'data/services/BaseService';
import EventDispatcher from 'data/events/EventDispatcher';
import ClosureEntry from 'data/models/ClosureEntry';
import TreeNode from 'data/models/TreeNode';

/**
 * Manages the track and playlist tree structure.
 */
export default class TrackListModel {
  private baseService: BaseService;
  private searchName: string = '';
  private searchTags: string = '';

  constructor() {
    this.baseService = new BaseService();
    EventDispatcher.getInstance().subscribe('dataChanged', this.handleDataChanged.bind(this));
  }

  /**
   * Subscribes to data change events.
   * @param callback The callback to invoke on data changes.
   */
  subscribe(callback: () => void): void {
    EventDispatcher.getInstance().subscribe('dataChanged', callback);
  }

  /**
   * Unsubscribes from data change events.
   * @param callback The callback to remove.
   */
  unsubscribe(callback: () => void): void {
    EventDispatcher.getInstance().unsubscribe('dataChanged', callback);
  }

  /**
   * Builds and filters the hierarchical tree structure from the items.
   * @param searchName The name to filter by.
   * @param searchTags The tags to filter by.
   * @returns The filtered hierarchical tree of TreeNodes.
   */
  async getFilteredTree(searchName: string, searchTags: string): Promise<TreeNode[]> {
    this.searchName = searchName;
    this.searchTags = searchTags;

    // Build the full tree as TreeNodes
    const fullTree = await this.buildTree();
    console.log('fullTree', fullTree);

    // Recursively filter the tree
    const filteredTree = this.filterTree(fullTree);
    console.log('filteredTree', filteredTree);

    return filteredTree;
  }

  /**
   * Builds the hierarchical tree using TreeNodes.
   * @returns The root-level TreeNodes.
   */
  private async buildTree(): Promise<TreeNode[]> {
    const allItems = await this.baseService.getAllItems();
    const closureEntries = await this.baseService.getAllClosureEntries();

    // Map item IDs to TreeNodes
    const nodeMap = new Map<string, TreeNode>();
    allItems.forEach(item => {
      nodeMap.set(item.id, new TreeNode(item));
    });

    // Build parent-child relationships
    closureEntries.forEach(entry => {
      if (entry.depth === 1) {
        const parentNode = nodeMap.get(entry.ancestorId);
        const childNode = nodeMap.get(entry.descendantId);
        if (parentNode && childNode && parentNode !== childNode) {
          parentNode.children.push(childNode);
        }
      }
    });

    // Identify root nodes (nodes without parents)
    const rootNodes = [];
    for (const node of nodeMap.values()) {
      const hasParent = closureEntries.some(
        entry => entry.descendantId === node.item.id && entry.depth === 1
      );
      if (!hasParent) {
        rootNodes.push(node);
      }
    }

    return rootNodes;
  }

  /**
   * Recursively filters the tree based on search criteria.
   * @param nodes The array of TreeNodes to filter.
   * @returns The filtered array of TreeNodes.
   */
  private filterTree(nodes: TreeNode[]): TreeNode[] {
    const filteredNodes: TreeNode[] = [];

    for (const node of nodes) {
      const { item, children } = node;

      if (item.type === 'track') {
        if (this.filterItem(item as Track)) {
          filteredNodes.push(node);
        }
      } else if (item.type === 'playlist') {
        const filteredChildren = this.filterTree(children);

        if (this.isSearchActive()) {
          // Include playlist only if it has matching children
          if (filteredChildren.length > 0) {
            const newNode = new TreeNode(item);
            newNode.children = filteredChildren;
            filteredNodes.push(newNode);
          }
        } else {
          // Include all playlists
          const newNode = new TreeNode(item);
          newNode.children = filteredChildren;
          filteredNodes.push(newNode);
        }
      }
    }

    return filteredNodes;
  }

  /**
   * Determines if a search query is active.
   * @returns True if either searchName or searchTags is non-empty, false otherwise.
   */
  private isSearchActive(): boolean {
    return this.searchName.trim() !== '' || this.searchTags.trim() !== '';
  }

  /**
   * Exports all data from IndexedDB into a single JSON file.
   */
  async exportData(): Promise<void> {
    const allItems = await this.baseService.getAllItems();
    const closureEntries = await this.baseService.getAllClosureEntries();

    const exportData = {
      libraryItems: allItems.map((item) => {
        if (item.type === 'track') {
          const track = item as Track;
          return {
            ...track,
            data: arrayBufferToBase64(track.data),
          };
        }
        return item;
      }),
      closureTable: closureEntries,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    saveAs(blob, 'library_export.json');
  }

  /**
   * Imports data from a JSON file into IndexedDB.
   */
  async importData(file: File): Promise<void> {
    const text = await file.text();
    const importedData = JSON.parse(text) as { libraryItems: LibraryItem[], closureTable: ClosureEntry[] };

    // Clear existing data
    await this.baseService.deleteAllItems();
    await this.baseService.deleteAllClosureEntries();

    // Import library items
    for (const item of importedData.libraryItems) {
      if (item.type === 'track') {
        const track = item as Track;
        track.data = base64ToArrayBuffer(track.data as unknown as string);
      }
      await this.baseService.addItem(item);
    }

    console.log('closureTable', importedData.closureTable);

    // Import closure table entries
    for (const entry of importedData.closureTable) {
      try {
        await this.baseService.addClosureEntry(entry);
      } catch (error) {
        // If the entry already exists, just ignore the error and continue
        console.log(`Closure entry already exists, skipping: ${entry.ancestorId} -> ${entry.descendantId}`);
      }
    }

    // Trigger a data change event to update the UI
    EventDispatcher.getInstance().emit('dataChanged', { action: 'import' });
  }

  /**
   * Determines if a LibraryItem matches the search criteria.
   * @param item The LibraryItem to check.
   * @returns True if the item matches, false otherwise.
   */
  private filterItem(item: LibraryItem): boolean {
    let matches = true;

    if (this.searchName) {
      matches = item.name.toLowerCase().includes(this.searchName.toLowerCase());
    }

    if (matches && this.searchTags && item.type === 'track') {
      const track = item as Track;
      const searchTagsArray = this.searchTags.split(',').map((tag) => tag.trim().toLowerCase());
      matches = searchTagsArray.every((searchTag) =>
        track.tags.some((tag) => tag.toLowerCase().includes(searchTag))
      );
    }

    return matches;
  }

  /**
   * Creates a new playlist with the given name.
   * @param playlistName The name of the new playlist.
   */
  async createPlaylist(playlistName: string): Promise<void> {
    try {
      const playlist: Playlist = {
        id: crypto.randomUUID(),
        name: playlistName,
        type: 'playlist',
      };
      await this.baseService.addItem(playlist);
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }

  /**
   * Adds a new track from the given file.
   * @param file The audio file to add.
   */
  async addTrack(file: File): Promise<void> {
    try {
      const track: Track = {
        id: crypto.randomUUID(),
        name: file.name,
        type: 'track',
        data: await file.arrayBuffer(),
        tags: [],
        description: '',
      };
      await this.baseService.addItem(track);
    } catch (error) {
      console.error('Error adding track:', error);
      throw error;
    }
  }

  /**
   * Deletes all items from the library.
   */
  async deleteAllItems(): Promise<void> {
    await this.baseService.deleteAllItems();
  }

  /**
   * Handles data change events emitted by the BaseService.
   * @param event The event object containing action and payload.
   */
  private async handleDataChanged(event: { action: string; item?: LibraryItem; id?: string }) {
    if (event.action === 'update') {
      // Reload the tree or update the specific item if necessary
      await this.getFilteredTree(this.searchName, this.searchTags);
    }
    // Handle other actions ('add', 'delete', 'move', etc.)
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  let binaryString = '';
  const chunkSize = 0x8000;

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, chunk as any);
  }

  return btoa(binaryString);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}