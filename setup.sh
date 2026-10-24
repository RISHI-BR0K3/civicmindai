#!/bin/bash
set -e

echo "🚀 Setting up CivicMind AI on Linux..."

# 1. Setup Backend Python Environment
echo "🐍 Configuring Python virtual environment..."
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 2. Seed Database
echo "🌱 Initializing and seeding SQLite database..."
python3 seed.py

# 3. Setup Frontend Node Environment
echo "⚛️ Installing Frontend dependencies..."
cd frontend
npm install --legacy-peer-deps
cd ..

echo "✅ Setup complete! You can now start the backend and frontend."
echo "👉 To start backend: ./start_backend.sh"
echo "👉 To start frontend: ./start_frontend.sh"
