import { Howl } from 'howler';
import { debugLog } from 'utils/debug';

interface AudioState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
}

export class AudioManager {
  private static instance: AudioManager;
  private audioInstances: Map<string, Howl>;
  private progressCallbacks: Map<string, (state: AudioState) => void>;

  private constructor() {
    this.audioInstances = new Map();
    this.progressCallbacks = new Map();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public getAudio(trackId: string): Howl | undefined {
    return this.audioInstances.get(trackId);
  }

  public async createAudio(
    trackId: string, 
    audioData: ArrayBuffer,
    onStateUpdate: (state: AudioState) => void
  ): Promise<Howl> {
    const existingAudio = this.getAudio(trackId);
    if (existingAudio) {
      debugLog('AudioManager', 'Returning existing audio', { trackId });
      return existingAudio;
    }

    debugLog('AudioManager', 'Creating new audio', { trackId });
    this.progressCallbacks.set(trackId, onStateUpdate);

    return new Promise((resolve, reject) => {
      const audio = new Howl({
        src: [URL.createObjectURL(new Blob([audioData]))],
        format: ['mp3'],
        html5: true,
        preload: true,
        onload: () => {
          this.audioInstances.set(trackId, audio);
          this.notifyState(trackId);
          resolve(audio);
        },
        onplay: () => {
          debugLog('AudioManager', 'Audio playing', { trackId });
          this.startProgressTracking(trackId);
          this.notifyState(trackId);
        },
        onpause: () => {
          debugLog('AudioManager', 'Audio paused', { trackId });
          this.notifyState(trackId);
        },
        onend: () => {
          debugLog('AudioManager', 'Audio ended', { trackId });
          this.notifyState(trackId);
        },
        onseek: () => {
          debugLog('AudioManager', 'Audio seeked', { trackId });
          this.notifyState(trackId);
        },
        onloaderror: (_, error) => {
          debugLog('AudioManager', 'Load error', { trackId, error });
          reject(error);
        }
      });
    });
  }

  private notifyState(trackId: string) {
    const audio = this.getAudio(trackId);
    const callback = this.progressCallbacks.get(trackId);
    
    if (audio && callback) {
      callback({
        currentTime: audio.seek() as number,
        duration: audio.duration(),
        isPlaying: audio.playing(),
        volume: audio.volume()
      });
    }
  }

  public startProgressTracking(trackId: string) {
    const audio = this.getAudio(trackId);
    if (audio && audio.playing()) {
      requestAnimationFrame(() => this.updateProgress(trackId));
    }
  }

  private updateProgress(trackId: string) {
    const audio = this.getAudio(trackId);
    if (audio && audio.playing()) {
      this.notifyState(trackId);
      requestAnimationFrame(() => this.updateProgress(trackId));
    }
  }

  public removeAudio(trackId: string) {
    debugLog('AudioManager', 'Removing audio', { trackId });
    const audio = this.getAudio(trackId);
    if (audio) {
      audio.unload();
      this.audioInstances.delete(trackId);
      this.progressCallbacks.delete(trackId);
    }
  }

  public play(trackId: string) {
    const audio = this.getAudio(trackId);
    if (audio) {
      audio.play();
    }
  }

  public pause(trackId: string) {
    const audio = this.getAudio(trackId);
    if (audio) {
      audio.pause();
    }
  }

  public seek(trackId: string, position: number) {
    const audio = this.getAudio(trackId);
    if (audio) {
      audio.seek(position);
    }
  }

  public setVolume(trackId: string, volume: number) {
    const audio = this.getAudio(trackId);
    if (audio) {
      audio.volume(volume);
    }
  }
}

export const audioManager = AudioManager.getInstance();