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

interface EditWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (word: VocabularyWord) => void;
  word: VocabularyWord | null;
  currentBook?: string;
}

const EditWordModal = ({ isOpen, onClose, onUpdate, word, currentBook = "" }: EditWordModalProps) => {
  const [formData, setFormData] = useState({
    english: "",
    portuguese: "",
    book: "",
    mastered: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Preenche o formulário quando a palavra muda
  useEffect(() => {
    if (word) {
      setFormData({
        english: word.english,
        portuguese: word.portuguese,
        book: word.book || currentBook, // Usa livro atual se a palavra não tiver livro
        mastered: word.mastered,
      });
    }
  }, [word, currentBook]);

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
    if (!formData.english.trim()) newErrors.english = "English word is required";
    if (!formData.portuguese.trim()) newErrors.portuguese = "Translation is required";
    if (!formData.book.trim()) newErrors.book = "Book name is required";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const updatedWord: VocabularyWord = {
        ...word,
        english: formData.english.trim(),
        portuguese: formData.portuguese.trim(),
        book: formData.book.trim(),
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
    if (formData.english.trim()) {
      translateWord(formData.english.trim());
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
            Edit Word
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

          {/* Mastered Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Word Status</Label>
            <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
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
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Edit className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWordModal;
