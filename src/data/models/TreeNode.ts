import LibraryItem from './LibraryItem';
import Playlist from './Playlist';
import Track from './Track';

export default class TreeNode {
  item: LibraryItem;
  children: TreeNode[];

  constructor(item: LibraryItem) {
    this.item = item;
    this.children = [];
  }
}