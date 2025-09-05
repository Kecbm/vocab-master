import { useState, useEffect } from "react";
import { BookOpen, Edit, X, Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VocabularyWord } from "./VocabularyCard";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface EditWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (word: VocabularyWord) => void;
  word: VocabularyWord | null;
}

const EditWordModal = ({ isOpen, onClose, onUpdate, word }: EditWordModalProps) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    foreignWord: "",
    portuguese: "",
    mastered: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Preenche o formulário quando a palavra muda
  useEffect(() => {
    if (word) {
      setFormData({
        foreignWord: word.foreignWord,
        portuguese: word.portuguese,
        mastered: word.mastered,
      });
    }
  }, [word]);

  // Função para traduzir automaticamente
  const translateWord = async (englishWord: string) => {
    if (!englishWord.trim()) return;
    
    setIsTranslating(true);
    try {
      // Usando MyMemory API (gratuita)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishWord)}&langpair=en|pt`
      );
      const data = await response.json();
      
      if (data.responseData && data.responseData.translatedText) {
        setFormData(prev => ({ 
          ...prev, 
          portuguese: data.responseData.translatedText 
        }));
      }
    } catch (error) {
      console.error('Erro na tradução:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word) return;
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.foreignWord.trim()) newErrors.foreignWord = "Foreign word is required";
    if (!formData.portuguese.trim()) newErrors.portuguese = "Translation is required";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const updatedWord: VocabularyWord = {
        ...word,
        foreignWord: formData.foreignWord.trim(),
        portuguese: formData.portuguese.trim(),
        mastered: formData.mastered,
      };
      
      onUpdate(updatedWord);
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    setIsTranslating(false);
    onClose();
  };

  const handleRetranslate = () => {
    if (formData.foreignWord.trim()) {
      translateWord(formData.foreignWord.trim());
    }
  };

  if (!word) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-full mx-4 rounded-2xl border-0 shadow-2xl bg-background/95 backdrop-blur-sm">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl border border-primary/20">
              <Edit className="h-5 w-5 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {t('editWord')}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* English Word */}
          <div className="space-y-3">
            <Label
              htmlFor="foreignWord"
              className="text-sm font-medium text-foreground/90 flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              {t('englishWord')}
              <span className="text-destructive text-xs">*</span>
            </Label>
            <div className="relative">
              <Input
                id="foreignWord"
                type="text"
                value={formData.foreignWord}
                onChange={(e) => setFormData(prev => ({ ...prev, foreignWord: e.target.value }))}
                placeholder="Ex: serendipity"
                className={cn(
                  "h-12 text-lg px-4 rounded-xl border-2 transition-all duration-200",
                  "bg-background/50 backdrop-blur-sm",
                  "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  "placeholder:text-muted-foreground/60",
                  errors.foreignWord
                    ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                    : "border-input hover:border-input"
                )}
                autoFocus
              />
            </div>
            {errors.foreignWord && (
              <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="w-1 h-1 bg-destructive rounded-full"></div>
                <p className="text-sm text-destructive font-medium">{errors.foreignWord}</p>
              </div>
            )}
          </div>

          {/* Portuguese Translation */}
          <div className="space-y-3">
            <Label
              htmlFor="portuguese"
              className="text-sm font-medium text-foreground/90 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                {t('portugueseTranslation')}
                <span className="text-destructive text-xs">*</span>
              </div>
              {formData.foreignWord && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRetranslate}
                  disabled={isTranslating}
                  className={cn(
                    "h-7 px-3 text-xs rounded-lg transition-all duration-200",
                    "text-primary hover:text-primary/80 hover:bg-primary/10",
                    "border border-transparent hover:border-primary/20",
                    isTranslating && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      <span className="font-medium">Translating...</span>
                    </>
                  ) : (
                    <>
                      <Languages className="h-3 w-3 mr-1.5" />
                      <span className="font-medium">Retranslate</span>
                    </>
                  )}
                </Button>
              )}
            </Label>
            <div className="relative">
              <Input
                id="portuguese"
                type="text"
                value={formData.portuguese}
                onChange={(e) => setFormData(prev => ({ ...prev, portuguese: e.target.value }))}
                placeholder={isTranslating ? "Translating automatically..." : "Ex: serendipity, pleasant surprise"}
                className={cn(
                  "h-12 text-lg px-4 pr-12 rounded-xl border-2 transition-all duration-200",
                  "bg-background/50 backdrop-blur-sm",
                  "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  "placeholder:text-muted-foreground/60",
                  errors.portuguese
                    ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                    : "border-input hover:border-input",
                  isTranslating && "bg-muted/30 cursor-wait"
                )}
                disabled={isTranslating}
              />
              {isTranslating && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
            {errors.portuguese && (
              <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="w-1 h-1 bg-destructive rounded-full"></div>
                <p className="text-sm text-destructive font-medium">{errors.portuguese}</p>
              </div>
            )}
          </div>


          {/* Mastered Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground/90 flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full"></span>
              Word Status
            </Label>
            <div className={cn(
              "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200",
              "bg-background/50 backdrop-blur-sm",
              formData.mastered
                ? "border-mastered/30 bg-mastered/5"
                : "border-orange-500/30 bg-orange-500/5"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200",
                  formData.mastered
                    ? "bg-gradient-to-br from-mastered/20 to-mastered/10 border border-mastered/20"
                    : "bg-gradient-to-br from-orange-500/20 to-orange-500/10 border border-orange-500/20"
                )}>
                  {formData.mastered ? (
                    <BookOpen className="h-6 w-6 text-mastered" />
                  ) : (
                    <Edit className="h-6 w-6 text-orange-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {formData.mastered ? "Mastered" : "Learning"}
                  </p>
                  <p className="text-sm text-muted-foreground/80">
                    {formData.mastered
                      ? "You have mastered this word"
                      : "Still practicing this word"
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {formData.mastered ? "Mastered" : "Learning"}
                  </p>
                </div>
                <Switch
                  checked={formData.mastered}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mastered: checked }))}
                  className="data-[state=checked]:bg-mastered data-[state=unchecked]:bg-learning/30"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              className={cn(
                "flex-1 h-12 rounded-xl font-medium transition-all duration-200",
                "bg-gradient-to-r from-primary to-primary/90",
                "hover:from-primary/90 hover:to-primary/80",
                "text-primary-foreground shadow-lg shadow-primary/25",
                "focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              disabled={isTranslating}
            >
              <Edit className="h-4 w-4 mr-2" />
              <span className="font-semibold">{t('saveChanges')}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWordModal;
