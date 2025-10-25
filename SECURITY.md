# 🔒 Security Guide

## ⚠️ IMPORTANT: Exposed Credentials

**During development, the following credentials were exposed in chat history:**

1. ✅ MongoDB URI (username/password visible)
2. ✅ OpenAI API Key
3. ✅ Instagram account password

### 🚨 **Action Required: Rotate These Credentials!**

#### 1. MongoDB Atlas Credentials
**Current Risk:** High - Database access exposed

**Fix:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Database Access** → Your user
3. Click **Edit** → **Edit Password**
4. Generate a new password
5. Update your `.env` file with the new connection string
6. Restart your backend

#### 2. OpenAI API Key
**Current Risk:** Medium - API usage/billing exposure

**Fix:**
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. **Revoke** the exposed key: `sk-proj-TQY2GVd9UHm8t_...`
3. Create a new API key
4. Update `OPENAI_API_KEY` in `.env`
5. Restart your backend

**Optional but recommended:** Set usage limits in OpenAI dashboard

#### 3. Instagram Account
**Current Risk:** Low - Throwaway account

**Fix (if using real account):**
1. Go to Instagram → Settings → Security
2. Change password
3. Update `INSTAGRAM_PASSWORD` in `.env` (if you decide to use Instagram again)
4. Enable 2FA for extra security

**Note:** Instagram scraping is currently disabled in favor of TikTok, so this is less critical.

---

## 🛡️ Security Best Practices

### Environment Variables

**✅ DO:**
- Use `.env` files for sensitive data
- Keep `.env` in `.gitignore`
- Use `.env.example` with placeholder values
- Rotate credentials periodically (every 90 days)
- Use different credentials for dev/staging/production

**❌ DON'T:**
- Commit `.env` files to git
- Share credentials in chat/email/Slack
- Use production credentials in development
- Hardcode credentials in source code
- Reuse credentials across projects

### API Key Security

**OpenAI API:**
- Set monthly spending limits ($10-20 recommended)
- Enable usage notifications
- Monitor usage in OpenAI dashboard
- Revoke unused keys immediately

**MongoDB:**
- Use Network Access whitelist (allow specific IPs only)
- Create read-only users when possible
- Enable MongoDB Atlas audit logs
- Use separate databases for dev/prod

### Production Deployment

**Before deploying:**
1. ✅ Verify `.env` is gitignored
2. ✅ Use environment variables in hosting platform
3. ✅ Enable HTTPS only
4. ✅ Set strict CORS origins
5. ✅ Use production-grade MongoDB cluster
6. ✅ Enable rate limiting on API endpoints

**Railway/Vercel/Render:**
- Add environment variables in dashboard (not in code)
- Enable automatic deployments only from protected branches
- Use secret scanning tools

### Git Security

**Check before committing:**
```bash
# Check what will be committed
git status
git diff

# Verify .env is not staged
git ls-files | grep .env
# Should return nothing!

# Check history for leaked secrets
git log --all --full-history --source -- .env
```

**If you accidentally committed secrets:**
```bash
# 1. Rotate compromised credentials IMMEDIATELY
# 2. Remove from git history:
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch backend/.env' \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (ONLY if not shared yet)
git push origin --force --all
```

---

## 🔍 Checking Your Security

### Quick Security Audit

Run these checks periodically:

```bash
# 1. Verify .env is gitignored
cat .gitignore | grep .env

# 2. Check for committed secrets
git ls-files | grep -E '\\.env$|\\.env\\..*'

# 3. Verify no hardcoded credentials
cd backend && grep -r "mongodb+srv://" --include="*.py" app/
cd frontend && grep -r "sk-" --include="*.js" --include="*.jsx" src/

# 4. Check MongoDB whitelist
# Go to MongoDB Atlas → Network Access
# Should NOT be 0.0.0.0/0 in production!
```

### Environment Variable Checklist

**Backend `.env` should have:**
- ✅ `MONGODB_URI` (not hardcoded)
- ✅ `OPENAI_API_KEY` (not hardcoded)
- ✅ `CORS_ORIGINS` (specific domains in production)
- ❌ No commented-out credentials
- ❌ No test/dummy values

**Frontend `.env.local` should have:**
- ✅ `VITE_API_BASE_URL` (production backend URL)
- ❌ No API keys (these should be backend-only!)

---

## 📋 Security Checklist for Production

Before going live:

### Database Security
- [ ] Changed MongoDB password from exposed one
- [ ] Network Access whitelist configured (not 0.0.0.0/0)
- [ ] Database user has minimum required permissions
- [ ] Enabled MongoDB Atlas audit logs
- [ ] Backups configured

### API Security
- [ ] Rotated OpenAI API key
- [ ] Set OpenAI spending limits ($10-20/month)
- [ ] Enabled usage alerts
- [ ] API rate limiting configured
- [ ] CORS restricted to production domain only

### Application Security
- [ ] All secrets in environment variables
- [ ] HTTPS enabled (mandatory)
- [ ] Security headers configured
- [ ] No credentials in git history
- [ ] `.env` files in `.gitignore`

### Monitoring
- [ ] MongoDB Atlas monitoring enabled
- [ ] OpenAI usage tracking active
- [ ] Backend error logging configured
- [ ] Uptime monitoring setup (optional)

---

## 🆘 What to Do If Credentials Are Compromised

**Immediate actions:**

1. **Rotate affected credentials** (see steps above)
2. **Check for unauthorized access:**
   - MongoDB Atlas: Check recent connections
   - OpenAI: Check usage logs for unusual activity
3. **Update all environments** with new credentials
4. **Monitor for 24-48 hours** for suspicious activity
5. **Review git history** to ensure no secrets committed

**If you suspect unauthorized database access:**
1. Create new MongoDB cluster
2. Migrate data
3. Delete old cluster
4. Update connection strings

---

## 📚 Additional Resources

- [MongoDB Atlas Security](https://www.mongodb.com/docs/atlas/security/)
- [OpenAI API Security Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)
- [Git Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## ✅ Current Security Status

**As of project creation:**
- ✅ `.env` files are gitignored
- ✅ `.env.example` templates provided
- ✅ Documentation includes security warnings
- ⚠️ **EXPOSED CREDENTIALS NEED ROTATION** (see top of this document)

**Your next steps:**
1. Rotate MongoDB password (5 minutes)
2. Rotate OpenAI API key (2 minutes)
3. Update `.env` file with new credentials
4. Test that everything still works

---

**Stay secure! 🔒**

