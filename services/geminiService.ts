import { GoogleGenAI, Type } from "@google/genai";
import { BusinessInfo, DesignTheme, LayoutStyle } from "../types";

// Initialize lazily to prevent module-level crashes if environment variables are missing
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateBusinessBio = async (info: BusinessInfo): Promise<string> => {
    const ai = getAi();
    const model = "gemini-2.5-flash";
    const prompt = `
        Napisz krótkie, profesjonalne bio (maksymalnie 2-3 zdania) dla wizytówki.
        Osoba: ${info.fullName}
        Stanowisko: ${info.jobTitle}
        Branża: ${info.industry}
        Styl: Profesjonalny, zaufany.
        Język: Polski.
        Nie używaj cudzysłowów.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text?.trim() || "";
    } catch (e) {
        console.error(e);
        return "Doświadczony specjalista w swojej branży, nastawiony na innowacyjne rozwiązania i najwyższą jakość usług.";
    }
}

export const generateCardDesigns = async (info: BusinessInfo, styleHint?: string): Promise<DesignTheme[]> => {
  const ai = getAi();
  const model = "gemini-2.5-flash";

  const prompt = `
    Jesteś światowej klasy projektantem graficznym.
    Użytkownik potrzebuje 6 rożnych, premium projektów wizytówek.
    Dane użytkownika:
    Branża: ${info.industry}
    Stanowisko: ${info.jobTitle}
    Firma: ${info.companyName}
    
    ${styleHint ? `Skup się na stylach typu: ${styleHint}.` : ''}

    Zasady:
    1. Wygeneruj 6 unikalnych stylów.
    2. Dobierz kolory (hex) pasujące do psychologii kolorów w tej branży.
    3. Wymyśl krótki, profesjonalny slogan (tagline) pasujący do firmy.
    4. layoutStyle musi być jednym z: Minimal, Bold, Luxury, Creative, Corporate, Tech.
    5. fontFamily wybierz jedno z: 
       - Standardowe: sans, serif, display, modern
       - Premium: poppins, cormorant, raleway, oswald, greatvibes, librebaskerville, sourcesans, dmserif, titillium, spacegrotesk.
    6. accentShape to sugestia geometryczna: circle, line, blob, none.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Nazwa stylu np. 'Midnight Gold'" },
              layoutStyle: { type: Type.STRING, enum: Object.values(LayoutStyle) },
              primaryColor: { type: Type.STRING, description: "Hex color" },
              secondaryColor: { type: Type.STRING, description: "Hex color" },
              backgroundColor: { type: Type.STRING, description: "Hex color" },
              textColor: { type: Type.STRING, description: "Hex color" },
              fontFamily: { type: Type.STRING, enum: ['sans', 'serif', 'display', 'modern', 'poppins', 'cormorant', 'raleway', 'oswald', 'greatvibes', 'librebaskerville', 'sourcesans', 'dmserif', 'titillium', 'spacegrotesk'] },
              slogan: { type: Type.STRING, description: "Krótkie hasło reklamowe" },
              accentShape: { type: Type.STRING, enum: ['circle', 'line', 'blob', 'none'] }
            },
            required: ["name", "layoutStyle", "primaryColor", "secondaryColor", "backgroundColor", "textColor", "fontFamily", "slogan", "accentShape"]
          }
        }
      }
    });

    if (response.text) {
      const themes = JSON.parse(response.text) as Omit<DesignTheme, 'id'>[];
      // Add IDs locally
      return themes.map((t, idx) => ({ ...t, id: `gen-${Date.now()}-${idx}` }));
    }
    throw new Error("Brak odpowiedzi od AI");
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if API fails or quota exceeded
    return fallbackThemes;
  }
};

// Fallback data in case of error
const fallbackThemes: DesignTheme[] = [
  {
    id: 'fb-1',
    name: 'Classic Elegant',
    layoutStyle: LayoutStyle.Luxury,
    primaryColor: '#C7A038',
    secondaryColor: '#1A1A1A',
    backgroundColor: '#0F0F0F',
    textColor: '#FFFFFF',
    fontFamily: 'cormorant',
    slogan: 'Excellence in every detail.',
    accentShape: 'line'
  },
  {
    id: 'fb-2',
    name: 'Modern Minimal',
    layoutStyle: LayoutStyle.Minimal,
    primaryColor: '#3B82F6',
    secondaryColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    textColor: '#111827',
    fontFamily: 'poppins',
    slogan: 'Simple solutions.',
    accentShape: 'none'
  }
];