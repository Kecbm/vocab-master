import { useState } from "react";
import { Volume2, Edit, Trash2, CheckCircle, Hourglass, Sparkles, Loader2 } from "lucide-react";
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
  pronunciation?: string;
  createdAt?: string;
  mastered?: boolean;
}

interface VocabularyCardProps {
  word: VocabularyWord;
  onEdit?: (word: VocabularyWord) => void;
  onDelete?: (id: string) => void;
  onToggleMastered?: (id: string) => void;
  onMarkAsLearning?: (id: string) => void;
  isUpdating?: boolean;
  className?: string;
}

const VocabularyCard = ({
  word,
  onEdit,
  onDelete,
  onToggleMastered,
  isUpdating = false,
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

  // Função para obter a melhor voz disponível para o idioma
  const getBestVoice = (languageCode: string): SpeechSynthesisVoice | null => {
    const voices = speechSynthesis.getVoices();

    if (voices.length === 0) {
      return null;
    }

    // Extrair o código base do idioma (ex: 'en' de 'en-US')
    const langBase = languageCode.split('-')[0];

    // Filtrar vozes do idioma desejado
    const languageVoices = voices.filter(v =>
      v.lang.startsWith(langBase) || v.lang.startsWith(languageCode)
    );

    if (languageVoices.length === 0) {
      return null;
    }

    // Prioridades de seleção de voz (em ordem de preferência):
    // 1. Vozes que correspondem exatamente ao código do idioma (ex: en-US)
    // 2. Vozes locais (localService = true) - geralmente de melhor qualidade
    // 3. Vozes com nomes que indicam qualidade premium
    // 4. Qualquer voz do idioma

    // Nomes de vozes premium conhecidas por idioma
    const premiumVoiceNames: { [key: string]: string[] } = {
      'en': [
        'Samantha', 'Alex', 'Victoria', 'Karen', 'Daniel', 'Moira', 'Tessa',
        'Google US English', 'Microsoft David', 'Microsoft Zira',
        'Google UK English Female', 'Google UK English Male'
      ],
      'fr': [
        'Thomas', 'Amelie', 'Google français', 'Microsoft Hortense',
        'Google French Female', 'Google French Male'
      ]
    };

    const premiumNames = premiumVoiceNames[langBase] || [];

    // 1. Tentar encontrar voz premium que corresponda exatamente ao código
    let bestVoice = languageVoices.find(v =>
      v.lang === languageCode &&
      premiumNames.some(name => v.name.includes(name))
    );

    // 2. Tentar encontrar voz local que corresponda exatamente ao código
    if (!bestVoice) {
      bestVoice = languageVoices.find(v =>
        v.lang === languageCode && v.localService
      );
    }

    // 3. Tentar encontrar qualquer voz premium do idioma base
    if (!bestVoice) {
      bestVoice = languageVoices.find(v =>
        premiumNames.some(name => v.name.includes(name))
      );
    }

    // 4. Tentar encontrar voz local do idioma base
    if (!bestVoice) {
      bestVoice = languageVoices.find(v => v.localService);
    }

    // 5. Pegar a primeira voz que corresponda exatamente ao código
    if (!bestVoice) {
      bestVoice = languageVoices.find(v => v.lang === languageCode);
    }

    // 6. Fallback: primeira voz do idioma base
    if (!bestVoice) {
      bestVoice = languageVoices[0];
    }

    return bestVoice || null;
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

      // Garantir que as vozes estejam carregadas
      let voices = speechSynthesis.getVoices();

      // Se não houver vozes, aguardar o evento de carregamento
      if (voices.length === 0) {
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => resolve(), 1000);
          speechSynthesis.onvoiceschanged = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
        voices = speechSynthesis.getVoices();
      }

      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.lang = languageCode;
      utterance.rate = 0.85; // Velocidade ligeiramente mais natural
      utterance.pitch = 1.0; // Tom natural
      utterance.volume = 1.0;

      // Selecionar a melhor voz disponível
      const bestVoice = getBestVoice(languageCode);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
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
        <div className="flex items-center gap-2">
          {/* Main Status Badge */}
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

          {/* Updating Badge */}
          {isUpdating && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200",
              "backdrop-blur-sm animate-in fade-in-0 slide-in-from-left-2",
              isNew && "border-orange-600/60 text-orange-600/60 bg-orange-500/10",
              word.mastered && "border-green-600/60 text-green-600/60 bg-green-500/10",
              !isNew && !word.mastered && "border-blue-600/60 text-blue-600/60 bg-blue-500/10"
            )}>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs font-semibold">Updating</span>
            </div>
          )}
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