import { saveAs } from 'file-saver';
import Track from '../../data/models/Track';
import Playlist from '../../data/models/Playlist';
import LibraryItem from '../../data/models/LibraryItem';
import BaseService, { ResolvedPlaylist } from '../../data/services/BaseService';
import { BaseRepository } from '../../data/repositories/BaseRepository';
import EventDispatcher from '../../data/events/EventDispatcher';
/**
 * Manages the track and playlist tree structure.
 */
export default class TrackListModel {
  private baseService: BaseService;
  private searchName: string = '';
  private searchTags: string = '';

  constructor() {
    this.baseService = new BaseService(new BaseRepository<LibraryItem>('libraryObjectStore'));
  }

  /**
   * Determines if a search query is active.
   * @returns True if either searchName or searchTags is non-empty, false otherwise.
   */
  private isSearchActive(): boolean {
    return this.searchName.trim() !== '' || this.searchTags.trim() !== '';
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
   * @returns The filtered hierarchical tree of LibraryItems.
   */
  async getFilteredTree(searchName: string, searchTags: string): Promise<LibraryItem[]> {
    this.searchName = searchName;
    this.searchTags = searchTags;

    const allItems = await this.baseService.getAllItems();

    // Build the full tree without filtering
    const fullTree = await this.baseService.buildTree(allItems);

    // Recursively filter the tree
    const filteredTree = this.filterTree(fullTree);

    return filteredTree;
  }

  /**
   * Recursively filters the tree based on search criteria.
   * @param items The array of LibraryItems to filter.
   * @returns The filtered array of LibraryItems.
   */
  private filterTree(items: LibraryItem[]): LibraryItem[] {
    const filteredItems: LibraryItem[] = [];

    for (const item of items) {
      if (item.type === 'track') {
        if (this.filterItem(item as Track)) {
          filteredItems.push(item);
        }
      } else if (item.type === 'playlist') {
        const playlist = item as ResolvedPlaylist;
        const filteredChildren = this.filterTree(playlist.items);

        if (this.isSearchActive()) {
          // **Search is Active**
          // Include playlist only if it has matching children
          if (filteredChildren.length > 0) {
            filteredItems.push({
              ...playlist,
              items: filteredChildren,
            } as ResolvedPlaylist);
          }
          // Else, do not include the playlist
        } else {
          // **No Search Active**
          // Include all playlists
          filteredItems.push({
            ...playlist,
            items: filteredChildren,
          } as ResolvedPlaylist);
        }
      }
    }

    return filteredItems;
  }

  /**
   * Exports all data from IndexedDB into a single JSON file.
   */
  async exportData(): Promise<void> {
    const allItems = await this.baseService.getAllItems();

    // Convert ArrayBuffer data to base64 strings for serialization
    const serializedItems = allItems.map(item => {
      if (item.type === 'track') {
        const track = item as Track;
        return {
          ...track,
          data: arrayBufferToBase64(track.data),
        };
      }
      return item;
    });

    const blob = new Blob([JSON.stringify(serializedItems)], { type: 'application/json' });
    saveAs(blob, 'library_export.json');
  }

    /**
   * Imports data from a JSON file into IndexedDB.
   */
    async importData(file: File): Promise<void> {
      const text = await file.text();
      const importedItems = JSON.parse(text) as LibraryItem[];
  
      // Clear existing data
      await this.baseService.deleteAllItems();
  
      // Reconstruct items and convert base64 strings back to ArrayBuffers
      for (const item of importedItems) {
        if (item.type === 'track') {
          const track = item as Track;
          track.data = base64ToArrayBuffer(track.data as unknown as string);
        }
        await this.baseService.addItem(item);
      }
      EventDispatcher.getInstance().emit('dataChanged');
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
      const searchTagsArray = this.searchTags.split(',').map(tag => tag.trim().toLowerCase());
      matches = searchTagsArray.every(searchTag =>
        track.tags.some(tag => tag.toLowerCase().includes(searchTag))
      );
    }

    return matches;
  }

  /**
   * Creates a new playlist with the given name.
   * @param playlistName The name of the new playlist.
   */
  async createPlaylist(playlistName: string): Promise<void> {
    const newPlaylist: Playlist = {
      id: this.generateId(),
      name: playlistName,
      type: 'playlist',
      items: [],
    };
    await this.baseService.addItem(newPlaylist);
  }

  /**
   * Adds a new track from the given file.
   * @param file The audio file to add.
   */
  async addTrack(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const newTrack: Track = {
      id: this.generateId(),
      name: file.name,
      type: 'track',
      data: arrayBuffer,
      tags: [],
      description: '',
      parentId: undefined,
    };
    await this.baseService.addItem(newTrack);
  }

  /**
   * Generates a unique ID for new items.
   * @returns A unique string ID.
   */
  private generateId(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
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