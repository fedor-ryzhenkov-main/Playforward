export default interface Track {
  id: string;
  name: string;
  data: ArrayBuffer;
  type: string;
  tags: string[];
  description?: string;
  parentId?: string; 
}