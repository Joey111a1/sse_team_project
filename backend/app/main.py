from fastapi import FastAPI
from app.routes import users, history, share, collab
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Register API routes with appropriate prefixes
app.include_router(users.router, prefix="/api/users")
app.include_router(history.router, prefix="/api")
app.include_router(share.router, prefix="/api")
app.include_router(collab.router, prefix="/api")

# Define the root endpoint for a simple health check
@app.get("/")
def read_root():
    return {"message": "Pixel Art Editor Backend is Running!"}

# List of allowed origins for cross-origin requests
origins = [
    "http://localhost:8000", 
    "http://127.0.0.1:5500",  
    "http://localhost:5500",  
]

# Configure CORS middleware to allow requests from specified origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)
