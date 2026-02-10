# Stock Price Analyzer

Real-time stock analysis with moving averages and buy/sell signals.

## Architecture

- **Frontend**: Standalone HTML file (`index.html`) - Deploy to GitHub Pages
- **Backend**: Node.js/Express API (`backend/`) - Deploy to Railway, Render, or Heroku

## Quick Start

### Frontend (GitHub Pages)

1. Push `index.html` to your GitHub repo
2. Go to **Settings** → **Pages** → Select main branch
3. Visit: `https://yourusername.github.io/repo-name`
4. On first load, enter your backend API URL when prompted
5. Done!

### Backend (Railway - Recommended)

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Set root directory to `backend`
4. Deploy
5. Copy your deployed URL and paste it in the frontend

## Project Structure

```
Stock-Price-Analyzer/
├── index.html              # Frontend (GitHub Pages)
├── backend/
│   ├── server.js          # Backend API
│   ├── package.json       # Dependencies
│   └── README.md          # Backend docs
└── [other Next.js files]  # Not used in this setup
```

## Features

- 📈 Real-time stock data from Yahoo Finance
- 📊 20-day and 50-day moving averages
- 🎯 Automated BUY/SELL/HOLD signals
- 📱 Responsive design
- 🚀 No build step needed

## How It Works

1. User enters a stock symbol in the HTML interface
2. Frontend calls backend API: `/api/stock?symbol=AAPL`
3. Backend fetches historical data from Yahoo Finance
4. Backend calculates moving averages and generates signals
5. Frontend displays chart and recommendations

## Cost-Free Deployment

- **Frontend**: GitHub Pages (FREE)
- **Backend**: Railway free tier or Render free tier (5 services)
- **Data Source**: Yahoo Finance API (FREE)

## Customization

### Change Moving Average Periods

Edit `backend/server.js`:
```javascript
const ma20 = calculateMA(closes, 20);  // Change 20 to other period
const ma50 = calculateMA(closes, 50);  // Change 50 to other period
```

### Change Data Range

Edit `backend/server.js`:
```javascript
async function fetchStockData(symbol, days = 365) // Change 365 to other days
```

### Modify Signal Logic

Edit the `generateSignal()` function in `backend/server.js`

## Troubleshooting

**404 Error on GitHub Pages**
- Make sure `index.html` is in the root of your repo
- Check GitHub Pages is enabled in Settings

**Backend API not responding**
- Check backend is deployed and running
- Verify the API URL is correct in localStorage (open dev console)
- Check backend logs for errors

**No stock data found**
- Ensure symbol is valid (e.g., AAPL, GOOGL)
- Yahoo Finance may have rate limits - wait a moment and retry

## License

MIT
