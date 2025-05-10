from src.services import ProductService
from src.core.db.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.schemas import product, user
from src.dependencies import auth, product as product_dep

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/", response_model=product.ProductInDB)
async def create_product(
    product_in: product.ProductCreate,
    db: AsyncSession = Depends(get_db),
    product_service: ProductService = Depends(product_dep.get_product_service),
    auth: user.UserInDB = Depends(auth.get_current_user),
):
    """
    Create a new product.
    """
    product = await product_service.create_product(db, product_in)
    return product

@router.get("/", response_model=list[product.ProductInDB])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    product_service: ProductService = Depends(product_dep.get_product_service),
    auth: user.UserInDB = Depends(auth.get_current_user),
):
    """
    Get all products.
    """
    products = await product_service.get_all_products(db)
    return products

@router.get("/{product_id}", response_model=product.ProductInDB)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    product_service: ProductService = Depends(product_dep.get_product_service),
    auth: user.UserInDB = Depends(auth.get_current_user),
):
    """
    Get a product by ID.
    """
    product = await product_service.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=product.ProductInDB)
async def update_product(
    product_id: int,
    product_in: product.ProductUpdate,
    db: AsyncSession = Depends(get_db),
    product_service: ProductService = Depends(product_dep.get_product_service),
    auth: user.UserInDB = Depends(auth.get_current_user),
):
    """
    Update a product by ID.
    """
    product = await product_service.update_product(db, product_id, product_in)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/{product_id}", response_model=product.ProductInDB)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    product_service: ProductService = Depends(product_dep.get_product_service),
    auth: user.UserInDB = Depends(auth.get_current_user),
):
    """
    Delete a product by ID.
    """
    product = await product_service.delete_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
