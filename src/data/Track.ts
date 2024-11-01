import { TrackRepository } from 'data/TrackRepository';

/**
 * Represents the serializable properties of a Track
 */
export interface TrackMetadata {
  id: string;
  name: string;
  tags: string[];
  description?: string;
}

/**
 * Represents a serialized Track instance
 */
export interface SerializedTrack extends TrackMetadata {
  type: 'Track';  // Type discriminator for safe deserialization
  version: 1;     // Schema version for future compatibility
}

/**
 * Represents a music track with lazy-loaded audio data.
 * Implements a clean separation between metadata and audio content.
 */
export class Track {
  private _audio: Promise<ArrayBuffer> | null = null;
  private static repository = TrackRepository.getInstance();

  private constructor(
    private readonly metadata: TrackMetadata,
  ) {}

  // Getters for metadata properties
  get id(): string { return this.metadata.id; }
  get name(): string { return this.metadata.name; }
  get tags(): string[] { return [...this.metadata.tags]; }
  get description(): string | undefined { return this.metadata.description; }

  set name(name: string) { this.metadata.name = name; }
  set description(description: string | undefined) { this.metadata.description = description; }
  set tags(tags: string[]) { this.metadata.tags = [...tags]; }

  /**
   * Creates a new track instance with a generated ID.
   */
  static create(name: string, tags: string[] = [], description?: string): Track {
    return new Track({
      id: crypto.randomUUID(),
      name,
      tags,
      description
    });
  }

  /**
   * Creates a track instance from serialized data with version checking.
   * @throws {Error} If the serialized data is invalid or incompatible
   */
  static fromSerialized(data: unknown): Track {
    // Type guard and validation
    if (!Track.isSerializedTrack(data)) {
      throw new Error('Invalid track data format');
    }

    // Version handling
    switch (data.version) {
      case 1:
        return new Track({
          id: data.id,
          name: data.name,
          tags: data.tags,
          description: data.description,
        });
      default:
        throw new Error(`Unsupported track data version: ${data.version}`);
    }
  }

  /**
   * Type guard for serialized track data
   */
  private static isSerializedTrack(data: unknown): data is SerializedTrack {
    return (
      typeof data === 'object' &&
      data !== null &&
      'type' in data &&
      data.type === 'Track' &&
      'version' in data &&
      typeof data.version === 'number' &&
      'id' in data &&
      typeof data.id === 'string' &&
      'name' in data &&
      typeof data.name === 'string' &&
      'tags' in data &&
      Array.isArray((data as any).tags) &&
      (data as any).tags.every((tag: unknown) => typeof tag === 'string')
    );
  }

  /**
   * Returns a serialized representation of the track.
   */
  serialize(): SerializedTrack {
    return {
      type: 'Track',
      version: 1,
      ...this.metadata
    };
  }

  /**
   * Lazily loads and caches the audio data.
   * Subsequent calls return the cached promise.
   * @throws Error if audio data cannot be loaded
   */
  async getAudio(): Promise<ArrayBuffer> {
    if (!this._audio) {
      this._audio = Track.repository.getAudio(this.id)
        .then(audio => {
          if (!audio) {
            throw new Error(`Audio data not found for track ${this.id}`);
          }
          return audio;
        });
    }
    return this._audio;
  }

  /**
   * Sets the audio data for the track.
   */
  setAudio(audio: ArrayBuffer): void {
    this._audio = Promise.resolve(audio);
  }

  /**
   * Checks if the track has audio data cached.
   */
  hasAudio(): boolean {
    return this._audio !== null;
  }
}
