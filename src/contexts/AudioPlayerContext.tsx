import React, { createContext, useContext, useState, useCallback } from 'react';
import AudioPlayerController from 'components/audio/audio-player/Controller';

interface AudioPlayerContextType {
  playTrack: (trackId: string) => void;
  stopTrack: (trackId: string) => void;
  isPlaying: (trackId: string) => boolean;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playingTracks, setPlayingTracks] = useState<Set<string>>(new Set());

  const playTrack = useCallback((trackId: string) => {
    setPlayingTracks(prev => new Set(prev).add(trackId));
  }, []);

  const stopTrack = useCallback((trackId: string) => {
    setPlayingTracks(prev => {
      const newSet = new Set(prev);
      newSet.delete(trackId);
      return newSet;
    });
  }, []);

  const isPlaying = useCallback((trackId: string) => playingTracks.has(trackId), [playingTracks]);

  return (
    <AudioPlayerContext.Provider value={{ playTrack, stopTrack, isPlaying }}>
      {children}
      {Array.from(playingTracks).map(trackId => (
        <AudioPlayerController
          key={trackId}
          trackId={trackId}
          onClose={() => stopTrack(trackId)}
        />
      ))}
    </AudioPlayerContext.Provider>
  );
};