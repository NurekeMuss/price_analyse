from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.logger import get_logger
from src.schemas import UserCreate
from src.services import UserService
from .utils.jwt_service import JWTManager
logger = get_logger(__name__)


class AuthService:
    def __init__(
        self,
        user_service: UserService,
        jwt_manager: JWTManager,
    ):
        self.user_service = user_service
        self.jwt_manager = jwt_manager

    async def register_user(
            self, 
            user_create: UserCreate, 
            db: AsyncSession
        ):
        """
        Register a new user with optional referral logic.
        """
        logger.debug(f"Registering user: {user_create}")

        user = await self.user_service.create_user(db=db, user=user_create)
        tokens = await self.jwt_manager.generate_tokens(user)

        return tokens

    async def authenticate_user(
            self, 
            email: str, 
            password: str, 
            db: AsyncSession
        ):
        """
        Authenticate user and return tokens or error response.
        """
        user = await self.user_service.get_user_by_email(db, email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incorrect email"
            )
        
        if not self.user_service.password_manager.verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password"
            )
        tokens = await self.jwt_manager.generate_tokens(user)
        if user.is_blocked:
            logger.info(f"User {user.email} is blocked")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is blocked"
            )

        return tokens

    async def verify_refresh_token(self, token: str):
        """
        Verify refresh token and issue new tokens.
        """
        logger.debug(f"Verifying refresh token: {token}")
        payload = await self.jwt_manager.decode_token(token)
        return await self.jwt_manager.generate_tokens_from_payload(payload)

    # async def process_change_password_request(self, email: str, db: AsyncSession):
    #     """
    #     Send recovery email for password reset.
    #     """
    #     logger.debug(f"Processing change password request for email: {email}")
    #     user_data = await self.user_service.get_user_by_email(db, email)
    #     if not user_data:
    #         raise HTTPException(status_code=404, detail="User not found")

    #     user_data_dict = {
    #         "id": user_data.id,
    #         "email": user_data.email,
    #         "status_role": user_data.status_role,
    #     }

    # async def process_change_password(
    #     self, recovery_token: str, new_password: str, db: AsyncSession
    # ):
    #     """
    #     Change user password after recovery token verification.
    #     """
    #     logger.debug(f"Processing password change with recovery token: {recovery_token}")
    #     payload = await self.jwt_manager.decode_token(recovery_token)
    #     user = await self.user_service.get_user(db, payload["id"])
    #     hashed_password = self.password_manager.hash_password(new_password)
    #     await self.user_service.update_user(
    #         db=db, 
    #         db_obj=user,
    #         user_data={"password_hash": hashed_password}
    #     )
    #     return await self.jwt_manager.generate_tokens(user)
    
    
    async def verify_account(self, token: str, db: AsyncSession):
        payload = await self.jwt_manager.decode_token(token)
        user_id = payload.get("id")
        username = payload.get("sub")
        status_role = payload.get("role")
        
        data = {
            "sub": username,
            "id": user_id,
            "role": status_role,
        }
        
        user = await self.user_service.get_user_by_id(db, user_id)
        await self.user_service.update_user(db=db, db_obj=user, user_data={"blocked": False})
        
        return await self.jwt_manager.generate_tokens_from_payload(data)
    
    async def logout(self, token: str):
        return {"message": "Logged out successfully"}   