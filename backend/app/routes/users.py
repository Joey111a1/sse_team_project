from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, auth
from app.database import SessionLocal
from app.database import get_db
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.UserResponse)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if a user with the provided email already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password before storing it
    hashed_password = auth.hash_password(user_data.password)
    
    # Create a new user record
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login")
def login_user(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    # Retrieve user by email
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # Verify the password
    if not auth.verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # Generate a JWT access token using the user's email
    access_token = auth.create_access_token(user.email)
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Decode the JWT token to obtain the user's email
    email = auth.verify_access_token(token)
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Retrieve the user from the database by email
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user  # Return the current user's data
