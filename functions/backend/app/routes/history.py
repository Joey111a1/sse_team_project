from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import HTMLResponse
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
import base64
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/history/save", status_code=201)
async def save_history(data: HistorySaveRequest, db: Session = Depends(get_db)):
    try:
        # convert imageData into JSON format
        history_entry = History(user_id=data.user_id, image_data=json.dumps(data.imageData))
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        return {"message": "History saved", "history_id": history_entry.id}
    except Exception as e:
        db.rollback()
        logger.error("Error saving history", exc_info=e)
        raise HTTPException(status_code=500, detail=f"Error saving history: {str(e)}")


# get all records
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


# get history records of a specific user
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


# get record through its id
@router.get("/history/{history_id}")
async def get_history(history_id: int, db: Session = Depends(get_db), request: Request = None):
    history_entry = db.query(History).filter(History.id == history_id).first()
    if not history_entry:
        raise HTTPException(status_code=404, detail="History not found")

    # Parse the stored image data
    parsed_image_data = json.loads(history_entry.image_data)

    final_image_src = None
    # Check if the data is in a list format (raw bytes)
    if isinstance(parsed_image_data, list):
        try:
            # Convert list of integers to bytes and then Base64 encode
            image_bytes = bytes(parsed_image_data)
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            final_image_src = f"data:image/png;base64,{image_base64}"
        except Exception as e:
            logger.error(f"Error converting image data to base64: {e}")
            raise HTTPException(status_code=500, detail="Error processing image data")
    # If it's a string, it might include the prefix but not be valid Base64
    elif isinstance(parsed_image_data, str):
        # Check if the string starts with the Base64 prefix and then a '[' indicating an array
        if parsed_image_data.startswith("data:image/png;base64") and '[' in parsed_image_data:
            # Extract the array part from the string and convert it to a list
            array_part = parsed_image_data.split(",", 1)[1]
            try:
                image_list = json.loads(array_part)
                if isinstance(image_list, list):
                    image_bytes = bytes(image_list)
                    image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                    final_image_src = f"data:image/png;base64,{image_base64}"
                else:
                    final_image_src = parsed_image_data
            except Exception as e:
                logger.error(f"Error processing image data string: {e}")
                final_image_src = parsed_image_data
        else:
            # Assume it's a proper data URL
            final_image_src = parsed_image_data
    else:
        raise HTTPException(status_code=500, detail="Unexpected format for image data")

    data = {
        "id": history_entry.id,
        "user_id": history_entry.user_id,
        "imageData": final_image_src,
        "created_at": history_entry.created_at
    }

    accept_header = request.headers.get("accept", "") if request else ""
    if "text/html" in accept_header:
        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Artwork {data['id']}</title>
            <style>
                body {{
                    font-family: sans-serif;
                    text-align: center;
                    margin: 20px;
                }}
                img {{
                    max-width: 90%;
                    height: auto;
                }}
            </style>
        </head>
        <body>
            <h1>Artwork {data['id']}</h1>
            <img src="{data['imageData']}" alt="Artwork Image">
            <p>Created at: {data['created_at']}</p>
        </body>
        </html>
        """
        return HTMLResponse(content=html_content)

    return data
