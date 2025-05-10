from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.db.database import get_db
from src.dependencies.user import get_user_service
from src.schemas import UserCreate, UserInDB, UserUpdate
from src.services import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserInDB)
async def create_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
) -> UserInDB:
    """
    Create a new user.
    """
    return await user_service.create_user(db=db, user=user)

@router.get("/", response_model=list[UserInDB])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
) -> list[UserInDB]:
    """
    Retrieve all users with pagination.
    """
    return await user_service.get_all_users(db=db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserInDB)
async def get_user_by_id(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
) -> UserInDB:
    """
    Retrieve a user by ID.
    """
    return await user_service.get_user_by_id(db=db, user_id=user_id)

@router.put("/{user_id}", response_model=UserInDB)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
) -> UserInDB:
    """
    Update user information.
    """
    return await user_service.update_user(db=db, user_id=user_id, user_update=user_update)

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
) -> None:
    """
    Delete a user.
    """
    await user_service.delete_user(db=db, user_id=user_id)
    return {"message": "User deleted successfully"}