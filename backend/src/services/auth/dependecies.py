from .service import AuthService
from .utils.jwt_service import JWTManager
from src.modules.user.dependencies import get_user_service
from .config import auth_settings

# Instantiate shared utility instances
def get_jwt_manager() -> JWTManager:
    return JWTManager(
        secret_key=auth_settings.SECRET_KEY,  # Use your ENV configuration
        algorithm=auth_settings.ALGORITHM,
        access_expiry=auth_settings.ACCESS_TOKEN_EXPIRE_MINUTES,  # Access token expiry in minutes
        refresh_expiry=auth_settings.REFRESH_TOKEN_EXPIRE_MINUTES  # Refresh token expiry in minutes
    )


# Factory to instantiate AuthService
def get_auth_service() -> AuthService:
    return AuthService(
        user_service=get_user_service(),
        jwt_manager=get_jwt_manager()
    )