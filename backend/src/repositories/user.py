from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.core.db.models import UserTable
from src.schemas import UserCreate, UserInDB, UserUpdate

from .base import RepositoryBase


class UserRepository(RepositoryBase[UserTable, UserCreate, UserUpdate]):
    def __init__(self):
        super().__init__(UserTable)

    async def get_by_email(
        self,
        db: AsyncSession,
        email: str,
    ) -> UserInDB | None:
        """
        Get a user by email.
        """
        result = await db.execute(
            select(self.model).where(self.model.email == email)
        )
        return result.scalars().first()