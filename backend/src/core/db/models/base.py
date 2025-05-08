from datetime import datetime

from sqlalchemy import TIMESTAMP, Column, Integer, func

from ..database import Base


class TableBase(Base):
    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    def as_dict(self):
        # Recursively serialize datetime fields in nested data structures
        def serialize(value):
            if isinstance(value, datetime):
                return value.isoformat()
            elif isinstance(value, dict):
                return {k: serialize(v) for k, v in value.items()}
            elif isinstance(value, list):
                return [serialize(v) for v in value]
            return value

        # Extract attributes from the instance and serialize them
        return {column.name: serialize(getattr(self, column.name)) for column in self.__table__.columns}