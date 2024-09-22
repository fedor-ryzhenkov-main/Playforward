import customtkinter as ctk
from tkinter import StringVar

class PlaceholderStringVar(StringVar):
    def __init__(self, master=None, value="", name=None):
        super().__init__(master, value, name)
        self._placeholder = ""

    def set_placeholder(self, placeholder):
        self._placeholder = placeholder

    def get(self):
        value = super().get()
        return "" if value == self._placeholder else value

class PlaceholderEntry(ctk.CTkEntry):
    def __init__(self, master, placeholder, *args, **kwargs):
        self.placeholder_var = PlaceholderStringVar(master)
        self.placeholder_var.set_placeholder(placeholder)
        super().__init__(master, textvariable=self.placeholder_var, *args, **kwargs)
        
        self.placeholder = placeholder
        self.placeholder_color = "gray"
        self.input_color = "black"  # Set this to a color that's visible on your background
        self.default_fg_color = self._fg_color

        self.bind("<FocusIn>", self._on_focus_in)
        self.bind("<FocusOut>", self._on_focus_out)
        self.bind("<KeyRelease>", self._on_key_release)

        self._on_focus_out()

    def _on_focus_in(self, event=None):
        if self.placeholder_var.get() == "":
            self.placeholder_var.set("")
            self.configure(text_color=self.input_color)

    def _on_focus_out(self, event=None):
        if self.placeholder_var.get() == "":
            self.placeholder_var.set(self.placeholder)
            self.configure(text_color=self.placeholder_color)
        else:
            self.configure(text_color=self.input_color)

    def _on_key_release(self, event=None):
        if self.placeholder_var.get() != "":
            self.configure(text_color=self.input_color)

    def get(self):
        return self.placeholder_var.get()