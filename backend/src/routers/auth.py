import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from src.schemas import UserCreate
from src.schemas import TokenResponse
from src.services import AuthService
from src.core.db.database import get_db

from src.dependencies import get_current_user as auth_get_current_user
from src.dependecies import get_auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post(
    "/register", 
    response_model=TokenResponse, 
)
async def register_user_route(
    http_request: Request,
    request: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    logging.debug(f"register route: {request}")
    client_host = http_request.client.host
    user_agent = http_request.headers.get("User-Agent", "Unknown")
    access_token, refresh_token = await auth_service.register_user(
        user_create=request,
        db=db,
        ip_address=client_host,
        device_info=user_agent
    )
      
    return TokenResponse(access_token=access_token,
                         refresh_token=refresh_token, 
                         token_type="Bearer"
                        )

    

@router.post("/login", response_model=TokenResponse)
async def login_user_route(
    http_request: Request,
    request: Annotated[OAuth2PasswordRequestForm, Depends()],
    auth_service: AuthService = Depends(get_auth_service),
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    username = request.username
    password = request.password
    client_host = http_request.client.host
    user_agent = http_request.headers.get("User-Agent", "Unknown")

    access_token, refresh_token, = await auth_service.authenticate_user(
        username=username,
        password=password,
        db=db,
        ip_address=client_host,
        device_info=user_agent
    )
    
    
    return TokenResponse(access_token=access_token, 
                         refresh_token=refresh_token, 
                         token_type="Bearer"
                         )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_route(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
    auth = Depends(auth_get_current_user)
) -> TokenResponse:
    refresh_token = request.headers.get("Authorization").split(" ")[1]
    access_token, refresh_token = await auth_service.verify_refresh_token(refresh_token)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer"
    )

@router.post(
    "/logout", 
)
async def logout_user_route(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
    auth = Depends(auth_get_current_user)
) -> JSONResponse:
    token = request.headers.get("Authorization").split(" ")[1]
    await auth_service.logout(token)
    return JSONResponse(status_code=200, content={"message": "Logged out successfully"})