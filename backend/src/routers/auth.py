import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from src.schemas import UserCreate
from src.schemas import auth as auth_schemas
from src.services import AuthService
from src.core.db.database import get_db

from src.dependencies import auth as auth_dep

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=auth_schemas.TokenResponse,
)
async def register_user_route(
    request: UserCreate,
    auth_service: AuthService = Depends(auth_dep.get_auth_service),
    db: AsyncSession = Depends(get_db)
):
    logging.debug(f"register route: {request}")
    access_token, refresh_token = await auth_service.register_user(
        user_create=request,
        db=db
    )

    return auth_schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer"
    )


@router.post("/login", response_model=auth_schemas.LoginResponse)
async def login_user_route(
    request: Annotated[OAuth2PasswordRequestForm, Depends()],
    auth_service: AuthService = Depends(auth_dep.get_auth_service),
    db: AsyncSession = Depends(get_db),
):
    """Login user and handle 2FA if enabled"""
    result = await auth_service.authenticate_user(
        email=request.username,
        password=request.password,
        db=db
    )

    if isinstance(result, dict) and result.get("requires_2fa"):
        return auth_schemas.LoginResponse(
            requires_2fa=True,
            temporary_token=result["temporary_token"]
        )

    access_token, refresh_token = result
    return auth_schemas.LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer",
        requires_2fa=False
    )


@router.post("/refresh", response_model=auth_schemas.TokenResponse)
async def refresh_token_route(
    request: Request,
    auth_service: AuthService = Depends(auth_dep.get_auth_service),
    auth=Depends(auth_dep.get_current_user)
):
    refresh_token = request.headers.get("Authorization").split(" ")[1]
    access_token, refresh_token = await auth_service.verify_refresh_token(refresh_token)

    return auth_schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer"
    )


@router.post(
    "/logout",
)
async def logout_user_route(
    request: Request,
    auth_service: AuthService = Depends(auth_dep.get_auth_service),
    auth=Depends(auth_dep.get_current_user)
) -> JSONResponse:
    token = request.headers.get("Authorization").split(" ")[1]  # noqa: F841
    return JSONResponse(status_code=200, content={"message": "Logged out successfully"})


@router.post("/2fa/enable", response_model=auth_schemas.Enable2FAResponse)
async def enable_2fa_route(
    request: auth_schemas.Enable2FARequest,
    auth_service: AuthService = Depends(auth_dep.get_auth_service),
    db: AsyncSession = Depends(get_db),
    auth=Depends(auth_dep.get_current_user)
):
    """Generate 2FA secret and QR code for setup"""
    return await auth_service.enable_2fa(
        user_id=auth.id,
        password=request.password,
        db=db
    )


@router.post("/2fa/verify", response_model=auth_schemas.Verify2FAResponse)
async def verify_2fa_setup_route(
    request: auth_schemas.Verify2FARequest,
    auth_service: AuthService = Depends(auth_dep.get_auth_service),
    db: AsyncSession = Depends(get_db),
    auth=Depends(auth_dep.get_current_user)
):
    """Verify and enable 2FA for a user"""
    return await auth_service.verify_2fa_setup(
        user_id=auth.id,
        code=request.code,
        db=db
    )


@router.post("/2fa/disable")
async def disable_2fa_route(
    request: auth_schemas.Disable2FARequest,
    auth_service: AuthService = Depends(auth_dep.get_auth_service),
    db: AsyncSession = Depends(get_db),
    auth=Depends(auth_dep.get_current_user)
):
    """Disable 2FA for a user"""
    return await auth_service.disable_2fa(
        user_id=auth.id,
        password=request.password,
        code=request.code,
        db=db
    )


@router.post("/2fa/verify-login", response_model=auth_schemas.TokenResponse)
async def verify_2fa_login_route(
    request: auth_schemas.Verify2FALoginRequest,
    auth_service: AuthService = Depends(auth_dep.get_auth_service),
    db: AsyncSession = Depends(get_db),
):
    """Verify 2FA code during login"""
    access_token, refresh_token = await auth_service.verify_2fa_login(
        temporary_token=request.temporary_token,
        code=request.code,
        db=db
    )
    
    return auth_schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer"
    )