// app/src/models/TrackListManager.ts
import Track from '../../models/track';
import Playlist from '../../models/playlist';
import { removeFileExtension } from '../../utils/files/removeFileExtension';
import { getAllTrackKeys } from '../../data/storageAudio';
import { getAllPlaylists } from '../../data/playlistStorage';

export interface ListItem {
  id: string;
  type: 'track' | 'playlist';
  data: Track | Playlist;
}

class TrackListManager {
  private tracks: Track[] = [];
  private playlists: Playlist[] = [];
  private expandedPlaylists: Set<string> = new Set();
  private searchName: string = '';
  private searchTags: string = '';

  async loadTracks() {
    const keys = await getAllTrackKeys();
    this.setTracks(keys);
  }

  async loadPlaylists() {
    const playlistData = await getAllPlaylists();
    this.setPlaylists(playlistData);
  }

  setTracks(tracks: Track[]) {
    this.tracks = tracks;
  }

  setPlaylists(playlists: Playlist[]) {
    this.playlists = playlists;
  }

  setExpandedPlaylists(expandedPlaylists: Set<string>) {
    this.expandedPlaylists = expandedPlaylists;
  }

  getExpandedPlaylists(): Set<string> {
    return this.expandedPlaylists;
  }

  setSearchName(searchName: string) {
    this.searchName = searchName;
  }

  getSearchName(): string {
    return this.searchName;
  }

  setSearchTags(searchTags: string) {
    this.searchTags = searchTags;
  }

  getSearchTags(): string {
    return this.searchTags;
  }

  togglePlaylist(playlistId: string) {
    if (this.expandedPlaylists.has(playlistId)) {
      this.expandedPlaylists.delete(playlistId);
    } else {
      this.expandedPlaylists.add(playlistId);
    }
  }

  getFilteredTracks(): Track[] {
    return this.tracks.filter((track) => {
      const nameMatch = removeFileExtension(track.name)
        .toLowerCase()
        .includes(this.searchName.toLowerCase());
      const tagsMatch =
        this.searchTags === '' ||
        track.tags.some((tag) => tag.toLowerCase().includes(this.searchTags.toLowerCase()));
      return nameMatch && tagsMatch;
    });
  }

  getFlatTrackList(): ListItem[] {
    const list: ListItem[] = [];
    const filteredTracks = this.getFilteredTracks();

    // Tracks without playlist
    const tracksWithoutPlaylist = filteredTracks.filter(
      (track) => !track.playlistId
    );
    tracksWithoutPlaylist.forEach((track) => {
      list.push({ id: track.id, type: 'track', data: track });
    });

    // Playlists
    this.playlists.forEach((playlist) => {
      const playlistTracks = filteredTracks.filter(
        (track) => track.playlistId === playlist.id
      );
      if (playlistTracks.length > 0) {
        list.push({ id: playlist.id, type: 'playlist', data: playlist });
        if (this.expandedPlaylists.has(playlist.id)) {
          playlistTracks.forEach((track) => {
            list.push({ id: track.id, type: 'track', data: track });
          });
        }
      }
    });

    return list;
  }
}

export default TrackListManager;