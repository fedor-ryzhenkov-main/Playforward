import { Track, SerializedTrack } from 'data/models/Track';
import { api } from 'services/api';
import { ApiResponse, ApiError } from 'types/api';

/**
 * Repository for managing tracks in PostgreSQL.
 * Handles the persistence and retrieval of Track entities and their audio data.
 */
/**
 * Repository for managing tracks in PostgreSQL.
 * Handles the persistence and retrieval of Track entities and their audio data.
 * Implements the singleton pattern to ensure only one instance exists.
 */
export class Repository {
  private static instance: Repository | null = null;

  private constructor() {}

  /**
   * Gets the singleton instance of TrackRepository.
   * Creates a new instance if one doesn't exist.
   */
  public static getInstance(): Repository {
    if (!Repository.instance) {
      Repository.instance = new Repository();
    }
    return Repository.instance;
  }

  /**
   * Adds or updates a track in the database.
   * @throws {Error} If database operation fails
   */
  async save(track: Track, audio?: ArrayBuffer): Promise<Track> {
    const response = await api.post<ApiResponse<SerializedTrack>>('/tracks', track.serialize());
    const savedTrack = Track.fromSerialized(response.data);

    if (audio) {
      const formData = new FormData();
      const blob = new Blob([audio], { type: 'application/octet-stream' });
      formData.append('audio', blob);

      await api.post<ApiResponse<void>>(`/tracks/${track.id}/audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      savedTrack.setAudio(audio);
    }

    return savedTrack;
  }

  /**
   * Retrieves a track's audio data by its ID.
   * @throws {Error} If track not found
   */
  async getAudio(id: string): Promise<ArrayBuffer> {
    const response = await api.get<ArrayBuffer>(`/tracks/${id}/audio`, {
      responseType: 'arraybuffer'
    });
    return response;
  }

  /**
   * Retrieves a track by its ID.
   */
  async getTrack(id: string): Promise<Track | null> {
    try {
      const response = await api.get<ApiResponse<SerializedTrack>>(`/tracks/${id}`);
      return Track.fromSerialized(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Retrieves all tracks (without audio data).
   */
  async getAll(): Promise<Track[]> {
    const response = await api.get<ApiResponse<SerializedTrack[]>>('/tracks');
    return response.data.map(track => Track.fromSerialized(track));
  }

  /**
   * Deletes a track and its audio data from the database.
   */
  async delete(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/tracks/${id}`);
  }

  /**
   * Search tracks by tag.
   */
  async searchByTag(tag: string): Promise<Track[]> {
    const response = await api.get<ApiResponse<SerializedTrack[]>>('/tracks', { params: { tag } });
    return response.data.map(track => Track.fromSerialized(track));
  }
}