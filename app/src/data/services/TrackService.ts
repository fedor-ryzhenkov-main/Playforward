// app/src/services/TrackService.ts
import { TrackRepository } from '../repositories/TrackRepository';
import Track from '../models/Track';
import { v4 as uuidv4 } from 'uuid';
import EventDispatcher from '../events/EventDispatcher';

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
  async addTrack(file: File): Promise<Track> {
    const arrayBuffer = await file.arrayBuffer();
    const track: Track = {
      id: uuidv4(),
      name: file.name,
      type: file.type,
      data: arrayBuffer,
      tags: [],
      description: '',
      parentId: undefined,
    };
    await this.repository.add(track);
    return track;
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

  async renameTrack(trackId: string, newName: string): Promise<void> {
    const track = await this.getTrack(trackId);
    if (!track) {
      throw new Error('Track not found');
    }
    track.name = newName;
    await this.updateTrack(track);
  }

  async updateTrackTags(trackId: string, tags: string[]): Promise<void> {
    const track = await this.getTrack(trackId);
    if (!track) {
      throw new Error('Track not found');
    }
    track.tags = tags;
    await this.updateTrack(track);
  }

  async updateTrackDescription(trackId: string, description: string): Promise<void> {
    const track = await this.getTrack(trackId);
    if (!track) {
      throw new Error('Track not found');
    }
    track.description = description;
    await this.updateTrack(track);
  }
}