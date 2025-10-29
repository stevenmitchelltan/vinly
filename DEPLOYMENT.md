# Deployment Guide

## GitHub Pages Deployment

### Quick Deploy (Automated)

To deploy the latest wines to GitHub Pages, just run:

```powershell
# Windows
.\scripts\deploy.ps1

# The script will:
# ✓ Export wines from MongoDB
# ✓ Build frontend with correct base path
# ✓ Verify everything is correct
# ✓ Show you what changed
# ✓ Ask for confirmation
# ✓ Commit and push
```

**Wait 1-2 minutes**, then check: https://stevenmitchelltan.github.io/vinly/

### Manual Deploy (If Needed)

If you prefer to deploy manually:

```bash
# 1. Export wines from MongoDB to JSON
docker-compose exec backend python scripts/export_to_json.py

# 2. Build frontend for GitHub Pages (with correct base path)
cd frontend
npm run build:pages

# 3. Commit and push
cd ..
git add docs/
git commit -m "Deploy: Updated wines"
git push
```

---

## Why Two Build Commands?

### `npm run build` - For Docker/Local
- Base path: `/` (root)
- Used by: Docker Compose
- Assets at: `http://localhost/assets/`

### `npm run build:pages` - For GitHub Pages
- Base path: `/vinly/` (subdirectory)
- Used by: GitHub Pages
- Assets at: `https://stevenmitchelltan.github.io/vinly/assets/`

**GitHub Pages serves from a subdirectory** (the repo name), so all asset paths must be prefixed with `/vinly/`.

---

## Environment Variables

The frontend uses different base paths depending on the environment:

| Environment | VITE_BASE_PATH | Result |
|------------|----------------|--------|
| **Docker (local)** | `/` | `http://localhost/` |
| **GitHub Pages** | `/vinly/` | `.../vinly/` |

Set in:
- **Docker**: `frontend/Dockerfile` (ARG VITE_BASE_PATH=/)
- **GitHub Pages**: `npm run build:pages` command

---

## Full Deployment Workflow

### After Adding/Editing Wines

**Option 1: Automated (Recommended)**

```powershell
.\scripts\deploy.ps1
```

Type `y` when prompted to confirm deployment.

**Option 2: Manual**

1. **Export wines**:
   ```bash
   docker-compose exec backend python scripts/export_to_json.py
   ```

2. **Build for GitHub Pages**:
   ```bash
   cd frontend
   npm run build:pages  # Includes automatic verification
   ```

3. **Commit and push**:
   ```bash
   cd ..
   git add docs/
   git commit -m "Deploy: [describe changes]"
   git push
   ```

4. **Verify deployment**:
   - Go to GitHub Actions: https://github.com/stevenmitchelltan/vinly/actions
   - Wait for "pages build and deployment" to complete
   - Visit: https://stevenmitchelltan.github.io/vinly/

---

## Troubleshooting

### Assets not loading (404 errors)

**Problem**: Console shows errors like:
```
GET /assets/index-xxx.css 404 (Not Found)
```

**Cause**: Built with wrong base path (used `npm run build` instead of `npm run build:pages`)

**Fix**:
```bash
cd frontend
npm run build:pages  # ← Use this for GitHub Pages!
cd ..
git add docs/
git commit -m "Fix: Correct asset paths"
git push
```

---

### Site shows old data

**Problem**: New wines not showing on GitHub Pages

**Causes**:
1. Forgot to export wines from MongoDB
2. Forgot to rebuild frontend
3. GitHub Pages cache

**Fix**:
```bash
# 1. Export latest wines
docker-compose exec backend python scripts/export_to_json.py

# 2. Rebuild
cd frontend
npm run build:pages

# 3. Deploy
cd ..
git add docs/
git commit -m "Update wines"
git push

# 4. Hard refresh in browser (Ctrl+Shift+R)
```

---

### Local site not working

**Problem**: Assets not loading on `http://localhost/`

**Cause**: Built with GitHub Pages base path

**Fix**: Rebuild Docker container:
```bash
docker-compose build frontend
docker-compose up -d frontend
```

Docker uses `VITE_BASE_PATH=/` in the Dockerfile.

---

## Admin Panel

The admin panel is **local-only** by default:
- Local: http://localhost/admin ✅
- GitHub Pages: https://stevenmitchelltan.github.io/vinly/admin ⚠️ (works but uses static data)

### Why?

The admin panel needs to connect to the backend API to:
- Edit wines
- Delete wines  
- Add TikTok posts

On GitHub Pages:
- Only **static files** are served (HTML, CSS, JS, JSON)
- No backend API available
- Can view wines but can't edit them

### To Use Admin Panel

Always use **local Docker environment**:
```bash
docker-compose up -d
# Visit http://localhost/admin
```

---

## Safety Features

### Automated Verification

The deployment process includes automatic safety checks:

1. **Build Verification** (`verify-build.js`):
   - Runs automatically after `npm run build:pages`
   - Checks all asset paths use `/vinly/` prefix
   - Fails build if paths are incorrect

2. **Deployment Script** (`deploy.ps1`):
   - Checks Docker is running
   - Exports and validates wines.json
   - Builds with verification
   - Shows git diff before deploying
   - Requires confirmation before pushing

3. **GitHub Actions** (`verify-build.yml`):
   - Runs on every push and pull request
   - Verifies builds work with both base paths
   - Validates wines.json structure
   - Prevents merging broken code

### Manual Verification

To manually verify a build:

```bash
cd frontend
npm run verify
```

This checks that `docs/index.html` has correct asset paths.

## Quick Reference

| Task | Command |
|------|---------|
| **Deploy (automated)** | `.\scripts\deploy.ps1` |
| **Export wines** | `docker-compose exec backend python scripts/export_to_json.py` |
| **Build for local** | `docker-compose build frontend` |
| **Build for GitHub Pages** | `cd frontend && npm run build:pages` |
| **Verify build** | `cd frontend && npm run verify` |
| **Deploy (manual)** | `git add docs/ && git commit -m "Deploy" && git push` |
| **Check deployment** | Visit https://github.com/stevenmitchelltan/vinly/actions |

---

## Automated Deployment (Future)

Currently deployment is manual. To automate:

1. **GitHub Actions** could:
   - Export wines from production MongoDB
   - Build frontend
   - Deploy to Pages
   
2. **Scheduled Updates**:
   - Daily cron job
   - Auto-export + deploy

This would require:
- Hosted MongoDB (e.g., MongoDB Atlas)
- Backend API deployed (e.g., Render.com)
- GitHub Actions workflow

For now, **manual deployment is simple and works well**! ✅

