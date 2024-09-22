from views.app_view import AppView
from viewmodels.app_vm import AppViewModel

import logging
import sys
import os

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

class AudioPlayerApp:
    def __init__(self, base_path: str):
        self.view = AppView()
        self.viewmodel = AppViewModel(base_path)
        self.viewmodel.set_view(self.view)
        self.viewmodel.load_items()

    def run(self):
        self.view.mainloop()

if __name__ == "__main__":
    if getattr(sys, 'frozen', False):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))

    app = AudioPlayerApp(base_path)
    app.run()