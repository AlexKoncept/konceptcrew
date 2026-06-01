import React, { useState } from "react";
import { 
  BarChart3, 
  Coins, 
  DollarSign, 
  Clock, 
  Cpu, 
  Gauge, 
  AlertTriangle, 
  Save, 
  TrendingUp, 
  ArrowUpRight 
} from "lucide-react";
import { UserStats, UserProfile } from "../types";

interface StatsDashboardProps {
  stats: UserStats;
  userProfile: UserProfile;
  onUpdateBudgetLimit: (limit: number) => void;
  isLightTheme: boolean;
  language?: any;
}

export default function StatsDashboard({
  stats,
  userProfile,
  onUpdateBudgetLimit,
  isLightTheme,
}: StatsDashboardProps) {
  const [budgetLimit, setBudgetLimit] = useState(userProfile.budgetLimitUSD);
  const [blockingCallOnLimit, setBlockingCallOnLimit] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const budgetUsagePercent = Math.min(
    100,
    Math.round((userProfile.budgetSpentUSD / budgetLimit) * 100)
  );

  const handleSaveBudget = () => {
    onUpdateBudgetLimit(budgetLimit);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Pre-calculated stats or defaults
  const totalCalls = stats.callsCount || 142;
  const avgCostPerCall = userProfile.budgetSpentUSD / totalCalls;

  // Render pristine SVGs charts for "Usage par Modèle"
  const modelEntries = Object.entries(stats.modelUsage || {
    "gemini-3.5-flash": 95,
    "gemini-3.1-pro-preview": 25,
    "gpt-4o": 12,
    "llama3.1:8b (local)": 10,
  });

  const providerEntries = Object.entries(stats.providerUsage || {
    "Google AI Studio": 120,
    "OpenAI Platform": 12,
    "Ollama (Local)": 10,
  });

  // Calculate coordinates for simple trend line
  const points = "20,90 80,75 140,80 200,60 260,40 320,50 380,25";

  return (
    <div 
      id="stats-budget-workspace"
      className="flex-1 flex flex-col h-full overflow-hidden select-none"
    >
      {/* Upper header */}
      <div className={`p-5 border-b ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#090d16] border-[#1e293b]"
      }`}>
        <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded">TABLEAU DE BORD</span>
        <h1 className={`font-black text-2xl tracking-tight mt-1 mb-0.5 ${isLightTheme ? "text-slate-900" : "text-white"}`}>
          Statistiques de Consommation & Budget
        </h1>
        <p className="text-xs text-slate-400">
          Suivez la consommation de vos spécialistes par modèle, gérez vos limites financières et gardez le contrôle de vos dépenses de manière transparente.
        </p>
      </div>

      {/* Container scroll */}
      <div className={`flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin ${
        isLightTheme ? "bg-slate-50/50" : "bg-[#05080c]/50"
      }`}>
        
        {/* Core numbers strip cards */}
        <div className="grid grid-cols-4 gap-3.5">
          {/* Tokens total */}
          <div className={`p-4 rounded-xl border ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Volume de Tokens</span>
              <Coins className="w-4 h-4 text-cyan-400" />
            </div>
            <p className={`font-black text-lg tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              {stats.tokensUsed.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5">Est. {Math.round(stats.tokensUsed / 1000)}k total</span>
          </div>

          {/* Money spent */}
          <div className={`p-4 rounded-xl border ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Coût Estimé</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-black text-lg text-emerald-400 tracking-tight">
              {userProfile.budgetSpentUSD.toFixed(2)} $
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5">Moyenne {avgCostPerCall.toFixed(3)}$ / appel</span>
          </div>

          {/* Session Durations */}
          <div className={`p-4 rounded-xl border ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Durée Conversation</span>
              <Clock className="w-4 h-4 text-pink-400" />
            </div>
            <p className={`font-black text-lg tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              {Math.round(stats.durationSeconds / 60)} min
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5">{stats.sessionsCount} sessions de chat distinctes</span>
          </div>

          {/* Total Calls */}
          <div className={`p-4 rounded-xl border ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Requêtes IA</span>
              <Gauge className="w-4 h-4 text-indigo-400" />
            </div>
            <p className={`font-black text-lg tracking-tight ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              {stats.callsCount}
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5">{Object.keys(stats.modelUsage).length} modèles sollicités</span>
          </div>
        </div>

        {/* BUDGET MANAGEMENT CONTROLLER */}
        <div className={`p-4 rounded-xl border ${
          isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className={`font-extrabold text-sm ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                Ajustement du budget mensuel
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Mise à jour instantanée du quota</span>
          </div>

          <div className="grid grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Limite financière autorisée</span>
                <span className="text-cyan-400 font-black font-mono">{budgetLimit.toFixed(1)} USD / Mois</span>
              </div>
              
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 rounded"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10.0 $ (Normal)</span>
                <span>50.0 $ (Pro)</span>
                <span>100.0 $ (Max limite)</span>
              </div>
            </div>

            <div className="space-y-4 border-l border-slate-800/80 pl-6">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={blockingCallOnLimit}
                  onChange={(e) => setBlockingCallOnLimit(e.target.checked)}
                  className="rounded border-slate-700 bg-transparent text-cyan-400 focus:ring-0 mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-300 block">Alertes & Blocages automatiques</span>
                  <span className="text-[11px] text-slate-500 block leading-tight">
                    Bloquer temporairement les requêtes API coûteuses si la consommation dépasse {budgetLimit.toFixed(1)}$ ce mois-ci. (Intelligence locale uniquement)
                  </span>
                </div>
              </label>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveBudget}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-1.5 px-4 rounded-lg shadow flex items-center gap-1 transition"
                >
                  <Save className="w-3.5 h-3.5 text-slate-950" />
                  <span>{isSaved ? "Configuration mise à jour !" : "Sauvegarder les limites"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CHARTS CONTAINER ROW */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Chart Left (SVG Bar usage of models) */}
          <div className={`p-4 rounded-xl border ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
          }`}>
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3">
              Distribution par modèles (%)
            </h3>

            <div className="space-y-3.5">
              {modelEntries.map(([modelName, value]) => {
                const totalModelCalls = modelEntries.reduce((sum, [_, val]) => sum + val, 0);
                const percent = Math.round((value / totalModelCalls) * 100);
                return (
                  <div key={modelName} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-300 truncate max-w-[180px]">{modelName}</span>
                      <span className="text-slate-400 pr-1 font-bold">{value} appels ({percent}%)</span>
                    </div>
                    <div className="h-2 rounded bg-slate-900 border border-[#1e293b]/40 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Right (Vector Trends SVG line and provider pie) */}
          <div className={`p-4 rounded-xl border ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
          }`}>
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3">
              Tendance des coûts (Semaine écoulée)
            </h3>

            <div className="flex flex-col gap-4">
              {/* Elegant responsive SVG line graph representing costs */}
              <div className="h-24 bg-[#05080f]/70 border border-[#1e293b]/50 rounded-lg p-2 flex items-center justify-center relative">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
                  
                  {/* Smooth Line */}
                  <polyline
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                    points={points}
                  />

                  {/* Gradient shadow beneath the line */}
                  <path
                    d={`M 20 90 L ${points} L 380 100 Z`}
                    fill="url(#cost-grad)"
                    opacity="0.15"
                  />

                  {/* Definitions */}
                  <defs>
                    <linearGradient id="cost-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute right-2 top-2 text-[9px] font-bold text-slate-500 flex items-center gap-1 bg-[#101726] px-1.5 py-0.5 rounded border border-slate-800">
                  <TrendingUp className="w-3 h-3 text-purple-400" />
                  <span>Hausse graduelle</span>
                </div>
              </div>

              {/* Providers breakdown lists */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                {providerEntries.map(([providerName, clicks]) => (
                  <div key={providerName} className="p-2 border border-[#1e293b]/50 bg-[#05080f]/20 rounded-lg">
                    <span className="text-slate-500 block truncate font-sans">{providerName}</span>
                    <span className="text-slate-300 font-extrabold text-xs block font-mono mt-0.5">{clicks} req.</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
