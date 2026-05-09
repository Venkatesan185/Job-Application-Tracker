from pydantic import BaseModel
from typing import Optional
from datetime import date

class ApplicationCreate(BaseModel):
    company_name:   str
    role:           str
    job_link:       Optional[str] = None
    location:       Optional[str] = None
    applied_date:   date
    status:         str = "Applied"
    notes:          Optional[str] = None
    interview_date: Optional[date] = None
    followup_date:  Optional[date] = None

class ApplicationUpdate(BaseModel):
    company_name:   Optional[str] = None
    role:           Optional[str] = None
    job_link:       Optional[str] = None
    location:       Optional[str] = None
    applied_date:   Optional[date] = None
    status:         Optional[str] = None
    notes:          Optional[str] = None
    interview_date: Optional[date] = None
    followup_date:  Optional[date] = None
    response_date:  Optional[date] = None