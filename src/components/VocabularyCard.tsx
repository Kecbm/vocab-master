import { useState } from "react";
import { BookOpen, Volume2, Edit, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface VocabularyWord {
  id: string;
  english: string;
  portuguese: string;
  book: string;
  isNew?: boolean;
  mastered?: boolean;
}

interface VocabularyCardProps {
  word: VocabularyWord;
  onEdit?: (word: VocabularyWord) => void;
  onDelete?: (id: string) => void;
  onToggleMastered?: (id: string) => void;
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

  const handlePlayPronunciation = () => {
    setIsPlaying(true);
    // Simulate audio playing (would integrate with Web Speech API)
    setTimeout(() => setIsPlaying(false), 1000);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.english);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={cn(
        "card-vocabulary group",
        word.isNew && "card-learning float-in",
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
              "w-3 h-3 rounded-full",
              word.isNew ? "bg-learning" : "bg-primary/30"
            )} />
          )}
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            word.isNew 
              ? "bg-learning/10 text-learning" 
              : word.mastered
                ? "bg-mastered/10 text-mastered"
                : "bg-primary/10 text-primary"
          )}>
            {word.isNew ? "Nova" : word.mastered ? "Dominada" : "Aprendendo"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onToggleMastered && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleMastered(word.id)}
              className="h-8 w-8 p-0 hover:bg-mastered/10"
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
              className="h-8 w-8 p-0 hover:bg-primary/10"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(word.id)}
              className="h-8 w-8 p-0 hover:bg-destructive/10"
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
            {word.english}
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
          {word.portuguese}
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