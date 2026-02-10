import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Helper to fetch stock data from Yahoo Finance
async function fetchStockData(symbol, days = 365) {
  try {
    const historicalUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`;

    const response = await fetch(historicalUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${symbol}`);
    }

    const json = await response.json();
    const result = json.chart?.result?.[0];

    if (!result) {
      throw new Error('No data found');
    }

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const volumes = result.indicators?.quote?.[0]?.volume || [];

    return timestamps
      .map((ts, idx) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        close: closes[idx] || 0,
        volume: volumes[idx] || 0,
      }))
      .filter((d) => d.close > 0);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return [];
  }
}

// Calculate moving average
function calculateMA(data, period) {
  return data.map((_, idx) => {
    if (idx < period - 1) return null;
    const slice = data.slice(idx - period + 1, idx + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

// Generate buy/sell signals
function generateSignal(prices, ma20, ma50) {
  const lastPrice = prices[prices.length - 1];
  const lastMA20 = ma20[ma20.length - 1];
  const lastMA50 = ma50[ma50.length - 1];

  let score = 0;

  if (lastMA20 && lastMA50) {
    // Price above both MAs = bullish
    if (lastPrice > lastMA20 && lastMA20 > lastMA50) {
      score += 2;
    } else if (lastPrice < lastMA20 && lastMA20 < lastMA50) {
      score -= 2;
    }

    // MA20 above MA50 = bullish
    if (lastMA20 > lastMA50) {
      score += 1;
    } else if (lastMA20 < lastMA50) {
      score -= 1;
    }

    // Price relative to MAs
    if (lastPrice > lastMA20) {
      score += 1;
    } else if (lastPrice < lastMA20) {
      score -= 1;
    }
  }

  let signal = 'HOLD';
  let strength = 0;

  if (score >= 3) {
    signal = 'BUY';
    strength = Math.min(score / 5, 1);
  } else if (score <= -3) {
    signal = 'SELL';
    strength = Math.min(Math.abs(score) / 5, 1);
  } else {
    strength = Math.abs(score) / 5;
  }

  return { signal, strength };
}

// Main API endpoint
app.get('/api/stock', async (req, res) => {
  try {
    const { symbol } = req.query;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const cleanSymbol = symbol.trim().toUpperCase();

    if (!/^[A-Z0-9]{1,7}$/.test(cleanSymbol)) {
      return res.status(400).json({ error: 'Invalid symbol format' });
    }

    const data = await fetchStockData(cleanSymbol);

    if (data.length === 0) {
      return res.status(404).json({ error: `No data found for symbol: ${cleanSymbol}` });
    }

    const closes = data.map((d) => d.close);
    const ma20 = calculateMA(closes, 20);
    const ma50 = calculateMA(closes, 50);

    const { signal, strength } = generateSignal(closes, ma20, ma50);

    const currentPrice = closes[closes.length - 1];
    const previousPrice = closes[closes.length - 2] || currentPrice;
    const change = currentPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;

    res.json({
      symbol: cleanSymbol,
      currentPrice,
      change,
      changePercent,
      data,
      ma20,
      ma50,
      signal,
      signalStrength: strength,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Stock analyzer backend running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/stock?symbol=AAPL`);
});
