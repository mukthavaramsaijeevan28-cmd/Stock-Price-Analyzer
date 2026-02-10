# Stock Analyzer Backend

Simple Node.js/Express backend for fetching stock data and generating trading signals.

## Installation

```bash
npm install
```

## Local Development

```bash
npm run dev
```

The server will run on `http://localhost:3001`

Test the API:
```
http://localhost:3001/api/stock?symbol=AAPL
```

## Deployment

### Deploy to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create a new project → Connect GitHub repo
4. Select the `backend` folder as the root directory
5. Add environment variable: `PORT=3001`
6. Deploy!

### Deploy to Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`
5. Deploy!

### Deploy to Heroku (Alternative)

```bash
heroku login
heroku create your-app-name
git push heroku main
```

## Environment Variables

- `PORT` - Server port (default: 3001)

## API Endpoints

### GET /api/stock?symbol=SYMBOL

Returns stock analysis data including:
- Current price and change
- Historical data (1 year)
- Moving averages (20 & 50 day)
- Trading signal (BUY/SELL/HOLD)
- Signal strength

Example response:
```json
{
  "symbol": "AAPL",
  "currentPrice": 150.25,
  "change": 2.15,
  "changePercent": 1.45,
  "signal": "BUY",
  "signalStrength": 0.8,
  "data": [...],
  "ma20": [...],
  "ma50": [...]
}
```

## Frontend Setup

Update the API URL in `index.html`:
1. On first load, you'll be prompted to enter the backend URL
2. Enter your deployed backend URL (e.g., `https://your-app.railway.app`)
3. This will be saved in localStorage for future use
