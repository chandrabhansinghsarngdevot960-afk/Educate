# 📚 Educate - Auto-Updating RBSE Data System

## ✨ Features

- **🔄 Automatic Updates**: Updates every 6 hours via GitHub Actions
- **📡 Multiple Sources**: RBSE Official, GitHub, News Feeds
- **📰 Live News Feed**: Real-time announcements and updates
- **🚀 Serverless**: No server needed, all via GitHub
- **✅ Auto-Commit**: Changes automatically committed to GitHub

## 📋 Setup Instructions

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit with auto-update system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/educate.git
git push -u origin main
```

### Step 2: Enable GitHub Actions
1. Go to your GitHub repository
2. Click **Settings** → **Actions** → **General**
3. Make sure "Allow all actions and reusable workflows" is enabled

### Step 3: Enable Scheduled Workflows (Important!)
1. Go to **Settings** → **Actions** → **Workflow permissions**
2. Select "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"

### Step 4: First Manual Run (Optional)
1. Go to **Actions** tab on GitHub
2. Click "Auto Update RBSE Data"
3. Click "Run workflow"
4. Watch it execute and auto-commit! 🎉

## 📊 How It Works

```
Every 6 Hours:
┌─────────────────────────────────────┐
│ GitHub Actions Workflow Triggered   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Node.js Script Runs (fetchData.js)  │
└────────────┬────────────────────────┘
             │
             ├─► Fetch RBSE Data
             ├─► Fetch GitHub Updates
             └─► Generate News Feed
             │
             ▼
┌─────────────────────────────────────┐
│ Update JSON Files                   │
│ - news-updates.json                 │
│ - data.js                           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Auto-Commit & Push to GitHub        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Website Loads Latest Data! 🎉       │
└─────────────────────────────────────┘
```

## 📁 File Structure

```
educate/
├── .github/
│   └── workflows/
│       └── auto-update-data.yml       (GitHub Actions workflow)
├── scripts/
│   └── fetchData.js                   (Data fetching script)
├── data.js                            (Main data file)
├── news-updates.json                  (Auto-updated news feed)
├── package.json                       (Dependencies)
├── index.html                         (Frontend)
├── scripts.js                         (Frontend logic)
├── style.css                          (Styling)
└── README.md                          (This file)
```

## 🔧 Customization

### Change Update Frequency
Edit `.github/workflows/auto-update-data.yml`:

```yaml
# Every 3 hours
- cron: '0 */3 * * *'

# Every 12 hours  
- cron: '0 0,12 * * *'

# Every day at 6 AM
- cron: '0 6 * * *'
```

### Add New Data Sources
Edit `scripts/fetchData.js`:

```javascript
async function fetchCustomData() {
    // Add your custom fetch logic
    return {
        source: 'Your Source',
        data: [...],
        lastUpdated: new Date().toISOString()
    };
}
```

### Display News in HTML
Update `index.html` or `scripts.js`:

```javascript
fetch('./news-updates.json')
    .then(res => res.json())
    .then(newsData => {
        // Display news feed
        console.log(newsData.allNews);
    });
```

## 🌐 Live Update Display Example

In your `scripts.js`:

```javascript
// Load news feed
async function loadNewsFeed() {
    try {
        const response = await fetch('./news-updates.json');
        const data = await response.json();
        
        console.log('Last Updated:', data.lastUpdated);
        console.log('Next Update:', data.autoUpdate.nextUpdate);
        
        // Display news
        data.allNews.forEach(news => {
            console.log(`[${news.source}] ${news.title}`);
            console.log(`  ${news.content}`);
            console.log(`  ${news.date}\n`);
        });
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

loadNewsFeed();
```

## 🚨 Troubleshooting

### Workflow Not Running?
- Check if GitHub Actions is enabled in Settings
- Verify branch protection rules don't block automatic commits
- Check "Actions" tab for error logs

### Data Not Updating?
- Go to GitHub Actions logs and check for errors
- Ensure `scripts/fetchData.js` has correct permissions
- Verify GitHub token has write access

### Want to Debug?
1. Make a small change to test the workflow
2. Go to Actions tab → see live logs
3. Check "Run workflow" → "Run workflow" for manual trigger

## 📞 Support

For issues or questions:
1. Check GitHub Actions logs (Actions tab)
2. Verify all files are properly committed
3. Check file permissions in `.github/workflows/`

## 📝 License

MIT License - Feel free to use and modify!

---

**Happy Learning! 📚✨**

Last Auto-Update: Check `news-updates.json` for latest timestamp
