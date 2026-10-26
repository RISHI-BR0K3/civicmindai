from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Complaint, Hotspot, User
from .complaints import get_current_user

router = APIRouter()

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["HEAD", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized to view admin stats")
    
    # Recalculate hotspots dynamically to ensure resolved complaints are immediately purged
    from ..ai.hotspot_detector import detect_hotspots
    detect_hotspots(db)
    
    total_complaints = db.query(Complaint).count()
    resolved_complaints = db.query(Complaint).filter(Complaint.status == "Resolved").count()
    hotspots = db.query(Hotspot).all()
    
    total_users = db.query(User).count()
    total_managers = db.query(User).filter(User.role == "OFFICER").count()
    
    return {
        "total_complaints": total_complaints,
        "resolved_complaints": resolved_complaints,
        "total_users": total_users,
        "total_managers": total_managers,
        "hotspots": [
            {
                "id": h.id,
                "center_latitude": h.center_latitude,
                "center_longitude": h.center_longitude,
                "complaint_count": h.complaint_count,
                "severity": h.severity,
                "created_at": h.created_at.isoformat() if h.created_at else None
            }
            for h in hotspots
        ]
    }

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["HEAD", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name or f"{u.first_name or ''} {u.last_name or ''}".strip() or u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "contact_number": u.contact_number,
            "occupation": u.occupation,
            "email": u.email,
            "role": u.role,
            "department_id": u.department_id
        }
        for u in users
    ]

from pydantic import BaseModel
class RoleUpdate(BaseModel):
    role: str

@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, update_data: RoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["HEAD", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = update_data.role
    db.commit()
    return {"message": "Role updated successfully"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["HEAD", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
