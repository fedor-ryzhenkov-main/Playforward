import Track from "./Track";

export default interface Playlist {
  id: string;
  name: string;
  parentId?: string;
  tracks: Track[];
}