from datetime import datetime

from pydantic import BaseModel, EmailStr, Field
from src.enums import UserRole


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password_hash: str
    role: UserRole = Field(default=UserRole.user)
    is_blocked: bool = Field(default=False)
    is_2fa_enabled: bool = Field(default=False)


class UserCreate(UserBase):
    password_hash: str
    is_2fa_enabled: bool = False


class UserUpdate(UserBase):
    email: EmailStr | None = None
    first_name: str | None = None
    last_name: str | None = None
    password_hash: str | None = None
    role: UserRole | None = None
    is_blocked: bool | None = None
    is_2fa_enabled: bool | None = None
    totp_secret: str | None = None


class UserInDB(UserBase):
    id: int
    created_at: datetime
    totp_secret: str | None = None

    class Config:
        orm_mode = True