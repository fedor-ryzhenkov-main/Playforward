import debug from 'debug';

export const createDebugger = (namespace: string) => {
  const dbg = debug(`musicplayer:${namespace}`);
  dbg.enabled = true;
  return dbg;
};

export const dbg = {
  db: createDebugger('db'),
  store: createDebugger('store'),
  track: createDebugger('track'),
  audio: createDebugger('audio')
};