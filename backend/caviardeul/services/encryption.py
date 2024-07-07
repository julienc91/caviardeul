from cryptography.fernet import Fernet


def generate_encryption_key() -> str:
    return Fernet.generate_key().decode()


def encrypt_data(data: str, key: str) -> str:
    fernet = Fernet(key.encode())
    encrypted_data = fernet.encrypt(data.encode())
    return encrypted_data.decode()


def decrypt_data(data: str, key: str) -> str:
    fernet = Fernet(key.encode())
    return fernet.decrypt(data.encode()).decode()
