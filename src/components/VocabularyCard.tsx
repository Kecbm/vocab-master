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
        "bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-xl",
        "hover:-translate-y-1 hover:scale-[1.02]",

        // Conditional styling based on word status
        isNew && [
          "border-learning/30",
          "shadow-learning/20 hover:shadow-learning/30",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
        ],
        word.mastered && [
          "border-mastered/30",
          "shadow-mastered/20 hover:shadow-mastered/30"
        ],
        !isNew && !word.mastered && [
          "border-primary/30",
          "shadow-primary/20 hover:shadow-primary/30"
        ],
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-30">
        <div className={cn(
          "w-full h-full rounded-full blur-2xl",
          isNew && "bg-gradient-to-br from-learning/40 to-transparent",
          word.mastered && "bg-gradient-to-br from-mastered/40 to-transparent",
          !isNew && !word.mastered && "bg-gradient-to-br from-primary/40 to-transparent"
        )}></div>
      </div>

      {/* Word Status Badge */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-xl border transition-all duration-200",
            isNew && "bg-gradient-to-br from-learning/20 to-learning/10 border-learning/30",
            word.mastered && "bg-gradient-to-br from-mastered/20 to-mastered/10 border-mastered/30",
            !isNew && !word.mastered && "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
          )}>
            {word.mastered ? (
              <CheckCircle className="h-4 w-4 text-mastered" />
            ) : isNew ? (
              <Sparkles className="h-4 w-4 text-learning" />
            ) : (
              <Hourglass className="h-4 w-4 text-primary" />
            )}
          </div>
          <span className={cn(
            "text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all duration-200",
            "backdrop-blur-sm",
            isNew && "border-learning/40 text-learning bg-learning/10",
            word.mastered && "border-mastered/40 text-mastered bg-mastered/10",
            !isNew && !word.mastered && "border-primary/40 text-primary bg-primary/10"
          )}>
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
      <div className="relative mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-foreground tracking-tight leading-tight">
              {capitalizeFirstLetter(getCurrentWord())}
            </h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePlayPronunciation}
            className={cn(
              "h-10 w-10 p-0 rounded-full transition-all duration-300 ease-out",
              "border-2 border-transparent",
              isPlaying
                ? [
                    "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground",
                    "shadow-lg shadow-primary/30 scale-110 border-primary/20",
                    "ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                  ]
                : [
                    "text-primary hover:text-primary-foreground",
                    "hover:bg-gradient-to-r hover:from-primary hover:to-primary/90",
                    "hover:shadow-lg hover:shadow-primary/25 hover:scale-110",
                    "hover:border-primary/30 active:scale-95",
                    "group-hover:-translate-y-0.5"
                  ]
            )}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Portuguese Translation */}
      <div className="relative">
        <p className="text-base text-muted-foreground font-medium leading-relaxed pl-3.5">
          {capitalizeFirstLetter(word.portuguese)}
        </p>
      </div>

      {/* Bottom accent line */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-all duration-300",
        isNew && "bg-gradient-to-r from-learning/60 to-learning/30",
        word.mastered && "bg-gradient-to-r from-mastered/60 to-mastered/30",
        !isNew && !word.mastered && "bg-gradient-to-r from-primary/60 to-primary/30"
      )}></div>
    </div>
  );
};

export default VocabularyCard;