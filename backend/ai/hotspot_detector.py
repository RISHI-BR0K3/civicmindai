from sklearn.cluster import DBSCAN
import numpy as np
import datetime
from sqlalchemy.orm import Session
from ..models import Complaint, Hotspot

def detect_hotspots(db: Session):
    # Always clear existing hotspots first so resolved issues immediately remove the hotspot!
    db.query(Hotspot).delete()
    
    # Fetch all unresolved complaints (exclude 'Resolved')
    complaints = db.query(Complaint).filter(Complaint.status != "Resolved").all()
    
    # If fewer than 3 unresolved complaints remain, no cluster exists
    if len(complaints) < 3:
        db.commit()
        return
        
    # Extract coordinates
    coords = np.array([[c.latitude, c.longitude] for c in complaints])
    
    # Run DBSCAN (eps = approx 500 meters, min_samples = 3)
    dbscan = DBSCAN(eps=0.005, min_samples=3)
    clusters = dbscan.fit_predict(coords)
    
    unique_labels = set(clusters)
    for label in unique_labels:
        if label == -1:
            continue # -1 is noise (not a cluster)
            
        cluster_mask = (clusters == label)
        cluster_coords = coords[cluster_mask]
        
        # Calculate center
        center_lat = float(np.mean(cluster_coords[:, 0]))
        center_lng = float(np.mean(cluster_coords[:, 1]))
        count = int(len(cluster_coords))
        
        severity = "High" if count >= 5 else "Medium"
        
        new_hotspot = Hotspot(
            center_latitude=center_lat,
            center_longitude=center_lng,
            complaint_count=count,
            severity=severity
        )
        db.add(new_hotspot)
        
    db.commit()
