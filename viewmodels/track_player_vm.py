import logging
import numpy as np
import pyaudio
import threading
import soundfile as sf
import time

class TrackPlayerViewModel:
    def __init__(self, track_name: str, track_path: str):
        self.track_name = track_name
        self.track_path = track_path
        self.is_playing = False
        self.is_paused = False
        self.is_looping = False
        self.volume = 1.0
        self.fade_duration = 1.0  # fade duration in seconds
        self.fading_in = False
        self.fading_out = False
        self.fade_start_time = 0
        self.fade_start_volume = 0

        self.audio_data, self.sample_rate = self._load_audio_file(self.track_path)
        self.play_thread = None
        self.stop_event = threading.Event()
        self.pause_event = threading.Event()
        self._seek_position = 0
        self.seek_event = threading.Event()
        self.seek_lock = threading.Lock()
        self.position_updated = threading.Event()
        self.stream = None
        self.p = None

    def _load_audio_file(self, file_path: str):
        data, sample_rate = sf.read(file_path, dtype='float32')
        if len(data.shape) == 1:
            data = np.column_stack((data, data))
        return data, sample_rate

    def play(self):
        if not self.is_playing:
            self.stop_event.clear()
            self.pause_event.clear()
            self.is_playing = True
            self.is_paused = False
            if self.play_thread is None or not self.play_thread.is_alive():
                self.play_thread = threading.Thread(target=self._play_audio, daemon=True)
                self.play_thread.start()
            else:
                self.pause_event.clear()

    def _play_audio(self):
        self.p = pyaudio.PyAudio()
        self.stream = self.p.open(format=pyaudio.paFloat32,
                                  channels=self.audio_data.shape[1],
                                  rate=self.sample_rate,
                                  output=True)

        chunk_size = 1024
        with self.seek_lock:
            current_frame = int(self._seek_position * len(self.audio_data))

        while not self.stop_event.is_set():
            if self.pause_event.is_set():
                self.pause_event.wait()
                continue

            if self.seek_event.is_set():
                with self.seek_lock:
                    current_frame = int(self._seek_position * len(self.audio_data))
                self.seek_event.clear()
                self.position_updated.set()

            end_frame = current_frame + chunk_size
            chunk = self.audio_data[current_frame:end_frame]

            if len(chunk) == 0:
                if self.is_looping:
                    current_frame = 0
                    continue
                else:
                    break

            if self.fading_in or self.fading_out:
                current_time = time.time()
                progress = (current_time - self.fade_start_time) / self.fade_duration
                if progress >= 1:
                    if self.fading_out:
                        self.stop()
                        break
                    self.fading_in = False
                    self.fading_out = False
                else:
                    if self.fading_in:
                        current_volume = self.fade_start_volume + (self.volume - self.fade_start_volume) * progress
                    else:  # fading out
                        current_volume = self.fade_start_volume * (1 - progress)
                    chunk = chunk * current_volume

            self.stream.write((chunk * self.volume).astype(np.float32).tobytes())
            current_frame = end_frame
            with self.seek_lock:
                if not self.seek_event.is_set():  # Only update if no seek is pending
                    self._seek_position = current_frame / len(self.audio_data)

        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
        if self.p:
            self.p.terminate()
        self.is_playing = False
        self.is_paused = False

    def pause(self):
        if self.is_playing and not self.is_paused:
            self.is_paused = True
            self.pause_event.set()

    def resume(self):
        if self.is_playing and self.is_paused:
            self.is_paused = False
            self.pause_event.clear()

    def stop(self):
        self.is_playing = False
        self.is_paused = False
        self.stop_event.set()
        self.pause_event.clear()
        if self.play_thread:
            self.play_thread.join()
        self.play_thread = None
        with self.seek_lock:
            self._seek_position = 0

    def set_volume(self, volume: float):
        self.volume = max(0.0, min(1.0, volume))
        if self.fading_in or self.fading_out:
            self.fading_in = False
            self.fading_out = False

    def set_position(self, position: float):
        if 0 <= position <= 1:
            with self.seek_lock:
                self._seek_position = position
            self.seek_event.set()
            self.position_updated.clear()
            if not self.is_playing:
                self.play()
            else:
                # Wait for the position to be updated in the play loop
                self.position_updated.wait(timeout=1.0)

    def get_position(self) -> float:
        with self.seek_lock:
            return self._seek_position

    def get_duration(self) -> float:
        return len(self.audio_data) / self.sample_rate

    def toggle_loop(self):
        self.is_looping = not self.is_looping

    def cleanup(self):
        self.stop()
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
        if self.p:
            self.p.terminate()

    def fade_in(self):
        if not self.is_playing:
            self.fade_start_volume = 0
            self.fading_in = True
            self.fading_out = False
            self.fade_start_time = time.time()
            self.play()
        elif self.is_paused:
            self.fade_start_volume = 0
            self.fading_in = True
            self.fading_out = False
            self.fade_start_time = time.time()
            self.resume()

    def fade_out(self):
        if self.is_playing and not self.is_paused:
            self.fade_start_volume = self.volume
            self.fading_in = False
            self.fading_out = True
            self.fade_start_time = time.time()