import tkinter as tk
from tkinter import ttk
import customtkinter as ctk
from tkinter import filedialog, simpledialog, messagebox
from database import *
from audio_utils import normalize_audio
from track_player import TrackPlayer

class AudioPlayerApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Audio Manager")
        self.geometry("1200x800")
        self.conn = init_db()
        self.players = {}
        self.setup_ui()
        self.load_tracks_and_playlists()

    def setup_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self.main_frame = ctk.CTkFrame(self)
        self.main_frame.grid(row=0, column=0, sticky="nsew", padx=20, pady=20)
        self.main_frame.grid_columnconfigure(0, weight=1)
        self.main_frame.grid_rowconfigure(1, weight=1)

        self.setup_controls()
        self.setup_tree()
        self.setup_players_frame()

    def setup_controls(self):
        controls_frame = ctk.CTkFrame(self.main_frame)
        controls_frame.grid(row=0, column=0, sticky="ew", pady=(0, 10))
        
        self.upload_button = ctk.CTkButton(controls_frame, text="Upload Tracks", command=self.upload_files)
        self.upload_button.pack(side=tk.LEFT, padx=5)
        
        self.create_playlist_button = ctk.CTkButton(controls_frame, text="Create Playlist", command=self.create_playlist)
        self.create_playlist_button.pack(side=tk.LEFT, padx=5)
        
        self.add_to_playlist_button = ctk.CTkButton(controls_frame, text="Add to Playlist", command=self.add_to_playlist)
        self.add_to_playlist_button.pack(side=tk.LEFT, padx=5)

    def setup_tree(self):
        self.tree = ttk.Treeview(self.main_frame, columns=("tags",), show="tree headings")
        self.tree.heading("tags", text="Tags")
        self.tree.column("tags", width=200)
        self.tree.grid(row=1, column=0, sticky="nsew")
        
        self.tree.bind("<Double-1>", self.on_tree_double_click)

    def setup_players_frame(self):
        self.players_frame = ctk.CTkFrame(self.main_frame)
        self.players_frame.grid(row=2, column=0, sticky="ew", pady=10)

    def load_tracks_and_playlists(self):
        self.tree.delete(*self.tree.get_children())
        
        # Add "All Tracks" as the root
        all_tracks_id = self.tree.insert("", "end", text="All Tracks", open=True)
        
        # Load all tracks
        for track in get_all_tracks(self.conn):
            self.tree.insert(all_tracks_id, "end", text=track[1], values=(track[4],), tags=("track",))
        
        # Load playlists
        for playlist in get_playlists(self.conn):
            playlist_id = self.tree.insert("", "end", text=playlist[1], open=False, tags=("playlist",))
            for track in get_tracks_in_playlist(self.conn, playlist[0]):
                self.tree.insert(playlist_id, "end", text=track[1], values=(track[4],), tags=("track",))

    def upload_files(self):
        files = filedialog.askopenfilenames(title="Select Audio Files")
        if files:
            for file in files:
                name = os.path.basename(file)
                normalized_path = normalize_audio(file)
                add_track(self.conn, name, file, normalized_path, '')
            self.load_tracks_and_playlists()

    def create_playlist(self):
        name = simpledialog.askstring("Create Playlist", "Enter playlist name:")
        if name:
            add_playlist(self.conn, name)
            self.load_tracks_and_playlists()

    def add_to_playlist(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showinfo("Info", "Please select a track to add to a playlist.")
            return
        
        playlists = get_playlists(self.conn)
        playlist_names = [p[1] for p in playlists]
        playlist_name = simpledialog.askstring("Add to Playlist", "Choose a playlist:", initialvalue=playlist_names[0] if playlist_names else "")
        
        if playlist_name in playlist_names:
            playlist_id = playlists[playlist_names.index(playlist_name)][0]
            for item in selected:
                if "track" in self.tree.item(item, "tags"):
                    track_name = self.tree.item(item, "text")
                    track_id = get_track_id_by_name(self.conn, track_name)
                    add_track_to_playlist(self.conn, playlist_id, track_id)
            self.load_tracks_and_playlists()
        elif playlist_name:
            messagebox.showinfo("Info", f"Playlist '{playlist_name}' does not exist.")

    def on_tree_double_click(self, event):
        item = self.tree.selection()[0]
        if "track" in self.tree.item(item, "tags"):
            self.play_audio(self.tree.item(item, "text"))

    def play_audio(self, track_name):
        if track_name in self.players:
            messagebox.showinfo("Info", f"Player for '{track_name}' is already running.")
            return
        track_path = get_track_path_by_name(self.conn, track_name)
        if track_path:
            player = TrackPlayer(self.players_frame, track_name, track_path, self)
            player.pack(fill="x", pady=5)
            self.players[track_name] = player
        else:
            messagebox.showerror("Error", "Track not found in database.")

    def remove_player(self, track_name):
        if track_name in self.players:
            del self.players[track_name]

if __name__ == "__main__":
    app = AudioPlayerApp()
    app.mainloop()