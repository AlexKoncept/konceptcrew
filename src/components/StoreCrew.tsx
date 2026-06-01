import React, { useState } from "react";
import { 
  Search, 
  Download, 
  Upload, 
  Star, 
  Filter, 
  Heart, 
  ShoppingBag, 
  BookOpen, 
  Plus, 
  Share2,
  FileJson,
  CheckCircle2
} from "lucide-react";
import { Persona, KnowledgePack } from "../types";
import { STORE_CATEGORIES } from "../presets";

interface StoreCrewProps {
  onImportPersona: (persona: Persona) => void;
  onAddFromStore: (persona: Persona) => void;
  availableTemplates: Persona[];
  addedPersonaIds: string[];
  isLightTheme: boolean;
  language?: any;
}

export default function StoreCrew({
  onImportPersona,
  onAddFromStore,
  availableTemplates,
  addedPersonaIds,
  isLightTheme,
}: StoreCrewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [favorites, setFavorites] = useState<string[]>(["p1", "p2"]); // default favorited templates
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle loading custom specialist JSON file
  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.name && parsed.systemPrompt) {
            onImportPersona({
              ...parsed,
              id: parsed.id || `imported-${Date.now()}`
            });
            triggerSuccess("Expert importé avec succès dans votre Crew !");
          } else {
            alert("Format JSON non valide. Le fichier doit contenir un nom et un prompt système.");
          }
        } catch (err) {
          alert("Fichier JSON corrompu ou illisible.");
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(x => x !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Export templates as shareable prompt JSON packs
  const handleJSONExport = (persona: Persona) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(persona, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `konceptcrew_persona_${persona.name.toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerSuccess(`Spécialiste "${persona.name}" exporté au format JSON.`);
  };

  // Advanced filters logic
  const filteredTemplates = availableTemplates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || t.category === selectedCategory || t.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div 
      id="store-crew-workspace"
      className="flex-1 flex flex-col h-full overflow-hidden select-none"
    >
      {/* Upper header */}
      <div className={`p-5 border-b flex flex-col gap-4 ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#090d16] border-[#1e293b]"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded">STORE DE CREW</span>
            <h1 className={`font-black text-2xl tracking-tight mt-1 mb-0.5 ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              Découvrez des Experts prêt-à-l'emploi
           </h1>
           <p className="text-xs text-slate-400">
             Optimisez votre productivité en important des configurations créées par la communauté ou d'autres utilisateurs.
           </p>
          </div>

          <div className="flex items-center gap-2">
            {/* File uploader trigger */}
            <label className="bg-[#161f38] hover:bg-[#202e52] border border-[#1e293b] text-slate-300 font-bold text-xs py-2 px-3.5 rounded-lg cursor-pointer flex items-center gap-1.5 transition">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Importer JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleJSONImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Search row and status message */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5" />
            <input
              type="text"
              placeholder="Rechercher des prompts, métiers (ex. horloger, prof, coach)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#05080c] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Categories scroll panel */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {STORE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white font-extrabold"
                  : isLightTheme ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-[#101726]/80 hover:bg-[#161f38] text-slate-400 hover:text-white border border-[#1e293b]/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Success banner if any */}
      {successMsg && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-2.5 flex items-center gap-2 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Grid Templates scroll */}
      <div className={`flex-1 overflow-y-auto p-5 scrollbar-thin ${
        isLightTheme ? "bg-slate-50/50" : "bg-[#05080c]/50"
      }`}>
        {filteredTemplates.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs gap-1.5">
            <ShoppingBag className="w-8 h-8 text-slate-600" />
            <span>Aucun modèle de spécialiste trouvé avec ces filtres.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredTemplates.map((template) => {
              const isAdded = addedPersonaIds.includes(template.id);
              const isFav = favorites.includes(template.id);
              return (
                <div
                  key={template.id}
                  id={`store-item-${template.id}`}
                  className={`p-4 rounded-xl border transition-all duration-200 relative group flex flex-col justify-between ${
                    isLightTheme
                      ? "bg-white border-slate-200 hover:shadow-md"
                      : "bg-[#090f19] border-[#1e293b] hover:border-[#2e3e5c] shadow hover:shadow-[0_0_15px_rgba(62,184,255,0.04)]"
                  }`}
                >
                  {/* Top line containing Category Badge and Favorites rating */}
                  <div className="flex items-start justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full">
                      {template.category}
                    </span>
                    <button
                      onClick={(e) => toggleFavorite(template.id, e)}
                      className={`p-1.5 rounded-full transition ${isFav ? "text-pink-500" : "text-slate-600 hover:text-white"}`}
                    >
                      <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Core display description */}
                  <div className="flex gap-3.5 my-3">
                    <img
                      src={template.avatar}
                      alt={template.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className={`font-bold text-sm truncate ${isLightTheme ? "text-slate-900" : "text-white"}`}>
                          {template.name}
                        </h3>
                        <span className="text-yellow-500 text-xs flex items-center">
                          ★ <span className="text-[10px] text-slate-400 font-bold ml-[1.5px]">4.9</span>
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-400 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  {/* Technical properties list drawer mockup (from mockup "Informations") */}
                  <div className="bg-[#05080f]/50 p-2 rounded-lg text-[10px] space-y-1 mb-4 border border-[#1e293b]/30">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rôle :</span>
                      <span className="text-slate-300 font-semibold">{template.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Moteur par défaut :</span>
                      <span className="text-cyan-400 font-bold font-mono text-[9px]">{template.engine.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Prompt optimisé :</span>
                      <span className="text-emerald-400 font-bold">Inclus & Activé</span>
                    </div>
                  </div>

                  {/* Operational actions footer */}
                  <div className="flex items-center justify-between border-t border-[#1e293b]/40 pt-3 mt-auto">
                    <button
                      onClick={() => handleJSONExport(template)}
                      className="text-slate-400 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition"
                      title="Partager cette configuration de spécialiste"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Partager JSON</span>
                    </button>

                    {isAdded ? (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                        ✓ Actif dans Crew
                      </span>
                    ) : (
                      <button
                        id={`btn-add-store-${template.id}`}
                        onClick={() => {
                          onAddFromStore(template);
                          triggerSuccess(`"${template.name}" a été ajouté avec succès à votre équipe active.`);
                        }}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-1 px-3.5 rounded-lg shadow-sm transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Recruter</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
