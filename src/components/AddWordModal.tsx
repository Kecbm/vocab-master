import { useState } from "react";
import { BookOpen, Plus, X } from "lucide-react";
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

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (word: Omit<VocabularyWord, 'id'>) => void;
  initialWord?: string;
}

const AddWordModal = ({ isOpen, onClose, onAdd, initialWord = "" }: AddWordModalProps) => {
  const [formData, setFormData] = useState({
    english: initialWord,
    portuguese: "",
    book: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.english.trim()) newErrors.english = "Palavra em inglês é obrigatória";
    if (!formData.portuguese.trim()) newErrors.portuguese = "Tradução é obrigatória";
    if (!formData.book.trim()) newErrors.book = "Nome do livro é obrigatório";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onAdd({
        ...formData,
        english: formData.english.trim(),
        portuguese: formData.portuguese.trim(),
        book: formData.book.trim(),
        isNew: true,
        mastered: false,
      });
      
      // Reset form
      setFormData({ english: "", portuguese: "", book: "" });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ english: initialWord, portuguese: "", book: "" });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-learning/10 rounded-xl">
              <Plus className="h-5 w-5 text-learning" />
            </div>
            Nova Palavra
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* English Word */}
          <div className="space-y-2">
            <Label htmlFor="english" className="text-sm font-medium">
              Palavra em Inglês *
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
            <Label htmlFor="portuguese" className="text-sm font-medium">
              Tradução em Português *
            </Label>
            <Input
              id="portuguese"
              type="text"
              value={formData.portuguese}
              onChange={(e) => setFormData(prev => ({ ...prev, portuguese: e.target.value }))}
              placeholder="Ex: serendipidade, casualidade feliz"
              className={cn(
                "h-12 text-lg",
                errors.portuguese && "border-destructive focus:border-destructive"
              )}
            />
            {errors.portuguese && (
              <p className="text-sm text-destructive">{errors.portuguese}</p>
            )}
          </div>

          {/* Book Source */}
          <div className="space-y-2">
            <Label htmlFor="book" className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Livro de Origem *
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
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-learning hover:bg-learning/90 text-learning-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Palavra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWordModal;