'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface SignalDisplayProps {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  signalStrength: number;
}

export function SignalDisplay({
  symbol,
  currentPrice,
  change,
  changePercent,
  signal,
  signalStrength,
}: SignalDisplayProps) {
  const isPositive = change >= 0;

  const getSignalColor = (sig: string) => {
    switch (sig) {
      case 'BUY':
        return 'bg-green-500/20 text-green-600 border-green-500/30 dark:text-green-400';
      case 'SELL':
        return 'bg-red-500/20 text-red-600 border-red-500/30 dark:text-red-400';
      default:
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30 dark:text-blue-400';
    }
  };

  const getSignalIcon = (sig: string) => {
    switch (sig) {
      case 'BUY':
        return <TrendingUp className="w-5 h-5" />;
      case 'SELL':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Stock Symbol</p>
            <p className="text-3xl font-bold text-foreground">{symbol}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Current Price</p>
              <p className="text-2xl font-semibold text-foreground">
                ${currentPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Change</p>
              <p
                className={`text-2xl font-semibold ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">Dollar Change</p>
            <p
              className={`text-lg font-semibold ${
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isPositive ? '+' : ''} ${change.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">Trading Signal</p>
            <Badge
              className={`gap-2 px-4 py-2 text-base font-semibold border ${getSignalColor(signal)}`}
            >
              {getSignalIcon(signal)}
              {signal}
            </Badge>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Signal Strength</p>
            <div className="space-y-1">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    signal === 'BUY'
                      ? 'bg-green-500'
                      : signal === 'SELL'
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${signalStrength * 100}%` }}
                />
              </div>
              <p className="text-xs text-foreground">
                {(signalStrength * 100).toFixed(0)}% Confidence
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {signal === 'BUY'
                ? 'Price is above moving averages. Consider buying.'
                : signal === 'SELL'
                  ? 'Price is below moving averages. Consider selling.'
                  : 'Price is around moving averages. Wait for more signals.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
