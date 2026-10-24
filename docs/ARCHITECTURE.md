# System Architecture & Technical Specifications

CivicMind AI is an end-to-end municipal issue tracking platform designed to predict, prioritize, and prevent civic breakdown through automated intelligence.

---

## 🏛️ High-Level System Architecture

```
+-------------------------------------------------------------+
|                      React 18 SPA                           |
|       (Vite + Tailwind CSS + React-Leaflet + Lucide)        |
+-------------------------------------------------------------+
                              |
                     REST APIs (Axios + JWT)
                              |
+-------------------------------------------------------------+
|                    FastAPI Application                      |
|                  (Python 3.12 + SQLAlchemy)                 |
+-------------------------------------------------------------+
         |                             |               |
         v                             v               v
+------------------+          +-----------------+ +---------------+
|  NLP Classifier  |          | DBSCAN Hotspot  | | SQLite Engine |
| (TF-IDF + Bayes) |          |   Clustering    | | (civic_app.db)|
+------------------+          +-----------------+ +---------------+
```

---

## 🧠 Artificial Intelligence Modules

### 1. NLP Department Routing (`backend/ai/nlp_classifier.py`)
- **Model Pipeline**: `TfidfVectorizer` (Text n-gram extraction) combined with `MultinomialNB` (Multinomial Naive Bayes classifier).
- **Function**: Automatically parses incoming natural language complaint descriptions (e.g. *"broken water pipe leaking on main street"*) and routes the complaint to the appropriate civic department:
  - `Roads`
  - `Electricity`
  - `Water & Sanitation`
  - `Waste Management`
- If a department is not yet initialized in the database, the system automatically registers the department on-the-fly.

### 2. Hotspot Detection via Spatial Density Clustering (`backend/ai/hotspot_detector.py`)
- **Algorithm**: `DBSCAN` (Density-Based Spatial Clustering of Applications with Noise).
- **Parameters**: `eps=0.005` (~500m radius), `min_samples=3`.
- **Function**: Evaluates the geographic distribution of all unresolved issues. When 3 or more complaints occur in close proximity, it flags a cluster center, calculates severity (`High` for $\ge 5$ issues, `Medium` otherwise), and writes the cluster coordinates to the `Hotspot` table for visual heatmap plotting on the Admin dashboard.

---

## 🗄️ Database Schema Design

### `users`
- `id`: Integer (Primary Key)
- `name`: String (Full Display Name)
- `first_name`: String
- `last_name`: String
- `contact_number`: String
- `occupation`: String (e.g., Resident, Student, IT Professional)
- `email`: String (Unique Index)
- `password_hash`: String (Bcrypt encrypted)
- `role`: String (`CITIZEN`, `OFFICER`, `ADMIN`)
- `department_id`: Integer (Foreign Key to `departments.id`, optional)

### `complaints`
- `id`: Integer (Primary Key)
- `citizen_id`: Integer (Foreign Key to `users.id`)
- `description`: String (Complaint text)
- `address`: String (Reverse geocoded human-readable location)
- `image_url`: String (Base64 encoded photo proof)
- `latitude`: Float
- `longitude`: Float
- `department_id`: Integer (Foreign Key to `departments.id`)
- `status`: String (`Pending`, `In Progress`, `Resolved`)
- `created_at`: DateTime (UTC timestamp)

### `hotspots`
- `id`: Integer (Primary Key)
- `center_latitude`: Float
- `center_longitude`: Float
- `complaint_count`: Integer
- `severity`: String (`High`, `Medium`)
- `created_at`: DateTime

---

## 🔒 Security & Authentication Flow

1. User submits credentials via `/api/auth/login` or registers via `/api/auth/register`.
2. Passwords are salted and hashed using `bcrypt`.
3. Upon validation, the server signs a JSON Web Token (`HS256` algorithm) containing the user's ID, role, and email with a 24-hour expiration.
4. The React client intercepts all outgoing HTTP requests (`api.js`) and attaches the Bearer token in the `Authorization` header.
5. Role authorization guards ensure Citizens cannot access administrative endpoints, while Managers and Admins access their designated workflows.
