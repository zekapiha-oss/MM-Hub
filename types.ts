
export enum Decision {
  BUY = 'BUY',
  SELL = 'SELL',
  WAIT = 'WAIT'
}

export type Theme = 'dark' | 'light' | 'grey';
export type Language = 'en' | 'ua' | 'ru';
export type Exchange = 'Binance' | 'WhiteBIT' | 'Bybit' | 'OKX' | 'Kuna';
export type TradeType = 'SPOT' | 'FUTURES';
export type Timeframe = '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '12h' | '1d';

export interface TradingAnalysis {
  thought_process: string;
  decision: Decision;
  confidence: number;
  entry_zone: string;
  stop_loss: string;
  take_profit: string;
  leverage: string;
  timestamp: number; // For caching
}

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  indicators?: {
    rsi?: number;
    macd?: MACDValue;
    ema20?: number;
    ema50?: number;
    bb?: BBValue;
    stoch?: StochValue;
    cci?: number;
    momentum?: number;
  };
}

export interface MACDValue {
  MACD?: number;
  signal?: number;
  histogram?: number;
}

export interface BBValue {
  upper?: number;
  middle?: number;
  lower?: number;
}

export interface StochValue {
  k?: number;
  d?: number;
}

export interface TechnicalIndicators {
  rsi: (number | undefined)[];
  macd: MACDValue[];
  ema20: (number | undefined)[];
  ema50: (number | undefined)[];
  bb: BBValue[];
  stoch: StochValue[];
  cci: (number | undefined)[];
  momentum: (number | undefined)[];
}

export interface PivotPoints {
  r2: number;
  r1: number;
  p: number;
  s1: number;
  s2: number;
}

export interface StrongIMPLevels {
  bsl: number; // Buy-Side Liquidity (High)
  ssl: number; // Sell-Side Liquidity (Low)
  impulse: number;
  level25: number;
  level50: number;
  level75: number;
}

export interface MarketSnapshot {
  symbol: string;
  price: number;
  change24h: number;
  klines: KlineData[];
  indicators: TechnicalIndicators;
  timeframe: Timeframe;
  strongIMP?: StrongIMPLevels;
  pivotPoints?: PivotPoints;
}
