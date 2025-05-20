from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.logger import get_logger
from src.schemas import UserCreate, UserUpdate
from src.services import UserService
from .jwt_manager import JWTManager
from src.utils import TOTPManager


logger = get_logger(__name__)


class AuthService:
    def __init__(
        self,
        user_service: UserService,
        jwt_manager: JWTManager,
    ):
        self.user_service = user_service
        self.jwt_manager = jwt_manager
        self.totp_manager = TOTPManager()

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
        Authenticate user and return tokens or temporary token if 2FA is enabled.
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
            
        if user.is_blocked:
            logger.info(f"User {user.email} is blocked")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is blocked"
            )
            
        # If 2FA is enabled, return a temporary token
        if user.is_2fa_enabled:
            # Create a temporary token with a short lifetime
            temp_payload = {
                "sub": user.email,
                "id": user.id,
                "temp_auth": True,
                "exp": 60 * 5  # 5 minutes expiry
            }
            temporary_token = await self.jwt_manager.create_token(temp_payload)
            return {
                "requires_2fa": True,
                "temporary_token": temporary_token
            }
            
        # If 2FA is not enabled, proceed with normal authentication
        tokens = await self.jwt_manager.generate_tokens(user)
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
    
    async def enable_2fa(self, user_id: int, password: str, db: AsyncSession):
        """Generate a new 2FA secret for a user"""
        user = await self.user_service.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if not self.user_service.password_manager.verify_password(password, user.password_hash):
            raise HTTPException(status_code=400, detail="Invalid password")
            
        secret = self.totp_manager.generate_secret()
        qr_code = self.totp_manager.generate_qr_code(secret, user.email)
        
        # Store the secret temporarily until verification
        # In a real-world scenario, you might want to encrypt this or store in a temporary storage
        await self.user_service.update_user(
            db=db, 
            user_id=user.id, 
            user_update=UserUpdate(totp_secret=secret)
        )
        
        return {
            "secret": secret,
            "qr_code": qr_code,
            "is_enabled": False
        }


    async def verify_2fa_setup(self, user_id: int, code: str, db: AsyncSession):
        """Verify and enable 2FA for a user"""
        user = await self.user_service.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if not user.totp_secret:
            raise HTTPException(status_code=400, detail="2FA not initialized")
            
        if not self.totp_manager.verify_totp(user.totp_secret, code):
            raise HTTPException(status_code=400, detail="Invalid 2FA code")
            
        # Enable 2FA for the user
        await self.user_service.update_user(
            db=db, 
            user_id=user.id, 
            user_update=UserUpdate(is_2fa_enabled=True)
        )
        
        return {"is_verified": True}


    async def disable_2fa(self, user_id: int, password: str, code: str, db: AsyncSession):
        """Disable 2FA for a user"""
        user = await self.user_service.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if not user.is_2fa_enabled:
            raise HTTPException(status_code=400, detail="2FA not enabled")
            
        if not self.user_service.password_manager.verify_password(password, user.password_hash):
            raise HTTPException(status_code=400, detail="Invalid password")
            
        if not self.totp_manager.verify_totp(user.totp_secret, code):
            raise HTTPException(status_code=400, detail="Invalid 2FA code")
            
        # Disable 2FA for the user
        await self.user_service.update_user(
            db=db, 
            user_id=user.id, 
            user_update=UserUpdate(is_2fa_enabled=False, totp_secret=None)
        )
        
        return {"message": "2FA disabled successfully"}


    async def verify_2fa_login(self, temporary_token: str, code: str, db: AsyncSession):
        """Verify 2FA code during login"""
        try:
            payload = await self.jwt_manager.decode_token(temporary_token)
            
            # Check if this is a temporary token
            if not payload.get("temp_auth"):
                raise HTTPException(status_code=400, detail="Invalid token type")
                
            user_id = payload.get("id")
            user = await self.user_service.get_user_by_id(db, user_id)
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
                
            if not user.is_2fa_enabled or not user.totp_secret:
                raise HTTPException(status_code=400, detail="2FA not enabled for this user")
                
            # Verify the code
            if not self.totp_manager.verify_totp(user.totp_secret, code):
                raise HTTPException(status_code=400, detail="Invalid 2FA code")
                
            # Generate regular tokens
            tokens = await self.jwt_manager.generate_tokens(user)
            return tokens
            
        except Exception as e:
            logger.error(f"Error verifying 2FA login: {e}")
            raise HTTPException(status_code=400, detail="Invalid or expired token")

    async def logout(self, token: str):
        return {"message": "Logged out successfully"}
