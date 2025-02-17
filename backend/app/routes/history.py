from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import History
from app.schemas import HistorySaveRequest
import json

router = APIRouter()

@router.post("/history/save", status_code=201)
async def save_history(data: HistorySaveRequest, db: Session = Depends(get_db)):
    try:
        # 将 imageData 转换成 JSON 存入数据库
        history_entry = History(image_data=json.dumps(data.imageData))
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        return {"message": "History saved", "history_id": history_entry.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving history: {str(e)}")
