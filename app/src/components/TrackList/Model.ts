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
   * Builds a hierarchical tree structure from the given items, applying search filters.
   * @param searchName The name to filter by.
   * @param searchTags The tags to filter by.
   * @returns The hierarchical tree of LibraryItems.
   */
  async getFilteredTree(searchName: string, searchTags: string): Promise<LibraryItem[]> {
    this.searchName = searchName;
    this.searchTags = searchTags;
    const allItems = await this.baseService.getAllItems();
    const filteredItems = this.filterItems(allItems);
    return this.baseService.buildTree(filteredItems);
  }

  /**
   * Filters the items based on search criteria.
   * @param items The array of LibraryItems to filter.
   * @returns The filtered array of LibraryItems.
   */
  private filterItems(items: LibraryItem[]): LibraryItem[] {
    return items.filter(item => this.filterItem(item));
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

    if (matches && this.searchTags) {
      if (item.type === 'track') {
        const track = item as Track;
        matches = track.tags.some(tag => tag.toLowerCase().includes(this.searchTags.toLowerCase()));
      }
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