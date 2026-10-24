$ErrorActionPreference = "Stop"

Write-Host "🚀 Preparing to push CivicMind AI to GitHub..." -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Git is not installed or not found in PATH." -ForegroundColor Red
    Exit 1
}

if (-not (Test-Path ".git")) {
    git init
    Write-Host "📁 Initialized Git repository." -ForegroundColor Green
}

$remoteUrl = "https://github.com/RISHI-BR0K3/civicmindai.git"
$hasRemote = git remote 2>$null | Select-String "origin"

if ($hasRemote) {
    git remote set-url origin $remoteUrl
} else {
    git remote add origin $remoteUrl
}

git branch -M main

Write-Host "📦 Staging files (excluding venv and node_modules)..." -ForegroundColor Cyan
git add .

$status = git status --porcelain
if ($status) {
    git commit -m "feat: complete CivicMind AI platform with AI routing, GIS maps, and auth"
    Write-Host "✅ Committed files." -ForegroundColor Green
} else {
    Write-Host "ℹ️ No changes to commit." -ForegroundColor Yellow
}

Write-Host "🌐 Pushing to GitHub (origin main)..." -ForegroundColor Cyan
Write-Host "👉 If Git asks for credentials, please sign in via the browser popup or personal access token." -ForegroundColor Yellow
git push -u origin main

Write-Host "🎉 Successfully uploaded to https://github.com/RISHI-BR0K3/civicmindai !" -ForegroundColor Green
