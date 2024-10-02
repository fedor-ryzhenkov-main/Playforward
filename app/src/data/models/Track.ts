import LibraryItem from './LibraryItem';

/**
 * Represents a music track.
 */
export default interface Track extends LibraryItem {
  type: 'track';
  data: ArrayBuffer;
  tags: string[];
  description?: string;
}