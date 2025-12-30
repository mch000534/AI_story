"""
AI Story Backend - Security Utilities
"""
import base64
import os
from cryptography.fernet import Fernet
from .config import settings


def get_encryption_key() -> bytes:
    """Get or generate the encryption key from secret_key."""
    # Use the first 32 bytes of the secret key as the Fernet key
    key_bytes = settings.secret_key.encode()[:32].ljust(32, b'\0')
    return base64.urlsafe_b64encode(key_bytes)


def encrypt_api_key(api_key: str) -> str:
    """Encrypt an API key for secure storage."""
    if not api_key:
        return ""
    fernet = Fernet(get_encryption_key())
    encrypted = fernet.encrypt(api_key.encode())
    return encrypted.decode()


def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt an API key from storage."""
    if not encrypted_key:
        return ""
    try:
        fernet = Fernet(get_encryption_key())
        decrypted = fernet.decrypt(encrypted_key.encode())
        return decrypted.decode()
    except Exception:
        return ""
