"""
tests/test_database.py

This file demonstrates how to test your database models and migrations.
It uses an in-memory SQLite database for simplicity. Adjust as needed.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User, History

@pytest.fixture(scope="module")
def in_memory_db():
    """
    Creates an in-memory SQLite database, initializes tables,
    and provides a session for testing.
    """
    engine = create_engine("sqlite:///:memory:", echo=False)
    TestingSessionLocal = sessionmaker(bind=engine)

    # Create all tables in the in-memory database
    Base.metadata.create_all(bind=engine)

    # Provide a session to the tests
    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

def test_create_user(in_memory_db):
    """
    Tests creating a user in the database.
    """
    new_user = User(
        username="testuser",
        email="testuser@example.com",
        password_hash="hashedpassword123"
    )
    in_memory_db.add(new_user)
    in_memory_db.commit()
    in_memory_db.refresh(new_user)

    assert new_user.id is not None
    assert new_user.username == "testuser"
    assert new_user.email == "testuser@example.com"

def test_create_history(in_memory_db):
    """
    Tests creating a history record and linking it to a user.
    """
    # Get a user from the database or create one
    user = in_memory_db.query(User).filter_by(username="testuser").first()
    assert user is not None

    new_history = History(
        user_id=user.id,
        image_data='[255,255,255]',
        # created_at is automatically set if server_default=func.now() in your model
    )
    in_memory_db.add(new_history)
    in_memory_db.commit()
    in_memory_db.refresh(new_history)

    assert new_history.id is not None
    assert new_history.user_id == user.id
    assert new_history.image_data == '[255,255,255]'
