import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useLanguage, languageConfig, Language } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { useEffect } from "react";

interface LanguageSelectProps {
  wordCounts?: {
    english: number;
    french: number;
    portuguese: number;
  };
  variant?: 'default' | 'compact';
  showPortuguese?: boolean; // Se deve mostrar português como opção
}

const LanguageSelect = ({ wordCounts, variant = 'default', showPortuguese = false }: LanguageSelectProps) => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();

  const handleLanguageChange = (value: string) => {
    setCurrentLanguage(value as Language);
  };

  const currentConfig = languageConfig[currentLanguage];

  // Filtrar idiomas baseado na prop showPortuguese
  const availableLanguages = showPortuguese
    ? Object.entries(languageConfig)
    : Object.entries(languageConfig).filter(([key]) => key !== 'portuguese');

  // Se o idioma atual não estiver disponível, mudar para inglês
  useEffect(() => {
    if (!showPortuguese && currentLanguage === 'portuguese') {
      setCurrentLanguage('english');
    }
  }, [showPortuguese, currentLanguage, setCurrentLanguage]);

  const triggerClassName = variant === 'compact'
    ? "w-[150px] h-8 px-2 gap-1 bg-white/95 backdrop-blur-sm border-slate-200/60 hover:bg-white hover:border-slate-300 transition-all duration-200 shadow-sm"
    : "w-[160px] h-8 px-3 gap-2 bg-white/90 backdrop-blur-sm border-slate-200 hover:bg-white transition-colors";

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className={triggerClassName}>
        <div className="flex items-center gap-2">
          {(variant !== 'compact' && showPortuguese) && <Globe className="h-4 w-4 text-slate-600" />}
          <span className={`font-medium text-slate-700 whitespace-nowrap ${variant === 'compact' ? 'text-sm' : 'text-sm'}`}>
            {variant === 'compact' ? `${currentConfig.flag} ${currentConfig.name}` : `${currentConfig.flag} ${currentConfig.name}`}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent
        className="max-w-[200px] w-auto bg-white border-slate-200"
        position="popper"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        {availableLanguages.map(([key, config]) => (
          <SelectItem
            key={key}
            value={key}
            className="bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900"
          >
            <div className="flex items-center gap-2">
              <span>{config.flag}</span>
              <span className="text-slate-700">{config.name}</span>
              {wordCounts && wordCounts[key as keyof typeof wordCounts] !== undefined && (
                <span className="text-xs text-muted-foreground ml-auto">
                  ({wordCounts[key as keyof typeof wordCounts]} palavras)
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelect;
