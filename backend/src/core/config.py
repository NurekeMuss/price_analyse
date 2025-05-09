import os
from dotenv import load_dotenv


load_dotenv()


class BackendConfig:

    DEBUG = os.getenv("DEBUG", False) == "TRUE"
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS").split(",")
    SECRET_KEY = os.getenv("SECRET_KEY", "test_key")

def get_backend_config() -> BackendConfig:
    """
    Returns the backend configuration.
    """
    return BackendConfig()