import { useState, useEffect } from "react";
import { BookOpen, Plus, Languages, Loader2 } from "lucide-react";
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

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (word: Omit<VocabularyWord, 'id'>) => void;
  initialWord?: string;
  currentBook?: string;
}

const AddWordModal = ({ isOpen, onClose, onAdd, initialWord = "", currentBook = "" }: AddWordModalProps) => {
  const [formData, setFormData] = useState(() => ({
    english: initialWord,
    portuguese: "",
    book: currentBook,
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Função para traduzir automaticamente
  const translateWord = async (word: string) => {
    if (!word.trim()) return;

    setIsTranslating(true);
    try {
      // Usando MyMemory API (gratuita)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|pt`
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
      // Preenche a palavra em inglês
      setFormData(prev => ({
        ...prev,
        english: initialWord,
        portuguese: "" // Limpa tradução anterior
      }));

      // Traduz automaticamente após um pequeno delay para garantir que a palavra está completa
      const timeoutId = setTimeout(() => {
        translateWord(initialWord);
      }, 300); // 300ms de delay

      // Cleanup do timeout se o componente for desmontado ou dependências mudarem
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, initialWord]);

  // Atualizar livro quando currentBook mudar
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      book: currentBook
    }));
  }, [currentBook]);

  // Garantir que o livro seja atualizado quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        book: currentBook
      }));
    }
  }, [isOpen, currentBook]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.english.trim()) newErrors.english = "English word is required";
    if (!formData.portuguese.trim()) newErrors.portuguese = "Translation is required";
    if (!formData.book.trim()) newErrors.book = "Book name is required";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onAdd({
        ...formData,
        english: formData.english.trim(),
        portuguese: formData.portuguese.trim(),
        book: formData.book.trim(),
        createdAt: getCurrentDate(), // Apenas data: YYYY-MM-DD
        mastered: false,
      });
      
      // Reset form
      setFormData({ english: "", portuguese: "", book: "" });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ english: initialWord, portuguese: "", book: currentBook });
    setErrors({});
    setIsTranslating(false);
    onClose();
  };

  const handleRetranslate = () => {
    if (formData.english.trim()) {
      translateWord(formData.english.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-learning/10 rounded-xl">
              <Plus className="h-5 w-5 text-learning" />
            </div>
            New Word
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* English Word */}
          <div className="space-y-2">
            <Label htmlFor="english" className="text-sm font-medium">
              English Word *
            </Label>
            <Input
              id="english"
              type="text"
              value={formData.english}
              onChange={(e) => setFormData(prev => ({ ...prev, english: e.target.value }))}
              placeholder="Ex: serendipity"
              className={cn(
                "h-12 text-lg",
                errors.english && "border-destructive focus:border-destructive"
              )}
              autoFocus
            />
            {errors.english && (
              <p className="text-sm text-destructive">{errors.english}</p>
            )}
          </div>

          {/* Portuguese Translation */}
          <div className="space-y-2">
            <Label htmlFor="portuguese" className="text-sm font-medium flex items-center justify-between">
              <span>Portuguese Translation *</span>
              {formData.english && (
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
            {formData.portuguese && !isTranslating && (
              <p className="text-xs text-muted-foreground">
                💡 Automatic translation. You can edit it if needed.
              </p>
            )}
          </div>

          {/* Book Source */}
          <div className="space-y-2">
            <Label htmlFor="book" className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Source Book *
            </Label>
            <Input
              id="book"
              type="text"
              value={formData.book}
              onChange={(e) => setFormData(prev => ({ ...prev, book: e.target.value }))}
              placeholder="Ex: The Hobbit - J.R.R. Tolkien"
              className={cn(
                "h-12 text-lg",
                errors.book && "border-destructive focus:border-destructive"
              )}
            />
            {errors.book && (
              <p className="text-sm text-destructive">{errors.book}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-learning hover:bg-learning/90 text-learning-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Word
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWordModal;