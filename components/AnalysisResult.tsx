
import React from 'react';
import { TradingAnalysis, Decision } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../utils/translations';

interface AnalysisResultProps {
  analysis: TradingAnalysis | null;
  loading: boolean;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, loading }) => {
  const { theme, language } = useSettings();
  const t = useTranslation(language);

  if (loading) {
    return (
      <div className={`border rounded-xl p-8 flex flex-col items-center justify-center space-y-4 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="opacity-60 animate-pulse">{t.analyzing}</p>
      </div>
    );
  }

  if (!analysis) return null;

  const decisionColor = 
    analysis.decision === Decision.BUY ? 'text-green-500 bg-green-500/10' :
    analysis.decision === Decision.SELL ? 'text-red-500 bg-red-500/10' :
    'text-slate-500 bg-slate-500/10';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`p-6 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'} ${decisionColor}`}>
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${decisionColor}`}>
            {analysis.decision}
          </div>
          <div>
            <div className="text-sm opacity-70 uppercase tracking-widest font-semibold">{t.consensusDecision}</div>
            <div className="text-2xl font-bold">{analysis.confidence}% {t.confidence}</div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
            <div className="text-right">
                <div className="text-xs opacity-70">{t.leverage}</div>
                <div className="text-lg font-mono font-bold">{analysis.leverage}</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl border space-y-4 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <h3 className="text-blue-400 font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            {t.agentThought}
          </h3>
          <p className="opacity-80 leading-relaxed italic">"{analysis.thought_process}"</p>
        </div>

        <div className={`p-6 rounded-xl border space-y-4 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <h3 className="text-purple-400 font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            {t.tradeParams}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <div className="text-xs opacity-50 uppercase">{t.entryZone}</div>
              <div className="font-mono opacity-90">{analysis.entry_zone}</div>
            </div>
            <div className={`p-3 rounded-lg border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <div className="text-xs opacity-50 uppercase">{t.stopLoss}</div>
              <div className="font-mono text-red-500">{analysis.stop_loss}</div>
            </div>
            <div className={`p-3 rounded-lg border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <div className="text-xs opacity-50 uppercase">{t.takeProfit}</div>
              <div className="font-mono text-green-500">{analysis.take_profit}</div>
            </div>
            <div className={`p-3 rounded-lg border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <div className="text-xs opacity-50 uppercase">{t.riskFactor}</div>
              <div className="font-mono opacity-90">
                {analysis.confidence > 80 ? t.low : analysis.confidence > 60 ? t.medium : t.high}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
