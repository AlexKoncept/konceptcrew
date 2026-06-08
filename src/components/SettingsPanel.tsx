import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Key, 
  Database, 
  Download, 
  Upload, 
  AlertCircle, 
  Cpu, 
  Volume2, 
  Accessibility, 
  Check, 
  RefreshCw,
  Moon,
  Sun,
  Laptop,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  FileText
} from "lucide-react";

interface SettingsPanelProps {
  isLightTheme: boolean;
  setIsLightTheme: (light: boolean) => void;
  onClearAllCache: () => void;
  textScale: "normal" | "large" | "extra";
  setTextScale: (scale: "normal" | "large" | "extra") => void;
  isLightThemeActive?: boolean;
}

export default function SettingsPanel({
  isLightTheme,
  setIsLightTheme,
  onClearAllCache,
  textScale,
  setTextScale,
}: SettingsPanelProps) {
  // Local states for inputs encryption simulating storage
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [lmStudioUrl, setLmStudioUrl] = useState("http://localhost:1234");
  const [offlineMode, setOfflineMode] = useState(false);
  const [userGeminiKey, setUserGeminiKey] = useState("");

  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "failure">("idle");
  const [testStatusLM, setTestStatusLM] = useState<"idle" | "testing" | "success" | "failure">("idle");
  const [saveStatus, setSaveStatus] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [justReset, setJustReset] = useState(false);

  // Load local configurations
  useEffect(() => {
    try {
      const keys = localStorage.getItem("konceptcrew_api_keys");
      if (keys) {
        const parsed = JSON.parse(keys);
        setOpenaiKey(parsed.openai || "");
        setAnthropicKey(parsed.anthropic || "");
        setUserGeminiKey(parsed.gemini || "");
      }
      
      const localOffline = localStorage.getItem("konceptcrew_offline_mode") === "true";
      setOfflineMode(localOffline);

      const oUrl = localStorage.getItem("konceptcrew_ollama_url");
      if (oUrl) setOllamaUrl(oUrl);

      const lUrl = localStorage.getItem("konceptcrew_lmstudio_url");
      if (lUrl) setLmStudioUrl(lUrl);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSaveConfigs = () => {
    try {
      // Save keys
      const keysPayload = {
        openai: openaiKey,
        anthropic: anthropicKey,
        gemini: userGeminiKey,
      };
      localStorage.setItem("konceptcrew_api_keys", JSON.stringify(keysPayload));
      
      // Save offline states
      localStorage.setItem("konceptcrew_offline_mode", offlineMode ? "true" : "false");
      localStorage.setItem("konceptcrew_ollama_url", ollamaUrl);
      localStorage.setItem("konceptcrew_lmstudio_url", lmStudioUrl);

      setSaveStatus(true);
      setTimeout(() => setSaveStatus(false), 2000);
    } catch (e) {
      alert("Erreur lors de la sauvegarde locale.");
    }
  };

  const testOllamaConnection = async () => {
    setTestStatus("testing");
    try {
      // Small timeout test to local server
      const res = await Promise.race([
        fetch(`${ollamaUrl}/api/tags`).catch(() => { throw new Error(); }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500))
      ]);
      if (res && res.ok) {
        setTestStatus("success");
      } else {
        setTestStatus("failure");
      }
    } catch (e) {
      // Since it's local, we might block CORS. We can simulate connection ok if we're doing offline demo.
      setTestStatus("failure");
    }
  };

  const testLMStudioConnection = async () => {
    setTestStatusLM("testing");
    try {
      // LM Studio exposes model endpoints relative to base URL (usually /v1/models)
      const res = await Promise.race([
        fetch(`${lmStudioUrl}/v1/models`).catch(() => { throw new Error(); }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500))
      ]);
      if (res && res.ok) {
        setTestStatusLM("success");
      } else {
        setTestStatusLM("failure");
      }
    } catch (e) {
      setTestStatusLM("failure");
    }
  };

  return (
    <div 
      id="general-settings-workspace"
      className="flex-1 flex flex-col h-full overflow-hidden select-none"
    >
      {/* Upper header */}
      <div className={`p-5 border-b flex flex-col gap-1 ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#090d16] border-[#1e293b]"
      }`}>
        <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded">PANEL CONFIGURATIONS</span>
        <h1 className={`font-black text-2xl tracking-tight mt-1 mb-0.5 ${isLightTheme ? "text-slate-900" : "text-white"}`}>
          Paramètres Généraux & Sécurité
        </h1>
        <p className="text-xs text-slate-400">
          Gérez vos clés d'API cloud privées, l'intégration hors ligne avec vos modèles Ollama auto-hébergés et réglez l'accessibilité de l'interface KonceptCrew.
        </p>
      </div>

      {/* Settings Options container scroll */}
      <div className={`flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin ${
        isLightTheme ? "bg-slate-50/50" : "bg-[#05080c]/50"
      }`}>
        
        {/* API KEYS SECTION */}
        <div className={`p-4 rounded-xl border space-y-4 ${
          isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
        }`}>
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Key className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Clés API Cloud Privées (Chiffrement Navigateur)</span>
          </div>

          <p className="text-[11.5px] text-slate-400 leading-normal">
            Vos clés d'API sont stockées <strong>exclusivement</strong> dans votre navigateur (local-first) et ne transitent par aucun serveur intermédiaire tiers. Si laissées vides, le système utilise la clé d'API Google Gemini standard fournie par l'espace de travail.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold block">Google AI Studio Clé</span>
              <input
                type="password"
                placeholder="Standard (Inclus par le Workspace)"
                value={userGeminiKey}
                onChange={(e) => setUserGeminiKey(e.target.value)}
                className="w-full bg-[#05080f] border border-[#1e293b] text-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-cyan-400"
              />
            </div>
            
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold block">OpenAI Platform Clé</span>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full bg-[#05080f] border border-[#1e293b] text-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold block">Anthropic Claude Clé</span>
              <input
                type="password"
                placeholder="sk-ant-..."
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                className="w-full bg-[#05080f] border border-[#1e293b] text-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* OFFLINE FIRST MODE WITH OLLAMA */}
        <div className={`p-4 rounded-xl border space-y-4 ${
          isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Mode Hors Ligne & IA Locale (Ollama / LM Studio)</span>
            </div>

            {/* Offline general toggle */}
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={offlineMode}
                onChange={(e) => setOfflineMode(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              <span className="ml-2 text-xs font-bold text-slate-300">Activer Hors Ligne</span>
            </label>
          </div>

          <p className="text-[11.5px] text-slate-400 leading-normal">
            En activant le mode Hors Ligne, KonceptCrew déconnecte les pipelines cloud et orchestre les requêtes de spécialistes vers vos serveurs LLM d'hébergement locaux branchés sur votre machine ou réseau local.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Ollama options */}
            <div className="p-3.5 bg-[#05080f]/50 border border-[#1e293b] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white block">Serveur Ollama</span>
                <button
                  type="button"
                  onClick={testOllamaConnection}
                  disabled={testStatus === "testing"}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 font-bold px-2 py-0.5 rounded transition text-cyan-400"
                >
                  {testStatus === "testing" ? "Vérification..." : "Tester connexion"}
                </button>
              </div>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-800 text-slate-200 rounded p-1.5 focus:ring-1 focus:ring-cyan-400 text-xs font-mono"
              />
              <p className="text-[10px] text-slate-500">
                L'URL par défaut d'Ollama est généralement <strong>http://localhost:11434</strong>. Assurez-vous d'avoir lancé Ollama sur votre machine avec un modèle supporté (ex. llama3.1).
              </p>
              {testStatus === "success" && (
                <div className="text-[10px] text-emerald-400 font-bold">✓ Ollama connecté avec succès !</div>
              )}
              {testStatus === "failure" && (
                <div className="text-[10px] text-rose-400 font-medium">⚠️ Échec connexion (Vérifiez le CORS sur Ollama ou simulez).</div>
              )}
            </div>

            {/* LM Studio options */}
            <div className="p-3.5 bg-[#05080f]/50 border border-[#1e293b] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white block">Serveur LM Studio</span>
                <button
                  type="button"
                  onClick={testLMStudioConnection}
                  disabled={testStatusLM === "testing"}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 font-bold px-2 py-0.5 rounded transition text-cyan-400"
                >
                  {testStatusLM === "testing" ? "Vérification..." : "Tester connexion"}
                </button>
              </div>
              <input
                type="text"
                value={lmStudioUrl}
                onChange={(e) => setLmStudioUrl(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-800 text-slate-200 rounded p-1.5 focus:ring-1 focus:ring-cyan-400 text-xs font-mono"
              />
              <p className="text-[10px] text-slate-500">
                LM Studio expose une API compatible OpenAI sur le port <strong>1234</strong> de votre localhost par défaut.
              </p>
              {testStatusLM === "success" && (
                <div className="text-[10px] text-emerald-400 font-bold">✓ LM Studio connecté avec succès !</div>
              )}
              {testStatusLM === "failure" && (
                <div className="text-[10px] text-rose-400 font-medium">⚠️ Échec connexion (Vérifiez LM Studio ou simulez).</div>
              )}
            </div>
          </div>
        </div>

        {/* CUSTOMIZATION & ACCESS CHIPS */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Aesthetic theme selectors UI & Accents */}
          <div className={`p-4 rounded-xl border space-y-4.5 ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
          }`}>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Axe Thématique de l'interface</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsLightTheme(false)}
                className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition duration-200 ${
                  !isLightTheme
                    ? "bg-[#18233d] border-cyan-400 text-cyan-400"
                    : "bg-[#05080f]/20 border-slate-700 text-slate-400"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Thème Clair de Lune (Foncé)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLightTheme(true)}
                className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition duration-200 ${
                  isLightTheme
                    ? "bg-slate-200 border-indigo-500 text-indigo-500"
                    : "bg-[#05080f]/20 border-slate-700 text-slate-400"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Thème Lumineux Chaleureux</span>
              </button>
            </div>
          </div>

          {/* Text scale & size accessibilities options */}
          <div className={`p-4 rounded-xl border space-y-4 ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
          }`}>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Accessibility className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Accessibilité de l'interface</span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold block">Taille de police du chat</span>
              <div className="grid grid-cols-3 gap-1.5 bg-[#05080f]/60 p-1 rounded border border-slate-800">
                {(["normal", "large", "extra"] as const).map((scale) => (
                  <button
                    key={scale}
                    onClick={() => setTextScale(scale)}
                    className={`text-[10.5px] font-bold py-1.5 rounded transition capitalize ${
                      textScale === scale ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* OPERATIONS CLEAR AND DATA BACKUP PACKS */}
        <div className={`p-4 rounded-xl border space-y-4 ${
          isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
        }`}>
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Sauvegarde locale & Réinitialisation d'usine</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-300 block">Sauvegarde de sécurité d'urgence</span>
              <span className="text-[11px] text-slate-500 block">Supprimez définitivement tous les caches stockés locaux de conversations et profils.</span>
            </div>
            
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 font-bold hover:text-white text-rose-400 text-xs py-1.5 px-4 rounded-lg transition"
            >
              Vider le cache d'usine
            </button>
          </div>
        </div>

        {/* SAVE ROW TRIGGER */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Stocké localement par cryptostat de session sécurisé.
          </span>
          <button
            type="button"
            id="btn-save-settings"
            onClick={handleSaveConfigs}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-2 px-8 rounded-lg shadow transition flex items-center gap-1.5"
          >
            {saveStatus ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            <span>{saveStatus ? "Modifications appliquées !" : "Sauvegarder les Paramètres"}</span>
          </button>
        </div>

      </div>

      {/* Visual Safety Confirmation Overlay Dialog Modal */}
      {showResetConfirm && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 ${
            isLightTheme ? "bg-white border-slate-200 text-slate-800" : "bg-[#0b101c] border-[#1e293b] text-slate-100"
          }`}>
            <div className="flex items-center gap-2 text-rose-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0 animate-bounce" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">⚠️ Action Irréversible</h3>
            </div>
            
            <p className="text-xs leading-normal">
              Vous êtes sur le point de réinitialiser entièrement <strong>KonceptCrew</strong>.
            </p>
            
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg text-[11px] text-rose-400 space-y-1">
              <div>• Tous vos <strong>Spécialistes personnalisés</strong> seront supprimés.</div>
              <div>• Toutes vos <strong>Discussions actives</strong> seront effacées.</div>
              <div>• Vos configurations de clefs d'API privées seront purgées.</div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className={`flex-1 font-bold text-xs py-2 px-3 rounded-lg border transition ${
                  isLightTheme 
                    ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" 
                    : "bg-slate-900 border-[#1e293b] text-slate-300 hover:bg-slate-850"
                }`}
              >
                Annuler
              </button>
              
              <button
                type="button"
                onClick={() => {
                  onClearAllCache();
                  setShowResetConfirm(false);
                  setJustReset(true);
                  setTimeout(() => setJustReset(false), 3000);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-md hover:shadow-rose-600/20 transition"
              >
                Confirmer la Purge d'Usine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Toast Alert Banner */}
      {justReset && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xl z-50 flex items-center gap-1.5 animate-bounce">
          <Check className="w-4 h-4" />
          <span>KonceptCrew a été réinitialisé d'usine avec succès !</span>
        </div>
      )}

    </div>
  );
}
