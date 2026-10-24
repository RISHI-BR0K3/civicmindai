from backend.database import SessionLocal, engine, Base
from backend.models import User, Department, Complaint
from backend.routes.auth import get_password_hash

# Create tables if not exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Clear existing test data
db.query(Complaint).delete()
db.query(User).delete()
db.query(Department).delete()
db.commit()

# Create Users (Simplified Architecture)
admin = User(name="System Admin", email="admin@city.com", password_hash=get_password_hash("AdminCivic2026!"), role="ADMIN")
citizen = User(name="Alice Citizen", email="alice@test.com", password_hash=get_password_hash("AliceCivic2026!"), role="CITIZEN")
manager = User(name="City Manager", email="manager@city.com", password_hash=get_password_hash("ManagerCivic2026!"), role="OFFICER")

db.add(admin)
db.add(citizen)
db.add(manager)
db.commit()

print("✅ Database successfully seeded with simplified roles!")
print("\n--- Test Accounts ---")
print("Client (Citizen): alice@test.com / AliceCivic2026!")
print("Manager (Officer): manager@city.com / ManagerCivic2026!")
print("Admin: admin@city.com / AdminCivic2026!")
