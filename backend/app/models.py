from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)  # Primary key
    username = Column(String, unique=True, index=True, nullable=False)  # Unique username
    email = Column(String, unique=True, index=True, nullable=False)  # Unique email
    password_hash = Column(String, nullable=False)  # Hashed password

    shares = relationship("Share", back_populates="user", cascade="all, delete")  # User's shares
    histories = relationship("History", back_populates="user")  # User's history records

class History(Base):
    __tablename__ = "history"
    
    id = Column(Integer, primary_key=True, index=True)  # Primary key
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # References User
    image_data = Column(Text, nullable=False)  # Stored pixel data in JSON
    created_at = Column(DateTime, server_default=func.now(), nullable=False)  # Creation timestamp

    shares = relationship("Share", back_populates="history")  # Associated shares
    user = relationship("User", back_populates="histories")  # Associated user

class Share(Base):
    __tablename__ = "shares"

    id = Column(Integer, primary_key=True, index=True)  # Primary key
    history_id = Column(Integer, ForeignKey("history.id"), nullable=False)  # References History
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # References User
    platform = Column(String, nullable=False)  # Sharing platform
    share_link = Column(String, unique=True, index=True)  # Unique share link
    image_url = Column(String, nullable=False)  # URL of the saved image
    created_at = Column(DateTime, default=datetime.utcnow)  # Timestamp

    history = relationship("History", back_populates="shares")  # Link to History
    user = relationship("User", back_populates="shares")  # Link to User

class CollabCanvas(Base):
    __tablename__ = "collab_canvas"
    
    id = Column(Integer, primary_key=True, index=True)  # Primary key
    state_data = Column(Text, nullable=False)  # Canvas state (JSON/Base64)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())  # Last update timestamp
