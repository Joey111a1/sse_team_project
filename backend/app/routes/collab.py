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
    保存当前协作画布状态
    """
    # 如果需要，可以在此处进行版本冲突的检测或其他逻辑
    new_state = CollabCanvas(
        state_data=state_req.state_data,
        updated_at=datetime.utcnow()
    )
    db.add(new_state)
    db.commit()
    db.refresh(new_state)
    return new_state

@router.get("/collab/state", response_model=CanvasStateResponse)
async def get_latest_canvas_state(db: Session = Depends(get_db)):
    state = db.query(CollabCanvas).order_by(CollabCanvas.updated_at.desc()).first()
    if not state:
        raise HTTPException(status_code=404, detail="No canvas state found")
    return state
