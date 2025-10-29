# Deployment Script for Vinly - GitHub Pages
# 
# This script automates the deployment process with safety checks

Write-Host ""
Write-Host "Vinly Deployment Script" -ForegroundColor Magenta
Write-Host "=======================" -ForegroundColor Magenta
Write-Host ""

# Step 1: Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Cyan
try {
    $dockerCheck = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker is not running" -ForegroundColor Red
        Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "SUCCESS: Docker is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not installed or not running" -ForegroundColor Red
    exit 1
}

# Step 2: Export wines from MongoDB
Write-Host ""
Write-Host "Exporting wines from MongoDB..." -ForegroundColor Cyan
$exportOutput = docker-compose exec -T backend python scripts/export_to_json.py 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to export wines" -ForegroundColor Red
    Write-Host $exportOutput -ForegroundColor Red
    exit 1
}

# Parse the number of wines from output
if ($exportOutput -match "Exported (\d+) wines") {
    $wineCount = $matches[1]
    Write-Host "SUCCESS: Exported $wineCount wines to docs/wines.json" -ForegroundColor Green
} else {
    Write-Host "WARNING: Could not parse wine count from export output" -ForegroundColor Yellow
    $wineCount = "unknown"
}

# Step 3: Verify wines.json
Write-Host ""
Write-Host "Verifying wines.json..." -ForegroundColor Cyan
if (-not (Test-Path "docs/wines.json")) {
    Write-Host "ERROR: docs/wines.json not found" -ForegroundColor Red
    exit 1
}

$jsonSize = (Get-Item "docs/wines.json").Length
if ($jsonSize -lt 1024) {
    Write-Host "ERROR: docs/wines.json is too small" -ForegroundColor Red
    Write-Host "Expected at least 1KB of data" -ForegroundColor Yellow
    exit 1
}

# Try to parse JSON
try {
    $json = Get-Content "docs/wines.json" -Raw | ConvertFrom-Json
    $sizeKB = [math]::Round($jsonSize/1024, 1)
    Write-Host "SUCCESS: wines.json is valid" -ForegroundColor Green
    Write-Host "  Size: $sizeKB KB" -ForegroundColor Gray
} catch {
    Write-Host "ERROR: wines.json is not valid JSON" -ForegroundColor Red
    exit 1
}

# Step 4: Build frontend for GitHub Pages
Write-Host ""
Write-Host "Building frontend for GitHub Pages..." -ForegroundColor Cyan
Push-Location frontend
try {
    npm run build:pages 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "SUCCESS: Build complete with verification" -ForegroundColor Green
} finally {
    Pop-Location
}

# Step 5: Show git changes
Write-Host ""
Write-Host "Changes to deploy:" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Gray

$gitStatus = git status --short docs/
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "No changes to deploy" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Everything is already up to date!" -ForegroundColor Cyan
    exit 0
}

# Show changes
Write-Host $gitStatus -ForegroundColor White

# Show wine count change if wines.json changed
if ($gitStatus -match "wines.json") {
    Write-Host ""
    Write-Host "wines.json has been updated" -ForegroundColor Cyan
}

# Step 6: Confirm deployment
Write-Host ""
Write-Host "Ready to deploy to GitHub Pages" -ForegroundColor Green
Write-Host ""
$confirmation = Read-Host "Deploy now? (y/n)"

if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host ""
    Write-Host "Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

# Step 7: Commit and push
Write-Host ""
Write-Host "Deploying..." -ForegroundColor Cyan

git add docs/

$commitMsg = "Deploy: Updated wines"
if ($wineCount -ne "unknown") {
    $commitMsg = "Deploy: Updated wines ($wineCount total)"
}
git commit -m $commitMsg

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Commit failed" -ForegroundColor Red
    exit 1
}

git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Push failed" -ForegroundColor Red
    exit 1
}

# Success!
Write-Host ""
Write-Host "SUCCESS: Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Site will update in 1-2 minutes:" -ForegroundColor Cyan
Write-Host "https://stevenmitchelltan.github.io/vinly/" -ForegroundColor Blue
Write-Host ""
Write-Host "Check deployment status:" -ForegroundColor Cyan
Write-Host "https://github.com/stevenmitchelltan/vinly/actions" -ForegroundColor Blue
Write-Host ""
