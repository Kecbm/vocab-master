import { useState } from "react";
import { BookOpen, Volume2, Edit, Trash2, CheckCircle } from "lucide-react";
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
  book: string;
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
      console.error('❌ Speech Synthesis not supported');
      setIsPlaying(false);
      return;
    }

    try {
      const currentWord = getCurrentWord();
      const languageCode = getLanguageCode();

      console.log('🔊 Playing pronunciation:', { word: currentWord, language: languageCode });

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
      console.log('🎤 Available voices:', voices.length);

      const voice = voices.find(v => v.lang.startsWith(languageCode.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
        console.log('🎤 Using voice:', voice.name, voice.lang);
      } else {
        console.log('🎤 Using default voice for:', languageCode);
      }

      // Eventos para controlar o estado
      utterance.onstart = () => {
        console.log('🎵 Speech started');
        setIsPlaying(true);
      };

      utterance.onend = () => {
        console.log('🎵 Speech ended');
        setIsPlaying(false);
      };

      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event.error);
        setIsPlaying(false);
      };

      // Verificar se o speechSynthesis está pronto
      if (speechSynthesis.speaking) {
        console.log('⚠️ Speech synthesis is already speaking');
        setIsPlaying(false);
        return;
      }

      speechSynthesis.speak(utterance);

      // Fallback: se não começar em 2 segundos, resetar estado
      setTimeout(() => {
        if (isPlaying && !speechSynthesis.speaking) {
          console.log('⚠️ Speech timeout, resetting state');
          setIsPlaying(false);
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Speech error:', error);
      setIsPlaying(false);
    }
  };

  // Verifica se a palavra é nova baseada na data
  const isNew = isToday(word.createdAt);

  return (
    <div
      className={cn(
        "card-vocabulary group",
        isNew && "card-learning float-in",
        word.mastered && "card-mastered",
        className
      )}
    >
      {/* Word Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {word.mastered ? (
            <CheckCircle className="h-5 w-5 text-mastered" />
          ) : (
            <div className={cn(
              "w-3 h-3 rounded-full border-2",
              isNew ? "border-learning" : "border-primary"
            )} />
          )}
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full border",
            isNew
              ? "border-learning text-learning"
              : word.mastered
                ? "border-mastered text-mastered"
                : "border-primary text-primary"
          )}>
            {isNew ? "New" : word.mastered ? "Mastered" : "Learning"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onToggleMastered && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleMastered(word.id)}
              className="h-8 w-8 p-0 hover:text-mastered"
            >
              <CheckCircle className={cn(
                "h-4 w-4",
                word.mastered ? "text-mastered" : "text-muted-foreground"
              )} />
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(word)}
              className="h-8 w-8 p-0 hover:text-primary"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(word.id)}
              className="h-8 w-8 p-0 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          )}
        </div>
      </div>

      {/* English Word */}
      <div className="mb-3">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-2xl font-semibold text-foreground">
            {capitalizeFirstLetter(getCurrentWord())}
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePlayPronunciation}
            className={cn(
              "h-8 w-8 p-0 rounded-full transition-all",
              isPlaying 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-primary/10 text-primary"
            )}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Portuguese Translation */}
      <div className="mb-4">
        <p className="text-lg text-muted-foreground font-medium">
          {capitalizeFirstLetter(word.portuguese)}
        </p>
      </div>

      {/* Book Source */}
      <div className="flex items-center gap-2 pt-3 border-t border-border/50">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground font-medium">
          {word.book}
        </span>
      </div>
    </div>
  );
};

export default VocabularyCard;