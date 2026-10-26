# CivicMind AI — Technical Project Report & System Documentation

**Project Motto:** *"Predict • Prioritize • Prevent"*  
**Application Name:** CivicMind AI  
**Project Scope:** Full-Stack AI-Powered Civic Grievance Reporting and Municipal Management System  

---

## 1. Technical Architecture and Design

### 1.1 Architecture Overview
The project is built as a complete, decoupled **Full-Stack Web Application** consisting of a React Single Page Application (SPA), a Python FastAPI REST API server, an embedded Scikit-learn AI/ML processing pipeline, and an SQLite database:

```
+-----------------------------------------------------------------------------------+
|                           FRONTEND CLIENT (Port 5173)                             |
|         React 18 SPA (Vite + Tailwind CSS + React-Leaflet + Lucide Icons)         |
|  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────────────┐  |
|  |  Citizen Dashboard  |  |  Manager Dashboard  |  |   Admin Master Dashboard  |  |
|  └─────────────────────┘  └─────────────────────┘  └───────────────────────────┘  |
+-----------------------------------------------------------------------------------+
                                         │  ▲
                     HTTP / REST API via Axios  │  JWT Bearer Token
                                         ▼  │
+-----------------------------------------------------------------------------------+
|                            BACKEND API (Port 8000)                                |
|                       FastAPI Asynchronous Web Engine                             |
|  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────────────┐  |
|  |   /api/auth/        |  |  /api/complaints/   |  |      /api/dashboard/      |  |
|  └─────────────────────┘  └─────────────────────┘  └───────────────────────────┘  |
+-----------------------------------------------------------------------------------+
                  │                                                 │
                  ▼                                                 ▼
+------------------------------------+            +---------------------------------+
|       EMBEDDED AI / ML PIPELINE    |            |       PERSISTENCE LAYER         |
|  - NLP Classifier (TF-IDF + Bayes) |            |  SQLite Database (civic_app.db) |
|  - Hotspot Clustering (DBSCAN)     |            |  SQLAlchemy 2.0 ORM             |
+------------------------------------+            +---------------------------------+
```

### 1.2 Implemented Database Schema (`backend/models.py`)
The system persists data locally using SQLite (`civic_app.db`) via SQLAlchemy ORM with four primary models:

1. **`users` Table**:
   * `id`: Integer, Primary Key, Auto-increment
   * `name`: String (Full display name)
   * `first_name`: String (Citizen first name)
   * `last_name`: String (Citizen last name)
   * `contact_number`: String (Phone number)
   * `occupation`: String (Occupation/designation)
   * `email`: String, Unique Index
   * `password_hash`: String (Bcrypt salted hash)
   * `role`: String (`CITIZEN`, `OFFICER`, `ADMIN`)
   * `department_id`: Integer, Foreign Key (`departments.id`, nullable)

2. **`departments` Table**:
   * `id`: Integer, Primary Key
   * `name`: String, Unique (`Roads`, `Electricity`, `Water & Sanitation`, `Waste Management`)

3. **`complaints` Table**:
   * `id`: Integer, Primary Key
   * `citizen_id`: Integer, Foreign Key (`users.id`)
   * `description`: String (Complaint text)
   * `address`: String (Human-readable street location)
   * `image_url`: String (Base64 encoded photo)
   * `latitude`: Float (GPS coordinate)
   * `longitude`: Float (GPS coordinate)
   * `department_id`: Integer, Foreign Key (`departments.id`)
   * `status`: String (`Pending`, `In Progress`, `Resolved`)
   * `created_at`: DateTime (UTC timestamp)

4. **`hotspots` Table**:
   * `id`: Integer, Primary Key
   * `center_latitude`: Float (Cluster centroid latitude)
   * `center_longitude`: Float (Cluster centroid longitude)
   * `complaint_count`: Integer (Number of unresolved issues in cluster)
   * `severity`: String (`High`, `Medium`)
   * `created_at`: DateTime

### 1.3 Security & Role-Based Access Control (RBAC)
* **Password Encryption**: Implemented using `bcrypt` via Python `passlib` to ensure raw passwords are never saved.
* **Token Authentication**: Implemented stateless `JSON Web Tokens (JWT)` signed with secret key and `HS256` algorithm, carrying a 24-hour expiration.
* **HTTP Interceptor**: Axios on the frontend (`frontend/src/api.js`) automatically attaches the JWT token from `localStorage` as `Authorization: Bearer <token>` to all outgoing requests.
* **Access Control**:
  * `CITIZEN`: Can submit issues, access camera and location, and only view their own history.
  * `OFFICER` (Manager): Has access to the city-wide queue, citizen contact cards, status update tools, and Google Maps routing.
  * `ADMIN`: Has full system authority, user management, complaint deletion, and live heatmap visibility.

---

## 2. Implementation and Prototype Development

### 2.1 Frontend User Interface & Dashboards

#### A. Authentication Portal (`frontend/src/App.jsx`)
* **Dual-Tab Interface**: Allows smooth switching between **Sign In** and **Create Account**.
* **Profile Fields**: Registration captures First Name, Last Name, Contact Number, Email, Password, and Occupation (with options: *Local Resident, Student, IT Professional, Healthcare Worker, Government Employee, Civil Engineer*, etc.).
* **Instant Login**: Upon registration, an authentication token is immediately generated and saved, routing the citizen directly to their dashboard.
* **Security Controls**: Password visibility toggle (`Eye` / `EyeOff` icons) and minimum 6-character length validation.

#### B. Citizen Dashboard (`frontend/src/pages/CitizenDashboard.jsx`)
* **GIS Map Pinpointing**: Built with `react-leaflet`. Initialized and centered on India (`[20.5937, 78.9629]`) at zoom level `5`.
* **One-Click Location Detection**: Uses browser `navigator.geolocation` to fly to the citizen's exact position.
* **Reverse Geocoding**: Queries the OpenStreetMap Nominatim API asynchronously to convert coordinates into real street addresses.
* **Center India Shortcut**: An `🇮🇳 Center India` button allows resetting the map view to the country overview.
* **Live In-Browser Camera**: Uses HTML5 `navigator.mediaDevices.getUserMedia` to stream video, snap photos via Canvas, and encode them into Base64 data strings.
* **Form Validation**: Submit button remains disabled and styled gray until a valid description (10+ characters) and a map location are chosen.
* **Isolated "My History"**: Calls `/api/complaints/my`. Users strictly see only their own complaints. Displays an expandable accordion showing photo, timestamp (24-hr format), address, and resolution status.

#### C. Manager Dashboard (`frontend/src/pages/OfficerDashboard.jsx`)
* **City-Wide Issue Queue**: Displays all complaints across all categories in the city.
* **Citizen Contact Card**: Expanded row reveals the reporter's full name, occupation, a clickable `📞 Call` button (`tel:`), and a direct `✉️ Email` link.
* **1-Click Turn-by-Turn Navigation**: Generates dynamic Google Maps links (`https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`) to route field workers directly to the issue.
* **Live Status Updates**: Dropdown allows changing complaint progress (`Pending` → `In Progress` → `Resolved`).

#### D. Admin Master Control Panel (`frontend/src/pages/AdminDashboard.jsx`)
* **Overview Metrics**: Displays real-time counts for Total Users, City Managers, All Complaints, and Active Hotspots.
* **AI Hotspot Heatmap**: Renders dynamic `CircleMarker` elements on Leaflet for all active DBSCAN clusters. Markers are color-coded (Red for High severity, Orange/Yellow for Medium) with popups showing complaint counts.
* **Categorized User Management**: Features two separate tables:
  1. *City Managers & Admins*: Role assignment and deletion.
  2. *Citizens*: Displays name, occupation, contact number, and promotion controls.
* **Master Database**: Danger zone table allowing Admins to override statuses or permanently delete spam complaints.
* **Client-Side Pagination**: Slices records to 10 per page to ensure smooth browser rendering.

### 2.2 Artificial Intelligence & Machine Learning Subsystems

#### A. NLP Department Classifier (`backend/ai/nlp_classifier.py`)
* **Model Composition**: `TfidfVectorizer` paired with a `MultinomialNB` (Multinomial Naive Bayes) classification pipeline.
* **Automated Triage**: Analyzes complaint descriptions and routes them to the proper department (*Roads, Electricity, Water & Sanitation, Waste Management*).
* **Model Persistence**: Automatically trains and saves the pipeline as `nlp_model.pkl` on initial boot if not present.
* **Dynamic Table Creation**: If a predicted department does not exist in the database, the system creates it on-the-fly.

#### B. DBSCAN Hotspot Clustering Engine (`backend/ai/hotspot_detector.py`)
* **Clustering Algorithm**: Scikit-learn `DBSCAN` with radius $\varepsilon = 0.005$ ($\approx 500\text{ meters}$) and $\text{min\_samples} = 3$.
* **Unresolved Focus**: Filters complaints where `status != 'Resolved'`.
* **Centroid Calculation**: Calculates arithmetic mean latitude and longitude of clustered complaints.
* **Severity Allocation**: Sets severity to **High** if count $\ge 5$, otherwise **Medium**.
* **Automatic Hotspot Eviction**: When issues are marked as `Resolved` by a manager or deleted by an admin, `detect_hotspots()` runs, recalculates clusters, and purges resolved hotspots from the database in real-time.

---

## 3. Tools Integration, Testing, and Performance Validation

### 3.1 Technology Stack Matrix

| Area | Component | Implementation in this Project |
| :--- | :--- | :--- |
| **Frontend UI** | React 18 & Vite | Fast, reactive Single Page Application with modular components. |
| **Styling** | Tailwind CSS | Responsive utility classes for all dashboard and form components. |
| **Mapping & GIS** | React-Leaflet & OpenStreetMap | Clickable map interface, circle cluster rendering, and India center lock. |
| **Icons** | Lucide React | Modern SVG icons (`Eye`, `EyeOff`, `Loader2`). |
| **HTTP Client** | Axios | Configured with automatic Bearer JWT injection interceptor. |
| **Backend API** | FastAPI & Uvicorn | Asynchronous Python REST endpoints with auto-documentation at `/docs`. |
| **ORM & Database** | SQLAlchemy & SQLite | Relational database mapping with local file storage (`civic_app.db`). |
| **Machine Learning** | Scikit-learn & NumPy | TF-IDF Vectorizer, Naive Bayes classifier, and DBSCAN clustering. |
| **Security** | Passlib, Bcrypt, PyJWT | Salted password hashing and token generation. |

### 3.2 Implemented Testing Scenarios

1. **Role-Based Authentication Testing**:
   * Tested login with seed accounts (`admin@city.com`, `manager@city.com`, `alice@test.com`).
   * Validated that Citizens cannot view the Admin control panel (an Access Denied screen is displayed if attempted).
2. **Citizen Data Isolation Testing**:
   * Verified that when Alice logs in, only Alice's complaints appear in "My History".
   * Verified that registering a new citizen creates an empty complaint list rather than showing another user's submissions.
3. **Complaint Redressal & Hotspot Eviction Testing**:
   * Injected 3 complaints within 300 meters in New Delhi. Verified that the Admin Heatmap renders an active hotspot.
   * Marked 1 complaint as "Resolved" from the Manager Dashboard. Verified that the active hotspot count decrements and the cluster circle immediately disappears from the heatmap.
4. **Hardware & Geolocation Testing**:
   * Tested HTML5 Geolocation triggering on desktop and mobile viewports.
   * Tested in-browser camera streaming, canvas image capture, and Base64 storage in SQLite.

### 3.3 Performance & Usability Refinements Implemented
* **Toast Notification Engine (`ToastContext.jsx`)**: Built a custom non-blocking notification context to replace freezing native browser `alert()` popups.
* **Loading Spinners & Spam Prevention**: Configured submit buttons to disable and display spinning `Loader2` icons during API requests to prevent accidental duplicate submissions.
* **Auto-Migration Engine (`backend/main.py`)**: Added startup checks executing `ALTER TABLE` commands for new columns (`address`, `first_name`, `last_name`, `contact_number`, `occupation`) so schema changes never crash an existing SQLite database.
* **DOM Throttling via Pagination**: Master database table in Admin Dashboard restricts rendered rows to 10 items at a time to maintain high frame rates.

---

## 4. Industry Readiness and Refinement

This section documents the specific engineering standards, safety guards, and structural refinements **already built into this codebase**:

### 4.1 Modular Codebase Organization
The project is organized into dedicated, single-responsibility modules:
* `backend/routes/`: Segregates authentication (`auth.py`), complaints handling (`complaints.py`), and admin governance (`dashboard.py`).
* `backend/ai/`: Isolates Machine Learning pipelines (`nlp_classifier.py`, `hotspot_detector.py`).
* `frontend/src/pages/`: Separates dashboards by user role (`CitizenDashboard.jsx`, `OfficerDashboard.jsx`, `AdminDashboard.jsx`).
* `frontend/src/ToastContext.jsx`: Provides a reusable notification layer across all components.

### 4.2 Data Sanitization & Circular Reference Prevention
* FastAPI endpoint `/dashboard/users` maps raw SQLAlchemy user models into clean dictionaries, explicitly removing `password_hash` and detaching circular relationships (`User -> Complaint -> User`) to prevent serialization recursion errors.
* Added fallback extraction in `get_current_user` checking both `payload["id"]` and `payload["sub"]` (email) to ensure user sessions never fail due to token format differences.

### 4.3 Clean Deployment & Startup Scripts
The repository contains ready-to-run automation scripts for Windows environments:
* **`requirements.txt`**: Standardized package manifest for Python dependencies.
* **`seed.py`**: Initial database seeder that sets up the database and creates default accounts:
  * Admin: `admin@city.com` / `AdminCivic2026!`
  * Manager: `manager@city.com` / `ManagerCivic2026!`
  * Citizen: `alice@test.com` / `AliceCivic2026!`
* **`start_backend.ps1`**: Activates virtual environment and starts FastAPI with hot-reload enabled.
* **`start_frontend.ps1`**: Navigates to the frontend directory and boots the Vite dev server.
* **`.gitignore`**: Configured to ensure `node_modules/`, Python virtual environments (`backend/venv/`), and database binaries (`civic_app.db`) are excluded from Git commits.

---

## 5. Project Outcome

### 5.1 Deliverables Achieved Against Project Goals

| Core Objective | What Was Implemented in this Project | Project Result |
| :--- | :--- | :--- |
| **"Predict"** | DBSCAN Spatial Density Clustering (`backend/ai/hotspot_detector.py`) | Automatically detects geographic complaint clusters $\ge 3$ issues within 500m, allowing municipal administrators to identify recurring failure areas. |
| **"Prioritize"** | NLP Text Classifier (`backend/ai/nlp_classifier.py`) | Automatically categorizes complaint descriptions into departments (*Roads, Electricity, Water, Waste*) with zero human sorting time. |
| **"Prevent"** | Role-Based Dashboards, Leaflet GIS Maps, WebRTC Camera Proof, and Citizen Contact Cards | Eradicates the lack of transparency in traditional complaint filing; gives field managers turn-by-turn navigation and direct phone contact with citizens. |

### 5.2 Summary of Implemented User Roles

1. **Citizen Portal**:
   * Users can register with full details (Name, Phone, Occupation).
   * Submit complaints with photo proof and automatic street-level address detection.
   * View personal submission history with real-time status badges.
2. **Manager (Officer) Portal**:
   * Review all submitted city issues.
   * View reporter contact information with one-click calling (`tel:`) and email links.
   * Open exact coordinates directly in Google Maps.
   * Update resolution status (`Pending`, `In Progress`, `Resolved`).
3. **Admin Portal**:
   * High-level system overview counters.
   * Live interactive Hotspot Heatmap over India.
   * Split user management to promote/demote or delete users.
   * Master database table with pagination and complaint purge tools.

### 5.3 Final Status
CivicMind AI is a fully functional, self-contained fullstack application. All components—frontend interfaces, FastAPI routing, Machine Learning inference, GIS mapping, and database persistence—are implemented, integrated, and verified to operate smoothly on the local development environment.
