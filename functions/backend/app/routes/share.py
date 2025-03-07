import base64
import uuid
import os
from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Share, History, User
from ..schemas import ShareCreateRequest, ShareResponse
from pathlib import Path
from azure.storage.blob import BlobServiceClient


router = APIRouter()

# Retrieve the connection string from environment variables
AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
if not AZURE_CONNECTION_STRING:
    raise Exception("AZURE_STORAGE_CONNECTION_STRING environment variable not set.")

sas_token = os.getenv("AZURE_STATIC_SAS_TOKEN")
if not sas_token:
    raise Exception("AZURE_STATIC_SAS_TOKEN environment variable not set.")

# Initialize the BlobServiceClient
blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
container_name = "pixel-art-images"


def upload_image_to_blob(image_data: str) -> str:
    """Upload Base64 encoded image data to Azure Blob Storage and return the blob URL."""
    try:
        # Decode the base64 image data
        image_bytes = base64.b64decode(image_data)
        # Generate a unique name for the image
        image_id = str(uuid.uuid4())[:8]
        blob_name = f"{image_id}.png"

        # Get a BlobClient to interact with the blob
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
        # Upload the image bytes
        blob_client.upload_blob(image_bytes)

        # Return the blob URL (typically: https://<storage_account>.blob.core.windows.net/images/<blob_name>)
        blob_sas_url = f"{blob_client.url}?{sas_token}"
        return blob_sas_url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


@router.post("/share", response_model=ShareResponse)
async def create_share(share_data: ShareCreateRequest, db: Session = Depends(get_db)):
    """ Process the share request with image uploaded to Azure Blob Storage """
    history = db.query(History).filter(History.id == share_data.history_id).first()
    if not history:
        raise HTTPException(status_code=404, detail="History record not found")

    user = db.query(User).filter(User.id == share_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    image_url = upload_image_to_blob(share_data.image_data)  # Upload image to Azure Blob Storage
    share_id = str(uuid.uuid4())[:8]
    share_link = f"https://pixel-art.azurewebsites.net/api/share/{share_id}"

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

#
# @router.get("/images/{blob_name}")
# async def get_image(blob_name: str):
#     """Retrieve the image from blob storage and return it to the client."""
#     try:
#         blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
#         stream = blob_client.download_blob()
#         image_data = stream.readall()
#         return Response(content=image_data, media_type="image/png")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to retrieve image: {str(e)}")
