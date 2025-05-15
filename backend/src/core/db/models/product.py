from .base import TableBase

from sqlalchemy import Boolean, Column, String, Float, Integer, TEXT


class ProductTable(TableBase):
    __tablename__ = "product"

    name = Column(String(50), index=True)
    description = Column(TEXT)
    price = Column(Float)
    quantity = Column(Integer)
    is_active = Column(Boolean, default=True)
    image_url = Column(TEXT)