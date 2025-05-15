from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from src.repositories import ProductRepository
from src.schemas import ProductCreate, ProductInDB, ProductUpdate


class ProductService:
    def __init__(self, product_repository: ProductRepository):
        self.product_repository = product_repository

    async def create_product(self, db: AsyncSession, product: ProductCreate) -> ProductInDB:
        """
        Create a new product in the database.
        """
        product_in_db = await self.product_repository.create(db=db, obj_in=product)
        return product_in_db

    async def update_product(self, db: AsyncSession, product_id: int, product_update: ProductUpdate) -> ProductInDB:
        """
        Update product information in the database.
        """
        product = await self.product_repository.get(db=db, id=product_id)
        updated_product = await self.product_repository.update(db=db, db_obj=product, obj_in=product_update)
        return updated_product

    async def delete_product(self, db: AsyncSession, product_id: int) -> None:
        """
        Delete a product from the database.
        """
        return await self.product_repository.remove(db=db, id=product_id)

    async def get_all_products(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ProductInDB]:
        """
        Retrieve all products from the database with pagination.
        """
        products = await self.product_repository.get_multi(db=db, skip=skip, limit=limit)
        return products

    async def get_product_by_id(self, db: AsyncSession, product_id: int) -> ProductInDB:
        """
        Retrieve a product by ID.
        """
        product = await self.product_repository.get(db=db, id=product_id)
        return product
