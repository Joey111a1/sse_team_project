from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    shares = relationship("Share", back_populates="user", cascade="all, delete")
    histories = relationship("History", back_populates="user")


class History(Base):
    __tablename__ = "history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_data = Column(Text, nullable=False)  # 存储 JSON 化的像素数据
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    shares = relationship("Share", back_populates="history")
    user = relationship("User", back_populates="histories")


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


class CollabCanvas(Base):
    __tablename__ = "collab_canvas"
    
    id = Column(Integer, primary_key=True, index=True)
    state_data = Column(Text, nullable=False)   # 存储画布状态（例如 JSON 字符串或 Base64 数据）
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    # version = Column(Integer, default=1)  # 可选：用于版本控制