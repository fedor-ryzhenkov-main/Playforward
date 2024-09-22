import tkinter as tk
from tkinter import ttk
from tkinter import filedialog
import customtkinter as ctk
from typing import Callable, Dict, Any, List, Optional, Union
from models.track import Track
from models.playlist import Playlist
from .placeholder import PlaceholderEntry

class AppView(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Audio Manager")
        self.geometry("1200x800")
        
        self.search_name_var: tk.StringVar = tk.StringVar()
        self.search_tags_var: tk.StringVar = tk.StringVar()
        self.tree: Optional[ttk.Treeview] = None
        self.players_frame: Optional[ctk.CTkFrame] = None
        self.dynamic_buttons_frame: Optional[ctk.CTkFrame] = None

        self._setup_ui()
        self._setup_custom_style()

    def _setup_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self.main_frame = ctk.CTkFrame(self)
        self.main_frame.grid(row=0, column=0, sticky="nsew", padx=20, pady=20)
        self.main_frame.grid_columnconfigure(0, weight=1)
        self.main_frame.grid_rowconfigure(1, weight=1)

        self._setup_tree()
        self._setup_controls()
        self._setup_players_frame()

    def _setup_controls(self):
        controls_frame = ctk.CTkFrame(self.main_frame)
        controls_frame.grid(row=0, column=0, sticky="ew", pady=(0, 10))
        controls_frame.grid_columnconfigure(3, weight=1)

        self.upload_button = ctk.CTkButton(controls_frame, text="Upload Tracks")
        self.upload_button.grid(row=0, column=0, padx=5)
        
        self.create_playlist_button = ctk.CTkButton(controls_frame, text="Create Playlist")
        self.create_playlist_button.grid(row=0, column=1, padx=5)
        
        self.youtube_button = ctk.CTkButton(controls_frame, text="Download from YouTube")
        self.youtube_button.grid(row=0, column=2, padx=5)
        
        self._setup_search_fields(controls_frame)

    def _setup_search_fields(self, parent: ctk.CTkFrame):
        self.search_name_entry = PlaceholderEntry(parent, placeholder="Search by name", width=200)
        self.search_name_entry.grid(row=0, column=4, padx=5)
        self.search_name_var = self.search_name_entry.placeholder_var

        self.search_tags_entry = PlaceholderEntry(parent, placeholder="Search by tags", width=200)
        self.search_tags_entry.grid(row=0, column=5, padx=5)
        self.search_tags_var = self.search_tags_entry.placeholder_var

    def _setup_entry_placeholder(self, entry: ctk.CTkEntry, placeholder: str):
        entry.bind("<FocusIn>", lambda e: self._on_entry_focus_in(e, placeholder))
        entry.bind("<FocusOut>", lambda e: self._on_entry_focus_out(e, placeholder))
        self._on_entry_focus_out(None, placeholder, entry=entry)

    def _setup_tree(self):
        self.tree_frame = ctk.CTkFrame(self.main_frame)
        self.tree_frame.grid(row=1, column=0, sticky="nsew")
        self.tree_frame.grid_columnconfigure(0, weight=1)
        self.tree_frame.grid_rowconfigure(0, weight=1)

        self.tree = ttk.Treeview(self.tree_frame, columns=("tags",), show="tree headings")
        self.tree.heading("#0", text="Name")
        self.tree.heading("tags", text="Tags")
        self.tree.column("tags", width=200)
        self.tree.grid(row=0, column=0, sticky="nsew")
        
        self.tree.tag_configure("Playlist.Treeview.Item", font=('TkDefaultFont', 12, 'bold'))
        self.tree.tag_configure("Track.Treeview.Item", font=('TkDefaultFont', 12, 'normal'))

        self._setup_tree_scrollbar()
        self._setup_dynamic_buttons()

    def _setup_tree_scrollbar(self):
        self.tree_scrollbar = ttk.Scrollbar(self.tree_frame, orient="vertical", command=self.tree.yview)
        self.tree_scrollbar.grid(row=0, column=1, sticky="ns")
        self.tree.configure(yscrollcommand=self.tree_scrollbar.set)

    def _setup_dynamic_buttons(self):
        self.dynamic_buttons_frame = ctk.CTkFrame(self.tree_frame)
        self.dynamic_buttons_frame.grid(row=1, column=0, columnspan=2, sticky="ew", pady=(5, 0))

    def _setup_players_frame(self):
        self.players_frame = ctk.CTkFrame(self.main_frame)
        self.players_frame.grid(row=2, column=0, sticky="ew", pady=10)

    def _setup_custom_style(self):
        style = ttk.Style()
        style.theme_use('default')
        style.configure("Treeview", background="#2a2d2e", foreground="white", rowheight=25, fieldbackground="#343638")
        style.map('Treeview', background=[('selected', '#22559b')])
        style.configure("Treeview.Heading", background="#565b5e", foreground="white", relief="flat")
        style.map("Treeview.Heading", background=[('active', '#3484F0')])

    def _on_entry_focus_in(self, event, placeholder):
        widget = event.widget if event else None
        if widget and widget.get() == placeholder:
            widget.delete(0, tk.END)
            if isinstance(widget, ctk.CTkEntry):
                widget.configure(text_color=("gray10", "gray90"))
            else:
                widget.config(fg="black")

    def _on_entry_focus_out(self, event, placeholder, entry=None):
        widget = event.widget if event else entry
        if widget and not widget.get():
            widget.insert(0, placeholder)
            if isinstance(widget, ctk.CTkEntry):
                widget.configure(text_color="gray")
            else:
                widget.config(fg="gray")

    def _on_entry_focus_out(self, event, placeholder, entry=None):
        widget = event.widget if event else entry
        if not widget.get():
            widget.insert(0, placeholder)
            widget.configure(text_color="gray")

    def set_upload_command(self, command: Callable):
        self.upload_button.configure(command=command)

    def set_create_playlist_command(self, command: Callable):
        self.create_playlist_button.configure(command=command)

    def set_youtube_download_command(self, command: Callable):
        self.youtube_button.configure(command=command)

    def set_tree_double_click_handler(self, handler: Callable):
        self.tree.bind("<Double-1>", handler)

    def set_tree_select_handler(self, handler: Callable):
        self.tree.bind("<<TreeviewSelect>>", handler)

    def set_tree_right_click_handler(self, handler: Callable):
        self.tree.bind("<Button-3>", handler)

    def set_search_handler(self, handler: Callable):
        self.search_name_var.trace("w", handler)
        self.search_tags_var.trace("w", handler)

    def update_tree(self, items: List[Union[Track, Playlist]]):
        self.tree.delete(*self.tree.get_children())
        self._insert_items(items)

    def _insert_items(self, items: List[Union[Track, Playlist]], parent: str = ''):
        for item in items:
            if isinstance(item, Playlist):
                playlist_id = self.tree.insert(parent, 'end', iid=str(item.id), text=item.name, 
                                               values=(', '.join(item.tags),), tags=('playlist',))
                self._insert_items(item.children, playlist_id)
            elif isinstance(item, Track):
                self.tree.insert(parent, 'end', iid=str(item.id), text=item.name, 
                                 values=(', '.join(item.tags),), tags=('track',))

    def update_dynamic_buttons(self, selected_items):
        # Clear existing buttons
        for widget in self.dynamic_buttons_frame.winfo_children():
            widget.destroy()

        if len(selected_items) == 1:
            item_id = int(selected_items[0])
            item_type = self.tree.item(item_id, "tags")[0]

            if item_type == "track":
                play_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Play", command=lambda: self.play_audio(item_id))
                play_button.pack(side="left", padx=5)
                
                edit_tags_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Edit Tags", command=lambda: self.edit_tags(item_id))
                edit_tags_button.pack(side="left", padx=5)
                
                edit_comments_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Edit Comments", command=lambda: self.edit_comments(item_id))
                edit_comments_button.pack(side="left", padx=5)
                
                remove_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Remove", command=lambda: self.remove_track(item_id))
                remove_button.pack(side="left", padx=5)

            elif item_type == "playlist":
                rename_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Rename", command=lambda: self.rename_playlist(item_id))
                rename_button.pack(side="left", padx=5)
                
                remove_button = ctk.CTkButton(self.dynamic_buttons_frame, text="Remove", command=lambda: self.remove_playlist(item_id))
                remove_button.pack(side="left", padx=5)

    def show_error(self, title: str, message: str):
        tk.messagebox.showerror(title, message)

    def show_info(self, title: str, message: str):
        tk.messagebox.showinfo(title, message)

    def ask_yes_no(self, title: str, message: str) -> bool:
        return tk.messagebox.askyesno(title, message)

    def ask_string(self, title: str, prompt: str, initial_value: str = "") -> Optional[str]:
        return tk.simpledialog.askstring(title, prompt, initialvalue=initial_value)

    def create_context_menu(self, commands: Dict[str, Callable]):
        menu = tk.Menu(self, tearoff=0)
        for label, command in commands.items():
            menu.add_command(label=label, command=command)
        return menu

    def show_context_menu(self, menu: tk.Menu, event):
        menu.tk_popup(event.x_root, event.y_root)

    def ask_open_filenames(self, **options):
        return filedialog.askopenfilenames(**options)
