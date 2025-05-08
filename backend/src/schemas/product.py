from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class ProductBase(BaseModel):
    name: str
    description: str
    quantity: int
    price: float
    is_active: bool = Field(default=True)
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None
    image_url: Optional[str] = None

class ProductInDB(ProductBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True