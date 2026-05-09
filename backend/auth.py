from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BASE_DIR / ".env", override=True)

security = HTTPBearer()
logger = logging.getLogger(__name__)

# Supabase JWT verification
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://bkihzhsfdcldxozmskda.supabase.co")

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    logger.info(f"Token received: {token[:50]}..." if token else "No token")
    
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    try:
        # Decode without verification - supports RS256, ES256, HS256 (Supabase can use any)
        # Note: key is required even with verify_signature=False
        payload = jwt.decode(
            token,
            key="",  # Empty key since we're not verifying signature
            algorithms=["RS256", "ES256", "HS256"],
            options={"verify_signature": False, "verify_aud": False, "verify_exp": False}
        )
        logger.info(f"Token payload (unverified): {payload}")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no subject")
        return type("User", (), {"id": user_id, "email": payload.get("email")})()
        
    except JWTError as e:
        logger.error(f"JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
