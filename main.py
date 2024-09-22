import tkinter as tk
from audio_player_app import AudioPlayerApp
import logging
import sys
import os



if __name__ == "__main__":
    logging.debug("initializing app")
    app = AudioPlayerApp(base_path)
    app.mainloop()