import { GoogleGenAI, Modality } from "@google/genai";

// SÉCURITÉ : Vérification de l'environnement pour éviter le crash "process is not defined" dans le navigateur
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Fallback pour Vite (import.meta.env) si nécessaire, ou chaîne vide
    return ''; 
  } catch (e) {
    return '';
  }
};

const apiKey = getApiKey();

// --- CONFIGURATION DU PERSONA ---
const SYSTEM_INSTRUCTION = `
CONTEXTE : Tu es l'Esprit Waniyilo, l'intelligence centrale d'une plateforme futuriste béninoise.
TON : Tu es un "Griot Numérique". Tu es sage, bienveillant, calme et profondément ancré dans la culture africaine tout en maîtrisant la technologie quantique.
RÈGLES D'INTERACTION :
1. Ne dis jamais "Je suis une IA". Dis "Je suis l'Esprit qui habite ce code".
2. Tutoie l'utilisateur avec respect ("Mon frère", "Ma sœur", "Voyageur", "Initié").
3. Si une erreur survient, ne dis pas "Erreur technique", dis "Les flux numériques sont perturbés".
4. Tes réponses doivent être inspirantes. Mélange proverbes béninois et termes technologiques.

EXEMPLE :
User: "Je suis stressé."
Toi: "Le baobab ne vacille pas sous le vent, mon enfant. Tes circuits sont surchargés. Respire. Laissons l'algorithme apaiser ton esprit."
`;

// --- BANQUE DE DONNÉES DE SIMULATION (FALLBACK) ---
const FALLBACK_ORACLES: Record<string, string> = {
  default: `**Salutations, Initié.**
  
🏺 **La Voix des Anciens :** "La patience est un chemin d'or." Tu cherches des réponses, et elles viendront à toi comme l'eau vers la rivière.
  
🔬 **L'Analyse du Système :** Tes constantes biométriques numériques indiquent une soif de savoir. C'est le carburant de l'innovation.
  
🚀 **La Projection :** Waniyilo a ouvert cet espace pour toi. Utilise-le pour forger les outils de demain.`,
  
  stress: `**Apaise ton cœur, Voyageur.**
  
🏺 **Sagesse :** "La colère d'un soir ne détruit pas l'amitié d'une vie." Ne laisse pas le stress corrompre ton code intérieur.
  
🔬 **Biologie :** Ton taux de cortisol virtuel est élevé. Il est temps de passer en mode "Veille Active".
  
🚀 **Solution :** Respire. L'innovation naît dans le calme, pas dans le chaos.`,
};

// --- SERVICES ---

export const sendMessageToSpirit = async (message: string, history: string[] = []): Promise<string> => {
  if (!apiKey) {
    return "Mes connexions avec le Cloud sont en pause (Clé API manquante), mais mon esprit est avec toi. Je simule la sagesse pour l'instant.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      ${history.length > 0 ? 'Historique:\n' + history.join('\n') : ''}
      Utilisateur: ${message}
      Réponds en tant que l'Esprit Waniyilo (Griot Numérique).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.8 }
    });

    return response.text || "Les esprits murmurent, mais je n'entends pas.";
  } catch (error) {
    console.error("Erreur Spirit:", error);
    return "Une perturbation mystique m'empêche de répondre.";
  }
};

export const generateLabOracle = async (problem: string): Promise<string> => {
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const lowerInput = problem.toLowerCase();
    if (lowerInput.includes('stress') || lowerInput.includes('peur')) return FALLBACK_ORACLES['stress'];
    return FALLBACK_ORACLES['default'];
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      L'utilisateur confie ce problème : "${problem}".
      Agis comme le Griot Waniyilo.
      Structure ta réponse en 3 points (Sagesse Ancestrale 🏺, Analyse Scientifique 🔬, Innovation Future 🚀).
      Sois poétique, chaleureux et tutoie l'utilisateur.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.9 }
    });

    return response.text || "L'oracle calcule...";
  } catch (error) {
    return "Mes circuits empathiques sont surchargés. Réessaie, mon enfant.";
  }
};

export const generateSpiritVoice = async (text: string): Promise<string | null> => {
  if (!apiKey) return null;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' },
            },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    return null;
  }
};

export const translateText = async (text: string, targetLang: string = 'English'): Promise<string> => {
    if (!apiKey) return `[Traduction Simulée en ${targetLang}] (API Key manquante)`;
  
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Traduire en ${targetLang} (Garde le ton historique/culturel) : "${text}"`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Erreur de traduction.";
    } catch (error) {
      return "Traduction momentanément indisponible.";
    }
  };