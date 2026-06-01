export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  role: string;
  tone: string; // Amical, Professionnel, Humoristique, Direct, Enseignant, etc.
  personality: string; // Décrit le tempérament (ex. Patient, enthousiaste, analytique)
  technicality: number; // 1-10 level
  responseStyle: string; // Concis, Détaillé, Illustré, Étape par Étape
  mainLanguage: string; // Français, Anglais, Espagnol, etc.
  jobSpecialization: string; // Horloger, Codeur, IKEA assembler etc.
  avatar: string; // Base64 or URL
  voice: string; // Prebuilt name like Kore, Puck etc.
  temperature: number; // 0.0 - 2.0
  maxTokens: number; // integer limit
  
  // Capabilities toggles
  capabilities: {
    text: boolean;
    voice: boolean;
    image: boolean;
    vision: boolean;
    searchWeb: boolean;
    analyzeDoc: boolean;
    memory: boolean;
  };

  // Provider config
  engine: {
    provider: string; // "Google AI Studio", "OpenAI", "Anthropic Claude", "Ollama", "LM Studio"
    model: string; // "gemini-3.5-flash", "gemini-3.1-pro-preview", "gpt-4o", "claude-3-5-sonnet", etc.
    fallbackModel?: string;
    speed: number; // 1-5 rating
    quality: number; // 1-5 rating
    costRate: number; // 1-5 rating
  };

  category: string; // DIY, Education, Science, Loisir, Professionnel etc.
  ratingsCount?: number;
  averageRating?: number;
  favorite?: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  image?: string; // base64 multi-modal input
  audioUrl?: string; // TTS response audio
  citations?: Array<{ title: string; uri: string }>;
  modelUsed?: string;
  costEstimate?: number;
}

export interface Conversation {
  id: string;
  personaId: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

export interface KnowledgePack {
  id: string;
  name: string;
  description: string;
  tags: string[];
  documents: Array<{
    id: string;
    fileName: string;
    fileSize: string;
    contentSummary: string;
    uploadDate: string;
    content?: string; // Stored raw text content for dynamic RAG
  }>;
}

export interface UserStats {
  tokensUsed: number;
  costUSD: number;
  sessionsCount: number;
  durationSeconds: number;
  callsCount: number;
  providerUsage: Record<string, number>; // counts
  modelUsage: Record<string, number>; // counts
}

export interface UserProfile {
  name: string;
  job: string;
  avatar?: string; // Base64 or URL custom user image
  hobbies: string[];
  preferences: string;
  goals: string;
  projects: string;
  budgetLimitUSD: number;
  budgetSpentUSD: number;
  // Dynamic discovered facts (automatic memories)
  discoveredFacts: Array<{
    id: string;
    fact: string;
    sourcePersona: string;
    timestamp: string;
    category: string;
  }>;
}
