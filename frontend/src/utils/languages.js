// Language codes for Web Speech API and Gemini language context
export const LANGUAGES = {
  English: {
    code: "en-US",
    name: "English",
    flag: "🇺🇸"
  },
  Hindi: {
    code: "hi-IN",
    name: "हिन्दी",
    flag: "🇮🇳"
  },
  Marathi: {
    code: "mr-IN",
    name: "मराठी",
    flag: "🇮🇳"
  }
};

export const getLanguageName = (code) => {
  for (const [key, value] of Object.entries(LANGUAGES)) {
    if (value.code === code) {
      return value.name;
    }
  }
  return "Unknown";
};

export const getLanguageFlag = (code) => {
  for (const [key, value] of Object.entries(LANGUAGES)) {
    if (value.code === code) {
      return value.flag;
    }
  }
  return "🌍";
};

export const LANGUAGE_NAMES = {
  "en-US": "English",
  "hi-IN": "Hindi",
  "mr-IN": "Marathi"
};
