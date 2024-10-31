import { Theme } from './types';

export type SxProps = 
  | { [key: string]: any }
  | ((props: { theme: Theme }) => { [key: string]: any })
  | undefined; 