'use client';

import React from "react"

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  isLoading: boolean;
}

export function StockSearch({ onSearch, isLoading }: StockSearchProps) {
  const [input, setInput] = useState('');

  const handleSearch = useCallback(() => {
    if (input.trim()) {
      onSearch(input.trim().toUpperCase());
      setInput('');
    }
  }, [input, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const quickSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Search Stock Symbol
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., AAPL, GOOGL, MSFT"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="bg-background border-border text-foreground placeholder-muted-foreground"
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !input.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Quick access:</p>
          <div className="flex flex-wrap gap-2">
            {quickSymbols.map((symbol) => (
              <Button
                key={symbol}
                variant="outline"
                size="sm"
                onClick={() => {
                  onSearch(symbol);
                }}
                disabled={isLoading}
                className="border-border text-foreground hover:bg-muted"
              >
                {symbol}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
