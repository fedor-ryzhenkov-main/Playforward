import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a music track.
 */
export default interface Track {
  id: string;
  name: string;
  data: ArrayBuffer;
  tags: string[];
  description?: string;
}

export const createTrack = (
  name: string, 
  data: ArrayBuffer, 
  tags: string[] = [], 
  description: string = ''
): Track => ({
  id: uuidv4(),
  name,
  data,
  tags,
  description
});