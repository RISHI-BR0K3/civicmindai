import os
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

from ..models import Department

MODEL_PATH = "nlp_model.pkl"

# Dummy data for initial training
TRAINING_DATA = [
    ("huge pothole on the road", "Roads"),
    ("street light is broken", "Electricity"),
    ("power outage in my area", "Electricity"),
    ("water pipe burst leaking water everywhere", "Water & Sanitation"),
    ("garbage is not collected for days", "Waste Management"),
    ("road is cracked and dangerous", "Roads"),
    ("drainage is overflowing on the street", "Water & Sanitation")
]

def train_and_save_model():
    texts = [item[0] for item in TRAINING_DATA]
    labels = [item[1] for item in TRAINING_DATA]
    
    model = make_pipeline(TfidfVectorizer(), MultinomialNB())
    model.fit(texts, labels)
    
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    
    return model

def load_model():
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    else:
        return train_and_save_model()

# Load the model into memory
nlp_model = load_model()

def predict_department(text: str, db):
    predicted_dept_name = nlp_model.predict([text])[0]
    
    # Try to find the department in the DB
    department = db.query(Department).filter(Department.name == predicted_dept_name).first()
    
    if not department:
        # If it doesn't exist, create it (just for the sake of the college project working easily)
        department = Department(name=predicted_dept_name)
        db.add(department)
        db.commit()
        db.refresh(department)
        
    return department.id
