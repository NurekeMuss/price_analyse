from enum import Enum

class UserRole(Enum):
    user = "user"
    admin = "admin"

    def __str__(self) -> str:
        return self.value