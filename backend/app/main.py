from fastapi import FastAPI
from app.routes import users
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 注册 API 路由
app.include_router(users.router, prefix="/api/users")

@app.get("/")
def read_root():
    return {"message": "Pixel Art Editor Backend is Running!"}

origins = [
    "http://localhost:3000", 
    "https://your-frontend.com" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)
