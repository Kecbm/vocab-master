import { useLanguage } from "@/contexts/LanguageContext";
import { translations, TranslationKey } from "@/locales/translations";

export const useTranslation = () => {
  const { currentLanguage } = useLanguage();
  
  const t = (key: TranslationKey): string => {
    return translations[currentLanguage][key] || key;
  };
  
  return { t };
};
