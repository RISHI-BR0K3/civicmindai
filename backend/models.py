from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    users = relationship("User", back_populates="department")
    complaints = relationship("Complaint", back_populates="department")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="CITIZEN") # CITIZEN, OFFICER, HEAD
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    department = relationship("Department", back_populates="users")
    complaints = relationship("Complaint", back_populates="citizen")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    address = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    latitude = Column(Float)
    longitude = Column(Float)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True) # Assigned by AI
    status = Column(String, default="Pending") # Pending, In Progress, Resolved
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    citizen = relationship("User", back_populates="complaints")
    department = relationship("Department", back_populates="complaints")

class Hotspot(Base):
    __tablename__ = "hotspots"
    id = Column(Integer, primary_key=True, index=True)
    center_latitude = Column(Float)
    center_longitude = Column(Float)
    complaint_count = Column(Integer)
    severity = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
