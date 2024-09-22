import logging
import numpy as np
import pyaudio
import threading
import queue
import soundfile as sf
import time
from enum import Enum, auto

class CommandType(Enum):
    PLAY = auto()
    PAUSE = auto()
    STOP = auto()
    SEEK = auto()
    SET_VOLUME = auto()
    TOGGLE_LOOP = auto()
    SET_FADE_MODE = auto()
    CLEANUP = auto()

class Command:
    def execute(self, player):
        pass

class PlayCommand(Command):
    def execute(self, player):
        player.handle_play()

class PauseCommand(Command):
    def execute(self, player):
        player.handle_pause()

class StopCommand(Command):
    def execute(self, player):
        player.handle_stop()

class SeekCommand(Command):
    def __init__(self, position):
        self.position = position

    def execute(self, player):
        player.handle_seek(self.position)

class SetVolumeCommand(Command):
    def __init__(self, volume):
        self.volume = volume

    def execute(self, player):
        player.handle_set_volume(self.volume)

class ToggleLoopCommand(Command):
    def execute(self, player):
        player.handle_toggle_loop()

class SetFadeModeCommand(Command):
    def __init__(self, enabled):
        self.enabled = enabled

    def execute(self, player):
        player.handle_set_fade_mode(self.enabled)

class Track:
    def __init__(self, file_path: str):
        self.audio_data, self.sample_rate = self._load_audio_file(file_path)
        self.channels = self.audio_data.shape[1]
        self.duration = len(self.audio_data) / self.sample_rate

    def _load_audio_file(self, file_path: str):
        data, sample_rate = sf.read(file_path, dtype='float32')
        if len(data.shape) == 1:
            data = np.column_stack((data, data))
        return data, sample_rate

class AudioPlayer:
    def __init__(self, sample_rate: int, channels: int):
        self.p = pyaudio.PyAudio()
        self.stream = self.p.open(format=pyaudio.paFloat32,
                                  channels=channels,
                                  rate=sample_rate,
                                  output=True)

    def play_chunk(self, chunk: np.ndarray):
        self.stream.write(chunk.astype(np.float32).tobytes())

    def close(self):
        self.stream.stop_stream()
        self.stream.close()
        self.p.terminate()

class FadeController:
    def __init__(self, fade_duration: float):
        self.fade_duration = fade_duration
        self.fade_start_time = None
        self.fade_type = None  # 'in' or 'out'
        self.active = False
        self.start_volume = 1.0
        self.target_volume = 1.0

    def start_fade_in(self, target_volume: float):
        self.fade_start_time = time.time()
        self.fade_type = 'in'
        self.start_volume = 0.0
        self.target_volume = target_volume
        self.active = True

    def start_fade_out(self, current_volume: float):
        self.fade_start_time = time.time()
        self.fade_type = 'out'
        self.start_volume = current_volume
        self.target_volume = 0.0
        self.active = True

    def get_volume_multiplier(self):
        if not self.active:
            return self.target_volume
        elapsed = time.time() - self.fade_start_time
        progress = min(elapsed / self.fade_duration, 1.0)
        if self.fade_type == 'in':
            volume = self.start_volume + (self.target_volume - self.start_volume) * progress
        elif self.fade_type == 'out':
            volume = self.start_volume * (1.0 - progress)
        else:
            volume = self.target_volume
        if progress >= 1.0:
            self.active = False
            volume = self.target_volume
        return volume

class PlayerState(Enum):
    STOPPED = auto()
    PLAYING = auto()
    PAUSED = auto()
    FADING_IN = auto()
    FADING_OUT = auto()
    SEEKING = auto()
    FADING_IN_AFTER_SEEK = auto()  # New state for clarity

class TrackPlayerViewModel:
    def __init__(self, track_name: str, track_path: str):
        self.track_name = track_name
        self.volume = 0.5
        self.fade_duration = 1.5
        self.seek_fade_duration = 0.3  # Faster fade for seeking
        self.fade_enabled = False
        self.seek_fade_enabled = True
        self.is_looping = False

        # Initialize components
        self.track = Track(track_path)
        self.audio_player = AudioPlayer(self.track.sample_rate, self.track.channels)
        self.fade_controller = FadeController(self.fade_duration)
        self.seek_fade_controller = FadeController(self.seek_fade_duration)

        self.current_frame = 0
        self._state = PlayerState.PLAYING  # Start in STOPPED state
        self.position_lock = threading.Lock()
        self.block_ui_updates = False
        self.seek_position = None  # For handling seek operations
        self.previous_state = None  # To remember the state before seeking

        # Command queue and playback thread
        self.command_queue = queue.Queue()
        self.play_thread = threading.Thread(target=self._playback_loop, daemon=True)
        self.play_thread.start()

    def _playback_loop(self):
        logging.info("Playback loop started")
        chunk_size = 1024

        while True:
            try:
                command = self.command_queue.get_nowait()
                command.execute(self)
            except queue.Empty:
                pass  # No commands to process

            if self.state == PlayerState.STOPPED:
                break  # Exit the loop

            elif self.state == PlayerState.PAUSED:
                time.sleep(0.1)
                continue

            elif self.state == PlayerState.PLAYING:
                # Regular playback
                self._play_audio_chunk(chunk_size)

            elif self.state == PlayerState.FADING_IN:
                self._play_audio_chunk(chunk_size, fading_in=True)
                if not self.fade_controller.active:
                    self._set_state(PlayerState.PLAYING)

            elif self.state == PlayerState.FADING_OUT:
                self._play_audio_chunk(chunk_size, fading_out=True)
                if not self.fade_controller.active:
                    if self.state == PlayerState.FADING_OUT:
                        self._set_state(PlayerState.STOPPED)
                    elif self.state == PlayerState.PAUSED:
                        self._set_state(PlayerState.PAUSED)
                    continue

            elif self.state == PlayerState.SEEKING:
                self._handle_seeking(chunk_size)

            elif self.state == PlayerState.FADING_IN_AFTER_SEEK:
                self._play_audio_chunk(chunk_size, fading_in_after_seek=True)
                if not self.seek_fade_controller.active:
                    # Return to the state before seeking
                    self._set_state(self.previous_state)

            else:
                logging.warning(f"Unhandled state: {self.state}")
                time.sleep(0.1)

        logging.debug("Playback thread exiting")

    def _play_audio_chunk(self, chunk_size, fading_in=False, fading_out=False, fading_in_after_seek=False):
        end_frame = self.current_frame + chunk_size
        chunk = self.track.audio_data[self.current_frame:end_frame]

        if len(chunk) == 0:
            if self.is_looping:
                self.current_frame = 0
                return
            else:
                self._set_state(PlayerState.STOPPED)
                return
 
        volume_multiplier = self.volume

        if fading_in:
            volume_multiplier *= self.fade_controller.get_volume_multiplier()
        elif fading_out:
            volume_multiplier *= self.fade_controller.get_volume_multiplier()
        elif fading_in_after_seek:
            volume_multiplier *= self.seek_fade_controller.get_volume_multiplier()

        # Apply volume and play chunk
        chunk = chunk * volume_multiplier
        self.audio_player.play_chunk(chunk)
        with self.position_lock:
            self.current_frame = end_frame

    def _handle_seeking(self, chunk_size):
        self.block_ui_updates = True
        if self.seek_fade_enabled and self.previous_state == PlayerState.PLAYING:
            # Fade-out before seeking
            volume_multiplier = self.volume * self.seek_fade_controller.get_volume_multiplier()
            if not self.seek_fade_controller.active:
                # Fade-out complete, perform seek
                self._perform_seek()
                # Start fade-in
                self.seek_fade_controller.start_fade_in(target_volume=self.volume)
                self._set_state(PlayerState.FADING_IN_AFTER_SEEK)
            else:
                # Continue fade-out
                self._play_audio_chunk(chunk_size, fading_out=True)
        else:
            # Perform seek immediately
            self._perform_seek()
            # Return to previous state
            self._set_state(self.previous_state)
        self.block_ui_updates = False

    def _perform_seek(self):
        with self.position_lock:
            self.current_frame = int(self.seek_position * len(self.track.audio_data))
            self.seek_position = None

    # Command handlers
    def handle_play(self):
        if self.state in [PlayerState.STOPPED, PlayerState.PAUSED]:
            if self.fade_enabled:
                self.fade_controller.start_fade_in(target_volume=self.volume)
                self._set_state(PlayerState.FADING_IN)
            else:
                self._set_state(PlayerState.PLAYING)
        else:
            logging.debug("Already playing")

    def handle_pause(self):
        if self.state == PlayerState.PLAYING:
            if self.fade_enabled:
                self.fade_controller.start_fade_out(current_volume=self.volume)
                self._set_state(PlayerState.FADING_OUT)
            else:
                self._set_state(PlayerState.PAUSED)
        else:
            logging.debug("Cannot pause, not currently playing")

    def handle_stop(self):
        if self.state != PlayerState.STOPPED:
            if self.fade_enabled:
                self.fade_controller.start_fade_out(current_volume=self.volume)
                self._set_state(PlayerState.FADING_OUT)
            else:
                self._set_state(PlayerState.STOPPED)

    def handle_seek(self, position):
        self.seek_position = position  # Store the desired seek position
        self.previous_state = self.state  # Remember current state
        if self.seek_fade_enabled and self.state == PlayerState.PLAYING:
            # Start fade-out before seeking
            self.seek_fade_controller.start_fade_out(current_volume=self.volume)
            self._set_state(PlayerState.SEEKING)
        else:
            # Perform seek immediately
            self._perform_seek()
            # Return to previous state
            self._set_state(self.previous_state)

    def handle_set_volume(self, volume):
        self.volume = max(0.0, min(1.0, volume))
        if self.fade_controller.active:
            self.fade_controller.target_volume = self.volume

    def handle_toggle_loop(self):
        self.is_looping = not self.is_looping

    def handle_set_fade_mode(self, enabled):
        self.fade_enabled = enabled

    def toggle_seek_fade(self):
        self.seek_fade_enabled = not self.seek_fade_enabled
        logging.debug(f"Seek fade {'enabled' if self.seek_fade_enabled else 'disabled'}")

    def _set_state(self, new_state: PlayerState):
        logging.debug(f"State transition from {self.state} to {new_state}")
        self.state = new_state

    # Public methods to control playback
    def play(self):
        logging.debug("Enqueuing PlayCommand")
        self.command_queue.put(PlayCommand())

    def pause(self):
        logging.debug("Enqueuing PauseCommand")
        self.command_queue.put(PauseCommand())

    def stop(self):
        logging.debug("Enqueuing StopCommand")
        self.command_queue.put(StopCommand())

    def set_volume(self, volume: float):
        logging.debug(f"Enqueuing SetVolumeCommand with volume {volume}")
        self.command_queue.put(SetVolumeCommand(volume))

    def set_position(self, position: float):
        logging.debug(f"Enqueuing SeekCommand to position {position}")
        self.command_queue.put(SeekCommand(position))

    def toggle_loop(self):
        logging.debug("Enqueuing ToggleLoopCommand")
        self.command_queue.put(ToggleLoopCommand())

    def set_fade_mode(self, enabled: bool):
        logging.debug(f"Enqueuing SetFadeModeCommand to {'enabled' if enabled else 'disabled'}")
        self.command_queue.put(SetFadeModeCommand(enabled))

    # Additional utility methods
    def get_position(self) -> float:
        if self.block_ui_updates:
            return None  # Return None during seeking to indicate position is updating
        with self.position_lock:
            return self.current_frame / len(self.track.audio_data)

    def get_duration(self) -> float:
        return self.track.duration

    # State property with logging
    @property
    def state(self):
        return self._state

    @state.setter
    def state(self, value):
        logging.debug(f"State changed from {getattr(self, '_state', 'None')} to {value}")
        self._state = value