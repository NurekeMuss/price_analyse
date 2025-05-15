import os
from dotenv import load_dotenv


load_dotenv()


class BackendConfig:

    DEBUG = os.getenv("DEBUG", False) == "TRUE"
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS").split(",")

    SECRET_KEY = os.getenv("SECRET_KEY", 'fijofnwqoniuweqfnoo')
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 week
    REFRESH_TOKEN_EXPIRE_MINUTES = 1440  # 1 day


def get_backend_config() -> BackendConfig:
    """
    Returns the backend configuration.
    """
    return BackendConfig()
