import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Trash2, 
  HelpCircle, 
  CheckCircle2, 
  Eye, 
  MessageSquare, 
  Sliders, 
  Cpu, 
  Check, 
  ChevronRight,
  RefreshCw,
  Image as ImageIcon,
  Upload
} from "lucide-react";
import { Persona } from "../types";
import { KonceptCrewAPI } from "../services/api";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&q=80&w=200", // Math
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200", // Watch
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=200", // Camper
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=200", // Gym
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=200", // Builder
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", // Female creative
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", // Male tech
];

const ENG_PROVIDERS = [
  { name: "Google AI Studio", models: ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"] },
  { name: "OpenAI Platform", models: ["gpt-4o", "gpt-4o-mini", "o3-mini"] },
  { name: "Anthropic Claude", models: ["claude-3-5-sonnet", "claude-3-haiku"] },
  { name: "Ollama (Local)", models: ["llama3.1:8b", "mistral:7b", "phi3"] },
  { name: "LM Studio", models: ["local-model"] }
];

interface StudioCreationProps {
  editingPersona: Persona | null;
  onSavePersona: (persona: Persona) => void;
  onClose: () => void;
  isLightTheme: boolean;
}

export default function StudioCreation({
  editingPersona,
  onSavePersona,
  onClose,
  isLightTheme,
}: StudioCreationProps) {
  const [activeTab, setActiveTab] = useState<"create" | "modify">("create");
  
  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [role, setRole] = useState("Expert technique");
  const [tone, setTone] = useState("Amical & Énergique");
  const [personality, setPersonality] = useState("Patient, méthodique et précis");
  const [technicality, setTechnicality] = useState(6);
  const [responseStyle, setResponseStyle] = useState("Détaillé");
  const [mainLanguage, setMainLanguage] = useState("Français");
  const [jobSpecialization, setJobSpecialization] = useState("");
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [voice, setVoice] = useState("Zephyr");
  const [temperature, setTemperature] = useState(0.8);
  const [maxTokens, setMaxTokens] = useState(800);
  const [category, setCategory] = useState("DIY");

  const [provider, setProvider] = useState("Google AI Studio");
  const [model, setModel] = useState("gemini-3.5-flash");

  // Capabilities
  const [caps, setCaps] = useState({
    text: true,
    voice: true,
    image: true,
    vision: true,
    searchWeb: true,
    analyzeDoc: true,
    memory: true,
  });

  // Loading states for AI Prompt engineering & AI avatar generator
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState("3D Cartoon");
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);

  // Dynamic light/dark theme styling classes for beautiful UI
  const inputBgClass = isLightTheme 
    ? "w-full bg-[#f1f5f9] border border-slate-300 text-slate-900 rounded focus:ring-1 focus:ring-indigo-400 placeholder-slate-400 text-xs transition duration-200" 
    : "w-full bg-[#0b0f19] border border-[#1e293b] text-slate-200 rounded focus:ring-1 focus:ring-cyan-400 text-xs transition duration-200";

  const textareaBgClass = isLightTheme 
    ? "w-full bg-[#f1f5f9] border border-slate-300 text-slate-900 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-indigo-400 leading-normal transition duration-200" 
    : "w-full bg-[#05080f] border border-[#1e293b] text-slate-200 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-cyan-400 leading-normal transition duration-200";

  const buttonBgClass = isLightTheme
    ? "bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 py-1 px-1.5 rounded transition font-medium flex items-center justify-center gap-1 text-[10px]"
    : "bg-[#101726] hover:bg-[#18233a] text-slate-200 border border-[#1e293b] py-1 px-1.5 rounded transition font-medium flex items-center justify-center gap-1 text-[10px]";

  const buttonBgClassFull = isLightTheme
    ? "w-full bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 py-1 px-1.5 rounded transition font-medium flex items-center justify-center gap-1 text-[10px]"
    : "w-full bg-[#101726] hover:bg-[#18233a] text-slate-200 border border-[#1e293b] py-1 px-1.5 rounded transition font-medium flex items-center justify-center gap-1 text-[10px]";

  const containerBgClass = isLightTheme
    ? "grid grid-cols-2 gap-2 bg-slate-100 p-2.5 rounded-lg border border-slate-300"
    : "grid grid-cols-2 gap-2 bg-[#0c1220]/40 p-2.5 rounded-lg border border-[#1e293b]/40";

  const inputCheckboxBgClass = isLightTheme
    ? "rounded border-slate-300 bg-slate-250 text-indigo-600 focus:ring-0 focus:ring-offset-0 text-indigo-600 cursor-pointer"
    : "rounded border-[#1e293b] bg-[#0c1220] text-cyan-400 focus:ring-0 focus:ring-offset-0 cursor-pointer";

  const labelTextClass = isLightTheme ? "text-slate-600" : "text-slate-400";
  const labelHeaderClass = isLightTheme ? "text-slate-700 font-extrabold" : "text-slate-400 ";

  // Load editing persona values as soon as editingPersona loads
  useEffect(() => {
    if (editingPersona) {
      setActiveTab("modify");
      setName(editingPersona.name);
      setDescription(editingPersona.description);
      setSystemPrompt(editingPersona.systemPrompt);
      setRole(editingPersona.role);
      setTone(editingPersona.tone);
      setPersonality(editingPersona.personality);
      setTechnicality(editingPersona.technicality);
      setResponseStyle(editingPersona.responseStyle);
      setMainLanguage(editingPersona.mainLanguage);
      setJobSpecialization(editingPersona.jobSpecialization);
      setAvatar(editingPersona.avatar);
      setVoice(editingPersona.voice);
      setTemperature(editingPersona.temperature);
      setMaxTokens(editingPersona.maxTokens);
      setCategory(editingPersona.category);
      setProvider(editingPersona.engine.provider);
      setModel(editingPersona.engine.model);
      setCaps({ ...editingPersona.capabilities });
    } else {
      setActiveTab("create");
      resetForm();
    }
  }, [editingPersona]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setSystemPrompt("");
    setRole("Expert technique");
    setTone("Amical & Énergique");
    setPersonality("Patient, méthodique et mûr");
    setTechnicality(6);
    setResponseStyle("Détaillé");
    setMainLanguage("Français");
    setJobSpecialization("");
    setAvatar(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
    setVoice("Zephyr");
    setTemperature(0.8);
    setMaxTokens(800);
    setCategory("DIY");
    setProvider("Google AI Studio");
    setModel("gemini-3.5-flash");
    setCaps({
      text: true,
      voice: true,
      image: true,
      vision: true,
      searchWeb: true,
      analyzeDoc: true,
      memory: true,
    });
  };

  // AI Prompt actions callback
  const handlePromptAI = async (action: "generate" | "optimize" | "simplify" | "humanize" | "pedagogical") => {
    setIsGeneratingPrompt(true);
    try {
      const result = await KonceptCrewAPI.runPromptEngineering(action, {
        name,
        role,
        details: `${description}. Spécialité: ${jobSpecialization}. Ton: ${tone}. Style: ${responseStyle}`,
        promptToImprove: systemPrompt,
      });
      setSystemPrompt(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Dynamic AI Persona generator callback
  const handleGenerateIdea = async () => {
    setIsGeneratingIdea(true);
    try {
      const idea = await KonceptCrewAPI.generatePersonaIdea();
      if (idea) {
        setName(idea.name || "");
        setDescription(idea.description || "");
        setRole(idea.role || "Expert");
        setTone(idea.tone || "Professionnel");
        setPersonality(idea.personality || "Sérieux et rigoureux");
        setJobSpecialization(idea.jobSpecialization || "");
        setCategory(idea.category || "Intelligence");
        setSystemPrompt(idea.systemPrompt || "");
        
        // Also select a random matching preset avatar for fun and visual variety
        const randomPic = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
        setAvatar(randomPic);
      }
    } catch (e) {
      console.error("Génération d'idée échouée", e);
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  // Avatar generation callback
  const handleAvatarAI = async () => {
    setIsGeneratingAvatar(true);
    try {
      const generatedUrl = await KonceptCrewAPI.generateAIImage(name || "Expert", role, avatarStyle, provider);
      setAvatar(generatedUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  // Image upload callback
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Veuillez saisir un nom pour votre spécialiste.");
      return;
    }
    const saved: Persona = {
      id: editingPersona?.id || `custom-${Date.now()}`,
      name,
      description: description || `Expert dans le domaine: ${role}`,
      systemPrompt: systemPrompt || `Tu es un assistant expert nommé ${name} spécialisé en ${role}. Réponds de façon précise.`,
      role,
      tone,
      personality,
      technicality,
      responseStyle,
      mainLanguage,
      jobSpecialization,
      avatar,
      voice,
      temperature,
      maxTokens,
      capabilities: caps,
      engine: {
        provider,
        model,
        speed: provider.includes("Local") ? 2 : 5,
        quality: model.includes("pro") ? 5 : 4,
        costRate: model.includes("pro") ? 4 : 1,
      },
      category,
    };
    onSavePersona(saved);
    if (!editingPersona) {
      resetForm();
    }
  };

  // Sync selected model when provider changes
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextProv = e.target.value;
    setProvider(nextProv);
    const found = ENG_PROVIDERS.find(p => p.name === nextProv);
    if (found && found.models.length > 0) {
      setModel(found.models[0]);
    }
  };

  return (
    <div 
      id="studio-creation-panel"
      className={`w-96 border-l h-full flex flex-col select-none ${
        isLightTheme 
          ? "bg-white/90 backdrop-blur-md border-slate-200/50 text-slate-800" 
          : "bg-[#090d16] border-[#1e293b] text-slate-100"
      }`}
    >
      {/* Header Studio */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isLightTheme ? "border-slate-200 bg-white" : "border-[#1e293b]"
      }`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h3 className={`font-bold text-base tracking-tight ${
            isLightTheme ? "text-slate-900" : "text-white"
          }`}>
            STUDIO DE CRÉATION
          </h3>
        </div>
        <button 
          onClick={onClose}
          className={`text-xs px-2 py-1 rounded transition ${
            isLightTheme 
              ? "text-slate-700 bg-slate-200 hover:bg-slate-300" 
              : "text-slate-400 hover:text-white bg-[#1e293b]/50 hover:bg-[#1e293b]"
          }`}
        >
          Fermer
        </button>
      </div>

      {/* Selector Tabs (Create or Modify) */}
      <div className={`p-3 grid grid-cols-2 gap-1 m-3 rounded-lg border ${
        isLightTheme ? "bg-slate-100 border-slate-300" : "bg-[#0c1220]/40 border-[#1e293b]/50"
      }`}>
        <button
          id="btn-tab-create"
          onClick={() => {
            setActiveTab("create");
            resetForm();
          }}
          className={`py-1.5 text-xs font-bold rounded-md transition duration-200 ${
            activeTab === "create" && !editingPersona
              ? isLightTheme 
                ? "bg-white text-indigo-700 border border-indigo-200 shadow-sm"
                : "bg-[#18233c] text-cyan-400 border border-cyan-500/20 shadow"
              : isLightTheme ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
          }`}
        >
          Créer
        </button>
        <button
          id="btn-tab-modify"
          onClick={() => {
            if (editingPersona) {
              setActiveTab("modify");
            } else {
              alert("Veuillez sélectionner un spécialiste dans le Crew pour le modifier.");
            }
          }}
          className={`py-1.5 text-xs font-bold rounded-md transition duration-200 ${
            activeTab === "modify" || editingPersona
              ? isLightTheme
                ? "bg-white text-pink-600 border border-pink-200 shadow-sm"
                : "bg-[#18233c] text-pink-400 border border-pink-500/20 shadow"
              : "text-slate-500 cursor-not-allowed"
          }`}
        >
          Modifier {editingPersona ? `(${editingPersona.name})` : ""}
        </button>
      </div>
      
      {/* Main Form container scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-5 scrollbar-thin text-xs">
        
        {/* INSPIRATION IA COOP */}
        <div className={`p-3 rounded-xl border flex flex-col gap-1.5 shadow-sm ${
          isLightTheme 
            ? "bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50 border-indigo-200" 
            : "bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/15"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className={`font-extrabold text-[10px] uppercase tracking-wider ${isLightTheme ? "text-indigo-950" : "text-cyan-300"}`}>Inspiration Magique IA</span>
            </div>
            {isGeneratingIdea && <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />}
          </div>
          <p className={`text-[10px] leading-normal ${isLightTheme ? "text-slate-600" : "text-slate-400"}`}>
            Pas d'idée précise ? Laissez l'IA inventer de toutes pièces un concept d'expert complet avec sa biographie et son prompt d'élite.
          </p>
          <button
            type="button"
            id="btn-auto-persona-gen"
            onClick={handleGenerateIdea}
            disabled={isGeneratingIdea}
            className="w-full mt-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:bg-slate-800 text-white font-bold text-[11px] py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md hover:shadow-indigo-500/10 transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            {isGeneratingIdea ? "Génération magique..." : "Générer un concept d'expert"}
          </button>
        </div>

        {/* AVATAR SYSTEM */}
        <div className="space-y-2">
          <label className={`block font-semibold uppercase tracking-wider text-[10px] ${labelHeaderClass}`}>
            Avatar IA Spécialiste
          </label>
          <div className="flex items-center gap-3">
            {/* Hidden native input */}
            <input
              type="file"
              id="avatar-file-uploader"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Clickable interactive preview */}
            <div 
              className="relative group cursor-pointer"
              onClick={() => document.getElementById("avatar-file-uploader")?.click()}
              title="Cliquez pour importer votre propre image"
            >
              <img
                src={avatar}
                alt="Selected avatar"
                className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500 shadow-md group-hover:border-cyan-400 transition"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                <Upload className="w-4 h-4 text-white animate-bounce" />
              </div>
              {isGeneratingAvatar && (
                <div className="absolute inset-x-0 inset-y-0 rounded-xl bg-slate-900/80 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Micro AI Avatar editor Form inside panel */}
            <div className="flex-1 space-y-1.5">
              <div className="flex gap-1.5">
                <select
                  value={avatarStyle}
                  onChange={(e) => setAvatarStyle(e.target.value)}
                  className={isLightTheme ? "bg-[#f1f5f9] border border-slate-300 text-slate-900 rounded px-2 py-1 text-[11px] block flex-1 focus:ring-1 focus:ring-indigo-400" : "bg-[#0b0f19] border border-[#1e293b] text-slate-200 rounded px-2 py-1 text-[11px] block flex-1 focus:ring-1 focus:ring-cyan-400"}
                >
                  <option value="3D Cartoon">3D Cartoon</option>
                  <option value="réaliste">Photoréaliste</option>
                  <option value="manga">Manga / Anime</option>
                  <option value="pixel art">Pixel Art</option>
                  <option value="watercolor">Aquarelle</option>
                  <option value="cyber">Cyberpunk Neon</option>
                  <option value="minimal">Minimaliste 2D</option>
                </select>
                <button
                  id="btn-generate-avatar-ai"
                  onClick={handleAvatarAI}
                  disabled={isGeneratingAvatar}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold rounded px-2.5 py-1 text-[11px] flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  Générer
                </button>
              </div>
              <div className="flex gap-1.5 pt-0.5">
                <button
                  type="button"
                  id="btn-upload-avatar-custom"
                  onClick={() => document.getElementById("avatar-file-uploader")?.click()}
                  className={isLightTheme ? "w-full bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 font-bold py-1 rounded-md text-[10px] flex items-center justify-center gap-1 transition duration-200" : "w-full bg-[#1e293b]/60 hover:bg-[#1e293b] text-slate-200 border border-[#334155]/60 hover:border-[#475569] font-bold py-1 rounded-md text-[10px] flex items-center justify-center gap-1 transition duration-200"}
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  Importer mon image
                </button>
              </div>
              <p className="text-[9px] text-slate-500 leading-normal">
                Générez avec l'IA, importez votre propre image, ou sélectionnez parmi les modèles d'avatars prédéfinis ci-dessous.
              </p>
            </div>
          </div>

          {/* Preset options */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto py-1 scrollbar-none">
            {PRESET_AVATARS.map((pic, idx) => (
              <img
                key={idx}
                src={pic}
                alt={`Preset ${idx}`}
                onClick={() => setAvatar(pic)}
                className={`w-9 h-9 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform duration-150 ${
                  avatar === pic ? "border-2 border-cyan-400 scale-105" : "border border-slate-700"
                }`}
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        </div>

        {/* BASIC INFORMATIONS */}
        <div id="forms-section-basics" className="space-y-3">
          <label className={`block font-semibold uppercase tracking-wider text-[10px] ${labelHeaderClass}`}>
            Informations de base
          </label>
          
          <div className="space-y-1">
            <span className={`text-[11px] ${labelTextClass}`}>Nom du Crew</span>
            <input
              type="text"
              placeholder="ex. Math Mentor, Horloger Expert..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputBgClass}
            />
          </div>

          <div className="space-y-1">
            <span className={`text-[11px] ${labelTextClass}`}>Description succincte</span>
            <input
              type="text"
              placeholder="ex. Professeur d'algèbre bienveillant..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputBgClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className={`text-[11px] ${labelTextClass}`}>Rôle</span>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputBgClass}
              />
            </div>
            <div className="space-y-1">
              <span className={`text-[11px] ${labelTextClass}`}>Langue principale</span>
              <input
                type="text"
                value={mainLanguage}
                onChange={(e) => setMainLanguage(e.target.value)}
                className={inputBgClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className={`text-[11px] ${labelTextClass}`}>Spécialité métier</span>
              <input
                type="text"
                placeholder="ex. Calibre ETA 2824"
                value={jobSpecialization}
                onChange={(e) => setJobSpecialization(e.target.value)}
                className={inputBgClass}
              />
            </div>
            <div className="space-y-1">
              <span className={`text-[11px] ${labelTextClass}`}>Catégorie Store</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputBgClass}
              >
                <option value="Prof" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>Prof / Éducation</option>
                <option value="Coach" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>Coach / Sport</option>
                <option value="Horloger" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>Horlogerie expert</option>
                <option value="DIY" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>DIY / Bricolage</option>
                <option value="Voyage" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>Voyage / Loisirs</option>
                <option value="Créatif" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>Créatif / Écritures</option>
                <option value="Intelligence" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>Assistant personnel</option>
                <option value="Développeur" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>Développeur / Code</option>
              </select>
            </div>
          </div>
        </div>

        {/* PROMPT ENGINEERING ENGINE WITH ACTIONS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className={`block font-semibold uppercase tracking-wider text-[10px] ${labelHeaderClass}`}>
              Prompt Système (Directives)
            </label>
            <span className="text-[10px] text-slate-500 font-bold">Aide par IA active</span>
          </div>

          <div className="relative">
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Instruisez le tempérament de l'IA, ses connaissances spécifiques, son niveau d'éducation, le format de ses réponses..."
              rows={5}
              className={textareaBgClass}
            />
            {isGeneratingPrompt && (
              <div className="absolute inset-0 bg-[#000]/80 rounded flex flex-col gap-2 items-center justify-center">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                <span className="text-[10px] text-slate-300 font-medium tracking-wider">Traitement par Gemini...</span>
              </div>
            )}
          </div>

          {/* Prompt Engineering Quick Actions (Buttons requested) */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-indigo-300 font-medium">✨ Affiner le comportement avec l'ingénieur de prompt :</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handlePromptAI("generate")}
                className={buttonBgClass}
              >
                Générer un prompt
              </button>
              <button
                type="button"
                onClick={() => handlePromptAI("optimize")}
                className={buttonBgClass}
              >
                Optimiser le prompt
              </button>
              <button
                type="button"
                onClick={() => handlePromptAI("simplify")}
                className={buttonBgClass}
              >
                Simplifier
              </button>
              <button
                type="button"
                onClick={() => handlePromptAI("humanize")}
                className={buttonBgClass}
              >
                Rendre plus humain
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => handlePromptAI("pedagogical")}
              className={buttonBgClassFull}
            >
              Rendre plus pédagogique
            </button>
          </div>
        </div>

        {/* MOTEUR D'INTELLIGENCE SELECTION */}
        <div id="forms-section-engine" className="space-y-3">
          <label className={`block font-semibold uppercase tracking-wider text-[10px] ${labelHeaderClass}`}>
            Moteur d'intelligence (LLM)
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className={`text-[11px] ${labelTextClass}`}>Fournisseur</span>
              <select
                value={provider}
                onChange={handleProviderChange}
                className={inputBgClass}
              >
                {ENG_PROVIDERS.map(p => (
                  <option key={p.name} value={p.name} className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className={`text-[11px] ${labelTextClass}`}>Modèle IA</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={inputBgClass}
              >
                {ENG_PROVIDERS.find(p => p.name === provider)?.models.map(m => (
                  <option key={m} value={m} className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* MODALITIES TOGGLES */}
        <div className="space-y-2">
          <label className={`block font-semibold uppercase tracking-wider text-[10px] ${labelHeaderClass}`}>
            Capacités Multimodales active
          </label>
          <div className={containerBgClass}>
            {Object.keys(caps).map((key) => {
              const capKey = key as keyof typeof caps;
              return (
                <label 
                  key={capKey} 
                  className={`flex items-center gap-2 font-medium cursor-pointer ${isLightTheme ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"}`}
                >
                  <input
                    type="checkbox"
                    checked={caps[capKey]}
                    onChange={(e) => setCaps({ ...caps, [capKey]: e.target.checked })}
                    className={inputCheckboxBgClass}
                  />
                  <span className="capitalize">{capKey === "searchWeb" ? "Recherche Web" : capKey === "analyzeDoc" ? "Analyse Docs" : capKey}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* FINE TUNING SLIDERS PARAMETERS (From Visual mockup) */}
        <div id="forms-section-params" className={`space-y-3.5 pt-2 border-t ${isLightTheme ? "border-slate-300" : "border-[#1e293b]/40"}`}>
          <label className={`block font-semibold uppercase tracking-wider text-[10px] ${labelHeaderClass}`}>
            Ajustement des Paramètres
          </label>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className={labelTextClass}>Créativité (Température)</span>
              <span className="text-cyan-400 font-mono font-bold">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className={`w-full accent-cyan-400 h-1 rounded-lg cursor-pointer ${isLightTheme ? "bg-slate-300" : "bg-slate-800"}`}
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>Précis & Strict</span>
              <span>Créatif & Fantaisiste</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className={labelTextClass}>Niveau de technicité</span>
              <span className="text-cyan-400 font-mono font-bold">{technicality}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={technicality}
              onChange={(e) => setTechnicality(parseInt(e.target.value))}
              className={`w-full accent-cyan-400 h-1 rounded-lg cursor-pointer ${isLightTheme ? "bg-slate-300" : "bg-slate-800"}`}
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>Grand Public</span>
              <span>Ultra Spécialisé</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className={`text-[11px] block mb-1 ${labelTextClass}`}>Voix Par défaut (TTS)</span>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className={inputBgClass}
            >
              <option value="Zephyr" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>Zephyr (Voix chaleureuse)</option>
              <option value="Kore" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>Kore (Voix énergique)</option>
              <option value="Puck" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>Puck (Voix calme)</option>
              <option value="Charon" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>Charon (Voix profonde)</option>
              <option value="Fenrir" className={isLightTheme ? "text-slate-900 bg-white" : "text-white bg-slate-900"}>Fenrir (Récit d'aventure)</option>
            </select>
          </div>
        </div>

      </div>

      {/* FOOTER SAVE CREW */}
      <div className={`p-4 border-t ${
        isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#060a12] border-[#1e293b]"
      }`}>
        <button
          id="btn-register-crew"
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Enregistrer le Crew
        </button>
      </div>
    </div>
  );
}
