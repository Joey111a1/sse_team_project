from fastapi import FastAPI
from app.routes import users, history
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 注册 API 路由
app.include_router(users.router, prefix="/api/users")
app.include_router(history.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Pixel Art Editor Backend is Running!"}

origins = [
    "http://localhost:8000", 
    "http://127.0.0.1:5500",  # 确保前端的端口号正确
    "http://localhost:5500"
    "*",                       # 允许所有来源（调试用）
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)
