$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path "backend"
python -m venv backend\venv
& "backend\venv\Scripts\pip.exe" install fastapi uvicorn sqlalchemy scikit-learn numpy pydantic passlib bcrypt pyjwt python-multipart
