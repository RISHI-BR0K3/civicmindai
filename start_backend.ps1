$ErrorActionPreference = "Stop"
.\backend\venv\Scripts\activate
uvicorn backend.main:app --reload
