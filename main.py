import tkinter as tk
from audio_player_app import AudioPlayerApp
import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

if __name__ == "__main__":
    app = AudioPlayerApp()
    app.mainloop()