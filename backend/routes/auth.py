from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import bcrypt
import jwt
import datetime

from ..database import get_db
from ..models import User

router = APIRouter()

SECRET_KEY = "super_secret_key_for_college_project" # Keep safe in production
ALGORITHM = "HS256"

class UserCreate(BaseModel):
    first_name: str = ""
    last_name: str = ""
    contact_number: str = ""
    occupation: str = ""
    email: str
    password: str
    name: str = None
    role: str = "CITIZEN"
    department_id: int = None

class UserLogin(BaseModel):
    email: str
    password: str

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    full_name = f"{user.first_name} {user.last_name}".strip() or user.name or user.email
    new_user = User(
        name=full_name, 
        first_name=user.first_name,
        last_name=user.last_name,
        contact_number=user.contact_number,
        occupation=user.occupation,
        email=user.email, 
        password_hash=hashed_password, 
        role=user.role, 
        department_id=user.department_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={
        "sub": new_user.email,
        "role": new_user.role,
        "id": new_user.id,
        "dept_id": new_user.department_id
    })

    return {
        "message": "User created successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "role": new_user.role
    }

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role, "id": db_user.id, "dept_id": db_user.department_id})
    return {"access_token": access_token, "token_type": "bearer", "role": db_user.role}
