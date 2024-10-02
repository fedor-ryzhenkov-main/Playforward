// app/src/services/TrackService.ts
import { TrackRepository } from '../repositories/TrackRepository';
import Track from '../models/Track';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing tracks.
 */
export default class TrackService {
  private repository: TrackRepository;

  constructor() {
    this.repository = new TrackRepository();
  }

  /**
   * Saves a new track to the database.
   * @param file The audio file to save.
   */
  async saveTrack(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const track: Track = {
      id: uuidv4(),
      name: file.name,
      type: file.type,
      data: arrayBuffer,
      tags: [],
      description: '',
      playlistId: undefined,
    };
    await this.repository.add(track);
    // Emit event or perform any additional actions
  }

  async getTrack(id: string): Promise<Track | null> {
    return this.repository.getById(id);
  }

  async getAllTracks(): Promise<Track[]> {
    return this.repository.getAll();
  }

  async updateTrack(track: Track): Promise<void> {
    await this.repository.update(track);
  }

  async deleteTrack(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
