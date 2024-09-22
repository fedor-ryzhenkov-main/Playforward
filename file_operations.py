import os
import shutil
from tkinter import filedialog, simpledialog

from audio_utils import normalize_audio
from database.database import add_item, add_track


def upload_files(self) -> None:
    """Upload audio files and add them to the database."""
    files = filedialog.askopenfilenames(filetypes=[("Audio Files", "*.mp3 *.wav *.ogg")])
    if files:
        for file in files:
            name = os.path.basename(file)
            dest_path = os.path.join(self.base_path, 'uploads', name)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            shutil.copy2(file, dest_path)
            normalized_path = normalize_audio(dest_path, self.base_path)
            
            comments = simpledialog.askstring("Add Comments", f"Enter comments for {name}:", parent=self)
            
            track_id = add_track(self.conn, name, dest_path, normalized_path, "", comments)
            add_item(self.conn, name, 'track', None, track_id)
        self._load_items()