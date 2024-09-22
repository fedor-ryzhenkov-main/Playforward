import logging
import customtkinter as ctk
import threading
import time
from viewmodels.track_player_vm import TrackPlayerViewModel, PlayerState

class TrackPlayer(ctk.CTkFrame):
    def __init__(self, master, track_name: str, track_path: str, app, *args, **kwargs):
        super().__init__(master, *args, **kwargs)
        self.app = app
        self.vm = TrackPlayerViewModel(track_name, track_path)
        self.is_closing = False

        self._setup_ui()
        self._schedule_ui_updates()

    def _setup_ui(self):
        # Track label
        self.track_label = ctk.CTkLabel(self, text=self.vm.track_name)
        self.track_label.grid(row=0, column=0, padx=5)

        # Play/Pause button
        self.play_button = ctk.CTkButton(self, text="Play", command=self.toggle_play_pause)
        self.play_button.grid(row=0, column=1, padx=5)

        # Loop toggle
        self.loop_toggle = ctk.CTkSwitch(self, text="Loop", command=self.vm.toggle_loop)
        self.loop_toggle.grid(row=0, column=2, padx=5)

        # Fade toggle
        self.fade_toggle = ctk.CTkSwitch(self, text="Fade", command=self.toggle_fade_mode)
        self.fade_toggle.grid(row=0, column=3, padx=5)

        # Close button
        self.close_button = ctk.CTkButton(self, text="Close", command=self.close_player)
        self.close_button.grid(row=0, column=4, padx=5)

        # Progress slider
        self.progress_slider = ctk.CTkSlider(
            self, from_=0, to=100, orientation="horizontal", command=self.on_slider_moved
        )
        self.progress_slider.grid(row=1, column=0, columnspan=3, sticky="ew", padx=5, pady=5)

        # Time label
        self.time_label = ctk.CTkLabel(self, text="0:00 / 0:00")
        self.time_label.grid(row=1, column=3, padx=5)

        # Volume slider
        self.volume_slider = ctk.CTkSlider(
            self, from_=0, to=100, orientation="horizontal", command=self.on_volume_changed
        )
        self.volume_slider.grid(row=2, column=0, columnspan=3, sticky="ew", padx=5, pady=5)
        self.volume_slider.set(50)

        # Volume label
        self.volume_label = ctk.CTkLabel(self, text="50%")
        self.volume_label.grid(row=2, column=3, padx=5)

    def _schedule_ui_updates(self):
        if self.is_closing or not self.winfo_exists():
            return
        
        self.update_progress_slider()
        self.update_time_label()
        self.update_play_button()
        
        # Schedule the next update
        self.after(100, self._schedule_ui_updates)

    def update_progress_slider(self):
        if self.is_closing or not self.winfo_exists():
            return
        position = self.vm.get_position()
        if position is not None:
            self.progress_slider.set(position * 100)

    def update_time_label(self):
        if self.is_closing or not self.winfo_exists():
            return
        position = self.vm.get_position()
        if position is not None:
            current_pos = position * self.vm.get_duration()
            duration = self.vm.get_duration()
            current_str = time.strftime("%M:%S", time.gmtime(current_pos))
            duration_str = time.strftime("%M:%S", time.gmtime(duration))
            self.time_label.configure(text=f"{current_str} / {duration_str}")

    def update_play_button(self):
        if self.is_closing or not self.winfo_exists():
            return
        if self.vm.state in [PlayerState.PLAYING]:
            self.play_button.configure(text="Pause")
        elif self.vm.state in [PlayerState.PAUSED, PlayerState.STOPPED]:
            self.play_button.configure(text="Play")

    def toggle_play_pause(self):
        if self.vm.state == PlayerState.PLAYING:
            self.vm.pause()
        elif self.vm.state in [PlayerState.PAUSED, PlayerState.STOPPED]:
            self.vm.play()
        else:
            # Handle other states if necessary
            pass
        self.update_play_button()

    def toggle_fade_mode(self):
        self.vm.set_fade_mode(self.fade_toggle.get())

    def on_slider_moved(self, value):
        logging.debug(f"Slider moved to {value}")
        position = value / 100.0
        self.vm.set_position(position)

    def on_volume_changed(self, value):
        volume = value / 100.0
        self.vm.set_volume(volume)
        self.volume_label.configure(text=f"{int(value)}%")

    def close_player(self):
        self.is_closing = True
        # Allow scheduled updates to recognize the closing state
        time.sleep(0.1)
        # Perform cleanup in a separate thread to avoid blocking the UI
        threading.Thread(target=self.vm.stop).start()
        self.destroy()
        self.app.remove_player(self.vm.track_name)