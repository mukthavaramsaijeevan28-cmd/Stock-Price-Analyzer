import { NextRequest, NextResponse } from 'next/server';

interface StockData {
  date: string;
  close: number;
  volume: number;
}

interface AnalysisResult {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  data: StockData[];
  ma20: (number | null)[];
  ma50: (number | null)[];
  signal: 'BUY' | 'SELL' | 'HOLD';
  signalStrength: number;
}

// Helper to fetch stock data from yfinance via a public API
async function fetchStockData(symbol: string, days: number = 365): Promise<StockData[]> {
  try {
    // Using yfinance data through a free API endpoint
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,financialData`;

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

    const json = await response.json() as any;
    const result = json.chart?.result?.[0];

    if (!result) {
      throw new Error('No data found');
    }

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const volumes = result.indicators?.quote?.[0]?.volume || [];

    return timestamps
      .map((ts: number, idx: number) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        close: closes[idx] || 0,
        volume: volumes[idx] || 0,
      }))
      .filter((d: StockData) => d.close > 0);
  } catch {
    return [];
  }
}

// Calculate moving average
function calculateMA(data: number[], period: number): (number | null)[] {
  return data.map((_, idx) => {
    if (idx < period - 1) return null;
    const slice = data.slice(idx - period + 1, idx + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

// Generate buy/sell signals
function generateSignal(
  prices: number[],
  ma20: (number | null)[],
  ma50: (number | null)[]
): { signal: 'BUY' | 'SELL' | 'HOLD'; strength: number } {
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

    // Recent trend
    if (
      prices[prices.length - 1] > prices[Math.max(0, prices.length - 5)]
    ) {
      score += 0.5;
    } else {
      score -= 0.5;
    }
  }

  const strength = Math.abs(score) / 3.5;

  if (score > 1.5) {
    return { signal: 'BUY', strength };
  } else if (score < -1.5) {
    return { signal: 'SELL', strength };
  }

  return { signal: 'HOLD', strength: 0.5 };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol')?.toUpperCase();

  if (!symbol || symbol.length < 1 || symbol.length > 10) {
    return NextResponse.json(
      { error: 'Invalid symbol' },
      { status: 400 }
    );
  }

  const data = await fetchStockData(symbol);

  if (data.length < 50) {
    return NextResponse.json(
      { error: 'Insufficient data' },
      { status: 400 }
    );
  }

  const closes = data.map((d) => d.close);
  const ma20 = calculateMA(closes, 20);
  const ma50 = calculateMA(closes, 50);

  const { signal, strength } = generateSignal(closes, ma20, ma50);

  const change = closes[closes.length - 1] - closes[0];
  const changePercent = (change / closes[0]) * 100;

  const result: AnalysisResult = {
    symbol,
    currentPrice: closes[closes.length - 1],
    change,
    changePercent,
    data,
    ma20,
    ma50,
    signal,
    signalStrength: strength,
  };

  return NextResponse.json(result);
}
