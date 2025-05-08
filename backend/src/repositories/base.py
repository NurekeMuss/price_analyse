from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.db.database import Base
from src.core.logger import get_logger

logger = get_logger(__name__)

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class RepositoryBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    
    def __init__(self, model: Type[ModelType]):
        self.model = model
        
    async def get(self, db: AsyncSession, id: int) -> Optional[ModelType]:
        logger.debug(f"Getting {self.model} with id: {id}")
        query = select(self.model).filter(self.model.id == id)
        result = await db.execute(query)
        obj = result.scalars().first()
        if obj is None:
            raise HTTPException(status_code=404, detail="Item not found")
        return obj
    
    async def get_multi(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ModelType]:
        logger.debug(f"Getting {self.model} with skip: {skip} and limit: {limit}")
        query = select(self.model).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def create(self, db: AsyncSession, 
                     obj_in: Union[CreateSchemaType, Dict[str, Any]],) -> ModelType:
        logger.info(f"Creating {self.model} with data: {obj_in}")
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.flush()
        return db_obj
    
    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: ModelType,
        obj_in: UpdateSchemaType
    ) -> ModelType:
        logger.debug(f"Updating {self.model} with data: {obj_in}")
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        await db.flush()
        return db_obj
    
    async def remove(self, db: AsyncSession, id: int) -> ModelType:
        logger.debug(f"Removing {self.model} with id: {id}")
        obj = await self.get(db, id)
        await db.delete(obj)
        await db.flush()
        return obj
    
    #CPU bound task, so not thread blocking
    def model_to_dict(self) -> Dict[str, Any]:
        # Exclude any private fields or relationships by filtering out attributes starting with '_'
        return {key: value for key, value in vars(self.model).items() if not key.startswith('_')}