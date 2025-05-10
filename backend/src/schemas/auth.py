from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str | None = None


class AccessToken(BaseModel):
    token: str