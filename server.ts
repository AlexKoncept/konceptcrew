import "dotenv/config";
import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Global initialization of Express
const app = express();
const PORT = 3000;

// Dynamic request parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to initialize Gemini SDK safely and lazy
function getGeminiClient(clientApiKey?: string) {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("La clé d'API Google Gemini n'est pas configurée dans les variables d'environnement.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ==========================================
// API ROUTES FIRST
// ==========================================

// 1. Health & Configuration Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasServerApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// 2. Chat / Conversation generation with tools option (Multimodal & Web Search Grounding)
app.post("/api/crews/chat", async (req, res) => {
  try {
    const { 
      prompt, 
      systemInstruction, 
      history = [], 
      model = "gemini-3.5-flash", 
      temperature = 1,
      maxTokens,
      webSearch = false,
      imageAttachment, // base64 string
      imageMimeType, // e.g. "image/png"
      stream = false
    } = req.body;

    const apiKey = req.headers["x-api-key"] as string || undefined;
    const ai = getGeminiClient(apiKey);

    // Build parts for content
    const contents: any[] = [];

    // Add conversation history if present
    // Mapping standard role strings
    if (history && history.length > 0) {
      for (const h of history) {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }]
        });
      }
    }

    // Add current user prompt with attachments if any
    const currentParts: any[] = [];
    if (imageAttachment && imageMimeType) {
      currentParts.push({
        inlineData: {
          data: imageAttachment.split(",")[1] || imageAttachment,
          mimeType: imageMimeType
        }
      });
    }

    if (prompt) {
      currentParts.push({ text: prompt });
    }

    contents.push({
      role: "user",
      parts: currentParts
    });

    // Build configuration
    const config: any = {
      systemInstruction: systemInstruction || "Tu es un spécialiste de KonceptCrew.",
      temperature: Number(temperature),
    };

    if (maxTokens) {
      config.maxOutputTokens = Number(maxTokens);
    }

    // Tools setup
    if (webSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    if (stream) {
      // Set headers for EventStream
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      try {
        const responseStream = await ai.models.generateContentStream({
          model: model,
          contents: contents,
          config: config
        });

        for await (const chunk of responseStream) {
          const chunkText = chunk.text || "";
          
          // Try to extract grounding citations if any in this chunk
          const searchChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          const citations = searchChunks.map((c: any) => ({
            title: c.web?.title || "Source",
            uri: c.web?.uri || "",
          })).filter((c: any) => c.uri);

          // Try to extract token metrics if available on this chunk (usually final chunk)
          const cost = chunk.usageMetadata ? {
            promptTokens: chunk.usageMetadata.promptTokenCount || 0,
            candidatesTokens: chunk.usageMetadata.candidatesTokenCount || 0,
            totalTokens: chunk.usageMetadata.totalTokenCount || 0,
          } : undefined;

          res.write(`data: ${JSON.stringify({ text: chunkText, citations, cost })}\n\n`);
        }

        res.write(`data: [DONE]\n\n`);
        res.end();
        return;
      } catch (streamError: any) {
        console.error("Stream generation error:", streamError);
        res.write(`data: ${JSON.stringify({ error: streamError.message || "Erreur lors du streaming." })}\n\n`);
        res.end();
        return;
      }
    }

    // Non-streaming fallback
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: config
    });

    // Parse references if web search was active
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const citations = searchChunks.map((chunk: any) => ({
      title: chunk.web?.title || "Source",
      uri: chunk.web?.uri || "",
    })).filter((c: any) => c.uri);

    res.json({
      text: response.text || "",
      citations: citations,
      modelUsed: model,
      cost: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        candidatesTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
      }
    });

  } catch (error: any) {
    console.error("Erreur Chat API:", error);
    res.status(500).json({ error: error.message || "Erreur interne du serveur lors du chat." });
  }
});

// 3. Prompt Engineering - Optimization & Generation
app.post("/api/crews/prompt-engineer", async (req, res) => {
  try {
    const { action, name, role, details, promptToImprove } = req.body;
    const apiKey = req.headers["x-api-key"] as string || undefined;
    const ai = getGeminiClient(apiKey);

    let systemPromptLine = "";
    if (action === "generate") {
      systemPromptLine = `Génère un prompt système de persona de haut niveau pour un expert IA nommé "${name}" dont le rôle est "${role}" et ses détails sont: "${details}". Rendre ce prompt précis, structuré avec les directives clés d'un expert et une personnalité bien définie.`;
    } else if (action === "optimize") {
      systemPromptLine = `Améliore, enrichis et optimise le prompt système suivant pour le rendre plus efficace envers un LLM: "${promptToImprove}". Conserve le rôle initial mais ajoute de la structure (objectifs, ton, consignes de sécurité).`;
    } else if (action === "simplify") {
      systemPromptLine = `Rends le prompt système suivant plus simple, direct et concis: "${promptToImprove}".`;
    } else if (action === "humanize") {
      systemPromptLine = `Ajuste le prompt de persona suivant pour que le ton soit extrêmement naturel, humain, chaleureux, empathique et fluide: "${promptToImprove}".`;
    } else if (action === "pedagogical") {
      systemPromptLine = `Ajuste ce prompt de persona pour qu'il adopte une démarche pédagogique par étapes, claire, bienveillante et adaptée à l'apprentissage: "${promptToImprove}".`;
    } else {
      res.status(400).json({ error: "Action inconnue" });
      return;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPromptLine,
      config: {
        systemInstruction: "Tu es un ingénieur de prompt d'élite (" + action + ") qui génère des prompts systèmes d'une rare précision, en français.",
        temperature: 0.7,
      }
    });

    res.json({ text: response.text || "" });

  } catch (error: any) {
    console.error("Erreur Prompt Engineering:", error);
    res.status(500).json({ error: error.message || "Erreur lors de l'ingénierie de prompt." });
  }
});

// 3.5. Magic Dynamic Persona Idea Generator using JSON Schemas
app.post("/api/crews/generate-persona-idea", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"] as string || undefined;
    const ai = getGeminiClient(apiKey);

    const userInspirationPrompt = `Génère une idée originale et ultra-complète de spécialiste ou d'expert de Crew IA. 
La réponse doit être structurée sous forme d'un objet JSON contenant les champs requis suivants.
Tous les champs doivent être rédigés en français. 
Idées de thèmes possibles: Un herboriste moderne, un guide survie spatial, un critique de mèmes rétro de l'an 2000, un expert de jardinage hydroponique, un conseiller en finances drôle mais rigoureux, un traducteur de comportement félin, etc. Donne vie à un personnage captivant, qualitatif et plein d'humour sérieux.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userInspirationPrompt,
      config: {
        systemInstruction: "Tu es un créateur d'idées de personas IA d'élite. Tu inventes des compagnons d'experts IA inoubliables, drôles, érudits et extrêmement qualifiés.",
        temperature: 0.95,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "Le nom créatif de l'expert (ex: 'Cat whispering Lord', 'Botaniste Cyberpunk'). Max 30 caractères."
            },
            description: {
              type: Type.STRING,
              description: "Une bio courte et mignonne ou percutante décrivant ce qu'il apporte à l'équipe. Max 100 caractères."
            },
            role: {
              type: Type.STRING,
              description: "Sa spécialité principale (ex: 'Comportementaliste animalier', 'Expert en Nutrition de Précision'). Max 40 caractères."
            },
            tone: {
              type: Type.STRING,
              description: "Le ton utilisé (ex: 'Pédagogue & Sarcastique', 'Noble & Poétique'). Max 30 caractères."
            },
            personality: {
              type: Type.STRING,
              description: "Ses traits de caractère rigolos (ex: 'Méticuleux, fou amoureux de son chat, caféinomane'). Max 60 caractères."
            },
            jobSpecialization: {
              type: Type.STRING,
              description: "Le domaine d'expertise pointu précis de son domaine (ex: 'Glandes salivaires canines', 'Calibres vintage'). Max 30 caractères."
            },
            category: {
              type: Type.STRING,
              description: "La categorie de l'expert. Doit uniquement être l'un de ces mots exacts: 'Prof' (éducation), 'Coach' (sport), 'Horloger' (horlogerie), 'DIY' (bricolage), 'Voyage' (loisirs/voyage), 'Créatif' (écriture), 'Intelligence' (assistant perso), 'Développeur' (code)."
            },
            systemPrompt: {
              type: Type.STRING,
              description: "Un prompt système de persona d'environ 150-200 mots commençant par 'Tu es [Nom]...' détaillant ses directives de personnalité, sa spécialité extrême et comment il formule ses réponses de manière interactive."
            }
          },
          required: ["name", "description", "role", "tone", "personality", "jobSpecialization", "category", "systemPrompt"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);

  } catch (error: any) {
    console.error("Erreur dynamic persona idea generator:", error);
    res.status(500).json({ error: error.message || "Erreur lors de la génération d'idée magique." });
  }
});

// 4. Generate Avatars with Style via gemini-2.5-flash-image or OpenAI
app.post("/api/crews/generate-avatar", async (req, res) => {
  try {
    const { name, role, style = "cartoon", provider, localEndpoint } = req.body;
    
    // We want the prompt to be in english since DALL-E and Imagen produce better results
    const stylePrompt = `A gorgeous square profile avatar portrait, perfectly centered, depicting an AI expert named "${name}" whose specialty is "${role}". Art style: ${style}. Clean background, professional modern design, high quality, masterpiece lighting, no text, no borders. Usable as a virtual assistant icon.`;
    
    let base64Image = "";

    if (provider === "OpenAI" || provider === "Local" || provider === "Ollama" || provider === "LM Studio") {
      const isLocal = provider !== "OpenAI";
      const apiUrl = isLocal 
        ? `${(localEndpoint || "http://localhost:11434").replace(/\/$/, "")}/v1/images/generations`
        : "https://api.openai.com/v1/images/generations";
      
      const openAiKey = req.headers["x-openai-key"] as string || "local-key";

      const headers: any = { "Content-Type": "application/json" };
      if (!isLocal) headers["Authorization"] = `Bearer ${openAiKey}`;
      
      const openaiRes = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: isLocal ? undefined : "dall-e-3",
          prompt: stylePrompt,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json"
        }),
      });

      if (!openaiRes.ok) {
        throw new Error(`Erreur génération image ${provider}: ${openaiRes.status}`);
      }

      const openaiData = await openaiRes.json();
      if (openaiData.data && openaiData.data[0] && openaiData.data[0].b64_json) {
        base64Image = `data:image/png;base64,${openaiData.data[0].b64_json}`;
      } else if (openaiData.data && openaiData.data[0] && openaiData.data[0].url) {
        base64Image = openaiData.data[0].url;
      }
    } else {
      const apiKey = req.headers["x-api-key"] as string || undefined;
      const ai = getGeminiClient(apiKey);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            { text: stylePrompt }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    }

    if (!base64Image) {
      // Fallback generator with Picsum seed if generation didn't return binary
      const randomSeed = Math.floor(Math.random() * 100000);
      base64Image = `https://picsum.photos/seed/crew_${randomSeed}/300/300`;
    }

    res.json({ imageUrl: base64Image });

  } catch (error: any) {
    console.error(`Erreur Avatar Générateur :`, error.message);
    // Silent fallback to standard avatar if offline or config issue
    const randomSeed = Math.floor(Math.random() * 100000);
    res.json({ 
      imageUrl: `https://picsum.photos/seed/crew_${randomSeed}/300/300`,
      warning: error.message || "Utilisation du fallback visuel." 
    });
  }
});

// 4.5. Generate Freeform Custom Images via gemini-3.5-flash & gemini-2.5-flash-image
app.post("/api/crews/generate-image", async (req, res) => {
  try {
    const { prompt, provider, localEndpoint } = req.body;
    let engineeredPrompt = prompt;

    // Use Gemini just to optimize the prompt (if keys available) regardless of final generator
    const geminiKey = req.headers["x-api-key"] as string || process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.length > 5) {
      try {
        const ai = getGeminiClient(geminiKey);
        const promptEngineeringQuery = `Analyse l'explication suivante d'un expert IA et rédige un prompt d'image (consigne visuelle) extrêmement précis et détaillé en anglais. Le prompt doit décrire une illustration, un graphique technique, un dessin à main levée, ou une image conceptuelle représentant au mieux le sujet pour aider l'utilisateur à visualiser. Rends-le sous forme d'une simple phrase ou paragraphe en anglais sans fioriture ni introduction ni guillemets. Sujet à illustrer : ${prompt}`;
        const promptResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: promptEngineeringQuery,
          config: {
            systemInstruction: "Tu es un spécialiste de l'analyse visuelle et de l'ingénierie de prompt pour générateurs d'images. Ton but est de concevoir un prompt visuel de haute qualité, clair, descriptif et en anglais.",
            temperature: 0.7,
          }
        });
        engineeredPrompt = promptResponse.text?.trim() || prompt;
      } catch (geminiPromptErr) {
        console.log("Could not optimize prompt via Gemini, using original", geminiPromptErr);
      }
    } else {
      engineeredPrompt = "A clean high-tech concept diagram, flat design illustration of: " + prompt;
    }

    console.log(`[Generate Image] Provider: ${provider}, Prompt: ${engineeredPrompt}`);

    let base64Image = "";

    if (provider === "OpenAI" || provider === "Local" || provider === "Ollama" || provider === "LM Studio") {
      const isLocal = provider !== "OpenAI";
      const apiUrl = isLocal 
        ? `${(localEndpoint || "http://localhost:11434").replace(/\/$/, "")}/v1/images/generations`
        : "https://api.openai.com/v1/images/generations";
      
      const openAiKey = req.headers["x-openai-key"] as string || "local-key";

      const headers: any = { "Content-Type": "application/json" };
      if (!isLocal) headers["Authorization"] = `Bearer ${openAiKey}`;
      
      const openaiRes = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: isLocal ? undefined : "dall-e-3",
          prompt: engineeredPrompt,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json"
        }),
      });

      if (!openaiRes.ok) {
        throw new Error(`Erreur génération image ${provider}: ${openaiRes.status}`);
      }

      const openaiData = await openaiRes.json();
      if (openaiData.data && openaiData.data[0] && openaiData.data[0].b64_json) {
        base64Image = `data:image/png;base64,${openaiData.data[0].b64_json}`;
      } else if (openaiData.data && openaiData.data[0] && openaiData.data[0].url) {
        // If the API somehow ignores b64_json and returns URL
        base64Image = openaiData.data[0].url;
      }
    } else {
      // DEFAULT = Gemini / Google AI Studio
      const ai = getGeminiClient(geminiKey);
      const imageResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: engineeredPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9", // A landscape aspect ratio is gorgeous for inline illustrations!
          }
        }
      });

      if (imageResponse.candidates?.[0]?.content?.parts) {
        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    }

    if (!base64Image) {
      throw new Error("No image data generated");
    }

    res.json({ imageUrl: base64Image, promptUsed: engineeredPrompt });

  } catch (error: any) {
    console.error(`Erreur Générateur d'Image Custom :`, error.message);
    const randomSeed = Math.floor(Math.random() * 100000);
    res.json({ 
      imageUrl: `https://picsum.photos/seed/concept_${randomSeed}/600/340`,
      warning: error.message || "Utilisation du fallback visuel." 
    });
  }
});

// ==========================================
// VITE OR STATIC MIDDLEWARE SETUP
// ==========================================
async function startServer() {
  // Check for Gemini API key on startup and display a friendly console box if missing
  if (!process.env.GEMINI_API_KEY) {
    console.warn("\n========================================================================");
    console.warn("⚠️  [KonceptCrew Warning] Clé GEMINI_API_KEY non détectée !");
    console.warn("------------------------------------------------------------------------");
    console.warn("Pour profiter de toute l'intelligence des experts IA en ligne (Gemini),");
    console.warn("veuillez créer un fichier `.env` à la racine du projet et y ajouter :");
    console.warn("  GEMINI_API_KEY=votre_clef_api");
    console.warn("\nEn l'absence de clé, l'application bascule automatiquement sur le");
    console.warn("simulateur local-first pour vous permettre de la tester instantanément.");
    console.warn("========================================================================\n");
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[KonceptCrew Server] En ligne sur http://localhost:${PORT}`);
  });
}

startServer();
