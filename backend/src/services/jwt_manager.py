from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, status
from pydantic import ValidationError
from src.core.logger import get_logger
from src.core.db.models import UserTable


logger = get_logger(__name__)


class JWTManager:
    def __init__(self, secret_key: str, algorithm: str, access_expiry: int, refresh_expiry: int):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_expiry = access_expiry
        self.refresh_expiry = refresh_expiry

    async def create_token(self, data: dict, expires_delta: timedelta = timedelta(hours=1)) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + expires_delta
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    async def generate_tokens(self, user: UserTable) -> tuple:
        data = {
            "sub": user.email,
            "id": user.id,
            "role": user.role,
        }
        return (
            await self.create_token(data, timedelta(minutes=self.access_expiry)),
            await self.create_token(data, timedelta(minutes=self.refresh_expiry)),
        )

    async def generate_tokens_from_payload(self, payload: dict) -> tuple:
        return (
            await self.create_token(payload, timedelta(minutes=self.access_expiry)),
            await self.create_token(payload, timedelta(minutes=self.refresh_expiry)),
        )

    async def decode_token(self, token: str) -> dict:
        try:
            return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=403, detail="Invalid token")

    async def decode_and_validate_token(self, token: str) -> dict:
        """
        Decode the token and validate its payload.
        """
        try:
            payload = await self.decode_token(token)  # Existing decode logic
            email = payload.get("sub")
            if not email:
                raise ValueError("Invalid token payload: Missing 'sub'")
            return payload
        except (jwt.PyJWTError, ValidationError) as e:
            logger.error(f"Token validation error: {e}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
