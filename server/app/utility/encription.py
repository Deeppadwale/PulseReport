from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64
import json
import os

AES_SECRET_KEY = os.environ.get("AES_SECRET_KEY", "12345678901234567890123456789012")

def encrypt_user_data(data: dict) -> str:
    """Encrypt user data using AES (CBC) compatible with CryptoJS"""
    key = AES_SECRET_KEY.encode()
    iv = AES_SECRET_KEY[:16].encode()
    raw = json.dumps(data).encode()
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ct_bytes = cipher.encrypt(pad(raw, AES.block_size))
    return base64.b64encode(ct_bytes).decode()

def decrypt_user_data(encrypted_str: str) -> dict:
    """Decrypt AES-encrypted user data"""
    try:
        key = AES_SECRET_KEY.encode()
        iv = AES_SECRET_KEY[:16].encode()
        ct = base64.b64decode(encrypted_str)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        pt = unpad(cipher.decrypt(ct), AES.block_size)
        return json.loads(pt.decode())
    except Exception:
        return None
