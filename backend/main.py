from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from .database import engine, Base
from .routes import auth, complaints, dashboard
from .ai import nlp_classifier, hotspot_detector

# Create database tables
Base.metadata.create_all(bind=engine)

# Auto-migrate SQLite schema to ensure new columns exist without breaking existing databases
with engine.connect() as conn:
    for col, col_type in [
        ("first_name", "VARCHAR"),
        ("last_name", "VARCHAR"),
        ("contact_number", "VARCHAR"),
        ("occupation", "VARCHAR"),
    ]:
        try:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
            conn.commit()
        except Exception:
            pass

    try:
        conn.execute(text("ALTER TABLE complaints ADD COLUMN address VARCHAR"))
        conn.commit()
    except Exception:
        pass

app = FastAPI(title="Civic Complaint API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(complaints.router, prefix="/api/complaints", tags=["complaints"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
def read_root():
    return {"message": "Civic Complaint API is running"}
