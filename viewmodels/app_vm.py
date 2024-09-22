import os
import shutil
import threading
from typing import List, Dict, Any, Optional, Callable, Union
from database.audio_player_database import AudioPlayerDatabase
from audio_utils import normalize_audio
from viewmodels.track_player_vm import TrackPlayerViewModel
from views.track_player_view import TrackPlayer
import yt_dlp
from pydub import AudioSegment
from models.track import Track
from models.playlist import Playlist

from views.app_view import AppView

class AppViewModel:
    def __init__(self, base_path: str):
        self.base_path = base_path
        self.db = AudioPlayerDatabase(os.path.join(self.base_path, 'audio_manager.db'))
        self.players: Dict[int, TrackPlayer] = {}
        self.view: Optional['AppView'] = None

    def set_view(self, view: 'AppView'):
        self.view = view
        self._bind_view_events()

    def _bind_view_events(self):
        self.view.set_upload_command(self.upload_files)
        self.view.set_create_playlist_command(self.create_playlist)
        self.view.set_youtube_download_command(self.download_from_youtube)
        self.view.set_tree_double_click_handler(self._on_tree_double_click)
        self.view.set_tree_select_handler(self._on_tree_select)
        self.view.set_tree_right_click_handler(self._on_tree_right_click)
        self.view.set_search_handler(self.on_search_change)
        self.view.play_audio = self.play_audio
        self.view.edit_tags = self.edit_tags
        self.view.edit_comments = self.edit_comments
        self.view.remove_track = self.delete_track
        self.view.rename_playlist = self.rename_playlist
        self.view.remove_playlist = self.delete_playlist

    def load_items(self, return_items=False):
        def get_items_recursive(parent_id: Optional[int] = None) -> List[Union[Track, Playlist]]:
            items = self.db.get_items_in_parent(parent_id)
            result = []
            for item in items:
                if item['type'] == 'playlist':
                    playlist = Playlist.from_db_item(item)
                    playlist.children = get_items_recursive(playlist.id)
                    result.append(playlist)
                elif item['type'] == 'track':
                    result.append(Track.from_db_item(item))
            return result

        all_items = get_items_recursive()
        if return_items:
            return all_items
        self.view.update_tree(all_items)

    def upload_files(self):
        files = self.view.ask_open_filenames(filetypes=[("Audio Files", "*.mp3 *.wav *.ogg")])
        if files:
            for file in files:
                name = os.path.basename(file)
                dest_path = os.path.join(self.base_path, 'uploads', name)
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                shutil.copy2(file, dest_path)
                normalized_path = normalize_audio(dest_path, self.base_path)
                
                comments = self.view.ask_string("Add Comments", f"Enter comments for {name}:")
                tags = self.view.ask_string("Add Tags", f"Enter tags for {name} (comma-separated):")
                tags_list = [tag.strip().lower() for tag in (tags or '').split(',') if tag.strip()]
                
                self.db.add_track(name, normalized_path, tags_list, comments or '', None)
            self.load_items()

    def create_playlist(self):
        playlist_name = self.view.ask_string("Create Playlist", "Enter playlist name:")
        if playlist_name:
            parent_id = self._select_playlist("Select Parent Playlist (or cancel for root)")
            tags = self.view.ask_string("Add Tags", "Enter tags for the playlist (comma-separated):")
            tags_list = [tag.strip().lower() for tag in (tags or '').split(',') if tag.strip()]
            description = self.view.ask_string("Add Description", "Enter description for the playlist:")
            self.db.add_playlist(playlist_name, parent_id, tags_list, description or '')
            self.load_items()

    def _select_playlist(self, title: str) -> Optional[int]:
        playlists = []
        self._get_playlists_recursive(None, playlists)
        if not playlists:
            self.view.show_info("Info", "No playlists available.")
            return None
        playlist_names = [("Root", None)] + playlists
        playlist_dict = {name: id for name, id in playlist_names}
        selected_name = self.view.ask_string(title, "Enter playlist name:\n" + "\n".join([name for name, _ in playlist_names]))
        return playlist_dict.get(selected_name)

    def _get_playlists_recursive(self, parent_id: Optional[int], playlists: List[tuple], path: str = ""):
        items = self.db.get_items_in_parent(parent_id)
        for item in items:
            if item['type'] == 'playlist':
                full_path = f"{path}/{item['name']}" if path else item['name']
                playlists.append((full_path, item['id']))
                self._get_playlists_recursive(item['id'], playlists, full_path)

    def download_from_youtube(self):
        youtube_url = self.view.ask_string("YouTube Downloader", "Enter YouTube URL:")
        if youtube_url:
            try:
                output_path = os.path.join(self.base_path, "YouTubeDownloads")
                os.makedirs(output_path, exist_ok=True)
                
                progress_dialog = self.view.create_progress_dialog("Downloading...", "Downloading and converting audio...")
                
                def download_thread():
                    try:
                        downloaded_file = self._download_audio(youtube_url, output_path)
                        track_name = os.path.basename(downloaded_file)
                        normalized_path = normalize_audio(downloaded_file, self.base_path)
                        self.db.add_track(track_name, normalized_path, [""], "", None)
                        self.view.after(0, self.load_items)
                        self.view.after(0, lambda: self.view.show_info("Success", f"Downloaded and added: {track_name}"))
                    except Exception as e:
                        self.view.after(0, lambda: self.view.show_error("Error", f"Failed to download: {str(e)}"))
                    finally:
                        self.view.after(0, progress_dialog.destroy)
                
                threading.Thread(target=download_thread, daemon=True).start()
                
            except Exception as e:
                self.view.show_error("Error", f"Failed to initiate download: {str(e)}")

    def _download_audio(self, youtube_url, output_path):
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(output_path, '%(title)s.%(ext)s'),
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=True)
            filename = ydl.prepare_filename(info)
            
            audio = AudioSegment.from_file(filename)
            mp3_filename = os.path.splitext(filename)[0] + '.mp3'
            audio.export(mp3_filename, format="mp3")
            
            if filename != mp3_filename:
                os.remove(filename)
            
            return mp3_filename

    def on_search_change(self, *args):
        search_name = self.view.search_name_var.get().lower()
        search_tags = self.view.search_tags_var.get().lower().split(',')
        
        # Remove empty strings from search_tags
        search_tags = [tag.strip() for tag in search_tags if tag.strip()]
        
        if not search_name and not search_tags:
            self.load_items()
            return
        
        filtered_items = self._filter_items(search_name, search_tags)
        self.view.update_tree(filtered_items)

    def _item_matches(self, item: Union[Track, Playlist], search_name: str, search_tags: List[str]) -> bool:
        name_match = not search_name or search_name in item.name.lower()
        tags_match = not search_tags or all(any(search_tag in tag.lower() for tag in item.tags) for search_tag in search_tags)
        return name_match and tags_match

    def _filter_items(self, search_name: str, search_tags: List[str]) -> List[Union[Track, Playlist]]:
        def filter_recursive(items: List[Union[Track, Playlist]]) -> List[Union[Track, Playlist]]:
            filtered = []
            for item in items:
                if isinstance(item, Playlist):
                    filtered_children = filter_recursive(item.children)
                    if filtered_children or self._item_matches(item, search_name, search_tags):
                        filtered_item = Playlist(
                            id=item.id,
                            name=item.name,
                            tags=item.tags,
                            description=item.description,
                            children=filtered_children,
                            parent_id=item.parent_id
                        )
                        filtered.append(filtered_item)
                elif isinstance(item, Track) and self._item_matches(item, search_name, search_tags):
                    filtered.append(item)
            return filtered

        all_items = self.load_items(return_items=True)
        return filter_recursive(all_items)

    def _on_tree_double_click(self, event):
        item_id = self.view.tree.focus()
        if item_id:
            item = self.db.get_item_details(int(item_id))
            if item and item['type'] == 'track':
                self.play_audio(item_id)

    def _on_tree_select(self, event):
        selected_items = self.view.tree.selection()
        self.view.update_dynamic_buttons(selected_items)

    def _on_tree_right_click(self, event):
        item = self.view.tree.identify_row(event.y)
        if item:
            self.view.tree.selection_set(item)
            item_type = self.db.get_item_details(int(item))['type']
            context_menu = self._create_context_menu(item, item_type)
            self.view.show_context_menu(context_menu, event)

    def _create_context_menu(self, item_id: str, item_type: str) -> Dict[str, Callable]:
        menu_items = {}
        if item_type == 'track':
            menu_items["Edit Tags"] = lambda: self.edit_tags(item_id)
            menu_items["Edit Comments"] = lambda: self.edit_comments(item_id)
            menu_items["Remove"] = lambda: self.delete_track(item_id)
        elif item_type == 'playlist':
            menu_items["Remove"] = lambda: self.delete_playlist(item_id)
        return menu_items

    def play_audio(self, item_id: int):
        item = self.db.get_item_details(item_id)
        if item and item['type'] == 'track':
            track = Track.from_db_item(item)
            if track.path:
                if item_id in self.players:
                    # If the player already exists, bring it to the front
                    self.players[item_id].lift()
                else:
                    # Create a new TrackPlayer
                    player = TrackPlayer(self.view.players_frame, track.name, track.path, self)
                    player.pack(fill="x", pady=5)
                    self.players[item_id] = player
            else:
                self.view.show_error("Error", "Track file not found.")
        else:
            self.view.show_error("Error", "Track not found in database.")

    def edit_tags(self, item_id: int):
        item = self.db.get_item_details(item_id)
        if item:
            if item['type'] == 'track':
                track = Track.from_db_item(item)
                new_tags = self.view.ask_string("Edit Tags", "Enter new tags (comma-separated):", ','.join(track.tags))
            else:
                playlist = Playlist.from_db_item(item)
                new_tags = self.view.ask_string("Edit Tags", "Enter new tags (comma-separated):", ','.join(playlist.tags))
            
            if new_tags is not None:
                tags_list = [tag.strip().lower() for tag in new_tags.split(',') if tag.strip()]
                self.db.update_item_field(item_id, 'tags', tags_list)
                self.load_items()

    def edit_comments(self, item_id: int):
        item = self.db.get_item_details(item_id)
        if item and item['type'] == 'track':
            track = Track.from_db_item(item)
            new_comments = self.view.ask_string("Edit Comments", "Enter comments:", track.comments)
            if new_comments is not None:
                self.db.update_item_field(item_id, 'comments', new_comments)
                self.load_items()

    def delete_track(self, item_id: str):
        if self.view.ask_yes_no("Confirm Delete", "Are you sure you want to delete this track?"):
            self.db.delete_item(int(item_id))
            self.load_items()

    def delete_playlist(self, item_id: str):
        if self.view.ask_yes_no("Confirm Delete", "Are you sure you want to delete this playlist and all its contents?"):
            self.db.delete_item(int(item_id))
            self.load_items()

    def rename_playlist(self, item_id: str):
        current_name = self.view.tree.item(item_id, "text")
        new_name = self.view.ask_string("Rename Playlist", "Enter new name:", current_name)
        if new_name:
            self.db.update_item_field(int(item_id), 'name', new_name)
            self.load_items()

    def remove_player(self, track_name: str):
        for item_id, player in list(self.players.items()):
            if player.vm.track_name == track_name:
                del self.players[item_id]
                break