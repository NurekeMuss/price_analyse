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


@router.post("/login", response_model=auth_schemas.TokenResponse)
async def login_user_route(
    request: Annotated[OAuth2PasswordRequestForm, Depends()],
    auth_service: AuthService = Depends(auth_dep.get_auth_service),
    db: AsyncSession = Depends(get_db),
):
    username = request.username
    password = request.password

    access_token, refresh_token, = await auth_service.authenticate_user(
        email=username,
        password=password,
        db=db
    )

    return auth_schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer"
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
