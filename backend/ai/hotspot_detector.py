from sklearn.cluster import DBSCAN
import numpy as np
import datetime
from sqlalchemy.orm import Session
from ..models import Complaint, Hotspot

def detect_hotspots(db: Session):
    # Fetch all unresolved complaints
    complaints = db.query(Complaint).filter(Complaint.status != "Resolved").all()
    
    if len(complaints) < 3:
        return # Not enough data for meaningful clustering
        
    # Extract coordinates
    coords = np.array([[c.latitude, c.longitude] for c in complaints])
    
    # Run DBSCAN (eps = approx 500 meters, min_samples = 3)
    # Note: Using crude euclidean distance for demonstration. 
    # For actual earth distance, haversine metric is better.
    dbscan = DBSCAN(eps=0.005, min_samples=3)
    clusters = dbscan.fit_predict(coords)
    
    # Clear old hotspots (simple approach for the project)
    db.query(Hotspot).delete()
    
    unique_labels = set(clusters)
    for label in unique_labels:
        if label == -1:
            continue # -1 is noise (not a cluster)
            
        cluster_mask = (clusters == label)
        cluster_coords = coords[cluster_mask]
        
        # Calculate center
        center_lat = np.mean(cluster_coords[:, 0])
        center_lng = np.mean(cluster_coords[:, 1])
        count = len(cluster_coords)
        
        severity = "High" if count >= 5 else "Medium"
        
        new_hotspot = Hotspot(
            center_latitude=center_lat,
            center_longitude=center_lng,
            complaint_count=count,
            severity=severity
        )
        db.add(new_hotspot)
        
    db.commit()
