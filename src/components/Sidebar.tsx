import React from "react";
// @ts-ignore
import logoImg from "../../logo.png";
import { 
  Users,  
  Store, 
  User, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Plus, 
  Bot,
  Flame,
  UserCheck2,
  Lock,
  Star
} from "lucide-react";
import { Persona, UserProfile } from "../types";
import { getTranslation, Language } from "../services/i18n";

interface SidebarProps {
  personas: Persona[];
  selectedPersonaId: string | null;
  onSelectPersona: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  activeTab: "chat" | "store" | "info" | "stats" | "settings" | "help";
  setActiveTab: (tab: "chat" | "store" | "info" | "stats" | "settings" | "help") => void;
  onAddNewCrew: () => void;
  userProfile: UserProfile;
  isLightTheme: boolean;
  language: Language;
}

export default function Sidebar({
  personas,
  selectedPersonaId,
  onSelectPersona,
  onToggleFavorite,
  activeTab,
  setActiveTab,
  onAddNewCrew,
  userProfile,
  isLightTheme,
  language,
}: SidebarProps) {
  const t = getTranslation(language);
  const budgetPercentage = Math.min(
    100,
    Math.round((userProfile.budgetSpentUSD / userProfile.budgetLimitUSD) * 100)
  );

  return (
    <aside 
      id="konceptcrew-sidebar"
      className={`w-80 flex flex-col border-r h-full select-none ${
        isLightTheme 
          ? "bg-[#f0f4fa]/95 border-slate-200/50 text-slate-800 shadow-[2px_0_12px_rgba(0,0,0,0.015)]" 
          : "bg-[#090d16] border-[#1e293b] text-slate-200"
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-transparent">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => setActiveTab("store")}
        >
          {/* Real logo image loaded from root logo.png */}
          <img
            src={logoImg}
            alt="KonceptCrew Logo"
            className="w-12 h-12 object-contain filter drop-shadow-[0_2px_10px_rgba(89,105,243,0.22)]"
            referrerPolicy="no-referrer"
          />
          <div>
            <span className={`font-black text-xl tracking-tight leading-none block ${
              isLightTheme ? "text-slate-900" : "text-white"
            }`}>
              Koncept<span className="bg-gradient-to-r from-[#5969F3] via-[#7d51f7] to-[#ec4899] bg-clip-text text-transparent">Crew</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 block font-bold">
              Your AI Crew. Your Way.
            </span>
          </div>
        </div>
      </div>

      {/* Crew Section Title and Creator Button */}
      <div className="px-5 py-3 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-widest">
        <span>{t.monEquipage}</span>
        <button
          id="btn-add-crew"
          onClick={onAddNewCrew}
          className={`p-1 rounded-md transition duration-200 ${
            isLightTheme 
              ? "hover:bg-slate-200 text-slate-600 hover:text-slate-900" 
              : "hover:bg-slate-800 text-slate-400 hover:text-white"
          }`}
          title={t.recruter}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Crew Members List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-3.5 scrollbar-thin">
        {(() => {
          const favorites = personas.filter(p => p.favorite);
          const others = personas.filter(p => !p.favorite);

          const renderPersonaCard = (persona: Persona) => {
            const isSelected = activeTab === "chat" && selectedPersonaId === persona.id;
            return (
              <div
                key={persona.id}
                id={`crew-item-${persona.id}`}
                onClick={() => {
                  onSelectPersona(persona.id);
                  setActiveTab("chat");
                }}
                className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer relative transition duration-200 group ${
                  isSelected
                    ? isLightTheme
                      ? "bg-white border-indigo-200/65 shadow-md shadow-indigo-100/50 rounded-2xl"
                      : "bg-[#161c2c] border-[1px] border-[#2a3854] shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)] rounded-2xl"
                    : isLightTheme
                      ? "hover:bg-white/60 hover:shadow-xs border-transparent rounded-2xl"
                      : "hover:bg-[#0f1524] border-transparent rounded-2xl"
                } border`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#1e293b]"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 rounded-full border-slate-950" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={`font-bold text-sm truncate ${
                      isLightTheme ? "text-slate-900" : "text-white"
                    }`}>
                      {persona.name}
                    </h4>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {persona.engine.provider === "Ollama" && (
                        <span className="text-[9px] bg-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded font-mono">Local</span>
                      )}
                      
                      {/* Favorite Button star icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite?.(persona.id);
                        }}
                        className="relative z-10 p-0.5 rounded-full hover:bg-slate-500/10 active:scale-95 transition"
                        title={persona.favorite ? (language === "fr" ? "Retirer des favoris" : "Remove from favorites") : (language === "fr" ? "Ajouter aux favoris" : "Add to favorites")}
                      >
                        {persona.favorite ? (
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        ) : (
                          <Star className="w-3.5 h-3.5 text-slate-400/40 group-hover:text-amber-500/60 hover:text-amber-500 hover:scale-110 duration-150" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 truncate leading-tight">
                    {persona.description}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-medium">{language === "fr" ? "En ligne" : "Online"}</span>
                  </div>
                </div>

                {/* Mini voice indicator waves (from Reference Image) */}
                <div className="flex items-end gap-[2px] h-3 pr-1 opacity-60 group-hover:opacity-100 transition duration-150">
                  <span className="w-[2px] bg-cyan-400 animate-[bounce_0.8s_infinite_100ms]" style={{ height: '40%' }}></span>
                  <span className="w-[2px] bg-indigo-400 animate-[bounce_0.8s_infinite_400ms]" style={{ height: '80%' }}></span>
                  <span className="w-[2px] bg-pink-400 animate-[bounce_0.8s_infinite_200ms]" style={{ height: '50%' }}></span>
                </div>
              </div>
            );
          };

          if (favorites.length > 0) {
            return (
              <>
                <div className="space-y-1.5 pt-1">
                  <div className="px-2 text-[10px] text-amber-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{t.favoris} ({favorites.length})</span>
                  </div>
                  {favorites.map(renderPersonaCard)}
                </div>
                
                {others.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <div className="px-2 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      <span>{t.crews} ({others.length})</span>
                    </div>
                    {others.map(renderPersonaCard)}
                  </div>
                )}
              </>
            );
          }

          return personas.map(renderPersonaCard);
        })()}
      </div>

      {/* Navigation Options Section */}
      <div className={`p-3 border-t border-b ${
        isLightTheme ? "border-slate-200/60" : "border-[#1e293b]"
      } space-y-1`}>
        {/* Store Button */}
        <button
          id="tab-btn-store"
          onClick={() => setActiveTab("store")}
          className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-sm font-medium transition duration-200 ${
            activeTab === "store"
              ? isLightTheme 
                ? "bg-white text-indigo-600 font-bold border border-slate-200/50 shadow-xs" 
                : "bg-[#182035] text-cyan-400 font-semibold"
              : isLightTheme 
                ? "hover:bg-white/40 text-slate-600 hover:text-slate-900" 
                : "hover:bg-[#0f1524] text-slate-400"
          }`}
        >
          <Store className="w-4 h-4 text-indigo-500/80" />
          <span>{t.boutique}</span>
        </button>

        {/* User Info Memory */}
        <button
          id="tab-btn-info"
          onClick={() => setActiveTab("info")}
          className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-sm font-medium transition duration-200 ${
            activeTab === "info"
              ? isLightTheme 
                ? "bg-white text-indigo-600 font-bold border border-slate-200/50 shadow-xs" 
                : "bg-[#182035] text-cyan-400 font-semibold"
              : isLightTheme 
                ? "hover:bg-white/40 text-slate-600 hover:text-slate-900" 
                : "hover:bg-[#0f1524] text-slate-400"
          }`}
        >
          <User className="w-4 h-4 text-indigo-500/80" />
          <span>{t.profil}</span>
        </button>

        {/* Stats and Costs */}
        <button
          id="tab-btn-stats"
          onClick={() => setActiveTab("stats")}
          className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-sm font-medium transition duration-200 ${
            activeTab === "stats"
              ? isLightTheme 
                ? "bg-white text-indigo-600 font-bold border border-slate-200/50 shadow-xs" 
                : "bg-[#182035] text-cyan-400 font-semibold"
              : isLightTheme 
                ? "hover:bg-white/40 text-slate-600 hover:text-slate-900" 
                : "hover:bg-[#0f1524] text-slate-400"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-500/80" />
          <span>{t.stats}</span>
        </button>

        {/* System Settings */}
        <button
          id="tab-btn-settings"
          onClick={() => setActiveTab("settings")}
          className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-sm font-medium transition duration-200 ${
            activeTab === "settings"
              ? isLightTheme 
                ? "bg-white text-indigo-600 font-bold border border-slate-200/50 shadow-xs" 
                : "bg-[#182035] text-cyan-400 font-semibold"
              : isLightTheme 
                ? "hover:bg-white/40 text-slate-600 hover:text-slate-900" 
                : "hover:bg-[#0f1524] text-slate-400"
          }`}
        >
          <Settings className="w-4 h-4 text-indigo-500/80" />
          <span>{t.config}</span>
        </button>
      </div>

      {/* User Budget and Profile Card (Bottom Block) */}
      <div 
        onClick={() => setActiveTab("info")}
        title={language === "fr" ? "Cliquez pour personnaliser votre profil" : "Click to customize your profile"}
        className={`p-4 flex flex-col gap-3.5 cursor-pointer group/user transition-all duration-300 hover:bg-opacity-95 active:scale-[0.99] ${
          isLightTheme 
            ? "bg-white/70 hover:bg-white/90 text-slate-800 border-t border-slate-200/40" 
            : "bg-[#0b1222] hover:bg-[#121c32] text-slate-200"
        }`}
      >
        {/* User identifier avatar footer */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 p-[1.5px] flex-shrink-0 overflow-hidden transition duration-300 group-hover/user:scale-105">
            {userProfile.avatar ? (
              <img 
                src={userProfile.avatar} 
                alt={userProfile.name} 
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-xs ${
                isLightTheme ? "bg-slate-100 text-slate-800" : "bg-slate-900 text-white"
              }`}>
                {(() => {
                  if (!userProfile.name) return "U";
                  return userProfile.name
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                })()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`font-extrabold text-sm truncate transition duration-200 group-hover/user:text-cyan-600 ${
                isLightTheme ? "text-[#1e293b]" : "text-white"
              }`}>{userProfile.name || "Utilisateur"}</span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate group-hover/user:text-slate-500">
              {userProfile.job || "Utilisateur"}
            </p>
          </div>
        </div>

        {/* Budget limit progress bar */}
        <div className={`p-2.5 rounded-xl ${isLightTheme ? "bg-slate-100/50" : "bg-[#0f172a]"} space-y-1.5`}>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-extrabold flex items-center gap-1 uppercase tracking-wider text-[9px]">
              {language === "fr" ? "Budget Mensuel" : "Monthly Budget"}
            </span>
            <span className={`font-black ${isLightTheme ? "text-[#1e293b]" : "text-white"}`}>
              {userProfile.budgetSpentUSD.toFixed(2)} / {userProfile.budgetLimitUSD.toFixed(1)} USD
            </span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${isLightTheme ? "bg-slate-200" : "bg-slate-800"}`}>
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 transition-all duration-300"
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
          <div className="flex justify-end text-[9px] text-pink-500 font-bold">{budgetPercentage}% {language === "fr" ? "utilisé" : "used"}</div>
        </div>
      </div>
    </aside>
  );
}
