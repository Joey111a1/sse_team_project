from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

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

class HistoryResponse(BaseModel):
    id: int
    imageData: List[int]  # 假设 imageData 是一个整数列表

    class Config:
        from_attributes = True

class ShareCreateRequest(BaseModel):
    history_id: int
    user_id: int
    platform: str
    image_data: str  # Base64 编码的图像数据

class ShareResponse(BaseModel):
    id: int
    history_id: int
    user_id: int
    platform: str
    share_link: str
    image_url: str

class CanvasStateRequest(BaseModel):
    state_data: str  # 前端传来的画布状态数据，格式由你定义（如 JSON 或 Base64）

class CanvasStateResponse(BaseModel):
    id: int
    state_data: str
    updated_at: datetime

    class Config:
        orm_mode = True  # Pydantic v1; 若使用 Pydantic v2, 可用 from_attributes = True
