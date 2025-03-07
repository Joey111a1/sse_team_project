from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CollabCanvas
from app.schemas import CanvasStateRequest, CanvasStateResponse
from datetime import datetime

router = APIRouter()

@router.post("/collab/save", response_model=CanvasStateResponse, status_code=201)
async def save_canvas_state(state_req: CanvasStateRequest, db: Session = Depends(get_db)):
    """
    Save the current collaborative canvas state.
    
    This endpoint receives the canvas state data (e.g., JSON or Base64 encoded)
    from the client, creates a new CollabCanvas record with the current UTC time,
    and saves it into the database.
    
    """
    # Create a new canvas state record with the provided state data and current UTC timestamp.
    new_state = CollabCanvas(
        state_data=state_req.state_data,
        updated_at=datetime.utcnow()
    )
    db.add(new_state)
    db.commit()       # Commit the transaction to persist the new record.
    db.refresh(new_state)  # Refresh the instance to load updated data from the database.
    return new_state

@router.get("/collab/state", response_model=CanvasStateResponse)
async def get_latest_canvas_state(db: Session = Depends(get_db)):
    """
    Retrieve the latest collaborative canvas state.
    
    This endpoint queries the CollabCanvas table, orders the records by the update timestamp
    in descending order, and returns the most recently updated canvas state.
    If no state is found, a 404 error is raised.

    """
    state = db.query(CollabCanvas).order_by(CollabCanvas.updated_at.desc()).first()
    if not state:
        raise HTTPException(status_code=404, detail="No canvas state found")
    return state
