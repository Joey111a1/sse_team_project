from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime

# Request model for creating a new user
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

# Response model for user data
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True

# Model for user login requests
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Request model for saving a history record (canvas pixel data)
class HistorySaveRequest(BaseModel):
    imageData: List[int] 

# Response model for detailed history record
class HistoryResponse(BaseModel):
    id: int
    user_id: int
    imageData: List[int]
    created_at: datetime 

    class Config:
        from_attributes = True

# Response model for summary view of a history record
class HistorySummaryResponse(BaseModel):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Request model for creating a share record
class ShareCreateRequest(BaseModel):
    history_id: int
    user_id: int
    platform: str
    image_data: str

# Response model for share record
class ShareResponse(BaseModel):
    id: int
    history_id: int
    user_id: int
    platform: str
    share_link: str
    image_url: str

# Request model for saving the canvas state in collaborative mode
class CanvasStateRequest(BaseModel):
    state_data: str

# Response model for canvas state
class CanvasStateResponse(BaseModel):
    id: int
    state_data: str
    updated_at: datetime

    class Config:
        from_attributes = True