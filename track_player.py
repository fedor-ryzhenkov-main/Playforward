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
        self.media_list = None
        self.media_list_player = None
        self.media_player = None
        self.track_duration = 0
        self.user_is_adjusting_slider = False

        self.grid_columnconfigure(1, weight=1)
        self.grid_columnconfigure(2, weight=1)

        self.track_label = ctk.CTkLabel(self, text=track_name)
        self.track_label.grid(row=0, column=0, padx=5)

        self.play_toggle = ctk.CTkSwitch(self, text="Play", command=self.play_pause)
        self.play_toggle.grid(row=0, column=1, padx=5)

        self.loop_toggle = ctk.CTkSwitch(self, text="Loop", command=self.toggle_loop)
        self.loop_toggle.grid(row=0, column=2, padx=5)

        self.close_button = ctk.CTkButton(self, text="Close", command=self.close_player)
        self.close_button.grid(row=0, column=3, padx=5)

        self.progress_slider = ctk.CTkSlider(self, from_=0, to=100, orientation="horizontal", command=self.on_progress_change)
        self.progress_slider.grid(row=1, column=0, columnspan=3, sticky="ew", padx=5, pady=5)

        self.time_label = ctk.CTkLabel(self, text="0:00 / 0:00")
        self.time_label.grid(row=1, column=3, padx=5)

        self.volume_slider = ctk.CTkSlider(self, from_=0, to=100, orientation="horizontal", command=self.on_volume_change)
        self.volume_slider.grid(row=2, column=0, columnspan=3, sticky="ew", padx=5, pady=5)
        self.volume_slider.set(50)  # Set default volume to 50%

        self.volume_label = ctk.CTkLabel(self, text="50%")
        self.volume_label.grid(row=2, column=3, padx=5)

        self.start_playback()
        self.update_thread = threading.Thread(target=self.update_progress_bar, daemon=True)
        self.update_thread.start()

    def start_playback(self):
        try:
            logging.debug(f"Loading audio file: {self.track_path}")
            self.instance = vlc.Instance()
            self.media_list = self.instance.media_list_new()
            self.media_list_player = self.instance.media_list_player_new()
            media = self.instance.media_new(self.track_path)
            self.media_list.add_media(media)
            self.media_list_player.set_media_list(self.media_list)
            self.media_player = self.media_list_player.get_media_player()
            
            # Set initial volume to 50%
            self.media_player.audio_set_volume(50)
            
            # Start playing to get the correct duration
            self.media_list_player.play()
            time.sleep(0.5)  # Wait for media to load
            
            # Get the correct duration
            self.track_duration = media.get_duration() / 1000  # Duration in seconds
            logging.debug(f"Track duration: {self.track_duration} seconds")
            
            self.progress_slider.configure(to=self.track_duration)
            self.is_playing = True
            self.play_toggle.select()  # Turn on the play toggle
            self.update_time_label()
        except Exception as e:
            logging.error(f"Error playing audio: {e}")
            messagebox.showerror("Error", f"Error playing audio: {e}")

    def play_pause(self):
        if self.media_list_player:
            if self.is_playing:
                self.media_list_player.pause()
                self.play_toggle.deselect()
            else:
                self.media_list_player.play()
                self.play_toggle.select()
            self.is_playing = not self.is_playing

    def toggle_loop(self):
        self.is_looping = not self.is_looping
        if self.media_list_player:
            self.media_list_player.set_playback_mode(vlc.PlaybackMode.loop if self.is_looping else vlc.PlaybackMode.default)
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
            self.media_player.audio_set_volume(int(value))
            self.volume_label.configure(text=f"{int(value)}%")

    def update_progress_bar(self):
        while True:
            if self.media_player and self.media_player.is_playing() and self.track_duration > 0:
                if not self.user_is_adjusting_slider:
                    current_pos = self.media_player.get_position() * self.track_duration
                    self.progress_slider.set(current_pos)
                    self.update_time_label()
            time.sleep(0.1)

    def update_time_label(self):
        if self.media_player:
            current_time = self.media_player.get_time() / 1000  # Current time in seconds
            current_str = time.strftime("%M:%S", time.gmtime(current_time))
            duration_str = time.strftime("%M:%S", time.gmtime(self.track_duration))
            self.time_label.configure(text=f"{current_str} / {duration_str}")

    def close_player(self):
        if self.media_list_player:
            self.media_list_player.stop()
        self.destroy()
        self.app.remove_player(self.track_name)