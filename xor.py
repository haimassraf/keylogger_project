# Encrypt a file using XOR
class Xor:
    def xor_encrypt_file(input_file, output_file, key):
        key = key.encode()  # המרת המפתח ל-bytes
        with open(input_file, "rb") as file:
            data = file.read()
        encrypted_data = bytes([a ^ b for a, b in zip(data, key * (len(data) // len(key)) + key[:len(data) % len(key)])])
        with open(output_file, "wb") as file:
            file.write(encrypted_data)

    # Decrypt a file using XOR
    def xor_decrypt_file(input_file, output_file, key):
        key = key.encode()  # המרת המפתח ל-bytes
        with open(input_file, 'rb') as file:
            data = file.read()
        decrypted_data = bytes([a ^ b for a, b in zip(data, key * (len(data) // len(key)) + key[:len(data) % len(key)])])
        with open(output_file, 'wb') as file:
            file.write(decrypted_data)

# Usage example
input_file = r"C:\Users\HP\Desktop\python\keylogger_project/test.txt.txt"
output_encrypted_file = "encrypted_output.txt"
output_decrypted_file = "decrypted_output.txt"
key = "secretkey123"

# Encrypt the file
xor=Xor
xor.xor_encrypt_file(input_file, output_encrypted_file, key)

# Decrypt the file
xor.xor_decrypt_file(output_encrypted_file, output_decrypted_file, key)


