
import React, { useState, useEffect, useCallback } from 'react';
import { fetchBinanceData } from './services/marketData';
import { analyzeMarket } from './services/gemini';
import { MarketSnapshot, TradingAnalysis, Timeframe, Exchange, TradeType } from './types';
import PriceChart from './components/PriceChart';
import AnalysisResult from './components/AnalysisResult';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { useTranslation } from './utils/translations';
import { Drawer } from 'vaul';

const Dashboard: React.FC = () => {
  const { 
    theme, setTheme, 
    language, setLanguage, 
    exchange, setExchange, 
    tradeType, setTradeType, 
    asset, setAsset, 
    timeframe, setTimeframe, 
    showStrongIMP, setShowStrongIMP,
    showPivotPoints, setShowPivotPoints
  } = useSettings();
  
  const t = useTranslation(language);

  const [marketSnapshot, setMarketSnapshot] = useState<MarketSnapshot | null>(null);
  const [analysis, setAnalysis] = useState<TradingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const assets = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'TON', 'XRP'];
  const timeframes: Timeframe[] = ['5m', '15m', '30m', '1h', '2h', '4h', '12h', '1d'];
  const exchanges: Exchange[] = ['Binance', 'WhiteBIT', 'Bybit', 'OKX', 'Kuna'];

  const refreshData = useCallback(async () => {
    try {
      const data = await fetchBinanceData(asset, timeframe);
      setMarketSnapshot(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch market data. Please check your connection.");
    }
  }, [asset, timeframe]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [refreshData]);

  // Reset analysis when asset or timeframe changes
  useEffect(() => {
    setAnalysis(null);
  }, [asset, timeframe]);

  const handleRunAnalysis = async () => {
    if (!marketSnapshot) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeMarket(marketSnapshot, language);
      setAnalysis(result);
    } catch (err) {
      setError("AI analysis failed. Ensure your API key is configured.");
    } finally {
      setLoading(false);
    }
  };

  // Theme classes
  const bgClass = theme === 'light' ? 'bg-slate-50 text-slate-900' 
                : theme === 'grey' ? 'bg-[#e5e5e5] text-[#404040]' 
                : 'bg-slate-950 text-slate-100';
  
  // Updated Dark Theme Card Background to be Lighter Grey (Slate-800) as requested
  const cardBgClass = theme === 'light' ? 'bg-white border-slate-200' 
                    : theme === 'grey' ? 'bg-[#f5f5f0] border-[#d4d4d4]' 
                    : 'bg-slate-800 border-slate-700';

  const secondaryTextClass = theme === 'light' ? 'text-slate-500' 
                           : theme === 'grey' ? 'text-[#737373]' 
                           : 'text-slate-400';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgClass}`}>
      
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <button className="lg:hidden p-2 rounded-lg border border-current opacity-50 hover:opacity-100 active:scale-95 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className={`bg-opacity-90 backdrop-blur-md fixed bottom-0 left-0 right-0 mt-24 flex flex-col rounded-t-[10px] ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-900'}`}>
            <div className="p-4 rounded-t-[10px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
              <div className="max-w-md mx-auto">
                <Drawer.Title className="font-medium mb-4 text-2xl">
                  {t.settings}
                </Drawer.Title>
                <div className="space-y-6 pb-8">
                  {/* Theme Selector */}
                  <div>
                    <label className={`text-xs font-bold uppercase opacity-60 mb-2 block ${secondaryTextClass}`}>{t.theme}</label>
                    <div className="flex gap-2">
                      {(['dark', 'light', 'grey'] as const).map(th => (
                        <button 
                          key={th}
                          onClick={() => setTheme(th)}
                          className={`flex-1 py-2 rounded-lg text-sm border ${theme === th ? 'border-blue-700 bg-blue-700/20 text-blue-700' : 'border-transparent bg-black/5'}`}
                        >
                          {th.charAt(0).toUpperCase() + th.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language Selector */}
                  <div>
                    <label className={`text-xs font-bold uppercase opacity-60 mb-2 block ${secondaryTextClass}`}>{t.language}</label>
                    <div className="flex gap-2">
                      <button onClick={() => setLanguage('ua')} className={`flex-1 py-2 rounded-lg text-2xl border ${language === 'ua' ? 'border-blue-700 bg-blue-700/20' : 'border-transparent bg-black/5'}`}>🇺🇦</button>
                      <button onClick={() => setLanguage('en')} className={`flex-1 py-2 rounded-lg text-2xl border ${language === 'en' ? 'border-blue-700 bg-blue-700/20' : 'border-transparent bg-black/5'}`}>🇺🇸</button>
                      <button onClick={() => setLanguage('ru')} className={`flex-1 py-2 rounded-lg text-2xl border ${language === 'ru' ? 'border-blue-700 bg-blue-700/20' : 'border-transparent bg-black/5'}`}>🇷🇺</button>
                    </div>
                  </div>

                  {/* Exchange Selector */}
                  <div>
                    <label className={`text-xs font-bold uppercase opacity-60 mb-2 block ${secondaryTextClass}`}>{t.exchange}</label>
                    <select 
                      value={exchange} 
                      onChange={(e) => setExchange(e.target.value as Exchange)}
                      className={`w-full p-3 rounded-lg border ${theme === 'light' ? 'bg-slate-100 border-slate-300' : theme === 'grey' ? 'bg-[#e5e5e5] border-[#d4d4d4]' : 'bg-slate-900 border-slate-700'}`}
                    >
                      {exchanges.map(ex => <option key={ex} value={ex}>{ex}</option>)}                    </select>
                  </div>

                  {/* Trade Type */}
                  <div>
                    <label className={`text-xs font-bold uppercase opacity-60 mb-2 block ${secondaryTextClass}`}>{t.tradingType}</label>
                    <div className="flex bg-black/5 p-1 rounded-lg">
                      <button 
                        onClick={() => setTradeType('SPOT')}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tradeType === 'SPOT' ? 'bg-blue-700 text-white shadow' : secondaryTextClass}`}
                      >
                        {t.spot}
                      </button>
                      <button 
                        onClick={() => setTradeType('FUTURES')}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tradeType === 'FUTURES' ? 'bg-blue-700 text-white shadow' : secondaryTextClass}`}
                      >
                        {t.futures}
                      </button>
                    </div>
                  </div>

                  {/* Indicator Toggles */}
                  <div>
                    <label className={`text-xs font-bold uppercase opacity-60 mb-2 block ${secondaryTextClass}`}>Chart Indicators</label>
                    <div className="space-y-2">
                      <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-900/50'}`}>
                        <span className="text-sm font-medium">{t.strongImp}</span>
                        <button onClick={() => setShowStrongIMP(!showStrongIMP)} className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${showStrongIMP ? 'bg-blue-700 justify-end' : 'bg-slate-600 justify-start'}`}>
                          <span className="w-4 h-4 bg-white rounded-full transition-transform"></span>
                        </button>
                      </div>
                      <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-900/50'}`}>
                        <span className="text-sm font-medium">{t.pivotPoints}</span>
                        <button onClick={() => setShowPivotPoints(!showPivotPoints)} className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${showPivotPoints ? 'bg-blue-700 justify-end' : 'bg-slate-600 justify-start'}`}>
                          <span className="w-4 h-4 bg-white rounded-full transition-transform"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-3xl font-extrabold flex items-center gap-2">
              <span className="bg-blue-700 p-1.5 md:p-2 rounded-lg">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </span>
              {t.title}
            </h1>
            <p className={`text-xs md:text-sm opacity-60 hidden md:block ${secondaryTextClass}`}>{t.subtitle}</p>
          </div>
            
          <div className="flex items-center gap-4">


            {/* Desktop Settings Bar */}
            <div className={`hidden lg:flex items-center gap-4 p-2 rounded-xl border backdrop-blur-sm ${theme === 'light' ? 'border-slate-200 bg-white/50' : theme === 'grey' ? 'border-[#d4d4d4] bg-[#f5f5f0]/50' : 'border-slate-700 bg-slate-800/50'}`}>
               {/* Language */}
               <div className={`flex gap-1 border-r pr-4 ${theme === 'light' ? 'border-slate-200' : theme === 'grey' ? 'border-[#d4d4d4]' : 'border-slate-700'}`}>
                  <button onClick={() => setLanguage('ua')} className={`text-xl hover:scale-110 transition ${language === 'ua' ? 'opacity-100' : 'opacity-40'}`}>🇺🇦</button>
                  <button onClick={() => setLanguage('en')} className={`text-xl hover:scale-110 transition ${language === 'en' ? 'opacity-100' : 'opacity-40'}`}>🇺🇸</button>
                  <button onClick={() => setLanguage('ru')} className={`text-xl hover:scale-110 transition ${language === 'ru' ? 'opacity-100' : 'opacity-40'}`}>🇷🇺</button>
               </div>

               {/* Theme */}
               <div className={`flex gap-1 border-r pr-4 ${theme === 'light' ? 'border-slate-200' : theme === 'grey' ? 'border-[#d4d4d4]' : 'border-slate-700'}`}>
                  {(['dark', 'light', 'grey'] as const).map(th => (
                     <button 
                       key={th} 
                       onClick={() => setTheme(th)}
                       className={`w-6 h-6 rounded-full border ${theme === 'light' ? 'border-slate-300' : 'border-white/20'} ${th === 'light' ? 'bg-white' : th === 'grey' ? 'bg-[#e5e5e5]' : 'bg-black'} ${theme === th ? 'ring-2 ring-blue-600' : ''}`}
                     />
                  ))}
               </div>

               {/* Exchange & Type */}
               <div className="flex items-center gap-3 text-sm font-medium">
                  <select 
                    value={exchange} 
                    onChange={(e) => setExchange(e.target.value as Exchange)}
                    className="bg-transparent border-none outline-none cursor-pointer hover:text-blue-400"
                  >
                    {exchanges.map(ex => <option key={ex} value={ex} className="text-black">{ex}</option>)}
                  </select>
                  <span className="opacity-30">|</span>
                  <button onClick={() => setTradeType(tradeType === 'SPOT' ? 'FUTURES' : 'SPOT')} className="hover:text-blue-400">
                     {tradeType === 'SPOT' ? t.spot : t.futures}
                  </button>
               </div>

               {/* Indicator Toggles */}
               <div className={`flex gap-4 border-l pl-4 ${theme === 'light' ? 'border-slate-200' : theme === 'grey' ? 'border-[#d4d4d4]' : 'border-slate-700'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${secondaryTextClass}`}>{t.strongImp}</span>
                    <button onClick={() => setShowStrongIMP(!showStrongIMP)} className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors ${showStrongIMP ? 'bg-blue-700 justify-end' : 'bg-slate-600 justify-start'}`}>
                      <span className="w-3.5 h-3.5 bg-white rounded-full transition-transform"></span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${secondaryTextClass}`}>{t.pivotPoints}</span>
                    <button onClick={() => setShowPivotPoints(!showPivotPoints)} className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors ${showPivotPoints ? 'bg-blue-700 justify-end' : 'bg-slate-600 justify-start'}`}>
                      <span className="w-3.5 h-3.5 bg-white rounded-full transition-transform"></span>
                    </button>
                  </div>
               </div>

            </div>
          </div>
        </header>

        {/* Control Bar (Assets & Timeframes) */}
        <div className="flex flex-col lg:flex-row gap-4">
           <div className={`flex items-center gap-2 p-1 rounded-xl border overflow-x-auto snap-x snap-mandatory no-scrollbar ${cardBgClass}`}>
              {assets.map(s => (
                <button
                  key={s}
                  onClick={() => setAsset(s)}
                  className={`snap-start px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    asset === s 
                      ? 'bg-blue-700 text-white shadow-md'
                      : `text-slate-500 hover:bg-black/5`
                  }`}
                >
                  {s}
                </button>
              ))}
           </div>

           <div className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto snap-x snap-mandatory no-scrollbar ${cardBgClass}`}>
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`snap-start px-3 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    timeframe === tf 
                      ? 'bg-purple-700 text-white shadow-md'
                      : `text-slate-500 hover:bg-black/5`
                  }`}
                >
                  {tf}
                </button>
              ))}
           </div>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Market Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`rounded-2xl p-6 border relative overflow-hidden group ${cardBgClass}`}>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                 <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div>
                  <h2 className={`opacity-60 text-sm font-semibold uppercase tracking-wider mb-1 ${secondaryTextClass}`}>{t.livePrice} ({exchange})</h2>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-mono font-extrabold tracking-tight">
                      ${marketSnapshot?.price.toLocaleString() ?? '---'}
                    </span>
                    <span className={`text-lg font-semibold ${marketSnapshot && marketSnapshot.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {marketSnapshot && marketSnapshot.change24h >= 0 ? '+' : ''}{marketSnapshot?.change24h}%
                    </span>
                  </div>
                </div>
                <button 
                  onClick={handleRunAnalysis}
                  disabled={loading || !marketSnapshot}
                  className={`relative w-full md:w-auto text-lg font-bold px-8 py-4 rounded-xl border-b-4 active:scale-[0.98] active:border-b-2 transition-all duration-150 ease-in-out 
                    ${loading 
                      ? 'bg-slate-500 border-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-b from-blue-500 to-blue-600 text-white border-blue-800 hover:from-blue-400 hover:to-blue-500 shadow-lg'}`}>
                  {loading ? t.analyzing : `🧠 ${t.startAnalysis}`}
                </button>
              </div>

              {marketSnapshot && <PriceChart data={marketSnapshot.klines} strongIMP={marketSnapshot.strongIMP} pivotPoints={marketSnapshot.pivotPoints} />}
            </div>

            <AnalysisResult analysis={analysis} loading={loading} />
          </div>

          {/* Right Column: Engine Status & Log */}
          <div className="space-y-6">
            <div className={`rounded-2xl border overflow-hidden ${cardBgClass}`}>
              <div className={`p-4 border-b ${theme === 'light' ? 'bg-slate-50 border-slate-200' : theme === 'grey' ? 'bg-[#e5e5e5] border-[#d4d4d4]' : 'bg-slate-900/50 border-slate-700'}`}>
                <h3 className="font-bold">{t.systemMonitoring}</h3>
              </div>
              <div className="p-6 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className={`opacity-60 text-sm ${secondaryTextClass}`}>{t.engineStatus}</span>
                    <span className="flex items-center gap-2 text-green-500 text-sm font-semibold">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {t.operational}
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className={`opacity-60 text-sm ${secondaryTextClass}`}>{t.agentSync}</span>
                    <span className="text-sm">3/3 {t.active}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className={`opacity-60 text-sm ${secondaryTextClass}`}>{t.lastUpdate}</span>
                    <span className="text-sm">{new Date().toLocaleTimeString()}</span>
                 </div>
                 <hr className={`border-t ${theme === 'light' ? 'border-slate-200' : theme === 'grey' ? 'border-[#d4d4d4]' : 'border-slate-700'}`} />
                 <div className="pt-2">
                    <div className={`text-xs opacity-50 uppercase font-bold mb-3 ${secondaryTextClass}`}>{t.liveTechnicals} ({timeframe})</div>
                   {marketSnapshot?.indicators ? (
                     <ul className="space-y-2 text-xs opacity-80 font-mono">
                        <li className={`flex justify-between items-center ${secondaryTextClass}`}><span>RSI (14)</span><span>{marketSnapshot.indicators.rsi.toFixed(2)}</span></li>
                        <li className={`flex justify-between items-center ${secondaryTextClass}`}><span>STOCH (%K)</span><span>{marketSnapshot.indicators.stoch.k.toFixed(2)}</span></li>
                        <li className={`flex justify-between items-center ${secondaryTextClass}`}><span>CCI (20)</span><span>{marketSnapshot.indicators.cci.toFixed(2)}</span></li>
                        <li className={`flex justify-between items-center ${secondaryTextClass}`}><span>MACD</span><span>{marketSnapshot.indicators.macd.MACD.toFixed(2)}</span></li>
                        <li className={`flex justify-between items-center ${secondaryTextClass}`}><span>Momentum</span><span>{marketSnapshot.indicators.momentum.toFixed(2)}</span></li>
                        <li className={`flex justify-between items-center ${secondaryTextClass}`}><span>EMA (20/50)</span><span>{marketSnapshot.indicators.ema20.toFixed(0)} / {marketSnapshot.indicators.ema50.toFixed(0)}</span></li>
                     </ul>
                   ) : (
                     <div className={`text-xs opacity-50 italic ${secondaryTextClass}`}>{t.initializing}</div>
                   )}
                 </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-500 text-sm flex gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {error}
              </div>
            )}

            {showStrongIMP && (
              <div className={`rounded-2xl border p-6 ${cardBgClass}`}>
                <h3 className="font-bold mb-4">{t.strongImp}</h3>
                {marketSnapshot?.strongIMP ? (
                  <div className="space-y-6 relative">
                     <div className="relative h-48 w-full pl-16 pr-4 py-2">
                        <div className={`absolute left-16 top-0 bottom-0 w-px border-l border-dashed ${theme === 'light' ? 'border-slate-300' : 'border-slate-600'}`}></div>
                        <div className="absolute top-0 left-0 w-full flex items-center">
                           <span className={`text-[10px] w-14 text-right pr-2 opacity-50 ${secondaryTextClass}`}>{t.bsl}</span>
                           <div className="w-2 h-px bg-current"></div>
                           <span className="ml-2 text-xs font-mono opacity-70">{marketSnapshot.strongIMP.bsl.toFixed(2)}</span>
                        </div>
                        <div className="absolute top-[25%] left-0 w-full flex items-center">
                           <span className="text-[10px] w-14 text-right pr-2 text-red-500">75%</span>
                           <div className="w-full h-px bg-red-500/30"></div>
                           <span className="absolute right-0 text-xs font-mono text-red-500 bg-red-500/10 px-1 rounded">{marketSnapshot.strongIMP.level75.toFixed(2)}</span>
                        </div>
                        <div className="absolute top-[50%] left-0 w-full flex items-center">
                           <span className="text-[10px] w-14 text-right pr-2 text-blue-600 font-bold">50%</span>
                           <div className="w-full h-0.5 bg-blue-600"></div>
                           <span className="absolute right-0 text-xs font-mono text-blue-600 font-bold bg-blue-600/10 px-1 rounded">{marketSnapshot.strongIMP.level50.toFixed(2)}</span>
                        </div>
                        <div className="absolute top-[75%] left-0 w-full flex items-center">
                           <span className="text-[10px] w-14 text-right pr-2 text-red-500">25%</span>
                           <div className="w-full h-px bg-red-500/30"></div>
                           <span className="absolute right-0 text-xs font-mono text-red-500 bg-red-500/10 px-1 rounded">{marketSnapshot.strongIMP.level25.toFixed(2)}</span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full flex items-center">
                           <span className={`text-[10px] w-14 text-right pr-2 opacity-50 ${secondaryTextClass}`}>{t.ssl}</span>
                           <div className="w-2 h-px bg-current"></div>
                           <span className="ml-2 text-xs font-mono opacity-70">{marketSnapshot.strongIMP.ssl.toFixed(2)}</span>
                        </div>
                     </div>
                     <div className={`text-center text-[10px] uppercase tracking-widest mt-2 opacity-40 ${secondaryTextClass}`}>
                        {t.impulse}: {marketSnapshot.strongIMP.impulse.toFixed(2)}
                     </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="space-y-1">
                         <div className={`w-full h-1 rounded ${theme === 'light' ? 'bg-slate-200' : theme === 'grey' ? 'bg-[#d4d4d4]' : 'bg-slate-700'}`}></div>
                         <p className={`text-xs opacity-40 ${secondaryTextClass}`}>{t.loadingFeed}</p>
                       </div>
                     ))}
                  </div>
                )}
              </div>
            )}

            {showPivotPoints && (
              <div className={`rounded-2xl border p-6 ${cardBgClass}`}>
                <h3 className="font-bold mb-4">{t.pivotPoints}</h3>
                {marketSnapshot?.pivotPoints ? (
                  <ul className="space-y-2 text-xs font-mono">
                    <li className="flex justify-between items-center text-red-500"><span>R2</span><span>{marketSnapshot.pivotPoints.r2.toFixed(2)}</span></li>
                    <li className="flex justify-between items-center text-red-400"><span>R1</span><span>{marketSnapshot.pivotPoints.r1.toFixed(2)}</span></li>
                    <li className={`flex justify-between items-center font-bold ${secondaryTextClass}`}><span>P</span><span>{marketSnapshot.pivotPoints.p.toFixed(2)}</span></li>
                    <li className="flex justify-between items-center text-green-400"><span>S1</span><span>{marketSnapshot.pivotPoints.s1.toFixed(2)}</span></li>
                    <li className="flex justify-between items-center text-green-500"><span>S2</span><span>{marketSnapshot.pivotPoints.s2.toFixed(2)}</span></li>
                  </ul>
                ) : (
                   <div className={`text-xs opacity-50 italic ${secondaryTextClass}`}>{t.initializing}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className={`text-center opacity-40 text-xs py-8 ${secondaryTextClass}`}>
          {t.footer}
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <Dashboard />
    </SettingsProvider>
  );
};

export default App;
