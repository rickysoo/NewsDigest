# Git Repository Setup Checklist

Follow this checklist before pushing your FMT News Digest project to Git.

## ✅ Pre-Push Checklist

### 1. Repository Preparation
- [ ] Created GitHub/GitLab repository
- [ ] Cloned repository or initialized git locally
- [ ] Added remote origin URL

### 2. Environment Security ⚠️ CRITICAL
- [ ] Created `.env` file locally (DO NOT commit this)
- [ ] Verified `.env` is in `.gitignore`
- [ ] Verified `digest-config.json` is in `.gitignore` (contains email addresses)
- [ ] Copied `.env.example` and `digest-config.example.json` for contributors
- [ ] All sensitive data removed from code files
- [ ] **READ SECURITY_CHECKLIST.md FIRST** ⚠️

### 3. Documentation Complete
- [ ] README.md updated with current features
- [ ] CONTRIBUTING.md created for contributors
- [ ] DEPLOYMENT.md created for production setup
- [ ] LICENSE file included
- [ ] .env.example configured properly

### 4. Code Quality
- [ ] All scripts are executable (`npm run setup` completed)
- [ ] CLI commands tested: `./digest config`, `./digest status`
- [ ] No hardcoded credentials in any files
- [ ] All temporary files excluded in `.gitignore`

### 5. Package Configuration
- [ ] Package.json has correct repository URL
- [ ] Version number is appropriate (1.0.0 for initial release)
- [ ] Dependencies are correctly specified
- [ ] Scripts are properly configured

## 🚀 Git Commands

```bash
# Initialize repository (if not already done)
git init

# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/[username]/fmt-news-digest.git

# Stage all files
git add .

# Check what will be committed (make sure no .env files!)
git status

# Commit with meaningful message
git commit -m "Initial release: FMT News Digest with CLI management system

- Complete automated news digest generation from FMT
- 16-command CLI interface for full system control
- Watchdog monitoring with auto-restart capabilities
- Production-ready with comprehensive documentation
- Email automation with AI-powered summaries"

# Push to repository
git push -u origin main
```

## 🔍 Final Verification

Before pushing, run these commands to ensure everything works:

```bash
# Test system functionality
./digest test

# Verify configuration
./digest config

# Check system status
./digest status

# Verify CLI help
./digest --help
```

## 📋 Files That Will Be Committed

**Core Application:**
- `digest-script.js` - Main application logic
- `digest-cli.cjs` - CLI interface
- `digest` - CLI wrapper script
- `image-converter.js` - Image processing
- All shell scripts (`.sh` files)

**Configuration:**
- `package.json` - Node.js dependencies
- `drizzle.config.ts` - Database configuration
- `.gitignore` - Git exclusions
- `.env.example` - Environment template

**Documentation:**
- `README.md` - Main project documentation
- `CONTRIBUTING.md` - Developer guidelines
- `DEPLOYMENT.md` - Production deployment guide
- `LICENSE` - MIT license
- `GIT_SETUP.md` - This file

**Files Excluded (in .gitignore):**
- `.env` - Your actual credentials
- `node_modules/` - Dependencies
- `*.log` - Log files
- `*.pid` - Process IDs
- `attached_assets/` - Development assets
- `replit.md` - Internal documentation

## 🛡️ Security Check

**Never commit these files:**
- `.env` (contains actual API keys)
- Any files with real credentials
- Log files with sensitive information
- Database files with user data

**Safe to commit:**
- `.env.example` (template only)
- All source code files
- Documentation files
- Configuration templates

## 🏁 After Pushing

1. **Verify repository** - Check GitHub/GitLab to ensure all files uploaded
2. **Test clone** - Clone repository in new directory and test setup
3. **Update repository settings** - Add description, topics, README display
4. **Create first release** - Tag version 1.0.0 for initial release

## 📞 Need Help?

If you encounter issues:
1. Check `.gitignore` is working: `git status` shouldn't show `.env`
2. Verify remote URL: `git remote -v`
3. Test local functionality before pushing
4. Review commit history: `git log --oneline`

---

**Ready to push?** ✅ All items checked above = Ready for Git!