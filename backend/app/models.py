from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    shares = relationship("Share", back_populates="user", cascade="all, delete")

class History(Base):
    __tablename__ = "history"
    
    id = Column(Integer, primary_key=True, index=True)
    image_data = Column(Text, nullable=False)  # 存储 JSON 化的像素数据

    shares = relationship("Share", back_populates="history")

class Share(Base):
    __tablename__ = "shares"

    id = Column(Integer, primary_key=True, index=True)
    history_id = Column(Integer, ForeignKey("history.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String, nullable=False)  # "Twitter", "Facebook"
    share_link = Column(String, unique=True, index=True)  # 分享链接
    image_url = Column(String, nullable=False)  # 存储的图片 URL
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    history = relationship("History", back_populates="shares")
    user = relationship("User", back_populates="shares")
