
import { MarketSnapshot, KlineData, TechnicalIndicators, Timeframe, StrongIMPLevels, PivotPoints } from '../types';
import { RSI, MACD, EMA, BollingerBands, Stochastic, CCI, WilliamsR } from 'technicalindicators';

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

// Map our timeframes to Binance API intervals
const TIMEFRAME_MAP: Record<Timeframe, string> = {
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '2h': '2h',
  '4h': '4h',
  '12h': '12h',
  '1d': '1d'
};

export const fetchBinanceData = async (asset: string = 'BTC', timeframe: Timeframe = '15m'): Promise<MarketSnapshot> => {
  const symbol = `${asset}USDT`;
  const interval = TIMEFRAME_MAP[timeframe];

  try {
    // Fetch 24hr Ticker
    const tickerRes = await fetch(`${BINANCE_API_BASE}/ticker/24hr?symbol=${symbol}`);
    const ticker = await tickerRes.json();

    // Fetch Klines (interval based on selection, 200 limits for better indicator accuracy)
    const klinesRes = await fetch(`${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=200`);
    const klinesRaw = await klinesRes.json();

    const klines: KlineData[] = klinesRaw.map((k: any) => ({
      time: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));

    // Calculate Indicators
    const closes = klines.map(k => k.close);
    const highs = klines.map(k => k.high);
    const lows = klines.map(k => k.low);
    const opens = klines.map(k => k.open);

    const rsiValues = RSI.calculate({ values: closes, period: 14 });
    const macdValues = MACD.calculate({
      values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false
    });
    const ema20Values = EMA.calculate({ values: closes, period: 20 });
    const ema50Values = EMA.calculate({ values: closes, period: 50 });
    const bbValues = BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 });
    const stochValues = Stochastic.calculate({ high: highs, low: lows, close: closes, period: 14, signalPeriod: 3 });
    const cciValues = CCI.calculate({ open: opens, high: highs, low: lows, close: closes, period: 20 });
    
    // Attach indicators to klines
    const klinesWithIndicators = klines.map((k, index) => {
      // Align indicator data with kline data. Indicators have a startup period.
      const rsiIndex = index - (klines.length - rsiValues.length);
      const macdIndex = index - (klines.length - macdValues.length);
      const ema20Index = index - (klines.length - ema20Values.length);
      const ema50Index = index - (klines.length - ema50Values.length);
      const bbIndex = index - (klines.length - bbValues.length);
      const stochIndex = index - (klines.length - stochValues.length);
      const cciIndex = index - (klines.length - cciValues.length);
      const momentum = index >= 10 ? closes[index] - closes[index - 10] : undefined;

      k.indicators = {
        rsi: rsiIndex >= 0 ? rsiValues[rsiIndex] : undefined,
        macd: macdIndex >= 0 ? macdValues[macdIndex] : undefined,
        ema20: ema20Index >= 0 ? ema20Values[ema20Index] : undefined,
        ema50: ema50Index >= 0 ? ema50Values[ema50Index] : undefined,
        bb: bbIndex >= 0 ? bbValues[bbIndex] : undefined,
        stoch: stochIndex >= 0 ? stochValues[stochIndex] : undefined,
        cci: cciIndex >= 0 ? cciValues[cciIndex] : undefined,
        momentum,
      };
      return k;
    });

    const lastIndicators: TechnicalIndicators = {
      rsi: rsiValues.slice(-1),
      macd: macdValues.slice(-1),
      ema20: ema20Values.slice(-1),
      ema50: ema50Values.slice(-1),
      bb: bbValues.slice(-1),
      stoch: stochValues.slice(-1),
      cci: cciValues.slice(-1),
      momentum: klinesWithIndicators[klinesWithIndicators.length - 1].indicators?.momentum ? [klinesWithIndicators[klinesWithIndicators.length - 1].indicators?.momentum] : [],
    };

    // Calculate StrongIMP Levels based on 1D data
    let strongIMP: StrongIMPLevels | undefined;
    try {
      let dailyKlines = klines;
      if (interval !== '1d') {
        const dailyRes = await fetch(`${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=1d&limit=30`);
        const dailyRaw = await dailyRes.json();
        dailyKlines = dailyRaw.map((k: any) => ({ time: k[0], open: parseFloat(k[1]), high: parseFloat(k[2]), low: parseFloat(k[3]), close: parseFloat(k[4]), volume: parseFloat(k[5]) }));
      }

      const recentKlines = dailyKlines.slice(-7);
      const bsl = Math.max(...recentKlines.map(k => k.high));
      const ssl = Math.min(...recentKlines.map(k => k.low));
      const impulse = bsl - ssl;

      strongIMP = {
        bsl,
        ssl,
        impulse,
        level25: ssl + (impulse * 0.25),
        level50: ssl + (impulse * 0.50),
        level75: ssl + (impulse * 0.75)
      };
    } catch (e) {
      console.warn('Failed to calculate StrongIMP levels', e);
    }

    // Calculate Classic Pivot Points for the current day
    let pivotPoints: PivotPoints | undefined;
    try {
        const yesterday = klines[klines.length - 2]; // Use the most recent completed candle
        const H = yesterday.high;
        const L = yesterday.low;
        const C = yesterday.close;
        const P = (H + L + C) / 3;
        const R1 = (2 * P) - L;
        const S1 = (2 * P) - H;
        const R2 = P + (H - L);
        const S2 = P - (H - L);
        pivotPoints = { r2: R2, r1: R1, p: P, s1: S1, s2: S2 };
    } catch (e) {
        console.warn('Failed to calculate Pivot Points', e);
    }

    return {
      symbol,
      price: parseFloat(ticker.lastPrice),
      change24h: parseFloat(ticker.priceChangePercent),
      klines: klinesWithIndicators.slice(-50),
      indicators: lastIndicators,
      timeframe,
      strongIMP,
      pivotPoints
    };
  } catch (error) {
    console.error('Market data fetch error:', error);
    throw error;
  }
};
