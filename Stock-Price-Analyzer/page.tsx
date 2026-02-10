'use client';

import { useState, useCallback, useEffect } from 'react';
import { StockSearch } from '@/components/stock-search';
import { PriceChart } from '@/components/price-chart';
import { SignalDisplay } from '@/components/signal-display';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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

interface ChartData {
  date: string;
  close: number;
  ma20: number | null;
  ma50: number | null;
}

export default function Home() {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('stockSearchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

  const handleSearch = useCallback(async (symbol: string) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch(`/api/stock?symbol=${symbol}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch stock data');
      }

      const data: AnalysisResult = await response.json();
      setAnalysis(data);

      // Add to search history
      const newHistory = [
        symbol,
        ...searchHistory.filter((s) => s !== symbol),
      ].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('stockSearchHistory', JSON.stringify(newHistory));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred while fetching data'
      );
    } finally {
      setLoading(false);
    }
  }, [searchHistory]);

  const chartData: ChartData[] = analysis
    ? analysis.data.map((d, idx) => ({
        date: d.date,
        close: d.close,
        ma20: analysis.ma20[idx],
        ma50: analysis.ma50[idx],
      }))
    : [];

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Stock Market Analyzer
            </h1>
            <p className="text-lg text-muted-foreground">
              Real-time analysis with moving averages and buy/sell signals
            </p>
          </div>

          {/* Search Section */}
          <StockSearch onSearch={handleSearch} isLoading={loading} />

          {/* Error Alert */}
          {error && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Analysis Results */}
          {analysis && (
            <>
              {/* Signal Display */}
              <SignalDisplay
                symbol={analysis.symbol}
                currentPrice={analysis.currentPrice}
                change={analysis.change}
                changePercent={analysis.changePercent}
                signal={analysis.signal}
                signalStrength={analysis.signalStrength}
              />

              {/* Price Chart */}
              <PriceChart data={chartData} symbol={analysis.symbol} />

              {/* Analysis Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-muted-foreground mb-1">Data Points</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {analysis.data.length}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-muted-foreground mb-1">Latest Volume</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {(
                      analysis.data[analysis.data.length - 1].volume / 1000000
                    ).toFixed(1)}
                    M
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-muted-foreground mb-1">52-Week Range</p>
                  <p className="text-2xl font-semibold text-foreground">
                    ${Math.min(...analysis.data.map((d) => d.close)).toFixed(2)} -
                    ${Math.max(...analysis.data.map((d) => d.close)).toFixed(2)}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Recent Searches */}
          {searchHistory.length > 0 && !analysis && (
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm font-semibold text-foreground mb-3">
                Recent Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => handleSearch(symbol)}
                    className="px-3 py-1 text-sm bg-muted text-foreground rounded hover:bg-muted/80 transition-colors"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!analysis && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Search for a stock symbol to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
