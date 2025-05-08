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

class UserCreate(UserBase):
    pass

class UserUpdate(UserBase):
    email: EmailStr | None = None
    first_name: str | None = None
    last_name: str | None = None
    password_hash: str | None = None
    role: UserRole | None = None
    is_blocked: bool | None = None

class UserInDB(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True