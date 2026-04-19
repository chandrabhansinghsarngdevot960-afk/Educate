# 🚀 Auto-Update System - Quick Start

## What's Ready Now

✅ **Automatic Update System** - Every 6 hours automatically
✅ **GitHub Actions Configured** - No manual work needed
✅ **News Feed JSON** - Real-time news storage
✅ **Website Ready** - Already integrated to show updates

## How to Enable (3 Simple Steps)

### Step 1: Push to GitHub
```bash
# In your terminal/command prompt:
cd "c:\Users\chand\OneDrive\Documents\Educate"
git init
git add .
git commit -m "Add auto-update system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/educate.git
git push -u origin main
```

### Step 2: Enable GitHub Actions
Go to your GitHub repo → **Settings** → **Actions** → Enable it

### Step 3: Done! 🎉
The system will automatically:
- ✅ Update every 6 hours
- ✅ Fetch RBSE data  
- ✅ Update news feed
- ✅ Auto-commit changes
- ✅ Website shows latest data

## Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/auto-update-data.yml` | GitHub Actions schedule |
| `scripts/fetchData.js` | Data fetching script |
| `news-updates.json` | Auto-updated news feed |
| `package.json` | Dependencies |

## Updates Display

The system automatically shows:
- 🔄 **Auto-update badge** on the ticker
- 📰 **Latest news** from all sources
- ⏰ **Next update time** on hover

## How Often Does It Update?

**Every 6 hours**: 12:00 AM, 6:00 AM, 12:00 PM, 6:00 PM (UTC)

To change: Edit `.github/workflows/auto-update-data.yml` and modify the `cron` value

## Example Update Frequency Options

```yaml
# Every 3 hours
- cron: '0 */3 * * *'

# Every day at 6 AM
- cron: '0 6 * * *'

# Every 2 hours
- cron: '0 */2 * * *'
```

## Check If It's Working

1. Go to GitHub repository
2. Click **Actions** tab
3. See "Auto Update RBSE Data" workflow
4. It will show when it last ran

## Troubleshooting

❌ **Workflow not running?**
- Enable Actions in Settings
- Ensure repository is public (if using free tier)

❌ **Data not updating?**
- Check Actions tab for error logs
- Verify GitHub token has write permission

❌ **Want to test now?**
- Go to **Actions** → **Auto Update RBSE Data**
- Click "Run workflow" → "Run workflow"

## Customize Data Sources

Edit `scripts/fetchData.js` to:
- Add your own data sources
- Fetch from different websites
- Process data differently

## Need Help?

See **SETUP_AUTO_UPDATE.md** for detailed documentation

---

**Status**: ✅ Ready to push to GitHub!
