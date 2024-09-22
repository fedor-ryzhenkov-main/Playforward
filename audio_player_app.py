import tkinter as tk
from tkinter import ttk
import customtkinter as ctk
from tkinter import filedialog, simpledialog, messagebox
import os
from database import *
from audio_utils import normalize_audio
from track_player import TrackPlayer
import vlc
from youtube_downloader import download_audio
import queue
import threading
import shutil

class AudioPlayerApp(ctk.CTk):
    def __init__(self, base_path):
        super().__init__()
        self.title("Audio Manager")
        self.geometry("1200x800")
        self.base_path = base_path
        self.conn = init_db(self.base_path)
        self.players = {}
        self.setup_ui()
        self.setup_custom_style()
        self.load_items()
        self.download_queue = queue.Queue()

        # Bind shortcuts
        self.bind("<Command-f>", self.focus_search)  # For macOS
        self.bind("<Control-f>", self.focus_search)  # For Windows/Linux
        self.bind("<Command-p>", self.toggle_all_tracks)  # For macOS
        self.bind("<Control-p>", self.toggle_all_tracks)  # For Windows/Linux

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
        
        self.youtube_button = ctk.CTkButton(controls_frame, text="Download from YouTube", command=self.download_from_youtube)
        self.youtube_button.pack(side=tk.LEFT, padx=5)
        
        # Add search elements
        self.search_var = tk.StringVar()
        self.search_entry = ctk.CTkEntry(controls_frame, textvariable=self.search_var, width=200)
        self.search_entry.pack(side=tk.LEFT, padx=5)
        
        self.search_button = ctk.CTkButton(controls_frame, text="Search", command=self.perform_search)
        self.search_button.pack(side=tk.LEFT, padx=5)
        
        self.search_mode_var = tk.StringVar(value="name")
        self.search_mode_menu = ctk.CTkOptionMenu(controls_frame, values=["name", "tags"], variable=self.search_mode_var)
        self.search_mode_menu.pack(side=tk.LEFT, padx=5)

    def setup_tree(self):
        self.tree_frame = ctk.CTkFrame(self.main_frame)
        self.tree_frame.grid(row=1, column=0, sticky="nsew")
        self.tree_frame.grid_columnconfigure(0, weight=1)
        self.tree_frame.grid_rowconfigure(0, weight=1)

        self.tree = ttk.Treeview(self.tree_frame, columns=("tags",), show="tree headings")
        self.tree.heading("tags", text="Tags")
        self.tree.column("tags", width=200)
        self.tree.grid(row=0, column=0, sticky="nsew")
        
        self.tree.tag_configure("Playlist.Treeview.Item", font=('TkDefaultFont', 12, 'bold'))
        self.tree.tag_configure("Track.Treeview.Item", font=('TkDefaultFont', 12, 'normal'))
        
        self.tree.bind("<Double-1>", self.on_tree_double_click)
        self.tree.bind("<<TreeviewSelect>>", self.on_tree_select)

        self.tree_scrollbar = ttk.Scrollbar(self.tree_frame, orient="vertical", command=self.tree.yview, style="Vertical.TScrollbar")
        self.tree_scrollbar.grid(row=0, column=1, sticky="ns")
        self.tree.configure(yscrollcommand=self.tree_scrollbar.set)

        self.dynamic_buttons_frame = ctk.CTkFrame(self.tree_frame)
        self.dynamic_buttons_frame.grid(row=1, column=0, columnspan=2, sticky="ew", pady=(5, 0))

    def setup_players_frame(self):
        self.players_frame = ctk.CTkFrame(self.main_frame)
        self.players_frame.grid(row=2, column=0, sticky="ew", pady=10)

    def load_items(self):
        expanded_items = self.get_expanded_items()
        self.tree.delete(*self.tree.get_children())
        self.load_items_recursive(None, '')
        for item in expanded_items:
            if self.tree.exists(item):
                self.tree.item(item, open=True)

    def load_items_recursive(self, parent_id, parent_tree_id):
        items = get_items_in_parent(self.conn, parent_id)
        for item in items:
            item_id, name, item_type, track_id = item
            if item_type == 'playlist':
                tree_id = self.tree.insert(parent_tree_id, 'end', text=name, open=False, 
                                           tags=('playlist',), iid=str(item_id))
                self.load_items_recursive(item_id, tree_id)
            elif item_type == 'track':
                self.add_track_to_tree(item, parent_tree_id)

    def add_track_to_tree(self, item, parent_tree_id=''):
        item_id, name, _, track_id = item
        tags = get_track_tags_by_id(self.conn, track_id)
        display_name = f"{name} | {tags}" if tags else name
        self.tree.insert(parent_tree_id, 'end', text=display_name, tags=('track',), iid=str(item_id))

    def on_tree_select(self, event):
        selected_items = self.tree.selection()
        self.dynamic_buttons_frame.grid_forget()
        for widget in self.dynamic_buttons_frame.winfo_children():
            widget.destroy()

        if selected_items:
            item_id = selected_items[0]
            item_tags = self.tree.item(item_id, "tags")
            if "track" in item_tags:
                self.dynamic_buttons_frame.grid(row=1, column=0, columnspan=2, sticky="ew", pady=(5, 0))
                track_name = self.tree.item(item_id, "text").split(" | ")[0]
                delete_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Delete", command=lambda: self.delete_track(item_id))
                delete_button.pack(side=tk.LEFT, padx=5)
                tags_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Edit Tags", command=lambda: self.edit_tags(item_id))
                tags_button.pack(side=tk.LEFT, padx=5)
                move_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Move", command=lambda: self.move_track(item_id))
                move_button.pack(side=tk.LEFT, padx=5)
                copy_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Copy", command=lambda: self.copy_track(item_id))
                copy_button.pack(side=tk.LEFT, padx=5)
            elif "playlist" in item_tags:
                self.dynamic_buttons_frame.grid(row=1, column=0, columnspan=2, sticky="ew", pady=(5, 0))
                delete_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Delete Playlist", command=lambda: self.delete_playlist(item_id))
                delete_button.pack(side=tk.LEFT, padx=5)
                rename_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Rename Playlist", command=lambda: self.rename_playlist(item_id))
                rename_button.pack(side=tk.LEFT, padx=5)
                play_playlist_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Play Playlist", command=lambda: self.play_playlist(item_id))
                play_playlist_button.pack(side=tk.LEFT, padx=5)
                self.simultaneous_var = tk.BooleanVar(value=True)
                simultaneous_toggle = ctk.CTkCheckBox(self.dynamic_buttons_frame, text="Simultaneous", variable=self.simultaneous_var)
                simultaneous_toggle.pack(side=tk.LEFT, padx=5)

    def on_tree_double_click(self, event):
        item_id = self.tree.focus()
        if item_id:
            item_tags = self.tree.item(item_id, "tags")
            if "track" in item_tags:
                self.play_audio(item_id)

    def play_audio(self, item_id):
        if item_id in self.players:
            messagebox.showinfo("Info", f"Player for '{self.tree.item(item_id, 'text')}' is already running.")
            return
        cursor = self.conn.cursor()
        cursor.execute('SELECT track_id FROM items WHERE id = ?', (item_id,))
        result = cursor.fetchone()
        if result:
            track_id = result[0]
            track_path = get_track_path_by_id(self.conn, track_id)
            if track_path:
                track_name = self.tree.item(item_id, "text").split(" | ")[0]
                player = TrackPlayer(self.players_frame, track_name, track_path, self)
                player.pack(fill="x", pady=5)
                self.players[item_id] = player
            else:
                messagebox.showerror("Error", "Track file not found.")
        else:
            messagebox.showerror("Error", "Track not found in database.")

    def delete_track(self, item_id):
        if messagebox.askyesno("Confirm Delete", "Are you sure you want to delete this track from the playlist?"):
            delete_item(self.conn, item_id)
            self.load_items()

    def edit_tags(self, item_id):
        cursor = self.conn.cursor()
        cursor.execute('SELECT track_id FROM items WHERE id = ?', (item_id,))
        result = cursor.fetchone()
        if result:
            track_id = result[0]
            current_tags = get_track_tags_by_id(self.conn, track_id)
            new_tags = simpledialog.askstring("Edit Tags", "Enter new tags:", initialvalue=current_tags)
            if new_tags is not None:
                update_track_tags(self.conn, track_id, new_tags)
                self.load_items()
        else:
            messagebox.showerror("Error", "Track not found in database.")

    def move_track(self, item_id):
        new_parent_id = self.select_playlist("Select Destination Playlist")
        if new_parent_id is not None:
            if self.can_add_to_playlist(new_parent_id, 'track'):
                move_item(self.conn, item_id, new_parent_id)
                self.load_items()
            else:
                messagebox.showerror("Error", "Cannot move track into a playlist that contains playlists.")

    def copy_track(self, item_id):
        new_parent_id = self.select_playlist("Select Destination Playlist")
        if new_parent_id is not None:
            if self.can_add_to_playlist(new_parent_id, 'track'):
                cursor = self.conn.cursor()
                cursor.execute('SELECT name, track_id FROM items WHERE id = ?', (item_id,))
                result = cursor.fetchone()
                if result:
                    name, track_id = result
                    add_item(self.conn, name, 'track', new_parent_id, track_id)
                    self.load_items()
                else:
                    messagebox.showerror("Error", "Track not found.")
            else:
                messagebox.showerror("Error", "Cannot copy track into a playlist that contains playlists.")

    def delete_playlist(self, item_id):
        if messagebox.askyesno("Confirm Delete", "Are you sure you want to delete this playlist and all its contents?"):
            delete_item(self.conn, item_id)
            self.load_items()

    def rename_playlist(self, item_id):
        current_name = self.tree.item(item_id, "text")
        new_name = simpledialog.askstring("Rename Playlist", "Enter new name:", initialvalue=current_name)
        if new_name:
            cursor = self.conn.cursor()
            cursor.execute('UPDATE items SET name = ? WHERE id = ?', (new_name, item_id))
            self.conn.commit()
            self.load_items()

    def select_playlist(self, title):
        playlists = []
        self.get_playlists_recursive(None, playlists)
        if not playlists:
            messagebox.showinfo("Info", "No playlists available.")
            return None
        playlist_names = [("Root", None)] + playlists
        playlist_dict = {name: id for name, id in playlist_names}
        selected_name = simpledialog.askstring(title, "Enter playlist name:\n" + "\n".join([name for name, _ in playlist_names]))
        return playlist_dict.get(selected_name)

    def get_playlists_recursive(self, parent_id, playlists, path=""):
        items = get_items_in_parent(self.conn, parent_id)
        for item in items:
            item_id, name, item_type, _ = item
            if item_type == 'playlist':
                full_path = f"{path}/{name}" if path else name
                playlists.append((full_path, item_id))
                self.get_playlists_recursive(item_id, playlists, full_path)

    def can_add_to_playlist(self, playlist_id, item_type):
        items = get_items_in_parent(self.conn, playlist_id)
        for item in items:
            existing_item_type = item[2]
            if existing_item_type != item_type:
                return False
        return True

    def upload_files(self):
        files = filedialog.askopenfilenames(filetypes=[("Audio Files", "*.mp3 *.wav *.ogg")])
        if files:
            for file in files:
                name = os.path.basename(file)
                dest_path = os.path.join(self.base_path, 'uploads', name)
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                shutil.copy2(file, dest_path)
                normalized_path = normalize_audio(dest_path, self.base_path)
                track_id = add_track(self.conn, name, dest_path, normalized_path, "")
                add_item(self.conn, name, 'track', None, track_id)
            self.load_items()

    def create_playlist(self):
        playlist_name = simpledialog.askstring("Create Playlist", "Enter playlist name:")
        if playlist_name:
            parent_id = self.select_playlist("Select Parent Playlist (or cancel for root)")
            add_item(self.conn, playlist_name, 'playlist', parent_id)
            self.load_items()

    def remove_player(self, track_name):
        for item_id, player in list(self.players.items()):
            if player.track_name == track_name:
                del self.players[item_id]
                break

    def setup_custom_style(self):
        style = ttk.Style()
        style.theme_use('default')  # or any other theme you prefer
        
        # Configure the overall Treeview style
        style.configure("Treeview", 
                        background="#2b2b2b",  # Dark background
                        fieldbackground="#2b2b2b",  # Dark background for fields
                        foreground="white",  # White text for all items
                        bordercolor="#1c1c1c",  # Dark border color
                        lightcolor="#1c1c1c",  # Dark color for 3D effects
                        darkcolor="#1c1c1c")  # Dark color for 3D effects
        
        # Configure playlist style (bold and light blue)
        style.configure("Playlist.Treeview.Item", font=('TkDefaultFont', 12, 'bold'))
        style.map("Playlist.Treeview.Item", foreground=[('focus', '#add8e6'), ('!focus', '#add8e6')])
        
        # Configure track style (normal and white)
        style.configure("Track.Treeview.Item", font=('TkDefaultFont', 12, 'normal'))
        style.map("Track.Treeview.Item", foreground=[('focus', 'white'), ('!focus', 'white')])
        
        # Configure selection colors
        style.map("Treeview",
                  background=[('selected', '#4a6984')],
                  foreground=[('selected', 'white')])

        # Configure scrollbar colors for dark mode
        style.configure("Vertical.TScrollbar", 
                        background="#2b2b2b", 
                        troughcolor="#1c1c1c", 
                        bordercolor="#1c1c1c",
                        arrowcolor="white",
                        lightcolor="#2b2b2b",
                        darkcolor="#2b2b2b")

        # Configure the slider (Scale) widget
        style.configure("Horizontal.TScale",
                        background="#2b2b2b",
                        troughcolor="#1c1c1c",
                        slidercolor="#4a6984",
                        lightcolor="#2b2b2b",
                        darkcolor="#2b2b2b")

    def get_expanded_items(self):
        expanded = []
        def traverse(item):
            if self.tree.item(item, "open"):
                expanded.append(item)
            for child in self.tree.get_children(item):
                traverse(child)
        traverse('')
        return expanded

    def play_playlist(self, playlist_id):
        tracks = self.get_tracks_in_playlist(playlist_id)
        if not tracks:
            messagebox.showinfo("Info", "This playlist is empty.")
            return

        if self.simultaneous_var.get():
            self.play_tracks_simultaneously(tracks)
        else:
            self.play_tracks_sequentially(tracks)

    def get_tracks_in_playlist(self, playlist_id):
        tracks = []
        def traverse(item_id):
            for child_id in self.tree.get_children(item_id):
                item_tags = self.tree.item(child_id, "tags")
                if "track" in item_tags:
                    track_name = self.tree.item(child_id, "text").split(" | ")[0]
                    track_path = get_track_path_by_id(self.conn, get_track_id_by_name(self.conn, track_name))
                    tracks.append((track_name, track_path))
                elif "playlist" in item_tags:
                    traverse(child_id)
        traverse(playlist_id)
        return tracks

    def play_tracks_simultaneously(self, tracks):
        for track_name, track_path in tracks:
            if track_name not in self.players:
                player = TrackPlayer(self.players_frame, track_name, track_path, self)
                player.pack(fill="x", pady=5)
                self.players[track_name] = player
            self.players[track_name].play_pause()

    def play_tracks_sequentially(self, tracks):
        if not hasattr(self, 'playlist_player'):
            self.playlist_player = vlc.MediaListPlayer()
            self.playlist_player.set_media_player(vlc.MediaPlayer())

        media_list = vlc.MediaList()
        for _, track_path in tracks:
            media = vlc.Media(track_path)
            media_list.add_media(media)

        self.playlist_player.set_media_list(media_list)
        self.playlist_player.play()

        # Create a single TrackPlayer for the entire playlist
        playlist_name = self.tree.item(self.tree.selection()[0], "text")
        player = TrackPlayer(self.players_frame, f"Playlist: {playlist_name}", tracks[0][1], self)  # Use the first track's path
        player.pack(fill="x", pady=5)
        player.media_list_player = self.playlist_player
        player.media_player = self.playlist_player.get_media_player()
        self.players[playlist_name] = player

    def download_from_youtube(self):
        youtube_url = simpledialog.askstring("YouTube Downloader", "Enter YouTube URL:")
        if youtube_url:
            try:
                output_path = os.path.join(self.base_path, "YouTubeDownloads")
                os.makedirs(output_path, exist_ok=True)
                
                # Show a progress dialog
                progress_window = ctk.CTkToplevel(self)
                progress_window.title("Downloading...")
                progress_label = ctk.CTkLabel(progress_window, text="Downloading and converting audio...")
                progress_label.pack(padx=20, pady=20)
                
                # Run the download in a separate thread to keep the UI responsive
                def download_thread():
                    try:
                        downloaded_file = download_audio(youtube_url, output_path)
                        
                        # Add the downloaded track to the database and UI
                        track_name = os.path.basename(downloaded_file)
                        normalized_path = normalize_audio(downloaded_file, self.base_path)
                        track_id = add_track(self.conn, track_name, downloaded_file, normalized_path, "")
                        add_item(self.conn, track_name, 'track', None, track_id)
                        
                        self.after(0, lambda: self.load_items())
                        self.after(0, lambda: messagebox.showinfo("Success", f"Downloaded and added: {track_name}"))
                    except Exception as e:
                        error_msg = str(e)
                        self.after(0, lambda: messagebox.showerror("Error", f"Failed to download: {error_msg}"))
                    finally:
                        self.after(0, lambda: progress_window.destroy())
                
                threading.Thread(target=download_thread, daemon=True).start()
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to initiate download: {str(e)}")

    def perform_search(self):
        search_term = self.search_var.get().strip().lower()
        search_mode = self.search_mode_var.get()
        
        if not search_term:
            self.load_items()  # Reset to show all items if search is empty
            return
        
        self.tree.delete(*self.tree.get_children())
        
        def search_recursive(parent_id=None, parent_tree_id=''):
            items = get_items_in_parent(self.conn, parent_id)
            for item in items:
                item_id, name, item_type, track_id = item
                if item_type == 'playlist':
                    tree_id = self.tree.insert(parent_tree_id, 'end', text=name, open=True, tags=('playlist',), iid=str(item_id))
                    search_recursive(item_id, tree_id)
                    # If the playlist is empty after search, remove it
                    if not self.tree.get_children(tree_id):
                        self.tree.delete(tree_id)
                elif item_type == 'track':
                    if search_mode == 'name' and search_term in name.lower():
                        self.add_track_to_tree(item, parent_tree_id)
                    elif search_mode == 'tags':
                        tags = get_track_tags_by_id(self.conn, track_id)
                        if tags and search_term in tags.lower():
                            self.add_track_to_tree(item, parent_tree_id)
        
        search_recursive()

    def focus_search(self, event=None):
        self.search_entry.focus_set()

    def toggle_all_tracks(self, event=None):
        for player in self.players.values():
            player.play_pause()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        base_path = sys.argv[1]
    else:
        base_path = os.path.expanduser("~/Music")
    app = AudioPlayerApp(base_path)
    app.mainloop()