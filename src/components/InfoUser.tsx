import React, { useState } from "react";
import { 
  User, 
  MapPin, 
  Calendar, 
  FileText, 
  Settings2, 
  Lightbulb, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Heart,
  Save,
  Tag,
  Upload,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { UserProfile } from "../types";
import { KonceptCrewAPI } from "../services/api";

const PRESET_USER_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", // Female creative
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", // Male tech
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200", // Professional Woman
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200", // Energetic Man
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200", // Consultant Woman
];

interface InfoUserProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  isLightTheme: boolean;
  language?: any;
}

export default function InfoUser({
  userProfile,
  onUpdateProfile,
  isLightTheme,
}: InfoUserProps) {
  // Local form attributes
  const [name, setName] = useState(userProfile.name);
  const [job, setJob] = useState(userProfile.job);
  const [avatar, setAvatar] = useState(userProfile.avatar || "");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState("3D Cartoon");
  const [preferences, setPreferences] = useState(userProfile.preferences);
  const [goals, setGoals] = useState(userProfile.goals);
  const [projects, setProjects] = useState(userProfile.projects);
  const [newHobby, setNewHobby] = useState("");
  const [hobbies, setHobbies] = useState<string[]>(userProfile.hobbies);

  const [isSaved, setIsSaved] = useState(false);

  // Dynamic light/dark theme styling classes for beautiful UI
  const inputBgClass = isLightTheme 
    ? "w-full bg-[#f1f5f9] border border-slate-300 text-slate-900 rounded p-2 focus:ring-1 focus:ring-indigo-400 placeholder-slate-400 text-xs transition duration-200" 
    : "w-full bg-[#05080f] border border-[#1e293b] text-slate-200 rounded p-2 focus:ring-1 focus:ring-cyan-400 text-xs transition duration-200";

  const textareaBgClass = isLightTheme 
    ? "w-full bg-[#f1f5f9] border border-slate-300 text-slate-900 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-indigo-400 leading-normal transition duration-200" 
    : "w-full bg-[#05080f] border border-[#1e293b] text-slate-200 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-cyan-400 leading-normal transition duration-200";

  const textLabelClass = isLightTheme ? "text-slate-600 font-semibold" : "text-slate-400 font-semibold";
  const headerTextClass = isLightTheme ? "text-slate-900" : "text-white";
  const sectionTitleClass = isLightTheme ? "text-slate-500 font-extrabold" : "text-slate-400 font-extrabold";

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIUserAvatar = async () => {
    setIsGeneratingAvatar(true);
    try {
      const gImg = await KonceptCrewAPI.generateAIImage(name || "Utilisateur", job || "Expert", avatarStyle);
      if (gImg) {
        setAvatar(gImg);
      }
    } catch (e) {
      console.error("Erreur de portrait utilisateur IA", e);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleSave = () => {
    onUpdateProfile({
      ...userProfile,
      name,
      job,
      avatar,
      preferences,
      goals,
      projects,
      hobbies,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const addHobby = () => {
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      const updated = [...hobbies, newHobby.trim()];
      setHobbies(updated);
      setNewHobby("");
    }
  };

  const deleteHobby = (index: number) => {
    setHobbies(hobbies.filter((_, i) => i !== index));
  };

  const deleteFact = (id: string) => {
    onUpdateProfile({
      ...userProfile,
      discoveredFacts: userProfile.discoveredFacts.filter(f => f.id !== id),
    });
  };

  return (
    <div 
      id="profile-info-workspace"
      className="flex-1 flex flex-col h-full overflow-hidden select-none"
    >
      {/* Upper header */}
      <div className={`p-5 border-b ${
        isLightTheme ? "bg-white border-slate-200" : "bg-[#090d16] border-[#1e293b]"
      }`}>
        <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded">PROFIL UTILISATEUR</span>
        <h1 className={`font-black text-2xl tracking-tight mt-1 mb-0.5 ${isLightTheme ? "text-slate-900" : "text-white"}`}>
          Mémoire Globale & Informations
        </h1>
        <p className="text-xs text-slate-400">
          Personnalisez vos données d'arrière-plan. Les spécialistes analysent ce profil pour contextualiser leurs réponses et attitudes d'experts.
        </p>
      </div>

      {/* Main container scroll */}
      <div className={`flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin ${
        isLightTheme ? "bg-slate-50/50" : "bg-[#05080c]/50"
      }`}>
        {/* Dynamic automatic facts discovery box ("Insights automatiques") */}
        <div className={`p-4 rounded-xl border ${
          isLightTheme 
            ? "bg-indigo-50/50 border-indigo-200" 
            : "bg-[#0f1423] border-[#223555] shadow-[0_0_15px_-3px_rgba(79,70,229,0.15)]"
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
            <h3 className={`font-extrabold text-sm ${isLightTheme ? "text-indigo-950" : "text-indigo-100"}`}>
              Insights automatiques & Mémoire des Personas
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-3.5 leading-normal">
            Le système scanne vos énoncés pour mémoriser vos traits pérennes. Retrouvez ici les faits détectés par vos spécialistes locaux durant les échanges :
          </p>

          <div className="space-y-2">
            {userProfile.discoveredFacts.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">Aucun insight ou fait d'arrière-plan détecté pour le moment.</p>
            ) : (
              userProfile.discoveredFacts.map((fact) => (
                <div 
                  key={fact.id}
                  className="bg-[#05080f]/50 p-2.5 rounded-lg flex items-center justify-between border border-[#1e293b]/40 text-xs"
                >
                  <div className="space-y-1 pr-4">
                    <p className="font-medium text-slate-200 leading-normal">{fact.fact}</p>
                    <div className="flex gap-2 text-[9px] text-slate-500">
                      <span>Source: <strong className="text-cyan-400">{fact.sourcePersona}</strong></span>
                      <span>•</span>
                      <span>Enregistré le {fact.timestamp}</span>
                      <span>•</span>
                      <span className="text-pink-400 font-bold">#{fact.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFact(fact.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 transition"
                    title="Oublier ce fait"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PROFILE FORM */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Column Left (Basics & Hobbies) */}
          <div className={`p-4 rounded-xl border space-y-4 ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
          }`}>
            <h3 className={`text-xs uppercase tracking-wider border-b pb-2 ${sectionTitleClass} ${isLightTheme ? "border-slate-200" : "border-slate-800"}`}>
              Identité & Photo de Profil
            </h3>

            {/* User Avatar Customizer Block */}
            <div className="p-3 rounded-lg border flex flex-col gap-3.5 bg-slate-500/5 border-slate-500/10">
              <span className={`text-[11px] uppercase tracking-wider font-extrabold ${isLightTheme ? "text-slate-700" : "text-slate-400"}`}>Photo de profil</span>
              
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="user-avatar-uploader"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Interactive Avatar Photo with Hover Upload State */}
                <div 
                  className="relative group cursor-pointer flex-shrink-0"
                  onClick={() => document.getElementById("user-avatar-uploader")?.click()}
                  title="Cliquez pour importer votre photo"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-cyan-400 to-pink-500 p-[1.5px]">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="User avatar preview"
                        className="w-full h-full rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={`w-full h-full rounded-xl flex items-center justify-center font-bold text-lg ${
                        isLightTheme ? "bg-slate-100 text-slate-800" : "bg-slate-950 text-white"
                      }`}>
                        {name ? name.slice(0, 2).toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-x-0 inset-y-0 m-[1.5px] rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                    <Upload className="w-4 h-4 text-white animate-bounce" />
                  </div>
                  {/* Spin loader */}
                  {isGeneratingAvatar && (
                    <div className="absolute inset-0 rounded-xl bg-slate-900/80 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Sélectionnez un modèle rapide, importez une image libre, ou générez avec l'IA.
                  </span>
                  
                  {/* Preset user avatars circles */}
                  <div className="flex gap-1.5 pt-0.5">
                    {PRESET_USER_AVATARS.map((pic, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(pic)}
                        className={`w-6 h-6 rounded-full border-2 overflow-hidden hover:scale-110 active:scale-95 transition ${
                          avatar === pic ? "border-cyan-400" : "border-transparent"
                        }`}
                      >
                        <img src={pic} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar("")}
                        className="text-[9px] text-rose-400 hover:text-rose-300 font-bold ml-1"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Portrait Maker */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-500/10">
                <select
                  value={avatarStyle}
                  onChange={(e) => setAvatarStyle(e.target.value)}
                  className={`text-[10px] rounded px-1 py-0.5 ${
                    isLightTheme 
                      ? "bg-slate-100 border border-slate-300 text-slate-800" 
                      : "bg-[#050810] border border-[#1e293b] text-slate-300"
                  }`}
                >
                  <option value="3D Cartoon">3D Cartoon</option>
                  <option value="réaliste">Photoréaliste</option>
                  <option value="Anime">Style Anime</option>
                  <option value="Cyberpunk">Cyberpunk</option>
                </select>
                <button
                  type="button"
                  id="btn-ai-user-portrait-gen"
                  onClick={handleAIUserAvatar}
                  disabled={isGeneratingAvatar || !name}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-[10px] py-1 px-2.5 rounded flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  {isGeneratingAvatar ? "Portrait en création..." : "Générer mon portrait IA"}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className={`text-xs ${textLabelClass}`}>Prénom & Nom</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputBgClass}
              />
            </div>

            <div className="space-y-1.5">
              <span className={`text-xs ${textLabelClass}`}>Métier ou Occupation</span>
              <input
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                className={inputBgClass}
              />
            </div>

            {/* Hobbies Lists tags manager */}
            <div className="space-y-2">
              <span className={`text-xs block ${textLabelClass}`}>Passions & Hobbies</span>
              
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="ex. Voile, Cuisine, Horlogerie..."
                  value={newHobby}
                  onChange={(e) => setNewHobby(e.target.value)}
                  className={inputBgClass}
                />
                <button
                  type="button"
                  onClick={addHobby}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 rounded font-bold transition"
                >
                  Ajouter
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {hobbies.map((h, i) => (
                  <span 
                    key={i}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium flex items-center gap-1.5 ${
                      isLightTheme ? "bg-slate-100 text-slate-700" : "bg-[#18233f] text-slate-300"
                    }`}
                  >
                    <span>{h}</span>
                    <button
                      onClick={() => deleteHobby(i)}
                      className="text-slate-500 hover:text-rose-400 font-extrabold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Column Right (Preferences, projects) */}
          <div className={`p-4 rounded-xl border space-y-4 ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#090f19] border-[#1e293b]"
          }`}>
            <h3 className={`text-xs uppercase tracking-wider border-b pb-2 ${sectionTitleClass} ${isLightTheme ? "border-slate-200" : "border-slate-800"}`}>
              Objectifs & Préférences de réponse
            </h3>

            <div className="space-y-1.5">
              <span className={`text-xs ${textLabelClass}`}>Préférences de format</span>
              <textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                rows={4}
                placeholder="Renseignez vos formats favoris..."
                className={textareaBgClass}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs ${textLabelClass}`}>Objectifs généraux</span>
              </div>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={4}
                className={textareaBgClass}
              />
            </div>

            <div className="space-y-1.5">
              <span className={`text-xs ${textLabelClass}`}>Projets en cours d'élaboration</span>
              <input
                type="text"
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                className={inputBgClass}
              />
            </div>
          </div>

        </div>

        {/* FOOTER SAVE CHIPS */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Toutes les modifications sont immédiatement synchronisées.
          </span>
          <button
            type="button"
            id="btn-save-profile"
            onClick={handleSave}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-2 px-6 rounded-lg shadow transition flex items-center gap-1.5"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Modifications Enregistrées !</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-slate-950" />
                <span>Enregistrer mon Profil</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
