import Playlist from "./Playlist";
import Track from "./Track";

interface TreeNode {
    id: string;
    type: 'track' | 'playlist';
    data: Track | Playlist;
    children: TreeNode[];
  }