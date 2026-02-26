import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { KlineData } from '../types';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  const { theme } = useSettings();

  if (active && payload && payload.length) {
    const data: KlineData = payload[0].payload;
    const isLight = theme === 'light';
    const isGrey = theme === 'grey';

    const containerClass = isLight ? 'bg-white/80 border-slate-200' 
                       : isGrey ? 'bg-[#f5f5f0]/80 border-[#d4d4d4]' 
                       : 'bg-slate-800/80 border-slate-700';
    
    const textClass = isLight ? 'text-slate-700' : isGrey ? 'text-[#404040]' : 'text-slate-300';
    const labelClass = isLight ? 'text-slate-500' : isGrey ? 'text-[#737373]' : 'text-slate-400';

    return (
      <div className={`p-4 rounded-xl border backdrop-blur-md shadow-lg ${containerClass}`}>
        <p className={`text-sm font-bold mb-2 ${textClass}`}>{`Time: ${label}`}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
          <span className={labelClass}>Open:</span><span className={textClass}>{data.open.toFixed(2)}</span>
          <span className={labelClass}>High:</span><span className={textClass}>{data.high.toFixed(2)}</span>
          <span className={labelClass}>Low:</span><span className={textClass}>{data.low.toFixed(2)}</span>
          <span className={labelClass}>Close:</span><span className={textClass}>{data.close.toFixed(2)}</span>
          <span className={labelClass}>Volume:</span><span className={textClass}>{data.volume.toFixed(0)}</span>
          
          {data.indicators?.rsi !== undefined && <><span className={labelClass}>RSI:</span><span className={textClass}>{data.indicators.rsi.toFixed(2)}</span></>} 
          {data.indicators?.macd?.MACD !== undefined && <><span className={labelClass}>MACD:</span><span className={textClass}>{data.indicators.macd.MACD.toFixed(2)}</span></>}
          {data.indicators?.ema20 !== undefined && <><span className={labelClass}>EMA20:</span><span className={textClass}>{data.indicators.ema20.toFixed(2)}</span></>}
        </div>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
