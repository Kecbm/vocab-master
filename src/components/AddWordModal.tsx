import { useState, useEffect } from "react";
import { Plus, Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VocabularyWord } from "./VocabularyCard";
import { cn } from "@/lib/utils";
import { getCurrentDate } from "@/utils/dateUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (word: Omit<VocabularyWord, 'id'>) => void;
  initialWord?: string;
}

const AddWordModal = ({ isOpen, onClose, onAdd, initialWord = "" }: AddWordModalProps) => {
  const { currentLanguage, getTranslationPair } = useLanguage();
  const { t } = useTranslation();

  const [formData, setFormData] = useState(() => ({
    foreignWord: initialWord,
    portuguese: "",
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Função para traduzir automaticamente
  const translateWord = async (word: string) => {
    if (!word.trim()) return;

    setIsTranslating(true);
    try {
      // Usando MyMemory API (gratuita) com o par de idiomas atual
      const translationPair = getTranslationPair();
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${translationPair}`
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

  // Traduzir automaticamente quando o modal abrir com uma palavra inicial
  useEffect(() => {
    if (isOpen && initialWord) {
      // Preenche a palavra no idioma atual
      setFormData({
        foreignWord: initialWord,
        portuguese: "", // Limpa tradução anterior
      });

      // Traduz automaticamente após um pequeno delay
      const timeoutId = setTimeout(() => {
        translateWord(initialWord);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, initialWord, currentLanguage]);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.foreignWord.trim()) {
      newErrors.foreignWord = t('englishWordRequired');
    } else if (formData.foreignWord.trim().includes(' ')) {
      newErrors.foreignWord = 'Please enter only one word (no spaces allowed)';
    }
    if (!formData.portuguese.trim()) {
      newErrors.portuguese = t('translationRequired');
    } else if (formData.portuguese.trim().includes(' ')) {
      newErrors.portuguese = 'Please enter only one word (no spaces allowed)';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onAdd({
        foreignWord: formData.foreignWord.trim(),
        language: currentLanguage,
        portuguese: formData.portuguese.trim(),
        createdAt: getCurrentDate(),
        mastered: false,
      });

      // Reset form
      setFormData({ foreignWord: "", portuguese: "" });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ foreignWord: initialWord, portuguese: "" });
    setErrors({});
    setIsTranslating(false);
    onClose();
  };

  const handleRetranslate = () => {
    if (formData.foreignWord.trim()) {
      translateWord(formData.foreignWord.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-full mx-4 rounded-2xl border-0 shadow-2xl backdrop-blur-sm">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <Plus className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-foreground">
              {t('addNewWord')}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Language Word */}
          <div className="space-y-3">
            <Label
              htmlFor="foreignWord"
              className="text-sm font-medium text-foreground/90 flex items-center gap-2"
            >
              {t('englishWord')}
              <span className="text-destructive text-xs">*</span>
            </Label>
            <div className="relative">
              <Input
                id="foreignWord"
                type="text"
                value={formData.foreignWord}
                onChange={(e) => {
                  // Remove espaços e caracteres especiais, permitindo apenas letras, números e alguns caracteres especiais comuns
                  const value = e.target.value.replace(/\s+/g, '');
                  setFormData(prev => ({ ...prev, foreignWord: value }));
                  // Limpa erro se existir
                  if (errors.foreignWord) {
                    setErrors(prev => ({ ...prev, foreignWord: '' }));
                  }
                }}
                placeholder={currentLanguage === 'english' ? "Ex: serendipity" : "Ex: sérendipité"}
                className={cn(
                  "h-12 text-lg px-4 rounded-xl border-2 transition-all duration-200",
                  "backdrop-blur-sm",
                  "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                  "placeholder:text-muted-foreground/60",
                  errors.foreignWord
                    ? "border-destructive/50 focus:border-destructive focus:ring-red-500/20"
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
                      <span className="font-medium">{t('translating')}</span>
                    </>
                  ) : (
                    <>
                      <Languages className="h-3 w-3 mr-1.5" />
                      <span className="font-medium">{t('retranslate')}</span>
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
                onChange={(e) => {
                  // Remove espaços e caracteres especiais, permitindo apenas letras, números e alguns caracteres especiais comuns
                  const value = e.target.value.replace(/\s+/g, '');
                  setFormData(prev => ({ ...prev, portuguese: value }));
                  // Limpa erro se existir
                  if (errors.portuguese) {
                    setErrors(prev => ({ ...prev, portuguese: '' }));
                  }
                }}
                placeholder={isTranslating ? "Translating automatically..." : "Ex: serendipity, pleasant surprise"}
                className={cn(
                  "h-12 text-lg px-4 pr-12 rounded-xl border-2 transition-all duration-200",
                  "backdrop-blur-sm",
                  "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                  "placeholder:text-muted-foreground/60",
                  errors.portuguese
                    ? "border-destructive/50 focus:border-destructive focus:ring-red-500/20"
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
            {formData.portuguese && !isTranslating && (
              <div className="flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                <span className="text-blue-600 dark:text-blue-400">💡</span>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Automatic translation. You can edit it if needed.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              className={cn(
                "flex-1 h-14 px-3 rounded-lg font-medium transition-all duration-300",
                "bg-orange-500/10 border border-orange-500/20",
                "hover:bg-orange-500/20 hover:border-orange-500/30",
                "text-orange-600",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              disabled={isTranslating}
            >
              <Plus className="h-4 w-4 mr-2 text-orange-600" />
              <span className="font-medium text-orange-600">{t('addWord')}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWordModal;