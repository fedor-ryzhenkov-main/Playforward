export default interface LibraryItem {
  id: string;
  name: string;
  type: 'track' | 'playlist';
  parentId?: string; 
}