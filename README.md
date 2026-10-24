HEAD
# CivicMind AI

> **"Predict • Prioritize • Prevent"**

An AI-powered civic complaint reporting and municipal management platform designed to streamline civic issue resolution across cities.

---

## 🌟 Key Features

- **🧠 AI Department Routing**: Uses NLP text classification (`TfidfVectorizer` + `MultinomialNB`) to automatically categorize complaints into relevant departments (Roads, Electricity, Water & Sanitation, Waste Management).
- **📍 Live GIS Mapping & Geolocation**: Clickable interactive Leaflet map centered on India with automatic HTML5 geolocation detection and reverse geocoding to human-readable street addresses.
- **📷 Camera & Image Upload**: Real-time WebRTC camera capture and photo upload for attaching visual proof to civic issues.
- **🔥 AI Hotspot Clustering**: Uses spatial clustering (`DBSCAN`) to automatically detect recurring issue clusters and display severity heatmaps on municipal dashboards.
- **👥 Role-Based Portals**:
  - **Citizen Dashboard**: Report issues, track complaint statuses, and review personal submission history.
  - **Manager (Officer) Dashboard**: Review city-wide complaints, view reporter contact cards (with one-click dialer and email), update progress statuses, and open Google Maps navigation directly.
  - **Admin Master Control Panel**: Full user management (with split Citizen / Manager views), role delegation, live AI hotspot heatmap, and a master database danger zone.
- **🔒 Secure Authentication**: Dual-tab Sign In / Sign Up portal with JWT authentication, bcrypt password hashing, and complete citizen profiling (Name, Phone, Email, Occupation).

---

## 🛠️ Tech Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy, SQLite, Pydantic, Scikit-learn, NumPy, PyJWT, Bcrypt
- **Frontend**: React 18, Vite, Tailwind CSS, React-Leaflet, Lucide Icons, Axios

---

## 🚀 Quick Start Guide

### Windows

1. **Setup Backend**:
   ```powershell
   python -m venv backend\venv
   .\backend\venv\Scripts\pip.exe install -r requirements.txt
   python seed.py
   ```

2. **Setup Frontend**:
   ```powershell
   cd frontend
   npm install --legacy-peer-deps
   cd ..
   ```

3. **Run Application**:
   - Start Backend:
     ```powershell
     .\start_backend.ps1
     ```
   - Start Frontend:
     ```powershell
     cd frontend
     npm run dev
     ```

### Linux (Fedora / Ubuntu)

```bash
chmod +x setup.sh start_backend.sh start_frontend.sh
./setup.sh
./start_backend.sh     # In terminal 1
./start_frontend.sh    # In terminal 2
```

---

## 🔑 Default Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@city.com` | `AdminCivic2026!` |
| **Manager** | `manager@city.com` | `ManagerCivic2026!` |
| **Citizen** | `alice@test.com` | `AliceCivic2026!` |
=======
# civicmindai

