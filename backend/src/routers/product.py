from src.services import ProductService
from src.core.db.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.schemas import product, user
from src.dependencies import auth, product as product_dep, price
from src.ml import optimalprice, potd
from src.dependencies import potd as potd_dep

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

@router.get("/ml/recommend_price/{product_id}")
async def recommend_price_by_id(
    product_id: int,
    predictor: optimalprice.PricePredictor = Depends(price.get_price_predictor),
    auth: user.UserInDB = Depends(auth.get_current_user),
):
    """
    Recommend an optimal price for a product by ID from mock data.
    """
    try:
        product_data = predictor.get_product_by_id(product_id)
        price_value = predictor.recommend_price(product_data)
        return {"recommended_price": round(price_value, 2)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")


@router.get("/ml/products_of_the_day")
async def get_products_of_the_day(
    classifier: potd.ProductsOfTheDayClassifier = Depends(potd_dep.get_products_of_the_day_classifier),
    auth: user.UserInDB = Depends(auth.get_current_user),
):
    """
    Return products classified as "products of the day".
    """
    try:
        products = classifier.get_products_of_the_day()
        return {"count": len(products), "products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
