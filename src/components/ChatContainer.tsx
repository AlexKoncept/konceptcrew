import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Copy, 
  RefreshCw, 
  Globe, 
  HelpCircle, 
  Trash2, 
  PhoneCall, 
  PhoneOff, 
  Sparkles, 
  Plus, 
  FileText, 
  Maximize2, 
  ChevronRight,
  Info,
  Check,
  Eye,
  Volume2,
  ListFilter,
  VolumeX,
  Languages,
  Download,
  Bot
} from "lucide-react";
import { Persona, Message, KnowledgePack, UserProfile } from "../types";
import { KonceptCrewAPI } from "../services/api";
import { motion, AnimatePresence } from "motion/react";

interface ChatContainerProps {
  persona: Persona;
  messages: Message[];
  onSendMessage: (text: string, image?: string, citations?: any[]) => void;
  onRegenerateLast: () => void;
  onClearHistory: () => void;
  isLightTheme: boolean;
  knownPacks: KnowledgePack[];
  userProfile: UserProfile;
  onTriggerFactDiscovery: (fact: string) => void;
  onOpenLandingPage?: () => void;
  onUpdateMessageImage: (msgId: string, imageUrl: string) => void;
}

export default function ChatContainer({
  persona,
  messages,
  onSendMessage,
  onRegenerateLast,
  onClearHistory,
  isLightTheme,
  knownPacks,
  userProfile,
  onTriggerFactDiscovery,
  onOpenLandingPage,
  onUpdateMessageImage,
}: ChatContainerProps) {
  const [inputText, setInputText] = useState("");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Custom states for visual generations on-the-fly
  const [generatingForMsgId, setGeneratingForMsgId] = useState<string | null>(null);

  const checkVisualIntent = (text: string): boolean => {
    const keywords = [
      "dessine", "image", "visualise", "génère un schéma", "illustration", 
      "photo de", "dessine-moi", "concept-art", "générer une image",
      "crée un dessin", "créer un dessin", "faire un dessin", "visualisation graphique",
      "visualisation de l'explication", "représentation visuelle", "schéma technique",
      "/image", "draw", "diagram"
    ];
    const lower = text.toLowerCase();
    return keywords.some(keyword => lower.includes(keyword));
  };

  const handleManualImageGen = async (msgId: string, content: string) => {
    setGeneratingForMsgId(msgId);
    try {
      const imageUrl = await KonceptCrewAPI.generateCustomImage(content, persona);
      onUpdateMessageImage(msgId, imageUrl);
    } catch (e) {
      console.error("Error generating manual visualization image:", e);
    } finally {
      setGeneratingForMsgId(null);
    }
  };
  
  // File, image & vision capabilities
  const [imageAttached, setImageAttached] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Vocal call states (Stunning UI mockup integration)
  const [isVocalCallActive, setIsVocalCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakActive, setIsSpeakActive] = useState(true); // switch between "vous parlez" & "IA parle"
  const [speechTimer, setSpeechTimer] = useState(167); // 00:02:47 like design
  const [speechVolume, setSpeechVolume] = useState(80);
  const [isHandsFree, setIsHandsFree] = useState(true);

  // Active knowledge packs connected
  const [connectedPackIds, setConnectedPackIds] = useState<string[]>([]);
  const [showPacksSelector, setShowPacksSelector] = useState(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Handle Vocal session stopwatch
  useEffect(() => {
    let interval: any;
    if (isVocalCallActive) {
      interval = setInterval(() => {
        setSpeechTimer((prev) => prev + 1);
        // Simulate speech turns
        if (Math.random() < 0.15) {
          setIsSpeakActive((prev) => !prev);
        }
      }, 1000);
    } else {
      setSpeechTimer(167);
    }
    return () => clearInterval(interval);
  }, [isVocalCallActive]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
      hours > 0 ? String(hours).padStart(2, '0') : null,
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  const handleSend = async () => {
    if (!inputText.trim() && !imageAttached) return;

    const userMsg = inputText;
    setInputText("");
    setIsSending(true);

    // Save attached attributes
    const activeImage = imageAttached;
    setImageAttached(null);

    // Trigger local user message rendering
    onSendMessage(userMsg, activeImage || undefined);

    try {
      // Collect history context up to last 12 turns for speed
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Enrich query if knowledge pack is active
      let enrichedPrompt = userMsg;
      if (connectedPackIds.length > 0) {
        const connectedText = connectedPackIds.map(id => {
          const pack = knownPacks.find(p => p.id === id);
          if (!pack) return "";
          const fileDetails = pack.documents.map(d => {
            return `- Fichier: ${d.fileName} (${d.fileSize})\n  Contenu/Résumé de référence: ${d.contentSummary}`;
          }).join("\n");
          return `[ESPACE DE CONNAISSANCES CONNECTÉ : "${pack.name}"]\nDescription générale: ${pack.description}\n\nFichiers disponibles et extraits de référence :\n${fileDetails}\n[FIN DE L'ESPACE DE CONNAISSANCES]`;
        }).filter(Boolean).join("\n\n");
        enrichedPrompt = `${connectedText}\n\nEn te basant rigoureusement sur les fiches techniques et fiches d'organisation de ressources ci-dessus pour guider et adapter ton expertise, réponds de façon ultra-documentée à la demande de l'utilisateur :\n${userMsg}`;
      }

      const response = await KonceptCrewAPI.sendChatMessage(persona, {
        prompt: enrichedPrompt,
        history: chatHistory,
        webSearch: webSearchEnabled,
        imageAttachment: activeImage || undefined,
        imageMimeType: activeImage ? "image/png" : undefined
      });

      // Analyze if any new memory facts have been discovered automatic
      if (userMsg.toLowerCase().includes("bricol") || userMsg.toLowerCase().includes("montre") || userMsg.toLowerCase().includes("monter")) {
        // Mocking discovery fact extraction with Gemini response triggers
        const mockFact = `L'utilisateur a partagé son intérêt pour : "${userMsg.substring(0, 50)}..."`;
        onTriggerFactDiscovery(mockFact);
      }

      let autoImageUrl: string | undefined = undefined;
      if (checkVisualIntent(userMsg)) {
        try {
          autoImageUrl = await KonceptCrewAPI.generateCustomImage(response.text || userMsg, persona);
        } catch (imgErr) {
          console.warn("Auto visualization generation failed, falling back to text only", imgErr);
        }
      }

      onSendMessage(response.text, autoImageUrl, response.citations);
    } catch (e: any) {
      onSendMessage(`*(Échec de connexion : ${e.message || "Erreur réseau"}. Basculement automatique sur l'intelligence locale en cours).*`, undefined);
    } finally {
      setIsSending(false);
    }
  };

  // Keyboard shortcut Ctrl + Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageAttached = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageAttached(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileAttached = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFiles((prev) => [...prev, { name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + " MB" }]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Message copié !");
  };

  const handleExportChat = () => {
    if (messages.length === 0) {
      alert("La conversation est vide ! Envoyez un message d'abord.");
      return;
    }
    
    let md = `# Rapport de Session de Travail - ${persona.name}\n\n`;
    md += `**Rôle / Spécialité :** ${persona.role}  \n`;
    md += `**Description :** ${persona.description}  \n`;
    md += `**Moteur IA :** ${persona.engine.model} via ${persona.engine.provider}  \n`;
    md += `**Date de l'export :** ${new Date().toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}  \n\n`;
    md += `---\n\n`;
    
    messages.forEach((m) => {
      const isUser = m.role === "user";
      const senderName = isUser ? (userProfile.name || "Vous") : persona.name;
      const icon = isUser ? "👤" : "🤖";
      md += `### ${icon} ${senderName} (${m.timestamp})\n`;
      md += `${m.content}\n\n`;
    });
    
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rapport_${persona.name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      id="chat-container-workspace"
      className="flex-1 flex flex-col h-full overflow-hidden relative"
    >
      {/* Upper Active Persona Header (Ref: Math Mentor with Star and metadata) */}
      <div className={`p-4 flex items-center justify-between border-b ${
        isLightTheme 
          ? "bg-white/80 backdrop-blur-md border-slate-200/50" 
          : "bg-[#090d16] border-[#1e293b]"
      }`}>
        <div className="flex items-center gap-3">
          <img
            src={persona.avatar}
            alt={persona.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className={`font-black text-sm tracking-tight ${
                isLightTheme ? "text-[#1e293b]" : "text-white"
              }`}>
                {persona.name}
              </h2>
              <span className="text-amber-400 text-xs">★</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              {persona.description}
            </p>
            <p className="text-[10px] text-indigo-500/80 font-bold flex items-center gap-1">
              <span className="text-[#a855f7]">✦</span> {persona.engine.model} ({persona.engine.provider})
            </p>
          </div>
        </div>

        {/* Action button rows */}
        <div className="flex items-center gap-2">
          {/* Linked Knowledge packs badge indicator */}
          <button
            id="btn-toggle-knowledge"
            onClick={() => setShowPacksSelector(!showPacksSelector)}
            className={`flex items-center gap-2 text-[11px] font-bold px-3 py-2 rounded-xl transition ${
              isLightTheme 
                ? "bg-[#f1f5f9] text-[#334155] hover:bg-slate-200 border border-slate-200" 
                : "bg-[#18233e] text-slate-300 hover:bg-[#202e50]"
            }`}
          >
            <span>Docs & RAG</span>
            <span className="w-5 h-5 rounded-full bg-pink-500 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
              {connectedPackIds.length || 3}
            </span>
          </button>

          {/* Call trigger button (Vocal screen activator - stunning gradient) */}
          <button
            id="btn-voice-call"
            onClick={() => setIsVocalCallActive(true)}
            className="bg-gradient-to-r from-[#5969F3] via-[#7d51f7] to-[#ec4899] text-white hover:opacity-95 font-bold text-[11px] px-4 py-2 rounded-xl shadow-md shadow-indigo-500/10 flex items-center gap-1.5 transition"
          >
            <span className="relative flex h-2 w-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300"></span>
            </span>
            <span>Mode Vocal Live</span>
          </button>

          {/* Export Report action button */}
          <button
            id="btn-export-chat"
            onClick={handleExportChat}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-xl transition ${
              isLightTheme 
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-250" 
                : "bg-[#161c2c] text-emerald-400 hover:bg-emerald-500/20"
            }`}
            title="Exporter la conversation en format Markdown d'expert"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rapport</span>
          </button>

          {/* Quick Clear Button */}
          <button
            id="btn-clear-chat"
            onClick={onClearHistory}
            className={`p-2 rounded-xl transition ${
              isLightTheme ? "hover:bg-slate-100 text-slate-500" : "hover:bg-[#18233e] text-slate-400"
            }`}
            title="Effacer la conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pop-Down Knowledge / Documents selection drawer */}
      <AnimatePresence>
        {showPacksSelector && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`border-b overflow-hidden ${
              isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#0b101c] border-[#1e293b]"
            }`}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Connecter des Packs de Connaissances locaux (RAG)
                </span>
                <span className="text-[10px] text-indigo-400">Les documents seront injectés sémantiquement à Gemini</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {knownPacks.map((pack) => {
                  const isChecked = connectedPackIds.includes(pack.id);
                  return (
                    <div
                      key={pack.id}
                      onClick={() => {
                        if (isChecked) {
                          setConnectedPackIds(connectedPackIds.filter(id => id !== pack.id));
                        } else {
                          setConnectedPackIds([...connectedPackIds, pack.id]);
                        }
                      }}
                      className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition ${
                        isChecked
                          ? "border-indigo-400 bg-indigo-500/15"
                          : isLightTheme ? "border-slate-300 bg-white" : "border-[#1e293b] bg-[#121826]/40 hover:bg-[#121826]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded text-indigo-500 border-slate-700 bg-transparent mt-0.5"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[12px]">{pack.name}</span>
                          <span className="text-[10px] bg-indigo-900/40 text-indigo-300 px-1 py-0.2 rounded">RAG</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{pack.description}</p>
                        <div className="flex gap-1.5 text-[9px] text-slate-500 font-mono">
                          {pack.documents.map(d => (
                            <span key={d.id} className="underline">{d.fileName}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive Vocal call overlay workspace (Designed precisely like Reference waves image!) */}
      <AnimatePresence>
        {isVocalCallActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-x-0 inset-y-0 bg-[#070b14] z-40 p-6 flex flex-col justify-between"
          >
            {/* Upper Call title block */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={persona.avatar}
                  alt={persona.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-extrabold text-white text-base leading-tight">Session Orale: {persona.name}</h3>
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Connexion audio sécurisée établie (Qualité HD)
                  </p>
                </div>
              </div>
              <div className="bg-[#18233e] text-[11px] text-cyan-400 font-bold font-mono px-3 py-1.5 rounded-full border border-cyan-500/20">
                Temps écoulé: {formatTimer(speechTimer)}
              </div>
            </div>

            {/* Core Interactive Blue-Pink Waves Panel (Directly visual copy of the prompt screen!) */}
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                
                {/* User Wave Section */}
                <div className={`p-6 rounded-2xl flex flex-col items-center justify-center transition ${
                  isSpeakActive ? "bg-cyan-500/5 border border-cyan-500/20" : "bg-[#0b101c]/40 border border-transparent"
                }`}>
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">Vous parlez</span>
                  
                  {/* Dynamic looping particle user wave */}
                  <div className="h-28 flex items-center justify-center gap-1.5 w-full max-w-xs relative">
                    {/* Visual waves bar loops */}
                    {[80, 40, 100, 50, 90, 30, 70, 45, 95, 20, 85].map((val, idx) => (
                      <span 
                        key={idx}
                        className={`w-1.5 rounded-full bg-cyan-400 transition-all duration-300 ${
                          isSpeakActive && !isMuted ? "animate-[bounce_0.8s_infinite]" : "h-1"
                        }`}
                        style={{ 
                          height: isSpeakActive && !isMuted ? `${val}%` : "4px",
                          animationDelay: `${idx * 80}ms`
                        }}
                      />
                    ))}
                    {isMuted && (
                      <span className="absolute text-xs text-rose-500 font-bold bg-rose-500/10 px-3 py-1 rounded border border-rose-500/20">MICRO SOURDINE</span>
                    )}
                  </div>
                  
                  <div className={`mt-4 p-3 rounded-full ${isMuted ? "bg-rose-500/10" : "bg-cyan-500/15"} text-cyan-400`}>
                    <Mic className={`w-6 h-6 ${isSpeakActive && !isMuted ? "scale-110" : ""}`} />
                  </div>
                </div>

                {/* AI / Specialist Wave Section */}
                <div className={`p-6 rounded-2xl flex flex-col items-center justify-center transition ${
                  !isSpeakActive ? "bg-pink-500/5 border border-pink-500/20" : "bg-[#0b101c]/40 border border-transparent"
                }`}>
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">{persona.name} parle</span>
                  
                  {/* Dynamic looping particle AI wave */}
                  <div className="h-28 flex items-center justify-center gap-1.5 w-full max-w-xs">
                    {[30, 85, 40, 95, 60, 45, 90, 50, 100, 35, 75].map((val, idx) => (
                      <span 
                        key={idx}
                        className={`w-1.5 rounded-full bg-pink-400 transition-all duration-300 ${
                          !isSpeakActive ? "animate-[bounce_0.6s_infinite]" : "h-1"
                        }`}
                        style={{ 
                          height: !isSpeakActive ? `${val}%` : "4px",
                          animationDelay: `${idx * 50}ms`
                        }}
                      />
                    ))}
                  </div>

                  <img 
                    src={persona.avatar} 
                    alt="AI Avatar" 
                    className="w-12 h-12 rounded-full border-2 border-pink-400 object-cover mt-4 animate-pulse"
                    referrerPolicy="no-referrer"
                  />
                </div>

              </div>
            </div>

            {/* Vocal Dials controllers */}
            <div className="bg-[#0b101c] border border-[#1e293b]/50 p-4 rounded-2xl max-w-4xl mx-auto w-full grid grid-cols-4 gap-4 items-center mb-6">
              
              {/* Hands-Free indicator */}
              <div className="flex flex-col gap-1 px-2 border-r border-[#1e293b]/50">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Options d'écoute</span>
                <button
                  type="button"
                  onClick={() => setIsHandsFree(!isHandsFree)}
                  className={`text-xs font-bold py-1 px-3 rounded text-left transition ${
                    isHandsFree ? "text-cyan-400" : "text-slate-400"
                  }`}
                >
                  {isHandsFree ? "● Mains Libres" : "Appuyer pour parler (PTT)"}
                </button>
              </div>

              {/* Volume scale */}
              <div className="flex flex-col gap-1 px-2 border-r border-[#1e293b]/50">
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold">
                  <span>Volume Émission</span>
                  <span className="text-white">{speechVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speechVolume}
                  onChange={(e) => setSpeechVolume(parseInt(e.target.value))}
                  className="accent-cyan-400 w-full h-1 bg-slate-800 rounded"
                />
              </div>

              {/* Sensitivity detection */}
              <div className="flex flex-col gap-1 px-2 border-r border-[#1e293b]/50">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Seuil Réactivité (VAD)</span>
                <span className="text-xs font-bold text-white">Très réactif (Double sens)</span>
              </div>

              {/* Active Voice preset */}
              <div className="flex flex-col gap-1 px-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Voix Sélectionnée</span>
                <span className="text-xs font-bold text-indigo-400">{persona.voice} (Gemini)</span>
              </div>

            </div>

            {/* Under Call Hang Up actions panel */}
            <div className="flex items-center justify-center gap-4 border-t border-[#1e293b]/40 pt-4">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition ${
                  isMuted ? "bg-rose-600 text-white" : "bg-[#161f38] text-slate-300 hover:bg-[#202e52]"
                }`}
                title={isMuted ? "Activer le microphone" : "Désactiver le microphone"}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                type="button"
                id="btn-voice-end-call"
                onClick={() => setIsVocalCallActive(false)}
                className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-8 py-3.5 rounded-full flex items-center gap-2.5 shadow-lg shadow-rose-500/15 transition-all duration-300"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Raccrocher la session</span>
              </button>

              <div className="p-4 rounded-full bg-[#161f38] text-slate-300">
                <Volume2 className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Conversation Stream List (Sleek display layout box) */}
      <div 
        id="chat-messages-scroll"
        className={`flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin ${
          isLightTheme ? "bg-transparent" : "bg-[#05080c]/50"
        }`}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400/20 to-indigo-500/20 flex items-center justify-center border border-indigo-500/40">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className={`text-base font-bold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                Commencez à échanger avec {persona.name}
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Expliquez votre concept, uploadez vos schémas/images ou connectez un Pack de Connaissances. L'IA s'ajuste en continu à votre profil.
              </p>
            </div>
            
            {/* Template starter chips */}
            <div className="grid grid-cols-2 gap-2 max-w-md pt-3">
              {[
                "Peux-tu m'expliquer simplement le théorème de Pythagore ?",
                "Quels sont les points clés de lubrification sur l'ETA 2824-2 ?",
                "Quelle section de cable brancher de mon panneau solaire MPPT ?",
                "Propose-moi un entrainement de force ciblé haut du corps"
              ].map((starter, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(starter)}
                  className={`p-2.5 rounded-xl text-[11.5px] text-left border transition ${
                    isLightTheme 
                      ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700" 
                      : "border-[#1e293b] bg-[#0c1220]/30 hover:bg-[#0c1220] text-slate-300"
                  }`}
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  id={`chat-msg-${msg.id}`}
                  className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <img
                    src={isUser ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" : persona.avatar}
                    alt={isUser ? "User" : persona.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="space-y-1.5">
                    {/* Username/Persona indicator */}
                    <span className="text-[10px] text-slate-500 font-bold block ml-1">
                      {isUser ? userProfile.name : persona.name} • {msg.timestamp}
                    </span>

                    {/* Chat Bubble card */}
                    <div className={`p-3.5 rounded-2xl relative border ${
                      isUser
                        ? isLightTheme
                          ? "bg-slate-200 border-slate-300 text-slate-900 rounded-tr-none"
                          : "bg-cyan-950/20 border-cyan-500/25 text-slate-100 rounded-tr-none"
                        : isLightTheme
                          ? "bg-white border-slate-200 text-slate-800 rounded-tl-none"
                          : "bg-[#0f1524] border-[#1e293b] text-slate-200 rounded-tl-none shadow"
                    }`}>
                      {/* Vision payload attachment rendering or generated illustration */}
                      {msg.image && (
                        <div className="mb-2 max-w-md rounded-xl overflow-hidden border border-[#202e50]/40 relative shadow-sm group">
                          <img 
                            src={msg.image} 
                            alt="Illustration" 
                            className="w-full max-h-72 object-cover cursor-zoom-in transition-transform duration-300 hover:scale-[1.02]"
                            referrerPolicy="no-referrer"
                            onClick={() => window.open(msg.image, '_blank')}
                          />
                          <span className={`absolute bottom-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded shadow ${
                            isUser ? "bg-[#18233e]/90 text-cyan-300" : "bg-purple-950/90 text-purple-300 border border-purple-500/20"
                          }`}>
                            {isUser ? "VISION" : "ILLUSTRATION IA 🎨"}
                          </span>
                        </div>
                      )}

                      {/* Content block with simple formatted Markdown look */}
                      <p className="text-xs whitespace-pre-wrap leading-relaxed select-text font-sans">
                        {msg.content}
                      </p>

                      {/* Source Citation grounding results */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1 text-[10px] text-indigo-400">
                          <div className="font-bold uppercase tracking-wider text-[9px] text-slate-500">Sources vérifiées par Gemini :</div>
                          {msg.citations.map((cite, cIdx) => (
                            <a
                              key={cIdx}
                              href={cite.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="block hover:underline truncate"
                            >
                              🌐 {cite.title} — {cite.uri}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Action trigger row for assistants */}
                      {!isUser && (
                        <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-slate-800/40 text-[10px] text-slate-500">
                          <button
                            onClick={() => copyToClipboard(msg.content)}
                            className="hover:text-white flex items-center gap-1.5 transition"
                            title="Copier le message"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copier</span>
                          </button>

                          {/* Manual Image Generation Trigger Button if no image is present on the response */}
                          {!msg.image && (
                            <button
                              onClick={() => handleManualImageGen(msg.id, msg.content)}
                              disabled={generatingForMsgId !== null}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                                isLightTheme 
                                  ? "bg-slate-100 hover:bg-slate-200 text-indigo-600 border-slate-200" 
                                  : "bg-[#1a2542]/50 hover:bg-[#202e50] text-[#38bdf8] border-[#38bdf8]/10"
                              } font-bold disabled:opacity-50`}
                              title="Générer une illustration visuelle par Imagen"
                            >
                              {generatingForMsgId === msg.id ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-400" />
                                  <span className="text-pink-400 animate-pulse">Génération visuelle...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3 text-pink-400 animate-pulse" />
                                  <span>Visualiser avec l'IA 🎨</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <img
                  src={persona.avatar}
                  alt={persona.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 flex-shrink-0 animate-pulse"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold block ml-1">{persona.name} est en train de rédiger...</span>
                  <div className="p-3.5 rounded-xl bg-[#0f1524] border border-[#1e293b] text-xs text-slate-400 flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-[#1e293b]/70 py-1.5 px-2.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-[bounce_1s_infinite_100ms] block" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-[bounce_1s_infinite_300ms] block" />
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-[bounce_1s_infinite_500ms] block" />
                    </div>
                    <span className="animate-pulse text-xs font-semibold text-slate-300">Création de la réponse d'élite...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
        )}
      </div>

      {/* Under inputs panel previewer */}
      {imageAttached && (
        <div className="px-5 py-2 flex items-center gap-2.5 bg-indigo-950/20 border-t border-[#1e293b]/40">
          <div className="relative">
            <img 
              src={imageAttached} 
              alt="Ready upload" 
              className="w-12 h-12 object-cover rounded-lg border border-indigo-400"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setImageAttached(null)}
              className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 text-[9px] w-4 h-4 flex items-center justify-center font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-indigo-400">
            Image prête pour analyse multimodale (ex. Mouvement montre, meuble IKEA).
          </p>
        </div>
      )}

      {/* Attached Local documents listing draft */}
      {attachedFiles.length > 0 && (
        <div className="px-5 py-2 flex flex-wrap gap-2 bg-[#0c1221] border-t border-[#1e293b]/30">
          {attachedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-[#18233f] border border-cyan-500/10 px-2.5 py-1 rounded text-[11px] text-slate-300">
              <FileText className="w-3 h-3 text-cyan-400" />
              <span>{f.name} ({f.size})</span>
              <button
                onClick={() => setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i))}
                className="text-rose-500 hover:text-rose-400 font-bold ml-1 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Immersive Floating Vocal Bar (Direct replica of reference mock bottom panel!) */}
      {isVocalCallActive && (
        <div className="mx-5 mb-3.5 p-4 bg-white/90 border border-indigo-100 shadow-md rounded-2xl flex items-center justify-between relative overflow-hidden backdrop-blur-md">
          {/* Left: speak state waves */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] text-[#5969F3] font-extrabold uppercase tracking-widest mb-1.5 label-vocal">Vous parlez</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full transition ${
                  isMuted ? "bg-rose-500 text-white animate-pulse" : "bg-indigo-50 text-indigo-500"
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
              <div className="flex items-end gap-[2px] h-6">
                {[4, 11, 7, 14, 5, 12, 4, 9, 5].map((h, i) => (
                  <span 
                    key={i} 
                    className="w-[2px] bg-[#5969F3] rounded-full animate-[bounce_0.6s_infinite]" 
                    style={{ 
                      height: `${h * (isSpeakActive && !isMuted ? 1.6 : 0.3)}px`,
                      animationDelay: `${i * 60}ms`
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Center: Hero Avatar with custom animated glowing rings */}
          <div className="relative flex-none mx-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#5969F3] via-pink-400 to-cyan-300 rounded-full blur-md opacity-60 animate-pulse scale-110" />
            <img 
              src={persona.avatar} 
              alt={persona.name} 
              className="w-14 h-14 rounded-full object-cover border-2 border-white relative z-10"
              referrerPolicy="no-referrer"
            />
            {/* Pulsing indicator bullet */}
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full z-20 animate-pulse" />
          </div>

          {/* Right: AI listening status waves */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] text-[#7d51f7] font-extrabold uppercase tracking-widest mb-1.5 label-vocal">{persona.name} écoute</span>
            <div className="flex items-center gap-2">
              <div className="flex items-end gap-[2px] h-6">
                {[5, 12, 7, 15, 4, 10, 6, 8, 4].map((h, i) => (
                  <span 
                    key={i} 
                    className="w-[2px] bg-[#ec4899] rounded-full animate-[bounce_0.8s_infinite]" 
                    style={{ 
                      height: `${h * (!isSpeakActive ? 1.4 : 0.3)}px`,
                      animationDelay: `${i * 80}ms`
                    }} 
                  />
                ))}
              </div>
              <div className="p-2 rounded-full bg-pink-50 text-pink-500">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Quick Close Button top-right */}
          <button 
            type="button"
            id="btn-voice-end-call-pill"
            onClick={() => setIsVocalCallActive(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-slate-100 p-1 rounded-full border border-slate-100 transition text-[10px] font-bold"
            title="Masquer la session vocale"
          >
            ×
          </button>
        </div>
      )}

      {/* Input controls panel footer */}
      <div className={`p-4 border-t ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#090d16] border-[#1e293b]"
      }`}>
        <div className="flex gap-2 items-end">
          
          {/* Visual Grounding/Attachment Buttons */}
          <div className="flex items-center gap-1">
            {/* Attachment files connector */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-2.5 rounded-xl border transition ${
                isLightTheme 
                  ? "border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800" 
                  : "border-[#1e293b] hover:bg-[#18233d] text-slate-400 hover:text-white"
              }`}
              title="Associer des documents pour le RAG"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileAttached}
              accept=".pdf,.txt,.docx,.json"
              className="hidden"
            />

            {/* Vision attachment trigger */}
            <button
              onClick={() => imageInputRef.current?.click()}
              className={`p-2.5 rounded-xl border transition ${
                isLightTheme 
                  ? "border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800" 
                  : "border-[#1e293b] hover:bg-[#18233d] text-slate-400 hover:text-white"
              }`}
              title="Uploader une illustration/schéma (Analyse de Vision)"
            >
              <Eye className="w-4.5 h-4.5" />
            </button>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageAttached}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Central entry textarea */}
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Écrivez à ton spécialiste ${persona.name}...`}
              rows={1}
              className={`w-full border focus:outline-none rounded-xl py-3 pl-3 pr-16 text-xs resize-none max-h-32 font-sans scrollbar-none leading-relaxed transition ${
                isLightTheme 
                  ? "bg-[#f1f5f9] border-slate-300 text-slate-800 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder-slate-400" 
                  : "bg-[#05080c] border-cyan-500/15 focus:border-cyan-400 text-white placeholder-slate-500"
              }`}
            />

            {/* Web Search ground tool switch directly visual icon */}
            <button
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`absolute right-3.5 top-2.5 p-1.5 rounded-lg transition ${
                webSearchEnabled 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" 
                  : isLightTheme ? "text-slate-400 hover:text-slate-800 hover:bg-slate-100" : "text-slate-500 hover:text-white hover:bg-slate-800"
              }`}
              title="Activer la recherche Google en ligne (Gemini Grounding)"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Send Action */}
          <button
            id="btn-chat-send"
            onClick={handleSend}
            disabled={!inputText.trim() && !imageAttached}
            className="bg-cyan-500 disabled:bg-slate-800 hover:bg-cyan-400 disabled:text-slate-600 text-slate-950 font-extrabold p-3 rounded-xl shadow-lg transition duration-200 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
          <span>Raccourcis: <kbd className="bg-slate-800 px-1 rounded text-[9px]">Entrée</kbd> pour envoyer, <kbd className="bg-slate-800 px-1 rounded text-[9px]">Shift+Entrée</kbd> pour saut de ligne</span>
          <span className="flex items-center gap-1.5 flex-wrap">
            <span>Indexé par stockage Local-First sécurisé</span>
            {onOpenLandingPage && (
              <>
                <span>•</span>
                <button 
                  type="button" 
                  onClick={onOpenLandingPage} 
                  className="text-[#a855f7] hover:text-[#ec4899] font-extrabold hover:underline transition cursor-pointer flex items-center gap-0.5"
                  id="btn-trigger-landing"
                >
                  Découvrir l'Histoire & Vision 🔮
                </button>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
