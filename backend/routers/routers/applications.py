from fastapi import APIRouter, Depends, Query, HTTPException
from models import ApplicationCreate, ApplicationUpdate
from database import get_db
from auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def ensure_profile_exists(db, user):
    try:
        profile = db.table("profiles").select("id").eq("id", user.id).execute()
        if not profile.data:
            logger.info(f"Creating missing profiles row for user {user.id}")
            profile_payload = {"id": user.id}
            if getattr(user, "email", None):
                profile_payload["email"] = user.email
            db.table("profiles").insert(profile_payload).execute()
    except Exception as e:
        logger.error(f"Failed to ensure profile exists: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to ensure profile exists: {e}")

@router.get("/")
async def list_applications(
    status: str = Query(None),
    search: str = Query(None),
    sort:   str = Query("applied_date"),
    user = Depends(get_current_user),
    db   = Depends(get_db)
):
    try:
        logger.info(f"Fetching applications for user: {user.id}")
        query = db.table("applications").select("*").eq("user_id", user.id)
        if status:
            query = query.eq("status", status)
        if search:
            query = query.ilike("company_name", f"%{search}%")
        result = query.order(sort, desc=True).execute()
        logger.info(f"Found {len(result.data)} applications")
        return result.data
    except Exception as e:
        logger.error(f"List error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")

@router.post("/")
async def create_application(
    data: ApplicationCreate,
    user = Depends(get_current_user),
    db   = Depends(get_db)
):
    try:
        ensure_profile_exists(db, user)
        payload = data.model_dump()
        payload["user_id"] = user.id
        logger.info(f"Creating application for user {user.id}: {payload}")
        
        for k, v in payload.items():
            if hasattr(v, 'isoformat'):
                payload[k] = v.isoformat()
        
        result = db.table("applications").insert(payload).execute()
        logger.info(f"Insert result: {result}")
        
        if not result.data:
            logger.error("Insert returned no data")
            raise HTTPException(status_code=500, detail="Failed to save application: insert returned no data")
        
        logger.info(f"Insert successful: {result.data[0]}")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Insert failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to save application: {str(e)}")

@router.get("/{app_id}")
async def get_application(app_id: str, user = Depends(get_current_user), db = Depends(get_db)):
    result = db.table("applications").select("*").eq("id", app_id).eq("user_id", user.id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Not found")
    return result.data[0]

@router.put("/{app_id}")
async def update_application(
    app_id: str,
    data: ApplicationUpdate,
    user = Depends(get_current_user),
    db   = Depends(get_db)
):
    try:
        payload = {k: v for k, v in data.model_dump().items() if v is not None}
        for k, v in payload.items():
            if hasattr(v, 'isoformat'):
                payload[k] = v.isoformat()
        
        logger.info(f"Updating application {app_id} for user {user.id}: {payload}")
        result = db.table("applications").update(payload).eq("id", app_id).eq("user_id", user.id).execute()
        
        if not result.data:
            logger.error(f"Update returned no data for ID {app_id}")
            raise HTTPException(status_code=404, detail="Application not found or update failed")
        
        logger.info(f"Update successful: {result.data[0]}")
        return result.data[0]
    except Exception as e:
        logger.error(f"Update error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update application: {str(e)}")

@router.delete("/{app_id}")
async def delete_application(app_id: str, user = Depends(get_current_user), db = Depends(get_db)):
    try:
        logger.info(f"Deleting application {app_id} for user {user.id}")
        result = db.table("applications").delete().eq("id", app_id).eq("user_id", user.id).execute()
        logger.info(f"Delete successful")
        return {"message": "Deleted"}
    except Exception as e:
        logger.error(f"Delete error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete application: {str(e)}")