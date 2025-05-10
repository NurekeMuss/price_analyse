from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.constants.auth import reuseable_oauth
from src.core.db.database import get_db
from src.core.db.models import UserTable
from .user import get_user_service
from src.services import AuthService

from .jwt_manager import get_jwt_manager


# Factory to instantiate AuthService
def get_auth_service() -> AuthService:
    return AuthService(
        user_service=get_user_service(),
        jwt_manager=get_jwt_manager()
    )


# Dependency to fetch the current authenticated user
async def get_current_user(
    token: str = Depends(reuseable_oauth),
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
) -> UserTable:
    """
    Retrieve the current user based on the JWT token.
    """
    payload = await auth_service.jwt_manager.decode_and_validate_token(token)
    email = payload["sub"]

    # Delegate fetching user to UserService
    user = await auth_service.user_service.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# Role-based access control dependencies
async def admin_required(current_user: UserTable = Depends(get_current_user)):
    """
    Ensure the user has 'admin' privileges.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this resource",
        )
    return current_user