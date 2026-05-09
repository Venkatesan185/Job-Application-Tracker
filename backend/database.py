from supabase import create_client
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

# Load root .env first, then backend/.env to ensure the server-side service key is used.
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BASE_DIR / ".env", override=True)

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

logger = logging.getLogger(__name__)

logger.info(f"Supabase URL configured: {bool(supabase_url)}")
logger.info(f"Supabase Key configured: {bool(supabase_key)}")
if supabase_key:
    logger.info(f"Key type (first 50 chars): {supabase_key[:50]}...")

supabase = None
try:
    supabase = create_client(supabase_url, supabase_key)
    logger.info("✓ Supabase client initialized successfully")
except Exception as e:
    logger.error(f"✗ Failed to initialize Supabase: {e}. Check SUPABASE_URL and SUPABASE_KEY in .env")
    supabase = None

def get_db():
    global supabase
    if supabase is None:
        logger.error("Database not configured!")
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Database not configured. Check .env file for SUPABASE_URL and SUPABASE_KEY")
    logger.debug("Returning Supabase client")
    return supabase
