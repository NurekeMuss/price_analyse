from src.core.db.models import UserTable
from src.schemas import UserCreate, UserInDB, UserUpdate

from .base import RepositoryBase


class UserRepository(RepositoryBase[UserTable, UserCreate, UserUpdate]):
    def __init__(self):
        super().__init__(UserTable)