import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatContainer from "./components/ChatContainer";
import StudioCreation from "./components/StudioCreation";
import StoreCrew from "./components/StoreCrew";
import InfoUser from "./components/InfoUser";
import StatsDashboard from "./components/StatsDashboard";
import SettingsPanel from "./components/SettingsPanel";
import LandingPage from "./components/LandingPage";

import { Persona, Conversation, Message, UserProfile, UserStats, KnowledgePack } from "./types";
import { 
  DEFAULT_PERSONAS, 
  INITIAL_PROFILE, 
  INITIAL_STATS, 
  DEFAULT_KNOWLEDGE_PACKS 
} from "./presets";

export default function App() {
  // Tab view controller states. Tabs: "chat" | "store" | "info" | "stats" | "settings" | "help"
  const [activeTab, setActiveTab] = useState<"chat" | "store" | "info" | "stats" | "settings" | "help">("chat");
  const [isLandingPageOpen, setIsLandingPageOpen] = useState(false);

  // Local storage lists
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [knowledgePacks, setKnowledgePacks] = useState<KnowledgePack[]>(DEFAULT_KNOWLEDGE_PACKS);
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  // Layout presentation states
  const [isCreationPanelOpen, setIsCreationPanelOpen] = useState(true); // Studio de Création open by default like mock
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [isLightTheme, setIsLightTheme] = useState(true); // Default to Light Theme on first load
  const [textScale, setTextScale] = useState<"normal" | "large" | "extra">("normal");

  // Load state from local storage on mount
  useEffect(() => {
    try {
      const storedPersonas = localStorage.getItem("konceptcrew_personas");
      if (storedPersonas) {
        const parsed = JSON.parse(storedPersonas) as Persona[];
        // Auto-migrate "Math Mentor" to "Math Mentor niveau 6ème" to bypass stale caches in browser
        const migrated = parsed.map(p => {
          if (p.id === "p1" && (p.name === "Math Mentor" || p.name.includes("Math Mentor"))) {
            return {
              ...p,
              name: "Math Mentor niveau 6ème",
              description: "Prof de maths bienveillant pour enfants de 12 ans. Rend l'algèbre amusante.",
              systemPrompt: "Tu es Math Mentor niveau 6ème, un professeur de mathématiques bienveillant, chaleureux, pédagogue et patient, spécialisé pour les collégiens d'environ 12 ans. Tu expliques les concepts d'algèbre, géométrie et arithmétique de manière très imagée, avec des analogies concrètes (ex. parts de pizzas pour les fractions, balances équilibrées pour les équations). Pose des questions de validation pour s'assurer que l'élève a bien compris."
            };
          }
          return p;
        });
        setPersonas(migrated);
        localStorage.setItem("konceptcrew_personas", JSON.stringify(migrated));
        if (migrated.length > 0) {
          setSelectedPersonaId(migrated[0].id);
        }
      } else {
        setPersonas(DEFAULT_PERSONAS);
        setSelectedPersonaId(DEFAULT_PERSONAS[0].id);
        localStorage.setItem("konceptcrew_personas", JSON.stringify(DEFAULT_PERSONAS));
      }

      const storedConversations = localStorage.getItem("konceptcrew_conversations");
      if (storedConversations) {
        setConversations(JSON.parse(storedConversations));
      } else {
        // Hydrate with a friendly welcome message for the first Math Mentor
        const initialConv: Record<string, Message[]> = {
          "p1": [
            {
              id: "welcome-p1",
              role: "assistant",
              content: "Bonjour ! Je suis Math Mentor niveau 6ème 📐. Je suis ravi de faire partie de ton Crew d'experts ! Quel sujet de mathématiques ou exercice aimerais-tu que je t'aide à comprendre ou à résoudre aujourd'hui ?",
              timestamp: "11:23",
              modelUsed: "gemini-3.5-flash",
              costEstimate: 0.002
            }
          ]
        };
        setConversations(initialConv);
        localStorage.setItem("konceptcrew_conversations", JSON.stringify(initialConv));
      }

      const storedProfile = localStorage.getItem("konceptcrew_user_profile");
      let currentProfile = INITIAL_PROFILE;
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (parsed.name === "Alex Koncept") {
          // Reset to clean default base project state to clear browser caches
          localStorage.setItem("konceptcrew_user_profile", JSON.stringify(INITIAL_PROFILE));
          localStorage.setItem("konceptcrew_user_stats", JSON.stringify(INITIAL_STATS));
          localStorage.removeItem("konceptcrew_conversations");
          currentProfile = INITIAL_PROFILE;
        } else {
          currentProfile = parsed;
        }
      }
      setUserProfile(currentProfile);

      const storedStats = localStorage.getItem("konceptcrew_user_stats");
      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        if (storedProfile && JSON.parse(storedProfile).name === "Alex Koncept") {
          setStats(INITIAL_STATS);
        } else {
          setStats(parsedStats);
        }
      }

      const storedPacks = localStorage.getItem("konceptcrew_knowledge_packs");
      if (storedPacks) {
        setKnowledgePacks(JSON.parse(storedPacks));
      }

      const themeRaw = localStorage.getItem("konceptcrew_light_theme");
      const storedTheme = themeRaw === null ? true : themeRaw === "true";
      setIsLightTheme(storedTheme);

      const storedLang = localStorage.getItem("konceptcrew_language") as "fr" | "en" | null;
      if (storedLang) {
        setLanguage(storedLang);
      }
    } catch (e) {
      console.error("Local Storage parsing failed:", e);
    }
  }, []);

  // Save updates helper
  const savePersonasToLocal = (newPersonas: Persona[]) => {
    setPersonas(newPersonas);
    localStorage.setItem("konceptcrew_personas", JSON.stringify(newPersonas));
  };

  const saveConversationsToLocal = (newConvs: Record<string, Message[]>) => {
    setConversations(newConvs);
    localStorage.setItem("konceptcrew_conversations", JSON.stringify(newConvs));
  };

  const handleUpdateLanguage = (lang: "fr" | "en") => {
    setLanguage(lang);
    localStorage.setItem("konceptcrew_language", lang);
  };

  const handleUpdateKnowledgePacks = (newPacks: KnowledgePack[]) => {
    setKnowledgePacks(newPacks);
    localStorage.setItem("konceptcrew_knowledge_packs", JSON.stringify(newPacks));
  };

  const handleUpdateProfile = (nextProfile: UserProfile) => {
    setUserProfile(nextProfile);
    localStorage.setItem("konceptcrew_user_profile", JSON.stringify(nextProfile));
  };

  // Callback to add a new custom Specialist created in the right Studio panel
  const handleSaveCustomPersona = (persona: Persona) => {
    const exists = personas.some(p => p.id === persona.id);
    let nextPersonas: Persona[];
    if (exists) {
      nextPersonas = personas.map(p => p.id === persona.id ? persona : p);
    } else {
      nextPersonas = [...personas, persona];
    }
    savePersonasToLocal(nextPersonas);
    setSelectedPersonaId(persona.id);
    setEditingPersona(null);

    // Initial message for custom persona
    if (!conversations[persona.id]) {
      const initialMessage: Message = {
        id: `welcome-${persona.id}-${Date.now()}`,
        role: "assistant",
        content: `Bonjour ! Je suis ${persona.name}, spécialisé en temps qu'expert en tant que : ${persona.role}. Commençons notre travail !`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: persona.engine.model
      };
      saveConversationsToLocal({
        ...conversations,
        [persona.id]: [initialMessage]
      });
    }

    // Add cost stats for persona creation
    const updatedStats = {
      ...stats,
      callsCount: stats.callsCount + 1,
      tokensUsed: stats.tokensUsed + 1200,
    };
    setStats(updatedStats);
    localStorage.setItem("konceptcrew_user_stats", JSON.stringify(updatedStats));
  };

  // Add / recruit specialist directly from Marketplace Store
  const handleAddFromStore = (persona: Persona) => {
    if (!personas.some(p => p.id === persona.id)) {
      const updated = [...personas, persona];
      savePersonasToLocal(updated);
      setSelectedPersonaId(persona.id);
      setActiveTab("chat");
    }
  };

  // Handle direct import JSON
  const handleImportPersona = (persona: Persona) => {
    const updated = [...personas.filter(p => p.id !== persona.id), persona];
    savePersonasToLocal(updated);
    setSelectedPersonaId(persona.id);
    setActiveTab("chat");
  };

  // Sending message orchestrator (saves history, triggers backend API stats tallying)
  const handleSendMessage = (text: string, image?: string, citations?: any[]) => {
    if (!selectedPersonaId) return;

    const persona = personas.find(p => p.id === selectedPersonaId);
    if (!persona) return;

    const isAssistant = citations !== undefined || text.includes("*(Échec") || text.includes("**") || text.includes("symptôme") || text.includes("ETA") || text.includes("Math");
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(5)}`,
      role: isAssistant ? "assistant" : "user",
      content: text,
      timestamp,
      image,
      citations,
      modelUsed: isAssistant ? persona.engine.model : undefined
    };

    const currentHistory = conversations[selectedPersonaId] || [];
    const updatedHistory = [...currentHistory, newMsg];

    const nextConversations = {
      ...conversations,
      [selectedPersonaId]: updatedHistory
    };
    saveConversationsToLocal(nextConversations);

    // Dynamic stats allocation tracking
    if (isAssistant) {
      const estimatedCost = persona.engine.model.includes("pro") ? 0.05 : 0.002;
      const tokensToAdd = text.length * 4;

      const modelName = persona.engine.model;
      const providerName = persona.engine.provider;

      const nextStats: UserStats = {
        ...stats,
        callsCount: stats.callsCount + 1,
        tokensUsed: stats.tokensUsed + tokensToAdd,
        costUSD: stats.costUSD + estimatedCost,
        modelUsage: {
          ...stats.modelUsage,
          [modelName]: (stats.modelUsage[modelName] || 0) + 1
        },
        providerUsage: {
          ...stats.providerUsage,
          [providerName]: (stats.providerUsage[providerName] || 0) + 1
        }
      };
      setStats(nextStats);
      localStorage.setItem("konceptcrew_user_stats", JSON.stringify(nextStats));

      // Synchronize budget in userProfile
      handleUpdateProfile({
        ...userProfile,
        budgetSpentUSD: userProfile.budgetSpentUSD + estimatedCost
      });
    }
  };

  const handleRegenerateLast = () => {
    if (!selectedPersonaId) return;
    const current = conversations[selectedPersonaId] || [];
    if (current.length < 2) return;
    // Remove last message and trigger send
    const truncated = current.slice(0, -1);
    saveConversationsToLocal({
      ...conversations,
      [selectedPersonaId]: truncated
    });
  };

  const handleClearHistory = () => {
    if (!selectedPersonaId) return;
    saveConversationsToLocal({
      ...conversations,
      [selectedPersonaId]: []
    });
  };

  const handleUpdateMessageImage = (msgId: string, imageUrl: string) => {
    if (!selectedPersonaId) return;
    const current = conversations[selectedPersonaId] || [];
    const updated = current.map(msg => msg.id === msgId ? { ...msg, image: imageUrl } : msg);
    saveConversationsToLocal({
      ...conversations,
      [selectedPersonaId]: updated
    });
  };

const handleAddNewCrew = () => {
    setEditingPersona(null);
    setActiveTab("chat"); // <- Ligne ajoutée ici
    setIsCreationPanelOpen(true);
  };

  const handleClearAllCache = () => {
    localStorage.clear();
    setPersonas(DEFAULT_PERSONAS);
    setSelectedPersonaId(DEFAULT_PERSONAS[0].id);
    setConversations({});
    setUserProfile(INITIAL_PROFILE);
    setStats(INITIAL_STATS);
    setKnowledgePacks(DEFAULT_KNOWLEDGE_PACKS);
    setActiveTab("chat");
  };

  const handleUpdateBudgetLimit = (limit: number) => {
    handleUpdateProfile({
      ...userProfile,
      budgetLimitUSD: limit
    });
  };

  const handleToggleFavorite = (id: string) => {
    const nextPersonas = personas.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p);
    savePersonasToLocal(nextPersonas);
  };

  // Extracted Automatic fact discovering mechanism
  const handleTriggerFactDiscovery = (fact: string) => {
    const activePersona = personas.find(p => p.id === selectedPersonaId) || DEFAULT_PERSONAS[0];
    const newFact = {
      id: `fact-${Date.now()}`,
      fact,
      sourcePersona: activePersona.name,
      timestamp: new Date().toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: 'numeric' }),
      category: activePersona.category
    };
    handleUpdateProfile({
      ...userProfile,
      discoveredFacts: [newFact, ...userProfile.discoveredFacts]
    });
  };

  const activePersona = personas.find(p => p.id === selectedPersonaId) || DEFAULT_PERSONAS[0];
  const activeHistory = selectedPersonaId ? (conversations[selectedPersonaId] || []) : [];

  return (
    <div 
      className={`flex h-screen w-screen overflow-hidden ${
        isLightTheme 
          ? "bg-gradient-to-tr from-[#e2ebf6] via-[#f0f4fa] to-[#fcf5f8] text-[#1e293b]" 
          : "bg-[#05080c] text-slate-100"
      }`}
    >
      {/* 1. Left Sidebar Navigation Panel */}
      <Sidebar
        personas={personas}
        selectedPersonaId={selectedPersonaId}
        onSelectPersona={(id) => {
          setSelectedPersonaId(id);
          const currentPersona = personas.find(p => p.id === id);
          if (currentPersona) {
            setEditingPersona(currentPersona);
          }
        }}
        onToggleFavorite={handleToggleFavorite}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddNewCrew={handleAddNewCrew}
        userProfile={userProfile}
        isLightTheme={isLightTheme}
        language={language}
      />

      {/* 2. Central Central Workspace according to Active view tab router */}
      <main className="flex-1 h-full flex overflow-hidden">
        
        {activeTab === "chat" && activePersona && (
          <ChatContainer
            persona={activePersona}
            messages={activeHistory}
            onSendMessage={handleSendMessage}
            onRegenerateLast={handleRegenerateLast}
            onClearHistory={handleClearHistory}
            isLightTheme={isLightTheme}
            knownPacks={knowledgePacks}
            onUpdateKnowledgePacks={handleUpdateKnowledgePacks}
            userProfile={userProfile}
            onTriggerFactDiscovery={handleTriggerFactDiscovery}
            onOpenLandingPage={() => setIsLandingPageOpen(true)}
            onUpdateMessageImage={handleUpdateMessageImage}
            language={language}
          />
        )}

        {activeTab === "store" && (
          <StoreCrew
            onImportPersona={handleImportPersona}
            onAddFromStore={handleAddFromStore}
            availableTemplates={DEFAULT_PERSONAS}
            addedPersonaIds={personas.map(p => p.id)}
            isLightTheme={isLightTheme}
            language={language}
          />
        )}

        {activeTab === "info" && (
          <InfoUser
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            isLightTheme={isLightTheme}
            language={language}
          />
        )}

        {activeTab === "stats" && (
          <StatsDashboard
            stats={stats}
            userProfile={userProfile}
            onUpdateBudgetLimit={handleUpdateBudgetLimit}
            isLightTheme={isLightTheme}
            language={language}
          />
        )}

        {activeTab === "settings" && (
          <SettingsPanel
            isLightTheme={isLightTheme}
            setIsLightTheme={(light) => {
              setIsLightTheme(light);
              localStorage.setItem("konceptcrew_light_theme", light ? "true" : "false");
            }}
            onClearAllCache={handleClearAllCache}
            textScale={textScale}
            setTextScale={setTextScale}
            language={language}
            onUpdateLanguage={handleUpdateLanguage}
          />
        )}
      </main>

      {/* 3. Right Studio Creation Slider Panel (Saves screen estate toggling) */}
      {isCreationPanelOpen && activeTab === "chat" && (
        <StudioCreation
          editingPersona={editingPersona}
          onSavePersona={handleSaveCustomPersona}
          onClose={() => setIsCreationPanelOpen(false)}
          isLightTheme={isLightTheme}
        />
      )}

      {/* Toggle button float to reveal Studio Panel of Creation if hidden */}
     {(!isCreationPanelOpen || activeTab !== "chat") && (
        <button
          id="btn-floating-studio-creation"
          onClick={() => {
            setActiveTab("chat"); // <- Ligne ajoutée ici
            const currentSelected = personas.find(p => p.id === selectedPersonaId);
            if (currentSelected) setEditingPersona(currentSelected);
            setIsCreationPanelOpen(true);
          }}
          className="absolute right-4 bottom-24 p-3 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white rounded-xl shadow-xl z-30 transition hover:scale-105 select-none"
          title="Ouvrir le Studio de Création"
        >
          <span>✏️ Studio</span>
        </button>
      )}

      {/* Immersive Beautiful Modern Landing Page Modal overlay */}
      {isLandingPageOpen && (
        <LandingPage 
          onClose={() => setIsLandingPageOpen(false)}
          isLightTheme={isLightTheme}
        />
      )}

    </div>
  );
}
