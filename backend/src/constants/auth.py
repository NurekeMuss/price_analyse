from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, status, WebSocket

reuseable_oauth = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
)


async def reuseable_oauth_websocket(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token missing"
        )
    return token
