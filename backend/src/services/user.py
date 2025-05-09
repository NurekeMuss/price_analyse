from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.logger import get_logger
from src.repositories import UserRepository
from src.schemas import UserCreate, UserInDB, UserUpdate
from src.utils import PasswordManager

logger = get_logger(__name__)


class UserService:
    def __init__(
        self, 
        user_repository: UserRepository,
    ):
        self.user_repository = user_repository
        self.password_manager = PasswordManager()

    async def create_user(self, db: AsyncSession, user: UserCreate) -> UserInDB:
        """
        Create a new user in the database.
        """
        if await self.get_user_by_email(db, user.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        user.password_hash = self.password_manager.hash_password(user.password_hash)
        user_in_db = await self.user_repository.create(db=db, obj_in=user)
        return user_in_db
    
    async def update_user(self, db: AsyncSession, user_id: int, user_update: UserUpdate) -> UserInDB:
        """
        Update user information in the database.
        """
        logger.info(f"Updating user with data: {user_update}")
        if user_update.password_hash:
            user_update.password_hash = self.password_manager.hash_password(user_update.password_hash)
        
        user = await self.user_repository.get(db=db, id=user_id)
        updated_user = await self.user_repository.update(db=db, db_obj=user, obj_in=user_update)
        return updated_user
    
    async def delete_user(self, db: AsyncSession, user_id: int) -> None:
        """
        Delete a user from the database.
        """
        user = await self.user_repository.get(db=db, id=user_id)
        await self.user_repository.remove(db=db, id=user.id)

    async def get_all_users(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> list[UserInDB]:
        """
        Retrieve all users from the database with pagination.
        """
        users = await self.user_repository.get_multi(db=db, skip=skip, limit=limit)
        return users
    
    async def get_user_by_id(self, db: AsyncSession, user_id: int) -> UserInDB:
        """
        Retrieve a user by ID.
        """
        user = await self.user_repository.get(db=db, id=user_id)
        return user
    
    async def get_user_by_email(self, db: AsyncSession, email: str) -> UserInDB:
        """
        Retrieve a user by email.
        """
        user = await self.user_repository.get_by_email(db=db, email=email)
        return user
    