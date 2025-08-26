import { Button } from "@/components/ui/button";
import { useLanguage, languageConfig } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  wordCounts?: {
    english: number;
    french: number;
  };
}

const LanguageToggle = ({ wordCounts }: LanguageToggleProps) => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'english' ? 'french' : 'english';
    setCurrentLanguage(newLanguage);
  };

  const currentConfig = languageConfig[currentLanguage];
  const nextLanguage = currentLanguage === 'english' ? 'french' : 'english';
  const nextConfig = languageConfig[nextLanguage];

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="h-8 px-3 gap-2"
      title={`Switch to ${nextConfig.target}`}
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">
        {currentConfig.flag} {currentConfig.target}
      </span>
    </Button>
  );
};

export default LanguageToggle;
