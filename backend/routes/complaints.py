from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
import jwt
from typing import List

from ..database import get_db
from ..models import Complaint, User
from .auth import SECRET_KEY, ALGORITHM
from ..ai.nlp_classifier import predict_department

router = APIRouter()

class ComplaintCreate(BaseModel):
    description: str
    address: str = None
    latitude: float
    longitude: float
    image_url: str = None

class ComplaintUpdate(BaseModel):
    status: str

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = db.query(User).filter(User.id == payload.get("id")).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/")
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # AI Magic happens here!
    predicted_dept_id = predict_department(complaint.description, db)
    
    new_complaint = Complaint(
        citizen_id=current_user.id,
        description=complaint.description,
        address=complaint.address,
        latitude=complaint.latitude,
        longitude=complaint.longitude,
        image_url=complaint.image_url,
        department_id=predicted_dept_id
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    
    # Trigger hotspot detection
    from ..ai.hotspot_detector import detect_hotspots
    detect_hotspots(db)
    
    return {"message": "Complaint created", "complaint": new_complaint}

@router.get("/")
def get_complaints(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "CITIZEN":
        complaints = db.query(Complaint).filter(Complaint.citizen_id == current_user.id).all()
    elif current_user.role in ["OFFICER", "HEAD", "ADMIN"]:
        # Manager and Admin see ALL complaints
        complaints = db.query(Complaint).all()
    else:
        complaints = []
        
    result = []
    for c in complaints:
        citizen_info = None
        if c.citizen:
            citizen_info = {
                "name": c.citizen.name or f"{c.citizen.first_name or ''} {c.citizen.last_name or ''}".strip() or "Citizen",
                "email": c.citizen.email,
                "contact_number": c.citizen.contact_number,
                "occupation": c.citizen.occupation
            }
        result.append({
            "id": c.id,
            "citizen_id": c.citizen_id,
            "citizen": citizen_info,
            "description": c.description,
            "address": c.address,
            "image_url": c.image_url,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else None
        })
    return result

@router.delete("/{complaint_id}")
def delete_complaint(complaint_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["HEAD", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete complaints")
    
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    db.delete(complaint)
    db.commit()
    return {"message": "Complaint deleted successfully"}

@router.put("/{complaint_id}/status")
def update_status(complaint_id: int, update: ComplaintUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["OFFICER", "HEAD", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    complaint.status = update.status
    db.commit()
    return {"message": "Status updated successfully"}
