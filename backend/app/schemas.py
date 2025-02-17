from pydantic import BaseModel, EmailStr
from typing import List

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class HistorySaveRequest(BaseModel):
    imageData: List[int]  # 画布像素数据，前端传入的
