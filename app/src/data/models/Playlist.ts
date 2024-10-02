import LibraryItem from './LibraryItem';

/**
 * Represents a playlist containing tracks or other playlists.
 */
export default interface Playlist extends LibraryItem {
  type: 'playlist';
  items: string[]; // IDs of child items
}