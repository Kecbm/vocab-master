import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage, languageConfig, Language } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageSelectProps {
  wordCounts?: {
    english: number;
    french: number;
    portuguese: number;
  };
  variant?: 'default' | 'compact';
}

const LanguageSelect = ({ wordCounts, variant = 'default' }: LanguageSelectProps) => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();

  const handleLanguageChange = (value: string) => {
    setCurrentLanguage(value as Language);
  };

  const currentConfig = languageConfig[currentLanguage];

  const triggerClassName = variant === 'compact'
    ? "w-[150px] h-8 px-2 gap-1 bg-white/95 backdrop-blur-sm border-slate-200/60 hover:bg-white hover:border-slate-300 transition-all duration-200 shadow-sm"
    : "w-[160px] h-8 px-3 gap-2 bg-white/90 backdrop-blur-sm border-slate-200 hover:bg-white transition-colors";

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className={triggerClassName}>
        <div className="flex items-center gap-2">
          {variant !== 'compact' && <Globe className="h-4 w-4 text-slate-600" />}
          <span className={`font-medium text-slate-700 whitespace-nowrap ${variant === 'compact' ? 'text-sm' : 'text-sm'}`}>
            {variant === 'compact' ? `${currentConfig.flag} ${currentConfig.name}` : `${currentConfig.flag} ${currentConfig.name}`}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(languageConfig).map(([key, config]) => (
          <SelectItem key={key} value={key}>
            <div className="flex items-center gap-2">
              <span>{config.flag}</span>
              <span>{config.name}</span>
              {wordCounts && wordCounts[key as keyof typeof wordCounts] !== undefined && (
                <span className="text-xs text-slate-500 ml-auto">
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
