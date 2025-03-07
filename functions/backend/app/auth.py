from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

# 加载环境变量
load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET", "your_secret_key")  # ✅ 确保 SECRET_KEY 不是空的
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
security = HTTPBearer()

# 使用 passlib 进行哈希
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ✅ 修正 hash_password 方法
def hash_password(password: str) -> str:
    return pwd_context.hash(password)  # ✅ 使用 passlib 计算哈希


# ✅ 修正 verify_password 方法
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)  # ✅ 使用 passlib 验证密码


# 生成 JWT 访问令牌
def create_access_token(email: str, user_id: int, expires_delta: Optional[int] = 60) -> str:
    payload = {
        "sub": email,
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(minutes=expires_delta)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# 验证 JWT 访问令牌
def verify_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # ✅ 确保返回的是 `sub` 字段
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None


# 获取当前用户
def get_current_user(token: HTTPAuthorizationCredentials = Security(security)) -> dict:
    payload = verify_access_token(token.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Ensure the payload contains a user_id (not just email)
    return payload
