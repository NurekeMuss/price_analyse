from sqlalchemy import Boolean, Column, String

from .base import TableBase


class UserTable(TableBase):
    __tablename__ = "user"

    email = Column(String(50), unique=True, index=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    password_hash = Column(String(256))
    role = Column(String(10))  # admin or user
    is_blocked = Column(Boolean, default=False)
    is_2fa_enabled = Column(Boolean, default=False, nullable=False)
    totp_secret = Column(String, nullable=True)
