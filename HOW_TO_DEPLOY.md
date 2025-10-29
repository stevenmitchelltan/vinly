# How to Deploy - Quick Reference

## After Updating Wines Locally

Just run ONE command:

```powershell
.\scripts\deploy.ps1
```

That's it! The script will:
1. ✅ Export wines from MongoDB
2. ✅ Build frontend with correct base path
3. ✅ Verify everything is correct
4. ✅ Show you what changed
5. ✅ Ask for confirmation
6. ✅ Commit and push

---

## Example Output

```
Vinly Deployment Script
=======================

Checking Docker...
SUCCESS: Docker is running

Exporting wines from MongoDB...
SUCCESS: Exported 41 wines to docs/wines.json

Verifying wines.json...
SUCCESS: wines.json is valid
  Size: 47.6 KB

Building frontend for GitHub Pages...
SUCCESS: Build complete with verification

Changes to deploy:
-------------------
M  docs/wines.json
M  docs/assets/index-xxx.js

wines.json has been updated

Ready to deploy to GitHub Pages

Deploy now? (y/n): _
```

Type `y` and press Enter → Done!

---

## Common Workflows

### 1. Added wines via Admin Panel
```powershell
# After editing in http://localhost/admin
.\scripts\deploy.ps1
```

### 2. Ran Rescanning Script
```powershell
# After running find_and_add_missed_wines.py
.\scripts\deploy.ps1
```

### 3. Manually Added TikTok Post
```powershell
# After using add_manual_post.py
.\scripts\deploy.ps1
```

---

## Safety Features

The deployment script includes automatic checks:

- ✅ Verifies Docker is running
- ✅ Exports wines from MongoDB
- ✅ Validates wines.json (size, valid JSON)
- ✅ Builds with correct base path (`/vinly/`)
- ✅ Verifies asset paths in built files
- ✅ Shows git diff before deploying
- ✅ Requires confirmation (can't accidentally deploy)
- ✅ Clear error messages if something fails

**You cannot accidentally deploy with wrong settings!**

---

## If Something Goes Wrong

The script will stop and show clear error messages:

### "ERROR: Docker is not running"
→ Start Docker Desktop

### "ERROR: Build failed"
→ Check `frontend/` for code errors, fix them first

### "ERROR: wines.json is not valid JSON"
→ Check MongoDB connection, re-export

### "ERROR: Found assets with incorrect paths"
→ The verification caught a base path issue - script will not deploy

---

## Advanced: Manual Deployment

See `DEPLOYMENT.md` for manual deployment steps if needed.

---

## GitHub Actions

Every push/PR is automatically verified:
- ✅ Frontend builds successfully
- ✅ wines.json is valid
- ✅ Asset paths are correct

Check status: https://github.com/stevenmitchelltan/vinly/actions

