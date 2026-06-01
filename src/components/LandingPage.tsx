import React, { useState } from "react";
import { motion } from "motion/react";
// @ts-ignore
import logoImg from "../../logo.png";
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Users, 
  Star, 
  GitFork, 
  Share2, 
  Quote, 
  Hammer, 
  Dumbbell, 
  CheckCircle,
  Shield,
  Heart,
  MessageSquare
} from "lucide-react";

interface LandingPageProps {
  onClose: () => void;
  isLightTheme: boolean;
}

// Full translated copies mapping
const translations = {
  fr: {
    tagline: "Your AI Crew. Your Way.",
    description: "Une orchestration d'agents experts local-first, façonnée pour répondre précisément aux besoins concrets du quotidien des humains.",
    originLabel: "Pourquoi j'ai créé ce projet ?",
    originAuthor: "Par Alex Koncept",
    p1: "Dans l'océan de technologies qui nous entoure, l'intelligence artificielle est de plus en plus omniprésente. Cependant, elle est trop souvent déployée de manière abstraite, complexe, ou impersonnelle alors qu'elle devrait être profondément humaine et complémentaire.",
    p2: "En concevant KonceptCrew, je voulais offrir à chacun la possibilité d'avoir des spécialistes dédiés à ses côtés d'un seul clic. Car soyons honnêtes, nous avons tous besoin d'un coup de main expert pour des moments très réels :",
    homeworkTitle: "Devoirs des enfants",
    homeworkDesc: "Expliquer les fractions ou la géométrie avec douceur et pédagogie (comme notre Math Mentor niveau 6ème).",
    gymTitle: "Séances de sport",
    gymDesc: "Optimiser nos mouvements, gérer l'intensité et structurer nos entraînements physiques de façon scientifique.",
    bricoTitle: "Bricolage à domicile",
    bricoDesc: "Résoudre des notices de meubles incompréhensibles sans crise de nerfs, grâce à des explications étape par étape claires.",
    quoteText: "« L'IA ne remplacera jamais l'humain, mais elle doit s'intégrer harmonieusement dans les petits et grands défis de notre quotidien. Mon but est de vous donner la maîtrise totale d'une équipe d'élite d'assistants dévoués. »",
    quoteAuthor: "— Alex Koncept",
    capabilitiesLabel: "🚀 COMMANDES AVANCÉES",
    capabilitiesTitle: "Capacités & Fonctionnalités Clés",
    capFavTitle: "Favoris & Équipage",
    capFavDesc: "Épinglez vos spécialistes d'un clic au sommet de votre barre latérale pour réagir instantanément. Un accès fluide et local-first préservant vos historiques.",
    capVocalTitle: "Spectre Vocal en Direct",
    capVocalDesc: "Un tableau de bord audio immersif doté d'une double simulation d'analyseur de spectre en temps réel pour l'écoute et l'interaction réciproque.",
    capRagTitle: "RAG (Connaissances Privées)",
    capRagDesc: "Associez des packs de connaissances spécifiques (manuels, PDF, documents) pour spécialiser et instruire votre IA sur un domaine ultra précis.",
    capMdTitle: "Compte-Rendu Markdown",
    capMdDesc: "Exportez instantanément l'intégralité d'un échange avec votre expert IA sous la forme d'un magnifique fichier scientifique structuré Markdown (.md) d'un clic.",
    capSecTitle: "Sécurité & Budget d'API",
    capSecDesc: "Suivez et limitez vos dépenses d'API mensuelles. Toutes vos données d'échanges restent locales et ne transitent par aucun serveur tiers.",
    capAvatarTitle: "Avatars & Vision",
    capAvatarDesc: "Créez vos avatars ou illustrez vos discussions via requêtes multi-API : compatible Imagen (Google), DALL-E (OpenAI) ou en Local (Ollama) sans effort.",
    resourcesPre: "DOCUMENTATION ASSISTÉE",
    resourcesTitle: "Espace Ressources (NotebookLM)",
    badgeImage: "Infographie PNG",
    badgeAudio: "Briefing Audio m4a",
    badgeVideo: "Vidéo MP4",
    badgePdf: "Document PDF",
    infoTitle: "Synthèse Visuelle",
    infoDesc: "Une représentation infographique claire pour appréhender l'ensemble de l'écosystème KonceptCrew en un coup d'œil.",
    audioTitle: "Podcast d'Orchestration",
    audioDesc: "Écoutez le briefing immersif généré par NotebookLM expliquant le rôle de chaque expert et la philosophie du projet.",
    videoTitle: "Démonstration Animée",
    videoDesc: "Découvrez l'interface dynamique en action, les spectres vocaux et le comportement réactif de l'équipage.",
    pdfTitle: "Guide & Concept Paper",
    pdfDesc: "Consultez le document de référence de 12 pages décrivant l'architecture technique, les prompts clés et la gestion locale.",
    btnDownload: "Télécharger",
    btnView: "Ouvrir",
    instPre: "GUIDE TECHNIQUE",
    instTitle: "Installation & Mise en ligne",
    localStep1Title: "Récupérer le Code Source",
    localStep1Desc: "Téléchargez le projet au format ZIP ou clonez le dépôt GitHub sur votre ordinateur. Naviguez dans le dossier extrait.",
    localStep2Title: "Installer les Dépendances",
    localStep2Desc: "Ouvrez votre terminal et exécutez la commande suivante pour télécharger les packages requis (React, Express, Google GenAI, etc.).",
    localStep3Title: "Configuration de la clé API",
    localStep3Desc: "Créez un fichier nommé .env à la racine du projet et placez-y votre clé d'API personnelle obtenue sur Google AI Studio.",
    localStep4Title: "Lancer en mode Développement",
    localStep4Desc: "Démarrez le serveur local pour exécuter l'interface et le pont d'API Express sécurisé de manière simultanée. L'application est disponible sur le port indiqué.",
    cloudStep1Title: "Pourquoi un hébergement Node.js ?",
    cloudStep1Desc: "KonceptCrew n'est pas un simple site statique client. Il comprend un serveur de sécurité (server.ts) pour protéger vos identifiants d'API Google. Les hébergements traditionnels statiques ne suffiront pas : Render.com ou Railway.app sont idéaux.",
    cloudStep2Title: "Exportation GitHub",
    cloudStep2Desc: "Dans Google AI Studio, cliquez sur le bouton de configuration ou d'exportation en haut à droite, puis sélectionnez 'Export to GitHub' ou importez le ZIP sur votre compte GitHub.",
    cloudStep3Title: "Déploiement sur Render (Recommandé)",
    cloudStep3Desc: "Créez un compte sur Render.com, créez un nouveau 'Web Service' et connectez le dépôt GitHub de KonceptCrew. Définissez la commande de build sur 'npm run build' et start sur 'npm run start'.",
    cloudStep4Title: "Variables d'Environnement",
    cloudStep4Desc: "Dans les paramètres ('Environment') du service Render, ajoutez la clé obligatoire pour permettre aux experts IA de répondre en toute sécurité.",
    hybridStep1Title: "Concept du déploiement scindé",
    hybridStep1Desc: "Vous pouvez préférer utiliser Netlify pour la rapidité de chargement de l'interface en l'hébergeant comme une SPA (Single Page Application) et déléguer la partie calcul IA à un serveur tiers ou des serveurs sans état (Serverless).",
    hybridStep2Title: "Déployer le Frontend sur Netlify",
    hybridStep2Desc: "Connectez votre projet GitHub sur Netlify. Réglez la commande de compilation sur 'npm run build' et le dossier de publication sur le répertoire de sortie de Vite : 'dist/'.",
    hybridStep3Title: "Configuration du Serveur API d'Appui",
    hybridStep3Desc: "Pour que l'IA fonctionne, vous devez héberger la partie Express séparément (ex. sur Render) et mettre à jour l'URL cible de vos appels API dans le code React client (ex: remplacer /api par l'URL de votre serveur Render).",
    futureLabel: "🔮 LE FUTUR : BIBLIOTHÈQUE VIVANTE",
    futureTitle: "L'évolution vers une communauté d'élite partagée",
    futureDesc: "KonceptCrew a vocation à ne pas rester fermé. Dans les prochaines versions, nous pourrions construire un écosystème d'entraide beaucoup plus communautaire et centralisé entre les utilisateurs :",
    p1Title: "Publier son expert",
    p1Desc: "Partager instantanément vos configurations de spécialistes et vos meilleures prompts IA avec les autres membres.",
    p2Title: "Suivre des créateurs",
    p2Desc: "S’abonner aux concepteurs d’équipes IA les plus ingénieux et recevoir leurs nouvelles créations d’experts.",
    p3Title: "Noter les Crews",
    p3Desc: "Attribuer des évaluations, laisser des avis constructifs et hisser les meilleurs spécialistes au sommet du classement général.",
    p4Title: "Cloner & Remixer",
    p4Desc: "Importer un expert existant en un clic, modifier ses directives pour l'adapter parfaitement à votre usage professionnel.",
    p5Title: "Partager des Packs",
    p5Desc: "Échanger des bibliothèques de fichiers de connaissances privées de grande valeur pour instruire n'importe quel robot et notre quotidien.",
    ctaTitle: "Prêt à orchestrer votre équipe IA d'élite ?",
    ctaSub: "Toutes les fonctionnalités sont actives et n'attendent que votre imagination !",
    ctaBtn: "Retourner au Crew"
  },
  en: {
    tagline: "Your AI Crew. Your Way.",
    description: "A local-first orchestration of expert agents, custom-tailored to solve humans' real and practical daily challenges.",
    originLabel: "Why did I create this project?",
    originAuthor: "By Alex Koncept",
    p1: "In the vast tech landscape surrounding us, artificial intelligence is increasingly omnipresent. Yet, it is too often deployed in abstract, complex, or impersonal ways, when it should instead be deeply human and complementary.",
    p2: "By building KonceptCrew, my goal was to offer everyone the ability to summon dedicated specialists at their fingertips. Because let's be honest, we all need expert assistance for very real everyday tasks:",
    homeworkTitle: "Children's Homework",
    homeworkDesc: "Explaining fractions or geometry with kindness and clarity (just like our Grade-6 level Math Mentor).",
    gymTitle: "Workout Sessions",
    gymDesc: "Optimizing our movements, pacing intensity, and structuring physical training routines scientifically.",
    bricoTitle: "Home D.I.Y.",
    bricoDesc: "Deciphering confusing assembly manuals stress-free, relying on simple step-by-step guidance.",
    quoteText: "“AI will never replace humans, but it must blend harmoniously with our daily micro and macro challenges. My mission is to put you in full control of an elite army of devoted assistants.”",
    quoteAuthor: "— Alex Koncept",
    capabilitiesLabel: "🚀 ADVANCED CONTROLS",
    capabilitiesTitle: "Core Capabilities & Key Features",
    capFavTitle: "Favorites & Crew listing",
    capFavDesc: "Pin your favorite specialists with a click at the top of your sidebar for instant reaction. Local-first retrieval that saves context histories.",
    capVocalTitle: "Live Audio Waves",
    capVocalDesc: "An immersive voice interface equipped with dual simulated real-time spectrum analyzers to mimic bidirectional hearing.",
    capRagTitle: "RAG Knowledge Packs",
    capRagDesc: "Directly attach custom documents (PDF, manuals, sheets) to train and instruct your agents on specialized private subjects.",
    capMdTitle: "Scientific Markdown Export",
    capMdDesc: "Instantly download a complete summary of your workspace exchange formatted as a clean Markdown (.md) paper with a single click.",
    capSecTitle: "Secured Budgets & Storage",
    capSecDesc: "Stay safe by tracking monthly simulation costs. All your keys and chats are kept in private local storage and never leak.",
    capAvatarTitle: "Avatars & Vision",
    capAvatarDesc: "Effortlessly generate avatars or illustrate chats using our multi-API image generation. Compatible with Google, OpenAI, or Local Ollama.",
    resourcesPre: "ASSISTED DOCUMENTATION",
    resourcesTitle: "Resource Hub (NotebookLM)",
    badgeImage: "Infographic PNG",
    badgeAudio: "Audio Briefing m4a",
    badgeVideo: "Video MP4",
    badgePdf: "PDF Document",
    infoTitle: "Visual Overview",
    infoDesc: "A clean infographic diagram to capture the entire KonceptCrew ecosystem at a single glance.",
    audioTitle: "Orchestration Podcast",
    audioDesc: "Listen to the immersive briefing generated by NotebookLM explaining the role of each expert and the overall vision.",
    videoTitle: "Animated Demonstration",
    videoDesc: "Discover the dynamic interface in action, live speech spectrums, and the crew's responsive behavior.",
    pdfTitle: "Guide & Concept Paper",
    pdfDesc: "Consult the 12-page reference paper describing the technical architecture, core instructions, and local workflow.",
    btnDownload: "Download",
    btnView: "Open",
    instPre: "TECHNICAL GUIDE",
    instTitle: "Installation & Hosting",
    localStep1Title: "Retrieve Source Code",
    localStep1Desc: "Download the project as a ZIP archive or clone the GitHub repository. Navigate into the project folder.",
    localStep2Title: "Install Project Dependencies",
    localStep2Desc: "Open your console and run the command to download all required packages (React, Express, Google GenAI, etc.).",
    localStep3Title: "Set up the API Key",
    localStep3Desc: "Create a file named .env at the root of the project and insert your personal API key obtained from Google AI Studio.",
    localStep4Title: "Run Development Server",
    localStep4Desc: "Start the local development server to run both the frontend interface and the secure Express API bridge. Accessible via the output port.",
    cloudStep1Title: "Why Node.js Hosting?",
    cloudStep1Desc: "KonceptCrew is not a simple static client site. It includes a backend security server (server.ts) to protect your Google API keys. Classic static hostings won't work: Render.com or Railway.app are recommended.",
    cloudStep2Title: "Export to GitHub",
    cloudStep2Desc: "In Google AI Studio, click the parameters button on the top-right, choose 'Export to GitHub' or upload the ZIP archive to your GitHub account.",
    cloudStep3Title: "Deploy on Render (Recommended)",
    cloudStep3Desc: "Register a free account on Render.com, create a new 'Web Service', and link the KonceptCrew repository. Set Build command to 'npm run build' and Start command to 'npm run start'.",
    cloudStep4Title: "Environment Variables",
    cloudStep4Desc: "In the service's 'Environment' settings panel, add the mandatory API key value to enable secured agent communication.",
    hybridStep1Title: "Split Architecture Concept",
    hybridStep1Desc: "You can host the React frontend app statically on Netlify for ultimate page load speeds, and delegate the AI operations to a separated server or stateless functions.",
    hybridStep2Title: "Host Frontend on Netlify",
    hybridStep2Desc: "Link your GitHub repository to Netlify. Set the build command to 'npm run build' and specify the output folder to Vite's output: 'dist/'.",
    hybridStep3Title: "Configure API Support Server",
    hybridStep3Desc: "For the AI features to respond, host the Express app separately (e.g. on Render) and update the base target URL in your React client queries (e.g. swap /api to your Render server URL).",
    futureLabel: "🔮 THE ROADMAP",
    futureTitle: "Community Sharing & Collaborations",
    futureDesc: "KonceptCrew will not remain disconnected. In upcoming releases, we could build a repository and a much more community-driven, centralized system between users:",
    p1Title: "Publish Experts",
    p1Desc: "Instantly deploy your custom configurations and system prompts to the centralized public library.",
    p2Title: "Follow Creators",
    p2Desc: "Subscribe to the most ingenious crew engineers and get notified whenever they craft a new specialist.",
    p3Title: "Rank & Rate Crews",
    p3Desc: "Upvote top-performing profiles, write helpful feedback, and push the best crews to the global leaderboard.",
    p4Title: "Clone & Remix",
    p4Desc: "Import any listed assistant with a click, tweak their personality, and remix it for your personal use-case.",
    p5Title: "Share Knowledge Packs",
    p5Desc: "Exchange curated libraries of private expert reference texts to train and instruct any bot and our daily life.",
    ctaTitle: "Ready to orchestrate your elite AI squad?",
    ctaSub: "All premium modules are fully armed and ready for your creativity!",
    ctaBtn: "Back to the Crew"
  }
};

export default function LandingPage({ onClose, isLightTheme }: LandingPageProps) {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [installTab, setInstallTab] = useState<"local" | "cloud" | "hybrid">("local");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const t = translations[lang];

  const handleCopyCode = (text: string, e: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(text);
    const target = e.currentTarget;
    const original = target.innerText;
    target.innerText = lang === "fr" ? "Copié !" : "Copied!";
    target.classList.add("bg-emerald-500", "text-white");
    setTimeout(() => {
      target.innerText = original;
      target.classList.remove("bg-emerald-500", "text-white");
    }, 2000);
  };


  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 md:p-8 backdrop-blur-xl animate-fade-in ${
      isLightTheme 
        ? "bg-slate-900/60" 
        : "bg-black/80"
    }`}>
      {/* Container main layout */}
      <div className={`relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border transition duration-300 flex flex-col my-auto ${
        isLightTheme 
          ? "bg-white/95 border-slate-200 text-slate-800" 
          : "bg-[#0c1221]/95 border-indigo-950/40 text-slate-100"
      }`}>
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Top Bar (Controls like language flag) */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10 select-none">
          <button
            type="button"
            onClick={() => setLang("fr")}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border transition ${
              lang === "fr" 
                ? "bg-gradient-to-r from-[#5969F3] to-[#7d51f7] text-white border-transparent shadow-xs" 
                : isLightTheme 
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200" 
                  : "bg-indigo-950/40 hover:bg-indigo-900/40 text-slate-400 border-indigo-900/30"
            }`}
          >
            🇫🇷 FR
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border transition ${
              lang === "en" 
                ? "bg-gradient-to-r from-[#5969F3] to-[#7d51f7] text-white border-transparent shadow-xs" 
                : isLightTheme 
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200" 
                  : "bg-indigo-950/40 hover:bg-indigo-900/40 text-slate-400 border-indigo-900/30"
            }`}
          >
            🇬🇧 EN
          </button>
        </div>

        {/* Floating Close Button */}
        <button
          onClick={onClose}
          id="btn-landing-back"
          className={`absolute top-4 right-4 p-2.5 rounded-full z-10 transition duration-150 ${
            isLightTheme 
              ? "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900" 
              : "bg-indigo-950/40 hover:bg-indigo-900/40 text-slate-400 hover:text-white"
          }`}
          title="Fermer la présentation"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Section Banner */}
        <div className={`p-8 md:p-12 relative flex flex-col items-center text-center border-b pt-16 md:pt-20 ${
          isLightTheme ? "border-slate-100" : "border-indigo-950/30"
        }`}>
          
          {/* Prominent centered logo showcasing Alex's logo.png */}
          <div className="relative mb-8 flex flex-col items-center justify-center">
            <motion.img 
              src={logoImg} 
              alt="KonceptCrew Logo" 
              className="w-72 h-72 md:w-80 md:h-80 object-contain relative z-10 filter drop-shadow-[0_16px_32px_rgba(89,105,243,0.32)] cursor-pointer"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              animate={{
                y: [0, -16, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ 
                scale: 1.04,
                transition: { duration: 0.3 }
              }}
            />

            {/* Pulsing ring background glow */}
            <div className="absolute w-80 h-80 md:w-96 md:h-96 border border-indigo-500/15 rounded-full animate-ping pointer-events-none opacity-20" />
          </div>

          <p className="text-xs md:text-sm font-extrabold tracking-widest text-[#5969F3] uppercase mt-4">
            {t.tagline}
          </p>
          <p className={`text-base md:text-lg max-w-2xl mt-4 font-light ${
            isLightTheme ? "text-slate-600" : "text-slate-300"
          }`}>
            {t.description}
          </p>

          <div className="flex flex-wrap gap-2.5 mt-6 justify-center">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-3 p-1.5 bg-indigo-500/10 text-[#5969F3] rounded-full font-bold border border-indigo-500/10">
              ⚡ Local-First
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-3 p-1.5 bg-pink-500/10 text-pink-500 rounded-full font-bold border border-pink-500/10">
              🎙️ Live Audio Waves
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-3 p-1.5 bg-cyan-500/10 text-cyan-500 rounded-full font-bold border border-cyan-500/10">
              📚 RAG & Expériences
            </span>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-6 md:p-10 space-y-12">
          
          {/* Section 1: The Origin Story / Histoire d'Alex Koncept */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Written block */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-widest">
                  {t.originLabel}
                </h2>
              </div>

              <div className={`space-y-3.5 text-sm md:text-base leading-relaxed ${
                isLightTheme ? "text-slate-600" : "text-slate-300"
              }`}>
                <p>{t.p1}</p>
                <p>{t.p2}</p>
              </div>
            </div>

            {/* Visual examples cards array */}
            <div className="md:col-span-5 space-y-3">
              {/* Card 1: Math Homework */}
              <div className={`p-4 rounded-2xl border transition hover:translate-x-1 ${
                isLightTheme ? "bg-slate-50/80 border-slate-200" : "bg-indigo-950/20 border-indigo-900/30"
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-500 font-extrabold mt-0.5">
                    📐
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">{t.homeworkTitle}</h3>
                    <p className={`text-xs mt-1 ${isLightTheme ? "text-slate-600" : "text-slate-300"}`}>
                      {t.homeworkDesc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Gym Session */}
              <div className={`p-4 rounded-2xl border transition hover:translate-x-1 ${
                isLightTheme ? "bg-slate-50/80 border-slate-200" : "bg-indigo-950/20 border-indigo-900/30"
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-pink-500/15 text-pink-500 mt-0.5">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">{t.gymTitle}</h3>
                    <p className={`text-xs mt-1 ${isLightTheme ? "text-slate-600" : "text-slate-300"}`}>
                      {t.gymDesc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Furniture Assembly */}
              <div className={`p-4 rounded-2xl border transition hover:translate-x-1 ${
                isLightTheme ? "bg-slate-50/80 border-slate-200" : "bg-indigo-950/20 border-indigo-900/30"
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 mt-0.5">
                    <span className="text-xs font-bold">🔨</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">{t.bricoTitle}</h3>
                    <p className={`text-xs mt-1 ${isLightTheme ? "text-slate-600" : "text-slate-300"}`}>
                      {t.bricoDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Core Philosophie Interlude block quote with corrected author labels */}
          <div className={`p-6 md:p-8 rounded-3xl border text-center relative overflow-hidden ${
            isLightTheme 
              ? "bg-[#fbfcfd] border-slate-200/60 text-slate-700" 
              : "bg-[#0f172a] border-indigo-950/40 text-slate-200"
          }`}>
            <Quote className="w-12 h-12 text-[#5969F3]/15 mx-auto mb-3" />
            <p className="text-sm md:text-base italic font-serif leading-relaxed">
              {t.quoteText}
            </p>
            <p className="text-xs uppercase tracking-widest font-black text-[#7d51f7] mt-3">
              {t.quoteAuthor}
            </p>
          </div>

          {/* Section 2: Current Capabilities & Functionalities (Ce qui est disponible) */}
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-[10px] text-[#5969F3] font-black uppercase tracking-widest bg-[#5969F3]/10 px-3 py-1 rounded-full border border-indigo-500/10">
                {t.capabilitiesLabel}
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold mt-2 tracking-tight">
                {t.capabilitiesTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className={`p-5 rounded-2xl border ${
                isLightTheme ? "bg-white border-slate-100 shadow-3xs" : "bg-[#111827]/40 border-indigo-950/30"
              }`}>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-[#5969F3] flex items-center justify-center mb-3">
                  <Star className="w-4 h-4 fill-indigo-500/30" />
                </div>
                <h3 className="text-sm font-bold">{t.capFavTitle}</h3>
                <p className={`text-xs mt-1.5 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
                  {t.capFavDesc}
                </p>
              </div>

              <div className={`p-5 rounded-2xl border ${
                isLightTheme ? "bg-white border-slate-100 shadow-3xs" : "bg-[#111827]/40 border-indigo-950/30"
              }`}>
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center mb-3">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">{t.capVocalTitle}</h3>
                <p className={`text-xs mt-1.5 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
                  {t.capVocalDesc}
                </p>
              </div>

              <div className={`p-5 rounded-2xl border ${
                isLightTheme ? "bg-white border-slate-100 shadow-3xs" : "bg-[#111827]/40 border-indigo-950/30"
              }`}>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">{t.capRagTitle}</h3>
                <p className={`text-xs mt-1.5 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
                  {t.capRagDesc}
                </p>
              </div>

              <div className={`p-5 rounded-2xl border ${
                isLightTheme ? "bg-white border-slate-100 shadow-3xs" : "bg-[#111827]/40 border-indigo-950/30"
              }`}>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                  <span className="text-sm font-bold">📁</span>
                </div>
                <h3 className="text-sm font-bold">{t.capMdTitle}</h3>
                <p className={`text-xs mt-1.5 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
                  {t.capMdDesc}
                </p>
              </div>

              <div className={`p-5 rounded-2xl border ${
                isLightTheme ? "bg-white border-slate-100 shadow-3xs" : "bg-[#111827]/40 border-indigo-950/30"
              }`}>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">{t.capSecTitle}</h3>
                <p className={`text-xs mt-1.5 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
                  {t.capSecDesc}
                </p>
              </div>

              <div className={`p-5 rounded-2xl border ${
                isLightTheme ? "bg-white border-slate-100 shadow-3xs" : "bg-[#111827]/40 border-indigo-950/30"
              }`}>
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center mb-3">
                  <span className="text-sm font-bold">🎨</span>
                </div>
                <h3 className="text-sm font-bold">{t.capAvatarTitle}</h3>
                <p className={`text-xs mt-1.5 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
                  {t.capAvatarDesc}
                </p>
              </div>

            </div>
          </div>

          {/* Section 3: Resources Hub (NotebookLM) */}
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <span className="text-[10px] text-purple-500 font-black uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/10">
                {t.resourcesPre}
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold mt-2 tracking-tight">
                {t.resourcesTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Infography */}
              <div className={`p-5 rounded-2xl border flex flex-col ${
                isLightTheme ? "bg-white border-slate-100 shadow-3xs" : "bg-slate-800/40 border-slate-700/50"
              }`}>
                <span className="self-start px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 rounded-md mb-4 flex items-center gap-1.5">
                  🖼️ {t.badgeImage}
                </span>
                <h3 className="text-sm font-bold mb-2">{t.infoTitle}</h3>
                <p className={`text-xs flex-grow mb-4 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
                  {t.infoDesc}
                </p>
                <div 
                  className="w-full h-36 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden cursor-pointer relative group flex items-center justify-center mb-4"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img src={`NotebookLM/${lang.toUpperCase()}/Infographie.png`} alt="Infography" className="w-full h-full object-cover transition-transform group-hover:scale-105 opacity-80" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-3xl">🔍</div>
                </div>
                <a href={`NotebookLM/${lang.toUpperCase()}/Infographie.png`} download className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-center rounded-lg transition">
                  {t.btnDownload} (PNG)
                </a>
              </div>

              {/* Audio Briefing */}
              <div className={`p-5 rounded-2xl border flex flex-col ${
                isLightTheme ? "bg-white border-slate-100 shadow-3xs" : "bg-slate-800/40 border-slate-700/50"
              }`}>
                 <span className="self-start px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pink-500/10 text-pink-500 rounded-md mb-4 flex items-center gap-1.5">
                  🎙️ {t.badgeAudio}
                </span>
                <h3 className="text-sm font-bold mb-2">{t.audioTitle}</h3>
                <p className={`text-xs flex-grow mb-4 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
                  {t.audioDesc}
                </p>
                <div className="mb-4">
                  <audio controls className="w-full" src={`NotebookLM/${lang.toUpperCase()}/Audio.m4a`} />
                </div>
                <a href={`NotebookLM/${lang.toUpperCase()}/Audio.m4a`} download className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-center rounded-lg transition mt-auto">
                  {t.btnDownload} (M4A)
                </a>
              </div>

              {/* Video Presentation */}
              <div className={`p-5 rounded-2xl border flex flex-col ${
                isLightTheme ? "bg-white border-slate-100 shadow-3xs" : "bg-slate-800/40 border-slate-700/50"
              }`}>
                <span className="self-start px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 rounded-md mb-4 flex items-center gap-1.5">
                  🎬 {t.badgeVideo}
                </span>
                <h3 className="text-sm font-bold mb-2">{t.videoTitle}</h3>
                <p className={`text-xs flex-grow mb-4 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
                  {t.videoDesc}
                </p>
                <div className="w-full aspect-video bg-black border border-slate-700 rounded-lg overflow-hidden mb-4">
                  <video controls className="w-full h-full object-cover">
                    <source src={`NotebookLM/${lang.toUpperCase()}/Video.mp4`} type="video/mp4" />
                  </video>
                </div>
                <a href={`NotebookLM/${lang.toUpperCase()}/Video.mp4`} download className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-center rounded-lg transition mt-auto">
                  {t.btnDownload} (MP4)
                </a>
              </div>

              {/* PDF Manual */}
              <div className={`p-5 rounded-2xl border flex flex-col ${
                isLightTheme ? "bg-white border-slate-100 shadow-3xs" : "bg-slate-800/40 border-slate-700/50"
              }`}>
                <span className="self-start px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 rounded-md mb-4 flex items-center gap-1.5">
                  📄 {t.badgePdf}
                </span>
                <h3 className="text-sm font-bold mb-2">{t.pdfTitle}</h3>
                <p className={`text-xs flex-grow mb-4 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
                  {t.pdfDesc}
                </p>
                <div className={`w-full h-24 border border-dashed rounded-lg flex flex-col items-center justify-center mb-4 transition ${
                  isLightTheme ? "bg-slate-50 border-slate-300" : "bg-slate-800 border-slate-600"
                }`}>
                  <span className="text-3xl mb-1">📄</span>
                  <span className="text-[10px] font-bold opacity-50">NotebookLM_Paper.pdf</span>
                </div>
                <div className="flex gap-2 w-full mt-auto">
                  <a href={`NotebookLM/${lang.toUpperCase()}/PDF.pdf`} target="_blank" rel="noreferrer" className="flex-1 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 text-xs font-bold text-center rounded-lg transition">
                    {t.btnView}
                  </a>
                  <a href={`NotebookLM/${lang.toUpperCase()}/PDF.pdf`} download className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-center rounded-lg transition">
                    {t.btnDownload} (PDF)
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Section 4: Installation Guide */}
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/10">
                {t.instPre}
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold mt-2 tracking-tight">
                {t.instTitle}
              </h2>
            </div>

            <div className="flex justify-center gap-2 mb-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setInstallTab("local")}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-t-lg transition border-b-2 ${
                  installTab === "local" ? "text-indigo-500 border-indigo-500" : "text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                💻 Local Dev
              </button>
              <button
                onClick={() => setInstallTab("cloud")}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-t-lg transition border-b-2 ${
                  installTab === "cloud" ? "text-indigo-500 border-indigo-500" : "text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                🚀 Cloud Node
              </button>
              <button
                onClick={() => setInstallTab("hybrid")}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-t-lg transition border-b-2 ${
                  installTab === "hybrid" ? "text-indigo-500 border-indigo-500" : "text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                🕸️ Hybride
              </button>
            </div>

            <div className={`space-y-4 animate-fade-in ${installTab === "local" ? "block" : "hidden"}`}>
              <div className={`p-5 border rounded-2xl ${isLightTheme ? "bg-slate-50" : "bg-slate-800/40"}`}>
                <div className="flex gap-4">
                  <div className="text-xl font-black text-indigo-500/50">1</div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold mb-1">{t.localStep1Title}</h4>
                    <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>{t.localStep1Desc}</p>
                  </div>
                </div>
              </div>
              <div className={`p-5 border rounded-2xl ${isLightTheme ? "bg-slate-50" : "bg-slate-800/40"}`}>
                <div className="flex gap-4">
                  <div className="text-xl font-black text-indigo-500/50">2</div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold mb-1">{t.localStep2Title}</h4>
                    <p className={`text-xs mb-3 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>{t.localStep2Desc}</p>
                    <div className="relative group">
                      <div className="bg-slate-900 text-slate-300 font-mono text-xs p-3 rounded-lg overflow-x-auto">npm install</div>
                      <button onClick={(e) => handleCopyCode("npm install", e)} className="absolute top-2 right-2 px-2 py-1 bg-white/10 hover:bg-white/20 text-xs rounded transition opacity-0 group-hover:opacity-100">Copier</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`p-5 border rounded-2xl ${isLightTheme ? "bg-slate-50" : "bg-slate-800/40"}`}>
                <div className="flex gap-4">
                  <div className="text-xl font-black text-indigo-500/50">3</div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold mb-1">{t.localStep3Title}</h4>
                    <p className={`text-xs mb-3 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>{t.localStep3Desc}</p>
                    <div className="relative group">
                      <div className="bg-slate-900 text-slate-300 font-mono text-xs p-3 rounded-lg overflow-x-auto">GEMINI_API_KEY=votre_cle_api_ici</div>
                      <button onClick={(e) => handleCopyCode("GEMINI_API_KEY=votre_cle_api_ici", e)} className="absolute top-2 right-2 px-2 py-1 bg-white/10 hover:bg-white/20 text-xs rounded transition opacity-0 group-hover:opacity-100">Copier</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`p-5 border rounded-2xl ${isLightTheme ? "bg-slate-50" : "bg-slate-800/40"}`}>
                <div className="flex gap-4">
                  <div className="text-xl font-black text-indigo-500/50">4</div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold mb-1">{t.localStep4Title}</h4>
                    <p className={`text-xs mb-3 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>{t.localStep4Desc}</p>
                    <div className="relative group">
                      <div className="bg-slate-900 text-slate-300 font-mono text-xs p-3 rounded-lg overflow-x-auto">npm run dev</div>
                      <button onClick={(e) => handleCopyCode("npm run dev", e)} className="absolute top-2 right-2 px-2 py-1 bg-white/10 hover:bg-white/20 text-xs rounded transition opacity-0 group-hover:opacity-100">Copier</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`space-y-4 animate-fade-in ${installTab === "cloud" ? "block" : "hidden"}`}>
               <div className={`p-5 border rounded-2xl ${isLightTheme ? "bg-slate-50" : "bg-slate-800/40"}`}>
                <div className="flex gap-4">
                  <div className="text-xl font-black text-indigo-500/50">1</div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold mb-1">{t.cloudStep1Title}</h4>
                    <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>{t.cloudStep1Desc}</p>
                  </div>
                </div>
              </div>
              <div className={`p-5 border rounded-2xl ${isLightTheme ? "bg-slate-50" : "bg-slate-800/40"}`}>
                <div className="flex gap-4">
                  <div className="text-xl font-black text-indigo-500/50">2</div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold mb-1">{t.cloudStep2Title}</h4>
                    <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>{t.cloudStep2Desc}</p>
                  </div>
                </div>
              </div>
              <div className={`p-5 border rounded-2xl ${isLightTheme ? "bg-slate-50" : "bg-slate-800/40"}`}>
                <div className="flex gap-4">
                  <div className="text-xl font-black text-indigo-500/50">3</div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold mb-1">{t.cloudStep3Title}</h4>
                    <p className={`text-xs mb-3 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>{t.cloudStep3Desc}</p>
                    <div className="bg-slate-900 text-slate-300 font-mono text-xs p-3 rounded-lg">
                      <div>🔧 Build Command: npm run build</div>
                      <div className="mt-1">🚀 Start Command: npm run start</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`p-5 border rounded-2xl ${isLightTheme ? "bg-slate-50" : "bg-slate-800/40"}`}>
                <div className="flex gap-4">
                  <div className="text-xl font-black text-indigo-500/50">4</div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold mb-1">{t.cloudStep4Title}</h4>
                    <p className={`text-xs mb-3 ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>{t.cloudStep4Desc}</p>
                    <div className="relative group">
                      <div className="bg-slate-900 text-slate-300 font-mono text-xs p-3 rounded-lg overflow-x-auto">Key: GEMINI_API_KEY  |  Value: [Votre_Cle_API_AI_Studio]</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`space-y-4 animate-fade-in ${installTab === "hybrid" ? "block" : "hidden"}`}>
              <div className={`p-5 border rounded-2xl ${isLightTheme ? "bg-slate-50" : "bg-slate-800/40"}`}>
                <div className="flex gap-4">
                  <div className="text-xl font-black text-indigo-500/50">1</div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold mb-1">{t.hybridStep1Title}</h4>
                    <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>{t.hybridStep1Desc}</p>
                  </div>
                </div>
              </div>
              <div className={`p-5 border rounded-2xl ${isLightTheme ? "bg-slate-50" : "bg-slate-800/40"}`}>
                <div className="flex gap-4">
                  <div className="text-xl font-black text-indigo-500/50">2</div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold mb-1">{t.hybridStep2Title}</h4>
                    <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>{t.hybridStep2Desc}</p>
                  </div>
                </div>
              </div>
              <div className={`p-5 border rounded-2xl ${isLightTheme ? "bg-slate-50" : "bg-slate-800/40"}`}>
                <div className="flex gap-4">
                  <div className="text-xl font-black text-indigo-500/50">3</div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold mb-1">{t.hybridStep3Title}</h4>
                    <p className={`text-xs ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>{t.hybridStep3Desc}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Section 5: The Roadmap of the Future / Aspect communautaire */}
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <span className="text-[10px] text-[#ec4899] font-black uppercase tracking-widest bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/10">
                {t.futureLabel}
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold mt-2 tracking-tight">
                {t.futureTitle}
              </h2>
              <p className={`text-sm mt-3 max-w-xl mx-auto leading-relaxed ${isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
                {t.futureDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 pt-2">
              
              {/* Pillar 1: Publier */}
              <div className={`p-4 rounded-2xl border text-center transition duration-200 hover:-translate-y-1 ${
                isLightTheme 
                  ? "bg-slate-50/70 border-slate-200 hover:bg-slate-50 hover:shadow-2xs" 
                  : "bg-indigo-950/15 border-indigo-900/20 hover:bg-indigo-950/30"
              }`}>
                <div className="w-10 h-10 rounded-full bg-[#5969F3]/15 text-[#5969F3] flex items-center justify-center mx-auto mb-3.5 shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-extrabold uppercase tracking-wide">{t.p1Title}</h4>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                  {t.p1Desc}
                </p>
              </div>

              {/* Pillar 2: Suivre */}
              <div className={`p-4 rounded-2xl border text-center transition duration-200 hover:-translate-y-1 ${
                isLightTheme 
                  ? "bg-slate-50/70 border-slate-200 hover:bg-slate-50 hover:shadow-2xs" 
                  : "bg-indigo-950/15 border-indigo-900/20 hover:bg-indigo-950/30"
              }`}>
                <div className="w-10 h-10 rounded-full bg-pink-500/15 text-pink-500 flex items-center justify-center mx-auto mb-3.5 shadow-sm">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-extrabold uppercase tracking-wide">{t.p2Title}</h4>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                  {t.p2Desc}
                </p>
              </div>

              {/* Pillar 3: Noter */}
              <div className={`p-4 rounded-2xl border text-center transition duration-200 hover:-translate-y-1 ${
                isLightTheme 
                  ? "bg-slate-50/70 border-slate-200 hover:bg-slate-50 hover:shadow-2xs" 
                  : "bg-indigo-950/15 border-indigo-900/20 hover:bg-indigo-950/30"
              }`}>
                <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto mb-3.5 shadow-sm">
                  <Star className="w-5 h-5 fill-amber-500/30" />
                </div>
                <h4 className="text-xs font-extrabold uppercase tracking-wide">{t.p3Title}</h4>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                  {t.p3Desc}
                </p>
              </div>

              {/* Pillar 4: Cloner/Remixer */}
              <div className={`p-4 rounded-2xl border text-center transition duration-200 hover:-translate-y-1 ${
                isLightTheme 
                  ? "bg-slate-50/70 border-slate-200 hover:bg-slate-50 hover:shadow-2xs" 
                  : "bg-indigo-950/15 border-indigo-900/20 hover:bg-indigo-950/30"
              }`}>
                <div className="w-10 h-10 rounded-full bg-cyan-500/15 text-cyan-500 flex items-center justify-center mx-auto mb-3.5 shadow-sm">
                  <GitFork className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-extrabold uppercase tracking-wide">{t.p4Title}</h4>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                  {t.p4Desc}
                </p>
              </div>

              {/* Pillar 5: Partager knowledge packs */}
              <div className={`p-4 rounded-2xl border text-center transition duration-200 hover:-translate-y-1 ${
                isLightTheme 
                  ? "bg-slate-50/70 border-slate-200 hover:bg-slate-50 hover:shadow-2xs" 
                  : "bg-indigo-950/15 border-indigo-900/20 hover:bg-indigo-950/30"
              }`}>
                <div className="w-10 h-10 rounded-full bg-violet-500/15 text-violet-500 flex items-center justify-center mx-auto mb-3.5 shadow-sm">
                  <Share2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-extrabold uppercase tracking-wide">{t.p5Title}</h4>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                  {t.p5Desc}
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Area with nice CTA button */}
        <div className={`p-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r ${
          isLightTheme 
            ? "from-slate-50 to-slate-100 border-slate-100" 
            : "from-indigo-950/10 to-pink-950/5 border-indigo-950/30"
        }`}>
          <div className="text-center md:text-left space-y-3">
            <div>
              <p className="text-sm font-black">{t.ctaTitle}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t.ctaSub}</p>
            </div>
            {/* Elegant contact and portfolio links */}
            <div className="flex flex-wrap items-center gap-3 pt-1 justify-center md:justify-start">
              <a 
                href="mailto:contact@alexkoncept.com"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-500/10 hover:border-indigo-500/30 bg-indigo-500/5 text-indigo-500 hover:text-indigo-600 dark:text-[#a855f7] dark:hover:text-[#ec4899] transition shadow-4xs animate-pulse"
              >
                <span>✉️ contact@alexkoncept.com</span>
              </a>
              <a 
                href="https://alexkoncept.github.io/" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-pink-500/10 hover:border-pink-500/30 bg-pink-500/5 text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 transition shadow-4xs"
              >
                <span>🌐 alexkoncept.github.io</span>
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            id="btn-landing-cta"
            className="px-6 py-3 bg-gradient-to-tr from-[#5969F3] via-[#7d51f7] to-[#ec4899] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-95 transition-all shadow-md hover:scale-[1.02] flex items-center gap-2"
          >
            <span>{t.ctaBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lightbox for Infography */}
        {isLightboxOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition"
              >
                <X className="w-8 h-8" />
              </button>
              <img 
                src={`NotebookLM/${lang.toUpperCase()}/Infographie.png`}
                alt="Infography Zoomed"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
