import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipos de idiomas suportados
export type Language = 'english' | 'french' | 'portuguese';

// Interface do contexto
interface LanguageContextType {
  currentLanguage: Language;
  setCurrentLanguage: (language: Language) => void;
  getTargetLanguage: () => string;
  getSourceLanguage: () => string;
  getLanguageCode: () => string;
  getTranslationPair: () => string;
}

// Configurações dos idiomas
const languageConfig = {
  english: {
    target: 'English',
    source: 'Portuguese',
    code: 'en-US',
    translationPair: 'en|pt',
    flag: '🇺🇸',
    name: 'English'
  },
  french: {
    target: 'French',
    source: 'Portuguese',
    code: 'fr-FR',
    translationPair: 'fr|pt',
    flag: '🇫🇷',
    name: 'Français'
  },
  portuguese: {
    target: 'Portuguese',
    source: 'Portuguese',
    code: 'pt-BR',
    translationPair: 'pt|pt',
    flag: '🇧🇷',
    name: 'Português'
  }
};

// Criar contexto
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider do contexto
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>('portuguese');

  // Carregar idioma salvo na inicialização
  useEffect(() => {
    const savedLanguage = localStorage.getItem('vocab-master-language') as Language;
    if (savedLanguage && (savedLanguage === 'english' || savedLanguage === 'french' || savedLanguage === 'portuguese')) {
      setCurrentLanguageState(savedLanguage);
    }
  }, []);

  // Salvar idioma quando mudar
  const setCurrentLanguage = (language: Language) => {
    setCurrentLanguageState(language);
    localStorage.setItem('vocab-master-language', language);
  };

  // Funções auxiliares
  const getTargetLanguage = () => languageConfig[currentLanguage].target;
  const getSourceLanguage = () => languageConfig[currentLanguage].source;
  const getLanguageCode = () => languageConfig[currentLanguage].code;
  const getTranslationPair = () => languageConfig[currentLanguage].translationPair;

  const value = {
    currentLanguage,
    setCurrentLanguage,
    getTargetLanguage,
    getSourceLanguage,
    getLanguageCode,
    getTranslationPair,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook para usar o contexto
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Exportar configurações para uso direto
export { languageConfig };
