import tkinter as tk
import customtkinter as ctk
from tkinter import filedialog, simpledialog, messagebox
import sqlite3
import threading
import os
import logging
import vlc
import time

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize the database
conn = sqlite3.connect('tracks.db')
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        path TEXT,
        tags TEXT
    )
''')
conn.commit()

# Functions to handle database operations
def add_track(name, path, tags):
    cursor.execute('INSERT INTO tracks (name, path, tags) VALUES (?, ?, ?)', (name, path, tags))
    conn.commit()

def search_tracks(keyword):
    cursor.execute('SELECT * FROM tracks WHERE name LIKE ? OR tags LIKE ?', (f'%{keyword}%', f'%{keyword}%'))
    return cursor.fetchall()

def get_all_tracks():
    cursor.execute('SELECT * FROM tracks')
    return cursor.fetchall()

def delete_track_from_db(name):
    cursor.execute('DELETE FROM tracks WHERE name=?', (name,))
    conn.commit()

def display_tags(track_name):
    cursor.execute('SELECT tags FROM tracks WHERE name=?', (track_name,))
    result = cursor.fetchone()
    tags = result[0] if result and result[0] else 'No tags available'
    app.tags_text.configure(state="normal")
    app.tags_text.delete("1.0", tk.END)
    app.tags_text.insert(tk.END, tags)
    app.tags_text.configure(state="disabled")

# Class to handle individual track players
class TrackPlayer(ctk.CTkFrame):
    def __init__(self, master, track_name, track_path, *args, **kwargs):
        super().__init__(master, *args, **kwargs)
        self.track_name = track_name
        self.track_path = track_path
        self.is_playing = False
        self.is_looping = False
        self.instance = None
        self.media_list = None
        self.media_player = None
        self.track_duration = 0
        self.user_is_adjusting_slider = False

        self.grid_columnconfigure(1, weight=1)

        self.track_label = ctk.CTkLabel(self, text=track_name)
        self.track_label.grid(row=0, column=0, padx=5)

        self.play_pause_button = ctk.CTkButton(self, text="Pause", command=self.play_pause)
        self.play_pause_button.grid(row=0, column=1, padx=5)

        self.loop_button = ctk.CTkButton(self, text="Loop", command=self.toggle_loop)
        self.loop_button.grid(row=0, column=2, padx=5)

        self.close_button = ctk.CTkButton(self, text="Close", command=self.close_player)
        self.close_button.grid(row=0, column=3, padx=5)

        self.progress_slider = ctk.CTkSlider(self, from_=0, to=100, orientation="horizontal", command=self.on_progress_change)
        self.progress_slider.grid(row=1, column=0, columnspan=4, sticky="ew", padx=5, pady=5)

        self.start_playback()
        self.update_thread = threading.Thread(target=self.update_progress_bar, daemon=True)
        self.update_thread.start()

    def start_playback(self):
        try:
            logging.debug(f"Loading audio file: {self.track_path}")
            self.instance = vlc.Instance()
            self.media_list = self.instance.media_list_new()
            self.media_player = self.instance.media_list_player_new()
            media = self.instance.media_new(self.track_path)
            self.media_list.add_media(media)
            self.media_player.set_media_list(self.media_list)
            self.media_player.play()
            time.sleep(0.1)  # Allow time for VLC to start playing
            self.track_duration = media.get_duration() / 1000  # Duration in seconds
            self.progress_slider.configure(to=self.track_duration)
            self.is_playing = True
        except Exception as e:
            logging.error(f"Error playing audio: {e}")
            messagebox.showerror("Error", f"Error playing audio: {e}")

    def play_pause(self):
        if self.media_player:
            if self.is_playing:
                self.media_player.pause()
                self.play_pause_button.configure(text="Play")
            else:
                self.media_player.play()
                self.play_pause_button.configure(text="Pause")
            self.is_playing = not self.is_playing

    def toggle_loop(self):
        self.is_looping = not self.is_looping
        if self.is_looping:
            self.media_player.set_playback_mode(vlc.PlaybackMode.loop)
        else:
            self.media_player.set_playback_mode(vlc.PlaybackMode.default)
        messagebox.showinfo("Info", f"Looping is now {'enabled' if self.is_looping else 'disabled'}")

    def on_progress_change(self, value):
        if self.media_player and self.track_duration > 0:
            self.user_is_adjusting_slider = True
            new_pos = value / self.track_duration
            self.media_player.get_media_player().set_position(new_pos)
            self.user_is_adjusting_slider = False

    def update_progress_bar(self):
        while True:
            if self.media_player and self.media_player.is_playing() and self.track_duration > 0:
                if not self.user_is_adjusting_slider:
                    current_pos = self.media_player.get_media_player().get_position() * self.track_duration
                    self.progress_slider.set(current_pos)
            time.sleep(0.1)

    def close_player(self):
        if self.media_player:
            self.media_player.stop()
        self.destroy()
        app.remove_player(self.track_name)

class AudioPlayerApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Audio Manager")
        self.geometry("1200x1200")

        self.players = {}  # Dictionary to keep track of active players

        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self.main_frame = ctk.CTkFrame(self)
        self.main_frame.grid(row=0, column=0, sticky="nsew", padx=20, pady=20)

        self.main_frame.grid_columnconfigure((0, 1, 2), weight=1)
        self.main_frame.grid_rowconfigure((0, 1, 2, 3, 4), weight=1)

        self.title_label = ctk.CTkLabel(self.main_frame, text="Audio Manager", font=("Helvetica", 24))
        self.title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))

        self.upload_frame = ctk.CTkFrame(self.main_frame)
        self.upload_frame.grid(row=1, column=0, columnspan=3, sticky="ew", pady=(0, 20))

        self.upload_label = ctk.CTkLabel(self.upload_frame, text="Upload Audio Files")
        self.upload_label.grid(row=0, column=0, padx=(0, 10))

        self.upload_entry = ctk.CTkEntry(self.upload_frame)
        self.upload_entry.grid(row=0, column=1, sticky="ew")

        self.upload_button = ctk.CTkButton(self.upload_frame, text="Upload", command=self.upload_files)
        self.upload_button.grid(row=0, column=2, padx=(10, 0))

        self.playlist_button = ctk.CTkButton(self.upload_frame, text="Create Playlist", command=self.create_playlist)
        self.playlist_button.grid(row=0, column=3, padx=(10, 0))

        self.tags_button = ctk.CTkButton(self.upload_frame, text="Add Tags", command=self.add_tags)
        self.tags_button.grid(row=0, column=4, padx=(10, 0))

        self.search_frame = ctk.CTkFrame(self.main_frame)
        self.search_frame.grid(row=2, column=0, columnspan=3, sticky="ew", pady=(0, 20))

        self.search_label = ctk.CTkLabel(self.search_frame, text="Search")
        self.search_label.grid(row=0, column=0, padx=(0, 10))

        self.search_entry = ctk.CTkEntry(self.search_frame)
        self.search_entry.grid(row=0, column=1, sticky="ew")

        self.search_button = ctk.CTkButton(self.search_frame, text="Search", command=self.search_tracks)
        self.search_button.grid(row=0, column=2, padx=(10, 0))

        self.track_list_frame = ctk.CTkFrame(self.main_frame)
        self.track_list_frame.grid(row=3, column=0, sticky="nsew", padx=(0, 10))

        self.track_list_label = ctk.CTkLabel(self.track_list_frame, text="Track List")
        self.track_list_label.pack(anchor="w", pady=(0, 10))

        self.track_list = tk.Listbox(self.track_list_frame, height=15)
        self.track_list.pack(fill="both", expand=True)
        self.track_list.bind("<<ListboxSelect>>", self.on_track_select)

        self.play_button = ctk.CTkButton(self.track_list_frame, text="Play", command=self.play_audio)
        self.play_button.pack(anchor="w", pady=(10, 0))

        self.delete_button = ctk.CTkButton(self.track_list_frame, text="Delete", command=self.delete_track)
        self.delete_button.pack(anchor="e", pady=(10, 0))

        self.tags_frame = ctk.CTkFrame(self.main_frame)
        self.tags_frame.grid(row=3, column=1, sticky="nsew", padx=(10, 10))

        self.tags_label = ctk.CTkLabel(self.tags_frame, text="Tags")
        self.tags_label.pack(anchor="w", pady=(0, 10))

        self.tags_text = ctk.CTkTextbox(self.tags_frame, height=5)
        self.tags_text.pack(fill="both", expand=True)
        self.tags_text.configure(state="disabled")

        self.exit_button = ctk.CTkButton(self.main_frame, text="Exit", command=self.exit_app)
        self.exit_button.grid(row=4, column=0, columnspan=3, pady=(20, 0))

        # Frame to hold the dynamic players
        self.players_frame = ctk.CTkFrame(self.main_frame)
        self.players_frame.grid(row=5, column=0, columnspan=3, sticky="ew", padx=20, pady=10)

        self.load_tracks()

    def upload_files(self):
        files = filedialog.askopenfilenames(title="Select Audio Files")
        if files:
            for file in files:
                if os.path.isfile(file):
                    name = os.path.basename(file)
                    add_track(name, file, '')
            messagebox.showinfo("Success", "Files uploaded successfully!")
            self.load_tracks()
        else:
            messagebox.showinfo("Info", "No files selected.")

    def search_tracks(self):
        keyword = self.search_entry.get()
        results = search_tracks(keyword)
        self.track_list.delete(0, tk.END)
        for row in results:
            self.track_list.insert(tk.END, row[1])

    def play_audio(self):
        selected_tracks = self.track_list.curselection()
        if selected_tracks:
            track_name = self.track_list.get(selected_tracks[0])
            if track_name in self.players:
                messagebox.showinfo("Info", f"Player for '{track_name}' is already running.")
                return
            cursor.execute('SELECT path FROM tracks WHERE name=?', (track_name,))
            result = cursor.fetchone()
            if result:
                path = result[0]
                # Create a new TrackPlayer
                player = TrackPlayer(self.players_frame, track_name, path)
                player.pack(fill="x", pady=5)
                self.players[track_name] = player
                display_tags(track_name)
            else:
                messagebox.showerror("Error", "Track not found in database.")
        else:
            messagebox.showinfo("Info", "No track selected.")

    def remove_player(self, track_name):
        if track_name in self.players:
            del self.players[track_name]

    def on_track_select(self, event):
        selected_track = self.track_list.get(self.track_list.curselection())
        display_tags(selected_track)

    def create_playlist(self):
        folder = filedialog.askdirectory(title='Select Playlist Folder')
        if folder:
            files = [os.path.join(folder, f) for f in os.listdir(folder)]
            for file in files:
                if os.path.isfile(file):
                    name = os.path.basename(file)
                    add_track(name, file, '')
            messagebox.showinfo('Success', 'Playlist created successfully!')
            self.load_tracks()

    def add_tags(self):
        selected_tracks = self.track_list.curselection()
        if selected_tracks:
            tags = simpledialog.askstring('Enter tags', 'Enter tags (comma-separated)')
            if tags:
                for index in selected_tracks:
                    track_name = self.track_list.get(index)
                    cursor.execute('SELECT tags FROM tracks WHERE name=?', (track_name,))
                    result = cursor.fetchone()
                    existing_tags = result[0] if result and result[0] else ''
                    new_tags = existing_tags + ',' + tags if existing_tags else tags
                    cursor.execute('UPDATE tracks SET tags=? WHERE name=?', (new_tags, track_name))
                    conn.commit()
                messagebox.showinfo('Success', 'Tags added successfully!')
                display_tags(self.track_list.get(selected_tracks[0]))
            else:
                messagebox.showinfo('Info', 'No tags entered.')
        else:
            messagebox.showinfo('Info', 'No track selected.')

    def delete_track(self):
        selected_tracks = self.track_list.curselection()
        if selected_tracks:
            for index in selected_tracks:
                track_name = self.track_list.get(index)
                delete_track_from_db(track_name)
                # Also stop and remove the player if it's running
                if track_name in self.players:
                    self.players[track_name].close_player()
            messagebox.showinfo('Success', 'Track(s) deleted successfully!')
            self.load_tracks()
            self.tags_text.configure(state="normal")
            self.tags_text.delete("1.0", tk.END)
            self.tags_text.configure(state="disabled")
        else:
            messagebox.showinfo('Info', 'No track selected.')

    def load_tracks(self):
        tracks = [row[1] for row in get_all_tracks()]
        self.track_list.delete(0, tk.END)
        for track in tracks:
            self.track_list.insert(tk.END, track)

    def exit_app(self):
        for player in self.players.values():
            player.close_player()
        conn.close()
        self.destroy()

if __name__ == "__main__":
    app = AudioPlayerApp()
    app.mainloop()