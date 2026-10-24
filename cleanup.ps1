$ErrorActionPreference = "SilentlyContinue"

Write-Host "🧹 Removing Fedora and temporary files..." -ForegroundColor Cyan

$filesToRemove = @(
    "docs\FEDORA_GUIDE.md",
    "HOW_TO_USE_ON_FEDORA.md",
    "setup.sh",
    "start_backend.sh",
    "start_frontend.sh",
    "push_to_github.sh",
    "push_to_github.ps1",
    "CIVICMIND_AI_LINUX_PROMPT.txt",
    "setup_frontend.ps1"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        git rm -f $file 2>$null
        Remove-Item -Force -Path $file -ErrorAction SilentlyContinue
        Write-Host "  Removed: $file" -ForegroundColor Yellow
    }
}

git add .
git commit -m "chore: remove Fedora/Linux files and focus project on Windows"
git push

Remove-Item -Force -Path "cleanup.ps1" -ErrorAction SilentlyContinue

Write-Host "✅ Cleanup complete and pushed to GitHub!" -ForegroundColor Green
