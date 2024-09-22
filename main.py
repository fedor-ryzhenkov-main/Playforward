import tkinter as tk
from audio_player_app import AudioPlayerApp
import logging
import sys
import os

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
else:
    base_path = os.path.dirname(os.path.abspath(__file__))

if __name__ == "__main__":
    app = AudioPlayerApp(base_path)
    app.mainloop()