# Navigate to project root
Set-Location $PSScriptRoot
Write-Host "Starting Job Tracker API..."

# Run uvicorn from venv
# Note: Uses backend.main:app --reload for development
& ".\.venv\Scripts\python.exe" -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
