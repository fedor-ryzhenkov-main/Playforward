// app/src/data/repositories/TrackRepository.ts
import { BaseRepository } from './BaseRepository';
import Track from '../models/Track';

/**
 * Repository for managing Track entities.
 */
export class TrackRepository extends BaseRepository<Track> {
  constructor() {
    super('tracks'); // The name of the object store for tracks
  }

  // Additional methods specific to tracks can be added here
}