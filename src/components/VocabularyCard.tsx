import { useState } from "react";
import { Volume2, Edit, Trash2, CheckCircle, Hourglass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isToday } from "@/utils/dateUtils";
import { useLanguage } from "@/contexts/LanguageContext";

// Função para capitalizar a primeira letra
const capitalizeFirstLetter = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export interface VocabularyWord {
  id: string;
  foreignWord: string;
  language: 'english' | 'french';
  portuguese: string;
  createdAt?: string;
  mastered?: boolean;
}

interface VocabularyCardProps {
  word: VocabularyWord;
  onEdit?: (word: VocabularyWord) => void;
  onDelete?: (id: string) => void;
  onToggleMastered?: (id: string) => void;
  onMarkAsLearning?: (id: string) => void;
  className?: string;
}

const VocabularyCard = ({ 
  word, 
  onEdit, 
  onDelete, 
  onToggleMastered,
  className
}: VocabularyCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { currentLanguage, getLanguageCode } = useLanguage();

  // Obter a palavra no idioma atual
  const getCurrentWord = () => {
    // Se a palavra é do idioma atual, mostra ela
    if (word.language === currentLanguage) {
      return word.foreignWord;
    }
    // Se não, não mostra (palavra de outro idioma)
    return word.foreignWord;
  };

  const handlePlayPronunciation = async () => {
    setIsPlaying(true);

    if (!('speechSynthesis' in window)) {
      setIsPlaying(false);
      return;
    }

    try {
      const currentWord = getCurrentWord();
      const languageCode = getLanguageCode();

      // Parar qualquer fala anterior
      speechSynthesis.cancel();

      // Aguardar um pouco para garantir que o cancel foi processado
      await new Promise(resolve => setTimeout(resolve, 50));

      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.lang = languageCode;
      utterance.rate = 0.8;
      utterance.volume = 1.0;

      // Tentar encontrar uma voz específica para o idioma
      const voices = speechSynthesis.getVoices();

      const voice = voices.find(v => v.lang.startsWith(languageCode.split('-')[0]));
      utterance.voice = voice;

      // Eventos para controlar o estado
      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      // Verificar se o speechSynthesis está pronto
      if (speechSynthesis.speaking) {
        setIsPlaying(false);
        return;
      }

      speechSynthesis.speak(utterance);

      // Fallback: se não começar em 2 segundos, resetar estado
      setTimeout(() => {
        if (isPlaying && !speechSynthesis.speaking) {
          setIsPlaying(false);
        }
      }, 2000);

    } catch (error) {
      setIsPlaying(false);
    }
  };

  // Verifica se a palavra é nova baseada na data
  const isNew = isToday(word.createdAt);

  return (
    <div
      className={cn(
        // Base card styling
        "relative group overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 ease-out",
        "backdrop-blur-sm shadow-lg",
        "hover:-translate-y-1 hover:scale-[1.02]",

        // Conditional styling based on word status
        isNew && [
          "border border-orange-500/20 bg-orange-500/10",
          "shadow-orange-500/20",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
        ],
        word.mastered && [
          "border border-green-500/20 bg-green-500/10",
          "shadow-green-500/20"
        ],
        !isNew && !word.mastered && [
          "border border-blue-500/20 bg-blue-500/10",
          "shadow-blue-500/20"
        ],
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-30">
        <div className={cn(
          "w-full h-full rounded-full blur-2xl",
          isNew && "bg-gradient-to-br from-orange-500/40 to-transparent",
          word.mastered && "bg-gradient-to-br from-green-500/40 to-transparent",
          !isNew && !word.mastered && "bg-gradient-to-br from-blue-500/40 to-transparent"
        )}></div>
      </div>

      {/* Word Status Badge */}
      <div className="relative flex items-center justify-between mb-6">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200",
          "backdrop-blur-sm",
          isNew && "border-orange-600/60 text-orange-600/60",
          word.mastered && "border-green-600/60 text-green-600/60",
          !isNew && !word.mastered && "border-blue-600/60 text-blue-600/60"
        )}>
          {word.mastered ? (
            <CheckCircle className="h-4 w-4" />
          ) : isNew ? (
            <Sparkles className="h-4 w-4" />
          ) : (
            <Hourglass className="h-4 w-4" />
          )}
          <span className="text-xs font-semibold">
            {isNew ? "New" : word.mastered ? "Mastered" : "Learning"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          {onToggleMastered && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleMastered(word.id)}
              className={cn(
                "h-9 w-9 p-0 rounded-xl transition-all duration-200",
                "hover:scale-110 active:scale-95",
                "hover:bg-mastered/10 hover:border-mastered/20 border border-transparent",
                word.mastered
                  ? "text-mastered hover:text-mastered"
                  : "text-muted-foreground hover:text-mastered"
              )}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(word)}
              className={cn(
                "h-9 w-9 p-0 rounded-xl transition-all duration-200",
                "hover:scale-110 active:scale-95",
                "text-muted-foreground hover:text-primary",
                "hover:bg-primary/10 hover:border-primary/20 border border-transparent"
              )}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(word.id)}
              className={cn(
                "h-9 w-9 p-0 rounded-xl transition-all duration-200",
                "hover:scale-110 active:scale-95",
                "text-muted-foreground hover:text-destructive",
                "hover:bg-destructive/10 hover:border-destructive/20 border border-transparent"
              )}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Word Section */}
      <div className="relative mb-2">
        <div className="flex items-center mb-1">
          <h3 className="text-2xl font-bold text-foreground tracking-tight leading-tight">
            {capitalizeFirstLetter(getCurrentWord())}
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePlayPronunciation}
            className={cn(
              "h-8 w-8 p-0 rounded-full transition-all duration-300 ease-out ml-2",
              "border-2 border-transparent",
              isPlaying
                ? [
                    "bg-primary text-primary-foreground",
                    "shadow-lg shadow-primary/30 scale-110 border-primary/20",
                    "ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                  ]
                : [
                    "text-primary hover:text-primary-foreground",
                    "hover:bg-primary/90",
                    "hover:shadow-lg hover:shadow-primary/25 hover:scale-110",
                    "hover:border-primary/30 active:scale-95",
                    "group-hover:-translate-y-0.5"
                  ]
            )}
          >
            <Volume2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Portuguese Translation */}
      <div className="relative">
        <p className="text-base text-muted-foreground font-medium leading-relaxed">
          {capitalizeFirstLetter(word.portuguese)}
        </p>
      </div>


    </div>
  );
};

export default VocabularyCard;