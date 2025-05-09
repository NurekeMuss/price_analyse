from src.core.db.models import ProductTable
from src.schemas import ProductCreate, ProductUpdate

from .base import RepositoryBase


class ProductRepository(RepositoryBase[ProductTable, ProductCreate, ProductUpdate]):
    def __init__(self):
        super().__init__(ProductTable)