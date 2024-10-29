import Track from 'data/models/Track';

export type DataChangeEvent = {
  action: 'add' | 'update' | 'delete';
  track?: Track;
  id?: string;
}; 