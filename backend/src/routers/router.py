# from .product import router as product_router
from fastapi import APIRouter

from .user import router as user_router

router = APIRouter()


router.include_router(user_router)
