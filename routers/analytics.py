from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.auth import get_current_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/summary")
async def summary(user = Depends(get_current_user), db = Depends(get_db)):
    try:
        result = db.table("applications").select("status").eq("user_id", user.id).execute()
        apps = result.data or []
        total = len(apps)
        counts = {}
        for a in apps:
            status = a.get("status") or "Applied"
            counts[status] = counts.get(status, 0) + 1
        interview_count = counts.get("Interview Scheduled", 0) + counts.get("Offer Received", 0)
        offer_count = counts.get("Offer Received", 0)
        return {
            "total": total,
            "by_status": counts,
            "interview_rate": round(100 * interview_count / total, 1) if total else 0,
            "offer_rate":     round(100 * offer_count     / total, 1) if total else 0,
            "rejection_rate": round(100 * counts.get("Rejected", 0) / total, 1) if total else 0
        }
    except Exception as e:
        logger.error(f"Summary error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch summary: {str(e)}")

@router.get("/weekly")
async def weekly(user = Depends(get_current_user), db = Depends(get_db)):
    result = db.rpc("get_weekly_applications", {"uid": user.id}).execute()
    return result.data

@router.get("/reminders")
async def reminders(user = Depends(get_current_user), db = Depends(get_db)):
    from datetime import date, timedelta
    today = date.today().isoformat()
    week  = (date.today() + timedelta(days=7)).isoformat()
    result = (db.table("applications").select("*")
        .eq("user_id", user.id)
        .gte("followup_date", today)
        .lte("followup_date", week)
        .execute())
    return result.data