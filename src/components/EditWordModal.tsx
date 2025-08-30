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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Edit className="h-5 w-5 text-primary" />
            </div>
            {t('editWord')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* English Word */}
          <div className="space-y-2">
            <Label htmlFor="foreignWord" className="text-sm font-medium">
              {t('englishWord')} *
            </Label>
            <Input
              id="foreignWord"
              type="text"
              value={formData.foreignWord}
              onChange={(e) => setFormData(prev => ({ ...prev, foreignWord: e.target.value }))}
              placeholder="Ex: serendipity"
              className={cn(
                "h-12 text-lg",
                errors.foreignWord && "border-destructive focus:border-destructive"
              )}
              autoFocus
            />
            {errors.foreignWord && (
              <p className="text-sm text-destructive">{errors.foreignWord}</p>
            )}
          </div>

          {/* Portuguese Translation */}
          <div className="space-y-2">
            <Label htmlFor="portuguese" className="text-sm font-medium flex items-center justify-between">
              <span>{t('portugueseTranslation')} *</span>
              {formData.foreignWord && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRetranslate}
                  disabled={isTranslating}
                  className="h-6 px-2 text-xs text-primary hover:text-primary/80"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages className="h-3 w-3 mr-1" />
                      Retranslate
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
                  "h-12 text-lg",
                  errors.portuguese && "border-destructive focus:border-destructive",
                  isTranslating && "bg-muted/50"
                )}
                disabled={isTranslating}
              />
              {isTranslating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
            {errors.portuguese && (
              <p className="text-sm text-destructive">{errors.portuguese}</p>
            )}
          </div>


          {/* Mastered Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Word Status</Label>
            <div className="flex items-center justify-between p-4 border rounded-xl">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  formData.mastered ? "bg-mastered/10" : "bg-learning/10"
                )}>
                  {formData.mastered ? (
                    <BookOpen className="h-5 w-5 text-mastered" />
                  ) : (
                    <Edit className="h-5 w-5 text-learning" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {formData.mastered ? "Mastered" : "Learning"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.mastered
                      ? "You have mastered this word"
                      : "Still practicing this word"
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.mastered}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mastered: checked }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('saveChanges')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWordModal;
