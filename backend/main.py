from fastapi import FastAPI, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import applications, analytics  # noqa: F401
from backend.auth import get_current_user

app = FastAPI(title="Job Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handle both /applications and /applications/ routes
app.include_router(applications.router, prefix="/applications", tags=["Applications"])
app.include_router(analytics.router,    prefix="/analytics",    tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "Job Tracker API is running"}

@app.get("/health")
def health():
    """Health check endpoint"""
    from backend.database import get_db
    try:
        db = get_db()
        result = db.table("applications").select("*").limit(1).execute()
        return {"status": "healthy", "db": "connected", "count": len(result.data)}
    except Exception as e:
        return {"status": "unhealthy", "db": "error", "message": str(e)}

@app.get("/debug/test-insert")
def test_insert():
    """Test insert to diagnose save issues"""
    from backend.database import get_db
    import logging
    import uuid
    logger = logging.getLogger(__name__)
    
    try:
        db = get_db()
        logger.info("Testing insert to applications table...")
        
        test_data = {
            "user_id": str(uuid.uuid4()),
            "company_name": "Test Company",
            "role": "Test Role",
            "applied_date": "2026-05-06",
            "status": "Applied"
        }
        
        logger.info(f"Inserting test data: {test_data}")
        result = db.table("applications").insert(test_data).execute()
        logger.info(f"Insert result: {result}")
        
        if result.data:
            logger.info(f"✓ Insert successful: {result.data[0]}")
            return {"status": "success", "data": result.data[0], "message": "Test insert worked!"}
        else:
            logger.error(f"No data returned: {result}")
            return {"status": "error", "message": "Insert returned no data", "result": str(result)}
            
    except Exception as e:
        logger.error(f"Insert failed: {str(e)}", exc_info=True)
        return {"status": "error", "message": str(e)}

@app.get("/debug/me")
def debug_me(user = Depends(get_current_user)):
    """Return the authenticated user, profile existence, and application count."""
    from backend.database import get_db
    db = get_db()
    profile = db.table("profiles").select("*").eq("id", user.id).execute()
    applications = db.table("applications").select("id").eq("user_id", user.id).execute()
    return {
        "user_id": user.id,
        "email": user.email,
        "profile_exists": bool(profile.data),
        "profile": profile.data,
        "applications_count": len(applications.data),
        "applications": applications.data
    }

@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)  # No content, suppresses 404
