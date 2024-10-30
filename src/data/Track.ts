import { TrackRepository } from 'data/TrackRepository';

/**
 * Represents a music track with lazy-loaded audio data.
 */
export class Track {
  private _audio?: ArrayBuffer;
  private static repository = new TrackRepository();

  constructor(
    public readonly id: string,
    public name: string,
    public tags: string[] = [],
    public description?: string,
  ) {}

  /**
   * Creates a new track instance.
   */
  static create(name: string): Track {
    return new Track(crypto.randomUUID(), name);
  }

  /**
   * Creates a track instance from JSON data.
   */
  static fromJSON(data: any): Track {
    return new Track(
      data.id,
      data.name,
      data.tags,
      data.description
    );
  }

  /**
   * Returns a JSON representation of the track.
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      tags: this.tags,
      description: this.description
    };
  }

  /**
   * Loads the audio data from repository if not already loaded.
   */
  async getAudio(): Promise<ArrayBuffer> {
    if (!this._audio) {
      const track = await Track.repository.getTrack(this.id);
      if (!track?._audio) {
        throw new Error(`Audio data not found for track ${this.id}`);
      }
      if (track._audio) {
        this._audio = track._audio;
      } else {
        throw new Error(`Audio data not found for track ${this.id}`);
      }
    }
    return this._audio as ArrayBuffer;
  }

  /**
   * Sets the audio data for the track.
   */
  setAudio(audio: ArrayBuffer) {
    this._audio = audio;
  }

  /**
   * Checks if the track has audio data loaded.
   */
  hasAudio(): boolean {
    return !!this._audio;
  }
}