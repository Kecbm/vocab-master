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
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();

  if (!word) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full mx-4 rounded-2xl border-0 shadow-2xl bg-background/95 backdrop-blur-sm">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-xl border border-destructive/30 shadow-lg shadow-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <span className="text-destructive">
              {t('deleteWord')}
            </span>
          </DialogTitle>
          <DialogDescription className="text-left pt-3 text-muted-foreground/80 leading-relaxed">
            {t('deleteWarning')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Word Preview */}
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-3 px-6 py-4 border-2 border-muted/30 rounded-2xl">
              <span className="w-2 h-2 bg-destructive rounded-full"></span>
              <h3 className="text-xl font-bold text-foreground tracking-tight">
                {word.foreignWord}
              </h3>
            </div>
          </div>

          {/* Warning Message */}
          <div className="relative overflow-hidden bg-gradient-to-br from-destructive/8 to-destructive/3 border-2 border-destructive/25 rounded-2xl p-5 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-destructive/10 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-xl border border-destructive/30 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-destructive text-base tracking-tight">
                  Warning: Permanent Deletion
                </h4>
                <p className="text-sm text-destructive/80 leading-relaxed">
                  {t('deleteConfirmation')}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-1 h-1 bg-destructive/60 rounded-full"></span>
                  <span className="text-xs text-destructive/70 font-medium">This action cannot be undone</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className={cn(
                "flex-1 h-12 rounded-xl font-medium transition-all duration-200",
                "bg-destructive",
                "hover:bg-destructive/90",
                "text-destructive-foreground shadow-lg shadow-destructive/25",
                "focus:ring-2 focus:ring-destructive/30 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isDeleting && "cursor-wait"
              )}
            >
              {isDeleting ? (
                <>
                  <div className="flex items-center justify-center w-5 h-5 mr-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                  <span className="font-semibold">Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="font-semibold">{t('delete')}</span>
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
