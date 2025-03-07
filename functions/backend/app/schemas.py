from pydantic import BaseModel, EmailStr
from typing import List
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
        orm_mode = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class HistorySaveRequest(BaseModel):
    user_id: int
    imageData: List[int]


class HistoryResponse(BaseModel):
    id: int
    user_id: int
    imageData: List[int]

    class Config:
        orm_mode = True


class HistorySummaryResponse(BaseModel):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class ShareCreateRequest(BaseModel):
    history_id: int
    user_id: int
    platform: str
    image_data: str  # Base64 encoded


class ShareResponse(BaseModel):
    id: int
    history_id: int
    user_id: int
    platform: str
    share_link: str
    image_url: str


class CanvasStateRequest(BaseModel):
    state_data: str


class CanvasStateResponse(BaseModel):
    id: int
    state_data: str
    updated_at: datetime

    class Config:
        orm_mode = True  # Pydantic v1; for Pydantic v2, use from_attributes = True
