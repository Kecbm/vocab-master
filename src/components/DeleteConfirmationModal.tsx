import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VocabularyWord } from "./VocabularyCard";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  word: VocabularyWord | null;
  isDeleting?: boolean;
}

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  word, 
  isDeleting = false 
}: DeleteConfirmationModalProps) => {
  if (!word) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-destructive/10 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription className="text-left pt-2">
            Esta ação não pode ser desfeita. A palavra será removida permanentemente do seu vocabulário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Word Preview */}
          <div className="bg-muted/30 border border-muted rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {word.english}
                </h3>
                <p className="text-muted-foreground">
                  {word.portuguese}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  word.mastered 
                    ? "bg-mastered/10 text-mastered" 
                    : "bg-primary/10 text-primary"
                }`}>
                  {word.mastered ? "Dominada" : "Aprendendo"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>📚</span>
              <span>{word.book}</span>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-destructive mb-1">
                  Atenção: Exclusão Permanente
                </h4>
                <p className="text-sm text-destructive/80">
                  Você tem certeza que deseja excluir "<strong>{word.english}</strong>"? 
                  Esta palavra será removida permanentemente e você perderá todo o progresso associado a ela.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 h-11 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Palavra
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
