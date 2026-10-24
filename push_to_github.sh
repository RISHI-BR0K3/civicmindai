#!/bin/bash
set -e

echo "🚀 Preparing to push CivicMind AI to GitHub..."

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install it with: sudo dnf install git"
    exit 1
fi

if [ ! -d ".git" ]; then
    git init
    echo "📁 Initialized Git repository."
fi

REMOTE_URL="https://github.com/RISHI-BR0K3/civicmindai.git"

if git remote | grep -q "origin"; then
    git remote set-url origin "$REMOTE_URL"
else
    git remote add origin "$REMOTE_URL"
fi

git branch -M main

echo "📦 Staging files (excluding venv and node_modules)..."
git add .

if [ -n "$(git status --porcelain)" ]; then
    git commit -m "feat: complete CivicMind AI platform with AI routing, GIS maps, and auth"
    echo "✅ Committed files."
else
    echo "ℹ️ No changes to commit."
fi

echo "🌐 Pushing to GitHub (origin main)..."
echo "👉 If Git asks for credentials, enter your GitHub username and Personal Access Token (PAT)."
git push -u origin main

echo "🎉 Successfully uploaded to https://github.com/RISHI-BR0K3/civicmindai !"
