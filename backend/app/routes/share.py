import base64
import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Share, History, User
from app.schemas import ShareCreateRequest, ShareResponse
from pathlib import Path

router = APIRouter()

# Create the static directory for saving images if it does not exist
STATIC_DIR = Path("static/images")
STATIC_DIR.mkdir(parents=True, exist_ok=True)

def save_image(image_data: str) -> str:
    """Convert Base64 encoded image data to a PNG file and store it.
    
    Returns:
        A URL pointing to the saved image.
    """
    try:
        image_bytes = base64.b64decode(image_data)
        image_id = str(uuid.uuid4())[:8]
        file_path = STATIC_DIR / f"{image_id}.png"

        with open(file_path, "wb") as img_file:
            img_file.write(image_bytes)

        return f"http://127.0.0.1:8000/static/images/{image_id}.png"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

@router.post("/share", response_model=ShareResponse)
async def create_share(share_data: ShareCreateRequest, db: Session = Depends(get_db)):
    """Handle share requests.

    This endpoint:
      - Validates the existence of the referenced history record.
      - Validates the existence of the referenced user.
      - Saves the provided Base64 image data as a PNG file.
      - Generates a unique share link.
      - Creates a new share record in the database and returns its details.
    """
    history = db.query(History).filter(History.id == share_data.history_id).first()
    if not history:
        raise HTTPException(status_code=404, detail="History record not found")

    user = db.query(User).filter(User.id == share_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    image_url = save_image(share_data.image_data)  # Save the image and retrieve its URL
    share_id = str(uuid.uuid4())[:8]
    share_link = f"http://127.0.0.1:8000/api/share/{share_id}"

    share_entry = Share(
        history_id=share_data.history_id,
        user_id=share_data.user_id,
        platform=share_data.platform,
        share_link=share_link,
        image_url=image_url
    )

    db.add(share_entry)
    db.commit()
    db.refresh(share_entry)

    return {
        "id": share_entry.id,
        "history_id": share_entry.history_id,
        "user_id": share_entry.user_id,
        "platform": share_entry.platform,
        "share_link": share_entry.share_link,
        "image_url": share_entry.image_url
    }
