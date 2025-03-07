from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import History
from ..schemas import HistorySaveRequest
from ..schemas import HistoryResponse
from ..schemas import HistorySummaryResponse
from ..auth import get_current_user
import json
import logging
logger = logging.getLogger(__name__)

router = APIRouter()


# ✅ 保存历史记录
@router.post("/history/save", status_code=201)
async def save_history(data: HistorySaveRequest, db: Session = Depends(get_db)):
    try:
        # 将 imageData 转换成 JSON 存入数据库
        history_entry = History(user_id=data.user_id, image_data=json.dumps(data.imageData))
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        return {"message": "History saved", "history_id": history_entry.id}
    except Exception as e:
        db.rollback()
        logger.error("Error saving history", exc_info=e)
        raise HTTPException(status_code=500, detail=f"Error saving history: {str(e)}")


# ✅ 获取所有历史记录
@router.get("/history_all", response_model=List[HistoryResponse])
async def get_all_histories(db: Session = Depends(get_db)):
    history_entries = db.query(History).all()
    if not history_entries:
        raise HTTPException(status_code=404, detail="No history records found")
    
    return [{
        "id": entry.id,
        "imageData": json.loads(entry.image_data),
        "created_at": entry.created_at
    } for entry in history_entries]


# ✅ 获取用户历史记录
@router.get("/history/user", response_model=List[HistorySummaryResponse])
async def get_user_history(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # current_user is now a dict containing the token payload; extract user_id from it.
    user_id = int(current_user.get("user_id"))
    histories = db.query(History).filter(History.user_id == user_id).order_by(History.created_at.desc()).all()
    if not histories:
        raise HTTPException(status_code=404, detail="No history records found")
    return [{
        "id": int(entry.id),
        "created_at": entry.created_at
    } for entry in histories]


# ✅ 获取特定历史记录
@router.get("/history/{history_id}", response_model=HistoryResponse)
async def get_history(history_id: int, db: Session = Depends(get_db)):
    history_entry = db.query(History).filter(History.id == history_id).first()
    if not history_entry:
        raise HTTPException(status_code=404, detail="History not found")

    return {
        "id": history_entry.id,
        "user_id": history_entry.user_id,
        "imageData": json.loads(history_entry.image_data),  # 从 JSON 还原数据
        "created_at": history_entry.created_at
    }
