import { Message, Persona } from "../types";

export interface ChatRequestParams {
  prompt?: string;
  systemInstruction?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  webSearch?: boolean;
  imageAttachment?: string; // Base64
  imageMimeType?: string;
}

export interface ChatResponse {
  text: string;
  citations: Array<{ title: string; uri: string }>;
  modelUsed: string;
  cost: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
}

// Client helper for API logic
export class KonceptCrewAPI {
  // Retrieve custom key from localStorage if saved by user for local-first privacy
  private static getLocalApiKey(): string | null {
    try {
      const keys = localStorage.getItem("konceptcrew_api_keys");
      if (keys) {
        const parsed = JSON.parse(keys);
        return parsed.gemini || null;
      }
    } catch (e) {
      console.error("Local keys read error", e);
    }
    return null;
  }

  // Get current active mode (online or offline)
  private static isOfflineMode(): boolean {
    return localStorage.getItem("konceptcrew_offline_mode") === "true";
  }

  // Chat request sender
  static async sendChatMessage(persona: Persona, params: ChatRequestParams): Promise<ChatResponse> {
    const isOffline = this.isOfflineMode();
    const localKeys = this.getLocalApiKey();
    
    // Simulate real Local Ollama or LM Studio offline response
    if (isOffline) {
      return this.simulateOfflineResponse(persona, params.prompt || "", undefined, params.webSearch);
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (localKeys) {
        headers["x-api-key"] = localKeys;
      }

      const response = await fetch("/api/crews/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt: params.prompt,
          systemInstruction: persona.systemPrompt,
          history: params.history,
          model: persona.engine.model || "gemini-3.5-flash",
          temperature: persona.temperature || 1.0,
          maxTokens: persona.maxTokens,
          webSearch: params.webSearch,
          imageAttachment: params.imageAttachment,
          imageMimeType: params.imageMimeType,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur (${response.status})`);
      }

      return await response.json();
    } catch (error: any) {
      console.warn("API Error, falling back to dynamic simulated response", error);
      // Fallback response for perfect preview robustness
      return this.simulateOfflineResponse(persona, params.prompt || "", error.message, params.webSearch);
    }
  }

  // Stream chat request sender (Server-Sent Events)
  static async sendChatMessageStream(
    persona: Persona,
    params: ChatRequestParams,
    onChunk: (text: string, citations?: any[], cost?: any) => void
  ): Promise<ChatResponse> {
    const isOffline = this.isOfflineMode();
    const localKeys = this.getLocalApiKey();

    if (isOffline) {
      return this.simulateOfflineResponseStream(persona, params.prompt || "", onChunk, params.webSearch);
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (localKeys) {
        headers["x-api-key"] = localKeys;
      }

      const response = await fetch("/api/crews/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt: params.prompt,
          systemInstruction: persona.systemPrompt,
          history: params.history,
          model: persona.engine.model || "gemini-3.5-flash",
          temperature: persona.temperature || 1.0,
          maxTokens: persona.maxTokens,
          webSearch: params.webSearch,
          imageAttachment: params.imageAttachment,
          imageMimeType: params.imageMimeType,
          stream: true
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur (${response.status})`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) {
        throw new Error("Impossible de lire le flux de réponse.");
      }

      let fullText = "";
      let lastCitations: any[] = [];
      let lastCost: any = null;
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;
          if (cleanLine === "data: [DONE]") continue;

          if (cleanLine.startsWith("data: ")) {
            try {
              const data = JSON.parse(cleanLine.substring(6));
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.text) {
                fullText += data.text;
              }
              if (data.citations) {
                lastCitations = data.citations;
              }
              if (data.cost) {
                lastCost = data.cost;
              }
              onChunk(fullText, lastCitations, lastCost);
            } catch (jsonErr) {
              // Ignore line parse errors if chunk is split
            }
          }
        }
      }

      return {
        text: fullText,
        citations: lastCitations,
        modelUsed: persona.engine.model || "gemini-3.5-flash",
        cost: lastCost || {
          promptTokens: (params.prompt || "").length * 4,
          candidatesTokens: fullText.length * 4,
          totalTokens: ((params.prompt || "").length + fullText.length) * 4,
        },
      };
    } catch (error: any) {
      console.warn("Stream API Error, falling back to simulated stream response", error);
      return this.simulateOfflineResponseStream(persona, params.prompt || "", onChunk, params.webSearch);
    }
  }

  // Simulated Offline stream responder word-by-word
  private static simulateOfflineResponseStream(
    persona: Persona,
    prompt: string,
    onChunk: (text: string, citations?: any[], cost?: any) => void,
    webSearch?: boolean
  ): Promise<ChatResponse> {
    return new Promise(async (resolve) => {
      const fullResponse = await this.simulateOfflineResponse(persona, prompt, undefined, webSearch);
      const text = fullResponse.text;
      
      const words = text.split(/(\s+)/);
      let currentText = "";
      let index = 0;

      const interval = setInterval(() => {
        if (index >= words.length) {
          clearInterval(interval);
          resolve(fullResponse);
          return;
        }

        currentText += words[index];
        index++;
        
        onChunk(currentText, fullResponse.citations, fullResponse.cost);
      }, 35);
    });
  }

  // Prompt generation & optimizing
  static async runPromptEngineering(
    action: "generate" | "optimize" | "simplify" | "humanize" | "pedagogical",
    payload: { name?: string; role?: string; details?: string; promptToImprove?: string }
  ): Promise<string> {
    if (this.isOfflineMode()) {
      return `[Optimisation Hors Ligne] Voici la version simulée simplifiée pour "${payload.name || "Persona"}". Veuillez activer le mode en ligne pour l'intelligence complète de Gemini.`;
    }

    try {
      const localKeys = this.getLocalApiKey();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (localKeys) headers["x-api-key"] = localKeys;

      const response = await fetch("/api/crews/prompt-engineer", {
        method: "POST",
        headers,
        body: JSON.stringify({ action, ...payload }),
      });

      if (!response.ok) {
        throw new Error("Erreur serveur");
      }

      const data = await response.json();
      return data.text || "";
    } catch (e) {
      return `[Fallback] Tu es ${payload.name || "l'expert"}, spécialiste de haut niveau dans le rôle de ${payload.role || "Conseiller"}. Directives de comportement: Reste courtois, précis, chaleureux et réponds méthodiquement.`;
    }
  }

  // Generate profile pics inside editor using local-first or proxy gemini-2.5-flash-image
  static async generateAIImage(name: string, role: string, style: string, fallbackProvider?: string): Promise<string> {
    if (this.isOfflineMode() && fallbackProvider !== "Ollama" && fallbackProvider !== "LM Studio") {
      const randomSeed = Math.floor(Math.random() * 100000);
      return `https://picsum.photos/seed/crew_${randomSeed}/300/300`;
    }

    try {
      let parsedKeys: any = {};
      const keys = localStorage.getItem("konceptcrew_api_keys");
      if (keys) {
        try { parsedKeys = JSON.parse(keys); } catch(e){}
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (parsedKeys.gemini) headers["x-api-key"] = parsedKeys.gemini;
      if (parsedKeys.openai) headers["x-openai-key"] = parsedKeys.openai;

      // Determine endpoint if local
      let localEndpoint = undefined;
      const isOffline = this.isOfflineMode();
      const provider = fallbackProvider || "Google AI Studio";
      
      if (isOffline || provider === "Ollama" || provider === "LM Studio") {
        localEndpoint = provider === "Ollama" 
          ? (localStorage.getItem("konceptcrew_ollama_url") || "http://localhost:11434")
          : (localStorage.getItem("konceptcrew_lmstudio_url") || "http://localhost:1234");
      }

      const response = await fetch("/api/crews/generate-avatar", {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          name, 
          role, 
          style,
          provider: isOffline ? (provider === "Ollama" || provider === "LM Studio" ? provider : "Local") : provider,
          localEndpoint 
        }),
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      return data.imageUrl || `https://picsum.photos/seed/crew_err/300/300`;
    } catch (e) {
      const randomSeed = Math.floor(Math.random() * 100000);
      return `https://picsum.photos/seed/crew_${randomSeed}/300/300`;
    }
  }

  // Generate local/online illustrative visualization based on an explanation prompt
  static async generateCustomImage(prompt: string, persona?: Persona): Promise<string> {
    if (this.isOfflineMode() && (!persona || persona.engine.provider !== "LM Studio" && persona.engine.provider !== "Ollama")) {
      const randomSeed = Math.floor(Math.random() * 100000);
      return `https://picsum.photos/seed/concept_${randomSeed}/600/340`;
    }

    try {
      let parsedKeys: any = {};
      const keys = localStorage.getItem("konceptcrew_api_keys");
      if (keys) {
        try { parsedKeys = JSON.parse(keys); } catch(e){}
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (parsedKeys.gemini) headers["x-api-key"] = parsedKeys.gemini;
      if (parsedKeys.openai) headers["x-openai-key"] = parsedKeys.openai;

      // Determine endpoint if local
      let localEndpoint = undefined;
      const isOffline = this.isOfflineMode();
      const provider = persona?.engine.provider || "Google AI Studio";
      
      if (isOffline || provider === "Ollama" || provider === "LM Studio") {
        localEndpoint = provider === "Ollama" 
          ? (localStorage.getItem("konceptcrew_ollama_url") || "http://localhost:11434")
          : (localStorage.getItem("konceptcrew_lmstudio_url") || "http://localhost:1234");
      }

      const response = await fetch("/api/crews/generate-image", {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          prompt,
          provider: isOffline ? (provider === "Ollama" || provider === "LM Studio" ? provider : "Local") : provider,
          localEndpoint: localEndpoint
        }),
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      return data.imageUrl || `https://picsum.photos/seed/concept_err/600/340`;
    } catch (e) {
      const randomSeed = Math.floor(Math.random() * 100000);
      return `https://picsum.photos/seed/concept_${randomSeed}/600/340`;
    }
  }

  // Generate dynamic persona ideas using gemini-3.5-flash
  static async generatePersonaIdea(): Promise<{
    name: string;
    description: string;
    role: string;
    tone: string;
    personality: string;
    jobSpecialization: string;
    category: string;
    systemPrompt: string;
  }> {
    const offlineFallbacks = [
      {
        name: "Herboriste Stellaire",
        description: "Botaniste de l'espace expert en fougères martiennes et remèdes bios du futur.",
        role: "Botaniste Alchimiste",
        tone: "Chaleureux, mystique et apaisant",
        personality: "Parle calmement, passionné par la chlorophylle cosmique, adore infuser du thé martien.",
        jobSpecialization: "Fongiculture exoplanétaire",
        category: "DIY",
        systemPrompt: "Tu es Herboriste Stellaire, un botaniste interstellaire hautement qualifié. Tu t'exprimes avec calme et bienveillance, en agrémentant tes réponses de conseils d'herboristerie cosmique et d'analogies fleuries."
      },
      {
        name: "Chef Barista Cyberpunk",
        description: "Un as de l'expresso qui torréfie des grains enrichis en neutrinos sous les néons.",
        role: "Sommelier en caféine",
        tone: "Sarcastique, vif et branché",
        personality: "Accro à la double-dose d'expresso, adore analyser les molécules aromatiques.",
        jobSpecialization: "Moutures moléculaires",
        category: "Coach",
        systemPrompt: "Tu es Chef Barista Cyberpunk, un expert absolu de la caféine moléculaire et de la torréfaction futuriste. Ton ton est direct, électrique, plein d'énergie créative."
      },
      {
        name: "Maître de Jeu Rétro",
        description: "Spécialiste de la nostalgie vidéoludique, du code d'assemblage 8-bits et des pixels d'époque.",
        role: "Historien des pixels",
        tone: "Nostalgique & Passionné",
        personality: "Collectionneur de cartouches poussiéreuses, cite des lignes de code assembleur de 1985.",
        jobSpecialization: "Optimisation Amiga 500",
        category: "Créatif",
        systemPrompt: "Tu es Maître de Jeu Rétro. Tu aides les utilisateurs à écrire, concevoir ou analyser du code avec l'âme des légendes du jeu vidéo des années 80. Ton ton est chaleureux, geek et plein de références savoureuses."
      }
    ];

    if (this.isOfflineMode()) {
      return offlineFallbacks[Math.floor(Math.random() * offlineFallbacks.length)];
    }

    try {
      const localKeys = this.getLocalApiKey();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (localKeys) headers["x-api-key"] = localKeys;

      const response = await fetch("/api/crews/generate-persona-idea", {
        method: "POST",
        headers,
      });

      if (!response.ok) throw new Error();
      return await response.json();
    } catch (e) {
      console.warn("Using offline fallback persona idea due to network or configuration issue", e);
      return offlineFallbacks[Math.floor(Math.random() * offlineFallbacks.length)];
    }
  }

  // Pure Local Simulated Generator (offline or missing key fallback)
  private static simulateOfflineResponse(persona: Persona, prompt: string, errorMsg?: string, webSearch?: boolean): Promise<ChatResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let text = "";
        const lower = prompt.toLowerCase();

        // Elegant customized answer per persona even when running offline or keys missing
        if (persona.id === "p1" || persona.name.toLowerCase().includes("math")) {
          text = `Bonjour ! Je suis **Math Mentor niveau 6ème** 📐. En mode simulation local-first, je t'aide avec plaisir ! 
          
Pour ta question sur "${prompt}", imaginons une analogie simple :
Si nous disposons de 10 pommes réparties de manière égale dans 2 paniers, chaque panier en contient un nombre égal à $10 \\div 2 = 5$. C'est le même principe de calcul pour isoler une variable $x$ !

As-tu réussi de ton côté à poser la première partie de l'équation ? Raconte-moi !`;
        } else if (persona.id === "p2" || persona.name.toLowerCase().includes("horloger") || persona.name.toLowerCase().includes("watch")) {
          text = `Salutations horlogères de **WatchMaster** ⏱️. 

Sur l'ETA 2824-2, pour ton problème lié à "${prompt}", voici les points clés d'intervention mécanique :
1. **Contrôle d'amplitude** : Assure-toi que le pivotement du balancier atteint bien entre 270° et 310° plat.
2. **Lubrification** : Applique une infime dose de *Moebius 9010* sur les contre-pivots de balancier et l'échappement.
3. **Erreur de repère** : Ajuste minutieusement le porte-piton pour réduire le beat-error en dessous de 0.5 ms.

N'oublie pas d'utiliser une loupe grossissante 5x pour éviter tout ripage involontaire du tournevis.`;
        } else if (persona.id === "p3" || persona.name.toLowerCase().includes("camper") || persona.name.toLowerCase().includes("van")) {
          text = `Hey ! C'est **Camper Expert** 🚐 !

Pour ton aménagement sur la thématique de "${prompt}", voilà mon retour d'expérience de baroudeur :
- **Astuce Électricité** : Il est primordial de calculer ta consommation moyenne journalière en Ah avant de dimensionner ton parc de batteries lithium.
- **Section des fils** : Utilise toujours du câble en cuivre souple de section adaptée (généralement du 6mm² pour relier les panneaux solaires au MPPT) protégés par des fusibles adéquats.
- **Isolant** : L'Armaflex AF autocollant en 19mm d'épaisseur reste imbattable pour épouser la carrosserie sans pont thermique.

Tu en es où dans la découpe de ta tôle ou ton câblage ?`;
        } else if (persona.id === "p4" || persona.name.toLowerCase().includes("coach") || persona.name.toLowerCase().includes("gym")) {
          text = `Allez on lâche rien ! Ici **Gym Coach** ! 💪🏋️

Concernant ta question sur "${prompt}", voici la marche à suivre immédiate pour cartonner :
- **Focus Technique** : Priorise la forme et l'amplitude de mouvement sur la charge pure.
- **Plan d'Action** : Fais 3 à 4 séries de travail effectives proches de l'échec technique pour stimuler l'hypertrophie.
- **Nutrition** : Reste hydraté (minimum 3L par jour) et vise un ratio protéique de 1.8g à 2g par kg de poids de corps.

Prépare ta bouteille d'eau, échauffe-toi bien les articulations et donne tout ! Ready ?`;
        } else {
          // Standard smart specialist response simulation
          text = `Bonjour ! Je suis **${persona.name}**, spécialisé dans le domaine suivant : *${persona.role}*.

Tu viens de m'interroger sur : **"${prompt}"**.
En tant qu'expert IA opérant en mode hors ligne (ou en secours de connexion), voici ce que je peux te conseiller en priorité :
1. Identifie l'objectif principal de ton action.
2. Découpe la tâche en étapes bien distinctes et claires.
3. Effectue des vérifications successives à chaque point d'étape.

${errorMsg ? `*(Note technique : L'API Google Gemini est indisponible ou nécessite une clé API personnalisée dans les Paramètres. Transition automatique en Intelligence Locale active. Erreur d'origine : ${errorMsg})*` : ""}`;
        }

        resolve({
          text,
          citations: webSearch ? [
            { title: "KonceptCrew Documentation Locale", uri: "#local-docs" },
            { title: "Guide de l'Expertise IA local-first", uri: "#guide" }
          ] : [],
          modelUsed: persona.engine.model || "Local Simulator (" + persona.name + ")",
          cost: {
            promptTokens: prompt.length * 4,
            candidatesTokens: text.length * 4,
            totalTokens: (prompt.length + text.length) * 4,
          }
        });
      }, 800);
    });
  }
}
