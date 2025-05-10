from src.core.config import get_backend_config
from src.services import JWTManager


def get_jwt_manager() -> JWTManager:
    auth_settings = get_backend_config()
    return JWTManager(
        secret_key=auth_settings.SECRET_KEY,  # Use your ENV configuration
        algorithm=auth_settings.ALGORITHM,
        access_expiry=auth_settings.ACCESS_TOKEN_EXPIRE_MINUTES,  # Access token expiry in minutes
        refresh_expiry=auth_settings.REFRESH_TOKEN_EXPIRE_MINUTES  # Refresh token expiry in minutes
    )