
import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';
import { KlineData, StrongIMPLevels, PivotPoints } from '../types';
import CustomTooltip from './CustomTooltip';
import { useSettings } from '../contexts/SettingsContext';

interface PriceChartProps {
  data: KlineData[];
  strongIMP?: StrongIMPLevels | null;
  pivotPoints?: PivotPoints | null;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, strongIMP, pivotPoints }) => {
  const { theme, showStrongIMP, showPivotPoints } = useSettings();

  const chartData = data.map(k => ({
    time: new Date(k.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    open: k.open,
    close: k.close,
    high: k.high,
    low: k.low,
    priceRange: [Math.min(k.open, k.close), Math.max(k.open, k.close)],
    isUp: k.close > k.open
  }));

  const minPrice = Math.min(...data.map(k => k.low)) * 0.999;
  const maxPrice = Math.max(...data.map(k => k.high)) * 1.001;

  const isLight = theme === 'light';
  const isGrey = theme === 'grey';

  const candleStroke = isLight || isGrey ? '#000000' : '#cbd5e1';
  const candleUpFill = isLight || isGrey ? '#ffffff' : '#ffffff';
  const candleDownFill = isLight || isGrey ? '#000000' : '#000000';

  const CustomCandle = (props: any) => {
    const { x, y, width, height, payload } = props;
    const { open, close, high, low, isUp } = payload;
    
    const bodyHeight = Math.max(height, 1);
    const priceDiff = Math.abs(open - close);
    const ratio = priceDiff === 0 ? 0 : bodyHeight / priceDiff;
    
    const maxBodyPrice = Math.max(open, close);
    const minBodyPrice = Math.min(open, close);
    
    const highDiff = high - maxBodyPrice;
    const lowDiff = minBodyPrice - low;
    
    const wickTopHeight = highDiff * ratio;
    const wickBottomHeight = lowDiff * ratio;
    
    const wickX = x + width / 2;
    const wickY1 = y - wickTopHeight;
    const wickY2 = y + bodyHeight + wickBottomHeight;

    return (
      <g>
        <line 
          x1={wickX} 
          y1={wickY1} 
          x2={wickX} 
          y2={wickY2} 
          stroke={candleStroke} 
          strokeWidth={1} 
        />
        <rect 
          x={x} 
          y={y} 
          width={width} 
          height={bodyHeight} 
          fill={isUp ? candleUpFill : candleDownFill} 
          stroke={candleStroke} 
          strokeWidth={1} 
        />
      </g>
    );
  };

  return (
    <div className={`h-64 md:h-96 w-full rounded-xl p-4 border ${isLight ? 'bg-white border-slate-200' : isGrey ? 'bg-[#f5f5f0] border-[#d4d4d4]' : 'bg-slate-800 border-slate-700'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight || isGrey ? '#e2e8f0' : '#334155'} />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isLight || isGrey ? '#64748b' : '#94a3b8', fontSize: 10 }}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: isLight || isGrey ? '#64748b' : '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="priceRange" 
            shape={<CustomCandle />}
            isAnimationActive={false}
          />

          {/* Strong IMP Levels */}
          {showStrongIMP && strongIMP && (
            <>
              <ReferenceLine y={strongIMP.bsl} stroke="#9ca3af" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'BSL', position: 'right', fill: '#9ca3af', fontSize: 10 }} />
              <ReferenceLine y={strongIMP.ssl} stroke="#9ca3af" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'SSL', position: 'right', fill: '#9ca3af', fontSize: 10 }} />
              <ReferenceLine y={strongIMP.level75} stroke="#ef4444" strokeDasharray="2 2" strokeWidth={1} label={{ value: '75%', position: 'right', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine y={strongIMP.level50} stroke="#3b82f6" strokeWidth={1.5} label={{ value: '50%', position: 'right', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }} />
              <ReferenceLine y={strongIMP.level20} stroke="#ef4444" strokeDasharray="2 2" strokeWidth={1} label={{ value: '20%', position: 'right', fill: '#ef4444', fontSize: 10 }} />
            </>
          )}

          {/* Pivot Points */}
          {showPivotPoints && pivotPoints && (
            <>
              <ReferenceLine y={pivotPoints.r2} stroke="#f87171" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'R2', position: 'right', fill: '#f87171', fontSize: 10 }} />
              <ReferenceLine y={pivotPoints.r1} stroke="#fb923c" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'R1', position: 'right', fill: '#fb923c', fontSize: 10 }} />
              <ReferenceLine y={pivotPoints.p} stroke="#a78bfa" strokeWidth={1.5} label={{ value: 'P', position: 'right', fill: '#a78bfa', fontSize: 10, fontWeight: 'bold' }} />
              <ReferenceLine y={pivotPoints.s1} stroke="#4ade80" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'S1', position: 'right', fill: '#4ade80', fontSize: 10 }} />
              <ReferenceLine y={pivotPoints.s2} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'S2', position: 'right', fill: '#22c55e', fontSize: 10 }} />
            </>
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
