from src.repositories import UserRepository
from src.services import UserService


def get_user_service() -> UserService:
    return UserService(
        user_repository=UserRepository()
    )
