from fastapi import FastAPI
from .routes import users, history, share, collab
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# register url routers
app.include_router(users.router, prefix="/api/users")
app.include_router(history.router, prefix="/api")
app.include_router(share.router, prefix="/api")
app.include_router(collab.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Pixel Art Editor Backend is Running!"}


origins = [
    "http://localhost:8000", 
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://lively-island-0f6993c03.4.azurestaticapps.net",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)
