import { Repository } from 'data/Repository';

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
  private static repository = Repository.getInstance();
  private metadata: TrackMetadata;

  private constructor(metadata: TrackMetadata) {
    this.metadata = { ...metadata };  // Create a mutable copy
  }

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
    if (!Track.isSerializedTrack(data)) {
      throw new Error('Invalid track data format');
    }

    const { id, name, tags, description } = data;
    return new Track({ id, name, tags, description });
  }

  /**
   * Type guard for serialized track data
   */
  private static isSerializedTrack(data: any): data is SerializedTrack {
    return (
      data &&
      data.type === 'Track' &&
      data.version === 1 &&
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      Array.isArray(data.tags) &&
      data.tags.every((tag: unknown) => typeof tag === 'string') &&
      (typeof data.description === 'string' || data.description === undefined)
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

  /**
   * Updates the track's metadata in the database.
   * @throws {Error} If update fails
   */
  async update(): Promise<void> {
    const savedTrack = await Track.repository.update(this);
    this.metadata = { ...savedTrack.metadata };
  }

  /**
   * Updates the track's name and saves to database.
   * @throws {Error} If update fails
   */
  async updateName(name: string): Promise<void> {
    this.name = name;
    await this.update();
  }

  /**
   * Updates the track's tags and saves to database.
   * @throws {Error} If update fails
   */
  async updateTags(tags: string[]): Promise<void> {
    this.tags = tags;
    await this.update();
  }

  /**
   * Updates the track's description and saves to database.
   * @throws {Error} If update fails
   */
  async updateDescription(description?: string): Promise<void> {
    this.description = description;
    await this.update();
  }

  /**
   * Deletes the track and its audio data from the database.
   * @throws {Error} If deletion fails
   */
  async delete(): Promise<void> {
    await Track.repository.delete(this.id);
  }
}
