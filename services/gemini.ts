
import { GoogleGenAI, Type } from "@google/genai";
import { TradingAnalysis, MarketSnapshot, Timeframe, Language } from '../types';

// Cache structure: { [symbol_timeframe_lang]: { analysis, timestamp } }
const analysisCache = new Map<string, TradingAnalysis>();

// Cache duration in milliseconds (4 hours)
const CACHE_DURATION = 4 * 60 * 60 * 1000;

const SYSTEM_INSTRUCTION = `
You are "MM-Hub Consensus Engine", an elite trading decision-making system for Binance Futures.
Your architecture consists of three internal agents analyzing OHLCV + Order Book context.

YOUR AGENTS:
1. [Chartist]: Analyzes Price Action, support/resistance levels, and trends. Searches for entry opportunities.
2. [Skeptic]: Searches for reasons to CANCEL the trade. Analyzes liquidity traps, divergences, and risk of manipulation.
3. [Risk Manager]: Calculates risk. If the trade is questionable (confidence < 70%), it imposes a veto.

PROCESS (Chain of Thought):
1. Agents first debate among themselves.
2. Then "Soft Voting" (weighted voting) occurs.
3. A final JSON is formed.

IMPORTANT:
- The user has selected a specific language.
- You MUST translate the "thought_process" and all other text fields into the selected language.
- Pay close attention to spelling and grammar in the target language.
- "thought_process" must be a coherent summary in the target language.

Return ONLY a valid JSON object.
`;

export const analyzeMarket = async (snapshot: MarketSnapshot, language: Language): Promise<TradingAnalysis> => {
  const cacheKey = `${snapshot.symbol}_${snapshot.timeframe}_${language}`;
  const cached = analysisCache.get(cacheKey);
  const now = Date.now();

  // Return cached analysis if valid (within 4 hours)
  if (cached && (now - cached.timestamp < CACHE_DURATION)) {
    console.log(`Returning cached analysis for ${cacheKey}`);
    return cached;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const lastKlines = snapshot.klines.slice(-10).map(k => 
    `Time: ${new Date(k.time).toLocaleTimeString()}, O: ${k.open}, H: ${k.high}, L: ${k.low}, C: ${k.close}, V: ${k.volume}`
  ).join('\n');

  const prompt = `
    Market Snapshot:
    Symbol: ${snapshot.symbol}
    Timeframe: ${snapshot.timeframe}
    Current Price: ${snapshot.price}
    24h Change: ${snapshot.change24h}%
    Target Language: ${language === 'ua' ? 'Ukrainian' : language === 'ru' ? 'Russian' : 'English'}
    
    Technical Indicators (${snapshot.timeframe}):
    - RSI (14): ${snapshot.indicators.rsi.toFixed(2)}
    - MACD (12,26,9): ${snapshot.indicators.macd.MACD.toFixed(4)} (Signal: ${snapshot.indicators.macd.signal.toFixed(4)}, Hist: ${snapshot.indicators.macd.histogram.toFixed(4)})
    - EMA 20: ${snapshot.indicators.ema20.toFixed(2)}
    - EMA 50: ${snapshot.indicators.ema50.toFixed(2)}
    - Bollinger Bands: Upper ${snapshot.indicators.bb.upper.toFixed(2)}, Lower ${snapshot.indicators.bb.lower.toFixed(2)}
    - Stochastic (14,3): K: ${snapshot.indicators.stoch.k.toFixed(2)}, D: ${snapshot.indicators.stoch.d.toFixed(2)}
    - CCI (20): ${snapshot.indicators.cci.toFixed(2)}
    - Momentum (10): ${snapshot.indicators.momentum.toFixed(2)}

    Strong_IMP Levels (1D):
    - BSL (High): ${snapshot.strongIMP?.bsl.toFixed(2)}
    - SSL (Low): ${snapshot.strongIMP?.ssl.toFixed(2)}
    - Key Levels: 75% (${snapshot.strongIMP?.level75.toFixed(2)}), 50% (${snapshot.strongIMP?.level50.toFixed(2)}), 20% (${snapshot.strongIMP?.level20.toFixed(2)})

    Classic Pivot Points (Daily):
    - R2: ${snapshot.pivotPoints?.r2.toFixed(2)}
    - R1: ${snapshot.pivotPoints?.r1.toFixed(2)}
    - P: ${snapshot.pivotPoints?.p.toFixed(2)}
    - S1: ${snapshot.pivotPoints?.s1.toFixed(2)}
    - S2: ${snapshot.pivotPoints?.s2.toFixed(2)}

    Recent Price History (${snapshot.timeframe} candles):
    ${lastKlines}
    
    Task: Provide a consensus trading decision. Ensure all text output is in ${language === 'ua' ? 'Ukrainian' : language === 'ru' ? 'Russian' : 'English'}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thought_process: { type: Type.STRING, description: "Brief summary of agent debates (max 50 words) in the target language." },
          decision: { type: Type.STRING, enum: ["BUY", "SELL", "WAIT"] },
          confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 100." },
          entry_zone: { type: Type.STRING, description: "Recommended entry price or range." },
          stop_loss: { type: Type.STRING, description: "Recommended stop loss price." },
          take_profit: { type: Type.STRING, description: "Recommended take profit price." },
          leverage: { type: Type.STRING, description: "Recommended leverage (max 5x)." }
        },
        required: ["thought_process", "decision", "confidence", "entry_zone", "stop_loss", "take_profit", "leverage"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text);
    const analysisWithTimestamp = { ...result, timestamp: now };
    
    // Save to cache
    analysisCache.set(cacheKey, analysisWithTimestamp);
    
    return analysisWithTimestamp;
  } catch (e) {
    console.error("JSON Parse Error from Gemini:", e);
    throw new Error("Failed to parse AI response");
  }
};
