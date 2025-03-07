from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

# Load environment variables from a .env file
load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET", "your_secret_key_here")  # Ensure SECRET_KEY is not empty
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
security = HTTPBearer()

# Set up password hashing using passlib's bcrypt algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash the given password using bcrypt
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Verify the provided plain password against the stored hashed password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Generate a JWT access token with an expiration time (in minutes)
def create_access_token(email: str, expires_delta: Optional[int] = 60) -> str:
    payload = {
        "sub": email,  # Subject of the token, typically the user's email
        "exp": datetime.utcnow() + timedelta(minutes=expires_delta)  # Expiration time of the token
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# Validate the JWT access token and return the subject (user's email) if valid
def verify_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")  # Return the 'sub' field from the token payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

# Dependency to retrieve the current user's email from the provided JWT token
def get_current_user(token: HTTPAuthorizationCredentials = Security(security)) -> str:
    email = verify_access_token(token.credentials)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return email
