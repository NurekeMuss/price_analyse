from .base import TableBase

from sqlalchemy import Boolean, Column, String, Float, Integer


class ProductTable(TableBase):
    __tablename__ = "product"

    name = Column(String(50), unique=True, index=True)
    description = Column(String(256))
    price = Column(Float)
    quantity = Column(Integer)
    is_active = Column(Boolean, default=True)
    image_url = Column(String(256))