import Track, { createTrack } from 'data/models/Track';
import BaseService from 'data/services/BaseService';
import EventDispatcher from 'data/events/EventDispatcher';
import { DataChangeEvent } from 'data/events/Types';

interface ExportData {
  tracks: Track[];
  version: string;
}

/**
 * Manages the track collection with tag-based organization.
 */
export default class TrackListModel {
  private baseService: BaseService;
  private cachedTracks: Track[] | null = null;
  private cachedTags: Set<string> | null = null;
  private changeListeners: Set<() => void> = new Set();

  constructor() {
    this.baseService = new BaseService();
    EventDispatcher.getInstance().subscribe(
      'dataChanged',
      this.handleDataChanged
    );
  }

  private handleDataChanged = (event: DataChangeEvent) => {
    this.cachedTracks = null;
    this.cachedTags = null;
    // Notify all listeners
    this.changeListeners.forEach(listener => listener());
  };

  public subscribe(listener: () => void): () => void {
    this.changeListeners.add(listener);
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  async getTracks(searchName: string = '', searchTags: string = ''): Promise<Track[]> {
    if (!this.cachedTracks) {
      this.cachedTracks = await this.baseService.getAllTracks();
    }
    
    if (!searchName && !searchTags) {
      return [...this.cachedTracks].sort((a, b) => a.name.localeCompare(b.name));
    }

    const searchTagsSet = searchTags ? 
      new Set(searchTags.split(',').map(tag => tag.trim()).filter(tag => tag)) : 
      new Set<string>();

    return this.cachedTracks.filter(track => {
      if (searchName && !track.name.toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }

      if (searchTagsSet.size > 0) {
        return Array.from(searchTagsSet).every(searchTag =>
          track.tags.includes(searchTag)
        );
      }

      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getAllTags(): Promise<string[]> {
    if (!this.cachedTags) {
      if (!this.cachedTracks) {
        this.cachedTracks = await this.baseService.getAllTracks();
      }

      this.cachedTags = new Set<string>();
      this.cachedTracks.forEach(track => {
        track.tags.forEach(tag => this.cachedTags!.add(tag));
      });
    }

    return Array.from(this.cachedTags).sort();
  }

  async addTrack(file: File): Promise<void> {
    try {
      const track = createTrack(
        file.name.replace(/\.[^/.]+$/, ''),
        await file.arrayBuffer()
      );
      await this.baseService.addTrack(track);
      this.handleDataChanged({ action: 'add', track });
    } catch (error) {
      console.error('Error adding track:', error);
      throw error;
    }
  }

  /**
   * Imports tracks from a JSON file.
   * @param file JSON file containing track data
   * @throws Error if file format is invalid
   */
  async importTracks(file: File): Promise<void> {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      // Validate file format
      if (!data.version || !data.tracks || !Array.isArray(data.tracks)) {
        throw new Error('Invalid file format');
      }

      // Process each track
      for (const trackData of data.tracks) {
        // Validate track data
        if (!trackData.name || !trackData.data || !Array.isArray(trackData.tags)) {
          console.warn('Skipping invalid track:', trackData.name || 'unnamed');
          continue;
        }

        // Convert base64 data back to ArrayBuffer
        const binaryString = atob(trackData.data as unknown as string);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const track: Track = {
          id: crypto.randomUUID(), // Generate new ID for imported track
          name: trackData.name,
          data: bytes.buffer,
          tags: trackData.tags,
        };

        await this.baseService.addTrack(track);
        this.handleDataChanged({ action: 'add', track });
      }
    } catch (error) {
      console.error('Error importing tracks:', error);
      throw error;
    }
  }
}