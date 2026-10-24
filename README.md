# CivicMind AI

> **"Predict • Prioritize • Prevent"**

An AI-powered civic complaint reporting and municipal management platform designed to streamline municipal issue resolution, automate departmental routing, and detect problem hotspots in real-time.

---

## 🌟 Key Features

- **🧠 AI Department Routing**: Uses NLP text classification (`TfidfVectorizer` + `MultinomialNB`) to automatically analyze complaint text and route it to the responsible department (Roads, Electricity, Water & Sanitation, Waste Management).
- **📍 Live GIS Mapping & Geolocation**: Clickable interactive Leaflet map centered on India with automatic HTML5 geolocation detection and OpenStreetMap reverse geocoding to human-readable street addresses.
- **📷 Camera & Image Proof**: Real-time WebRTC camera capture and photo upload for attaching visual evidence to civic complaints.
- **🔥 AI Hotspot Clustering**: Employs spatial density clustering (`DBSCAN`) to automatically detect recurring issue clusters and display severity heatmaps on municipal dashboards.
- **👥 Role-Based Portals**:
  - **Citizen Dashboard**: Report issues, track complaint statuses, and review personal submission history in expandable accordion cards.
  - **Manager (Officer) Dashboard**: Review city-wide complaints, view reporter contact cards (with one-click phone dialer and email links), update resolution statuses, and launch turn-by-turn Google Maps navigation.
  - **Admin Master Control Panel**: Full user management with split Citizen and Manager views, role promotion/demotion, live AI hotspot heatmap, and a master database danger zone.
- **🔒 Secure Authentication**: Dual-tab Sign In / Sign Up portal with JWT authentication, bcrypt password hashing, and complete citizen profiling (First Name, Last Name, Phone, Email, Occupation).

---

## 📂 Project Architecture & Directory Structure

```
civicmindai/
├── backend/                  # FastAPI REST API & AI engine
│   ├── ai/                   # Machine Learning models
│   │   ├── hotspot_detector.py # DBSCAN spatial clustering for complaint clusters
│   │   └── nlp_classifier.py   # TF-IDF + Naive Bayes department router
│   ├── routes/               # API endpoint routers
│   │   ├── auth.py           # Registration & JWT login
│   │   ├── complaints.py     # Complaint submission, listing & status updates
│   │   └── dashboard.py      # Admin stats, hotspot data & user management
│   ├── database.py           # SQLAlchemy SQLite connection & session
│   ├── main.py               # Application entrypoint & CORS middleware
│   └── models.py             # Database schemas (User, Complaint, Hotspot, Department)
│
├── frontend/                 # React 18 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── pages/            # Role-based dashboard views
│   │   │   ├── AdminDashboard.jsx    # System metrics, user management & heatmap
│   │   │   ├── CitizenDashboard.jsx  # Issue reporting with map & camera
│   │   │   └── OfficerDashboard.jsx  # Manager complaints queue with contact cards
│   │   ├── api.js            # Axios client with automated JWT Authorization headers
│   │   ├── App.jsx           # Main routing & dual-tab Auth card
│   │   ├── index.css         # Tailwind directives & base styles
│   │   ├── main.jsx          # React DOM entrypoint
│   │   └── ToastContext.jsx  # Modern toast notification engine
│   ├── index.html            # Single page application HTML shell
│   ├── package.json          # Node dependencies & build scripts
│   ├── postcss.config.js     # PostCSS configuration
│   ├── tailwind.config.js    # Tailwind theme & content paths
│   └── vite.config.js        # Vite bundler configuration
│
├── docs/                     # Technical documentation
│   └── ARCHITECTURE.md       # System design, data flow & AI pipeline details
│
├── .gitignore                # Excludes venv, node_modules, and database
├── README.md                 # Project documentation
├── requirements.txt          # Python backend dependencies
├── seed.py                   # Initial database seeder with demo accounts
├── setup.ps1                 # Windows PowerShell setup script
└── start_backend.ps1         # Windows backend startup script
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React-Leaflet, Lucide Icons, Axios |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy, SQLite, Pydantic |
| **AI / ML** | Scikit-learn (`TfidfVectorizer`, `MultinomialNB`, `DBSCAN`), NumPy |
| **Auth & Security** | PyJWT (JSON Web Tokens), Bcrypt password hashing |
| **GIS Services** | OpenStreetMap, Leaflet.js, Nominatim Reverse Geocoding |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed
- Windows PowerShell

### Setup Instructions

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
   - **Backend**:
     ```powershell
     .\start_backend.ps1
     ```
     API will be running on `http://localhost:8000` (Interactive Swagger Docs at `http://localhost:8000/docs`).

   - **Frontend**:
     ```powershell
     cd frontend
     npm run dev
     ```
     Web application will be running on `http://localhost:5173`.

---

## 🔑 Default Demo Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@city.com` | `AdminCivic2026!` | Master Database, User Management, AI Hotspot Heatmap |
| **Manager** | `manager@city.com` | `ManagerCivic2026!` | City Complaints Queue, Status Updates, Citizen Contact |
| **Citizen** | `alice@test.com` | `AliceCivic2026!` | Report Issues, Live Camera/GPS Map, Submission History |

*(New citizens can also register directly from the landing page using the **Create Account** tab).*
