from src.repositories import ProductRepository
from src.services import ProductService


def get_product_service() -> ProductService:
    return ProductService(product_repository=ProductRepository())
