import customtkinter as ctk
import vlc
import time
import threading
import logging
from tkinter import messagebox

class TrackPlayer(ctk.CTkFrame):
    def __init__(self, master, track_name, track_path, app, *args, **kwargs):
        super().__init__(master, *args, **kwargs)
        self.track_name = track_name
        self.track_path = track_path
        self.app = app
        self.is_playing = False
        self.is_looping = False
        self.instance = None
        self.media_player = None
        self.media_list_player = None  # Add this line
        self.track_duration = 0
        self.user_is_adjusting_slider = False
        self.fadeout_enabled = False
        self.fade_thread = None
        self.fade_stop_event = threading.Event()
        self.fading = False
        self.volume_lock = threading.Lock()  # Lock for synchronizing volume adjustments
        self.destroyed = False  # New flag to check if the widget has been destroyed

        self.grid_columnconfigure(1, weight=1)
        self.grid_columnconfigure(2, weight=1)

        self.track_label = ctk.CTkLabel(self, text=self.track_name)
        self.track_label.grid(row=0, column=0, padx=5)

        self.play_toggle = ctk.CTkSwitch(self, text="Play", command=self.play_pause)
        self.play_toggle.grid(row=0, column=1, padx=5)

        self.loop_toggle = ctk.CTkSwitch(self, text="Loop", command=self.toggle_loop)
        self.loop_toggle.grid(row=0, column=2, padx=5)

        self.fadeout_toggle = ctk.CTkSwitch(self, text="Fade", command=self.toggle_fade)
        self.fadeout_toggle.grid(row=0, column=3, padx=5)

        self.close_button = ctk.CTkButton(self, text="Close", command=self.close_player)
        self.close_button.grid(row=0, column=4, padx=5)

        self.progress_slider = ctk.CTkSlider(
            self, from_=0, to=100, orientation="horizontal", command=self.on_progress_change
        )
        self.progress_slider.grid(row=1, column=0, columnspan=3, sticky="ew", padx=5, pady=5)

        self.time_label = ctk.CTkLabel(self, text="0:00 / 0:00")
        self.time_label.grid(row=1, column=3, padx=5)

        self.volume_slider = ctk.CTkSlider(
            self, from_=0, to=100, orientation="horizontal", command=self.on_volume_change
        )
        self.volume_slider.grid(row=2, column=0, columnspan=3, sticky="ew", padx=5, pady=5)
        self.volume_slider.set(50)

        self.volume_label = ctk.CTkLabel(self, text="50%")
        self.volume_label.grid(row=2, column=3, padx=5)

        self.after(100, self.start_playback)  # Delay start_playback slightly
        self.update_thread = threading.Thread(target=self.update_progress_bar, daemon=True)
        self.update_thread.start()

    def toggle_fade(self):
        self.fadeout_enabled = self.fadeout_toggle.get()

    def start_playback(self):
        if self.destroyed:
            return
        try:
            logging.debug(f"Loading audio file: {self.track_path}")
            self.instance = vlc.Instance()
            media = self.instance.media_new(self.track_path)
            self.media_player = self.instance.media_player_new()
            self.media_player.set_media(media)

            # Set volume to 0 before starting playback to prevent volume jump
            self.media_player.audio_set_volume(0)

            # Start playback
            self.media_player.play()
            time.sleep(0.5)  # Wait for media to load

            # Get the correct duration
            self.track_duration = self.media_player.get_length() / 1000  # Duration in seconds
            logging.debug(f"Track duration: {self.track_duration} seconds")

            self.progress_slider.configure(to=self.track_duration)
            self.is_playing = True
            self.play_toggle.select()
            self.update_time_label()

            # Set volume to the slider's value if fade is not enabled
            if not self.fadeout_enabled:
                self.media_player.audio_set_volume(int(self.volume_slider.get()))
                self.volume_label.configure(text=f"{int(self.volume_slider.get())}%")
        except Exception as e:
            logging.error(f"Error playing audio: {e}")
            if not self.destroyed:
                messagebox.showerror("Error", f"Error playing audio: {e}")

    def play_pause(self):
        if self.media_list_player:
            if self.is_playing:
                self.media_list_player.pause()
                self.play_toggle.deselect()
                self.is_playing = False
            else:
                self.media_list_player.play()
                self.play_toggle.select()
                self.is_playing = True
        elif self.media_player:
            if self.is_playing:
                if self.fadeout_enabled:
                    if self.fade_thread and self.fade_thread.is_alive():
                        self.fade_stop_event.set()
                        # Do not call join() to prevent blocking
                    self.fade_stop_event.clear()
                    self.fade_thread = threading.Thread(target=self.fadeout_and_pause, daemon=True)
                    self.fade_thread.start()
                else:
                    self.media_player.pause()
                    self.play_toggle.deselect()
                    self.is_playing = False
            else:
                if self.fadeout_enabled:
                    if self.fade_thread and self.fade_thread.is_alive():
                        self.fade_stop_event.set()
                        # Do not call join() to prevent blocking
                    self.fade_stop_event.clear()
                    # Set volume to 0 before starting playback
                    with self.volume_lock:
                        self.media_player.audio_set_volume(0)
                    time.sleep(0.1)
                    self.media_player.play()
                    self.play_toggle.select()
                    self.is_playing = True
                    self.fade_thread = threading.Thread(target=self.fadein, daemon=True)
                    self.fade_thread.start()
                else:
                    self.media_player.audio_set_volume(int(self.volume_slider.get()))
                    self.media_player.play()
                    self.play_toggle.select()
                    self.is_playing = True

    def toggle_loop(self):
        self.is_looping = not self.is_looping
        if self.media_player:
            self.media_player.set_repeat(self.is_looping)
        if self.is_looping:
            self.loop_toggle.select()
        else:
            self.loop_toggle.deselect()

    def on_progress_change(self, value):
        if self.media_player and self.track_duration > 0:
            self.user_is_adjusting_slider = True
            new_pos = value / self.track_duration
            self.media_player.set_position(new_pos)
            self.user_is_adjusting_slider = False

    def on_volume_change(self, value):
        if self.media_player:
            with self.volume_lock:
                self.media_player.audio_set_volume(int(value))
            self.volume_label.configure(text=f"{int(value)}%")

    def update_progress_bar(self):
        while not self.destroyed:
            if self.media_player and self.media_player.is_playing() and self.track_duration > 0:
                if not self.user_is_adjusting_slider:
                    current_pos = self.media_player.get_position() * self.track_duration
                    self.update_ui(lambda: self.progress_slider.set(current_pos))
                    self.update_time_label()
            time.sleep(0.1)

    def update_time_label(self):
        if self.destroyed:
            return
        if self.media_player:
            current_time = self.media_player.get_time() / 1000  # Current time in seconds
            current_str = time.strftime("%M:%S", time.gmtime(current_time))
            duration_str = time.strftime("%M:%S", time.gmtime(self.track_duration))
            self.update_ui(lambda: self.time_label.configure(text=f"{current_str} / {duration_str}"))

    def update_ui(self, func):
        if not self.destroyed:
            self.after(0, func)

    def fadeout_and_pause(self):
        """Gradually reduce the volume and pause."""
        self.fading = True
        with self.volume_lock:
            initial_volume = self.media_player.audio_get_volume()
        interrupted = False
        for vol in range(initial_volume, -1, -5):
            if self.fade_stop_event.is_set():
                interrupted = True
                break
            with self.volume_lock:
                self.media_player.audio_set_volume(vol)
            time.sleep(0.1)
        if not interrupted:
            self.media_player.pause()
            self.play_toggle.deselect()
            self.is_playing = False
        self.fading = False

    def fadein(self):
        """Gradually increase the volume to the target level."""
        self.fading = True
        target_volume = int(self.volume_slider.get())
        for vol in range(0, target_volume + 1, 5):
            if self.fade_stop_event.is_set():
                break
            with self.volume_lock:
                self.media_player.audio_set_volume(vol)
            time.sleep(0.1)
        self.fading = False

    def close_player(self):
        self.destroyed = True
        if self.fade_thread and self.fade_thread.is_alive():
            self.fade_stop_event.set()
            self.fade_thread.join(timeout=1.0)
        if self.media_player:
            self.media_player.stop()
        self.destroy()
        self.app.remove_player(self.track_name)