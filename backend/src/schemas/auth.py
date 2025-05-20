from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class Enable2FARequest(BaseModel):
    password: str


class Disable2FARequest(BaseModel):
    password: str
    code: str


class Enable2FAResponse(BaseModel):
    secret: str
    qr_code: str
    is_enabled: bool = False


class Verify2FARequest(BaseModel):
    code: str


class Verify2FAResponse(BaseModel):
    is_verified: bool


class LoginResponse(BaseModel):
    access_token: str | None = None
    refresh_token: str | None = None
    token_type: str | None = None
    requires_2fa: bool = False
    temporary_token: str | None = None


class Verify2FALoginRequest(BaseModel):
    temporary_token: str
    code: str