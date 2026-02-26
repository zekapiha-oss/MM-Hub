import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, Language, Exchange, TradeType, Timeframe } from '../types';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  exchange: Exchange;
  setExchange: (exchange: Exchange) => void;
  tradeType: TradeType;
  setTradeType: (type: TradeType) => void;
  asset: string;
  setAsset: (asset: string) => void;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  showStrongIMP: boolean;
  setShowStrongIMP: (show: boolean) => void;
  showPivotPoints: boolean;
  setShowPivotPoints: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('ua');
  const [exchange, setExchange] = useState<Exchange>('Binance');
  const [tradeType, setTradeType] = useState<TradeType>('FUTURES');
  const [asset, setAsset] = useState<string>('BTC');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [showStrongIMP, setShowStrongIMP] = useState(true);
  const [showPivotPoints, setShowPivotPoints] = useState(true);

  useEffect(() => {
    // Apply theme to body
    document.body.className = theme === 'light' ? 'bg-slate-50 text-slate-900' : theme === 'grey' ? 'bg-zinc-900 text-zinc-100' : 'bg-slate-950 text-slate-100';
  }, [theme]);

  return (
    <SettingsContext.Provider value={{
      theme, setTheme,
      language, setLanguage,
      exchange, setExchange,
      tradeType, setTradeType,
      asset, setAsset,
      timeframe, setTimeframe,
      showStrongIMP, setShowStrongIMP,
      showPivotPoints, setShowPivotPoints
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
