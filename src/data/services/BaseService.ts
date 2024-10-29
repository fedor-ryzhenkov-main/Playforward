import { ItemRepository } from 'data/repositories/ItemRepository';
import Track from 'data/models/Track';
import EventDispatcher from 'data/events/EventDispatcher';
import { DataChangeEvent } from 'data/events/Types';

/**
 * Service for managing tracks.
 */
export default class BaseService {
  private itemRepository: ItemRepository;

  constructor() {
    this.itemRepository = new ItemRepository();
  }

  /**
   * Retrieves a track by its ID.
   */
  async getTrack(id: string): Promise<Track | null> {
    try {
      return await this.itemRepository.getById(id);
    } catch (error) {
      console.error(`Error retrieving track with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Adds a new track.
   */
  async addTrack(track: Track): Promise<void> {
    await this.itemRepository.add(track);
    EventDispatcher.getInstance().emit<DataChangeEvent>('dataChanged', { 
      action: 'add', 
      track 
    });
  }

  /**
   * Updates an existing track.
   */
  async updateTrack(track: Track): Promise<void> {
    await this.itemRepository.update(track);
    EventDispatcher.getInstance().emit<DataChangeEvent>('dataChanged', { 
      action: 'update', 
      track 
    });
  }

  /**
   * Deletes a track.
   */
  async deleteTrack(id: string): Promise<void> {
    await this.itemRepository.delete(id);
    EventDispatcher.getInstance().emit<DataChangeEvent>('dataChanged', { 
      action: 'delete', 
      id 
    });
  }

  /**
   * Retrieves all tracks.
   */
  async getAllTracks(): Promise<Track[]> {
    return await this.itemRepository.getAll();
  }
}