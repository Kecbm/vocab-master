import { useState, useMemo, useEffect, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import VocabularyCard, { VocabularyWord } from "@/components/VocabularyCard";
import AddWordModal from "@/components/AddWordModal";
import EditWordModal from "@/components/EditWordModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import { Plus, Brain, Target, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageToggle from "@/components/LanguageToggle";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import {
  getAllWords,
  addWordToData,
  updateWordInData,
  deleteWordFromData,
  toggleWordMastered
} from "@/utils/vocabularyData";
import { isToday } from "@/utils/dateUtils";

// Função debounce simples
const debounceFunction = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

const Index = () => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"alphabetical" | "recent">("alphabetical");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "learning" | "mastered">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingWord, setDeletingWord] = useState<VocabularyWord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  // Pagination constants
  const WORDS_PER_PAGE = 16;

  // Carrega palavras e configurações da API na inicialização
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Carrega palavras e configurações em paralelo
        const wordsFromAPI = await getAllWords();
        setWords(wordsFromAPI);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Error loading data",
          description: "Check if the server is running (npm run db)",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Search, filtering and sorting logic
  const filteredWords = useMemo(() => {
    let filtered = [...words]; // Create a copy to avoid mutations

    // PRIMEIRO: Filtro por idioma (sempre aplicado)
    filtered = filtered.filter(word => word.language === currentLanguage);

    // Aplica filtro de busca se houver query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(word =>
        word.foreignWord.toLowerCase().includes(query)
      );
    }

    // Aplica filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter(word => {
        const wordIsNew = isToday(word.createdAt);

        switch (statusFilter) {
          case "new":
            return wordIsNew;
          case "learning":
            return !word.mastered && !wordIsNew;
          case "mastered":
            return word.mastered;
          default:
            return true;
        }
      });
    }

    // Aplica ordenação
    if (sortOrder === "alphabetical") {
      filtered.sort((a, b) =>
        a.foreignWord.toLowerCase().localeCompare(b.foreignWord.toLowerCase())
      );
    } else {
      // Ordenação por data (mais recentes primeiro)
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || "1970-01-01");
        const dateB = new Date(b.createdAt || "1970-01-01");
        return dateB.getTime() - dateA.getTime();
      });
    }

    return filtered;
  }, [words, searchQuery, statusFilter, sortOrder, currentLanguage]);

  // Pagination logic
  const totalPages = Math.ceil(filteredWords.length / WORDS_PER_PAGE);
  const paginatedWords = useMemo(() => {
    const startIndex = (currentPage - 1) * WORDS_PER_PAGE;
    const endIndex = startIndex + WORDS_PER_PAGE;
    return filteredWords.slice(startIndex, endIndex);
  }, [filteredWords, currentPage, WORDS_PER_PAGE]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortOrder, currentLanguage]);

  const hasResults = filteredWords.length > 0;
  const isNewWord = searchQuery.length > 0 && !hasResults;

  // Statistics - filtered by current language
  const stats = useMemo(() => {
    // Filter words by current language first
    const languageWords = words.filter(w => w.language === currentLanguage);

    return {
      total: languageWords.length,
      mastered: languageWords.filter(w => w.mastered).length,
      learning: languageWords.filter(w => !w.mastered).length,
    };
  }, [words, currentLanguage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Reset filtro para "all" quando há busca ativa para evitar palavras duplicadas
    if (query.trim() && statusFilter !== "all") {
      setStatusFilter("all");
    }
  };

  const handleAddWord = async (newWordData: Omit<VocabularyWord, 'id'>) => {
    try {
      // Adiciona via API
      const newWord = await addWordToData(newWordData);

      // Adiciona ao estado atual
      setWords(prev => [newWord, ...prev]);

      // Fecha o modal
      setIsModalOpen(false);

      // Limpa o campo de busca
      setSearchQuery("");

      toast({
        title: "Word added!",
        description: `"${newWordData.foreignWord}" was added to your vocabulary.`,
      });
    } catch (error) {
      console.error('Error adding word:', error);
      toast({
        title: "Error adding word",
        description: "Check if the server is running",
        variant: "destructive",
      });
    }
  };

  const handleEditWord = (word: VocabularyWord) => {
    setEditingWord(word);
    setIsEditModalOpen(true);
  };

  const handleUpdateWord = async (updatedWord: VocabularyWord) => {
    try {
      // Atualiza via API
      await updateWordInData(updatedWord);

      // Atualiza o estado local
      setWords(prev => prev.map(word =>
        word.id === updatedWord.id ? updatedWord : word
      ));

      toast({
        title: "Word updated!",
        description: `"${updatedWord.foreignWord}" was updated successfully.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar palavra:', error);
      toast({
        title: "Error updating word",
        description: "Check if the server is running",
        variant: "destructive",
      });
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingWord(null);
  };

  const handleDeleteWord = (id: string) => {
    const word = words.find(w => w.id === id);
    if (word) {
      setDeletingWord(word);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingWord) return;

    setIsDeleting(true);

    try {
      // Remove via API
      await deleteWordFromData(deletingWord.id);

      // Remove do estado local
      setWords(prev => prev.filter(w => w.id !== deletingWord.id));

      toast({
        title: "Word removed",
        description: `"${deletingWord.foreignWord}" was removed from your vocabulary.`,
        variant: "destructive",
      });

      // Fecha o modal
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Erro ao deletar palavra:', error);
      toast({
        title: "Error deleting word",
        description: "Check if the server is running",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingWord(null);
    setIsDeleting(false);
  };


  const handleToggleMastered = async (id: string) => {
    try {
      // Atualiza via API e obtém a palavra atualizada
      const updatedWord = await toggleWordMastered(id);

      // Atualiza o estado local
      setWords(prev => prev.map(word =>
        word.id === id ? updatedWord : word
      ));

      toast({
        title: updatedWord.mastered ? "Word mastered!" : "Back to learning",
        description: `"${updatedWord.foreignWord}" ${updatedWord.mastered ? 'was marked as mastered' : 'is back to learning'}.`,
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Error changing status",
        description: "Check if the server is running",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Search Header */}
      <SearchBar
        onSearch={handleSearch}
        onAddNew={() => setIsModalOpen(true)}
        searchQuery={searchQuery}
        isNewWord={isNewWord}
      />

      <main className="max-w-7xl mx-auto px-6 pb-12 relative">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-learning/20 rounded-full blur-xl"></div>
                <div className="relative flex items-center justify-center w-16 h-16 bg-background/80 backdrop-blur-sm rounded-full border border-primary/20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground font-medium">{t('loadingWords')}</p>
            </div>
          </div>
        ) : (
          <>
        {/* Controls and Statistics */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-stretch min-h-[140px]">
            {/* Left Column: Sort and Filter Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sort Controls */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground/95">{t('sort')}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={sortOrder === "alphabetical" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortOrder("alphabetical")}
                    className={cn(
                      "h-8 text-xs font-medium rounded-lg transition-all duration-200",
                      sortOrder === "alphabetical"
                        ? "border-2 border-blue-500 text-blue-600 bg-blue-500/10 hover:text-blue-600"
                        : "border-2 text-foreground/70 hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    {t('sortAZ')}
                  </Button>
                  <Button
                    variant={sortOrder === "recent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortOrder("recent")}
                    className={cn(
                      "h-8 text-xs font-medium rounded-lg transition-all duration-200",
                      sortOrder === "recent"
                        ? "border-2 border-blue-500 text-blue-600 bg-blue-500/10 hover:text-blue-600"
                        : "border-2 text-foreground/70 hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    {t('sortRecent')}
                  </Button>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground/95">{t('filter')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className={cn(
                      "h-8 text-xs px-3 font-medium rounded-lg transition-all duration-200",
                      statusFilter === "all"
                        ? "border-2 border-blue-500 text-blue-600 bg-blue-500/10 hover:text-blue-600"
                        : "border-2 text-foreground/70 hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    {t('filterAll')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setStatusFilter("new")}
                    className={cn(
                      "h-8 text-xs px-3 font-medium rounded-lg border-2 transition-all duration-200",
                      statusFilter === "new"
                        ? "border-orange-500 text-orange-600 bg-orange-500/10 hover:text-orange-600"
                        : "bg-orange-500/10 text-orange-600/70 border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/30 hover:text-orange-600"
                    )}
                  >
                    {t('filterNew')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setStatusFilter("learning")}
                    className={cn(
                      "h-8 text-xs px-3 font-medium rounded-lg border-2 transition-all duration-200",
                      statusFilter === "learning"
                        ? "border-blue-500 text-blue-600 bg-blue-500/10 hover:text-blue-600"
                        : "bg-primary/10 text-primary/70 border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:text-blue-600"
                    )}
                  >
                    {t('filterLearning')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setStatusFilter("mastered")}
                    className={cn(
                      "h-8 text-xs px-3 font-medium rounded-lg border-2 transition-all duration-200",
                      statusFilter === "mastered"
                        ? "border-green-500 text-green-600 bg-green-500/10 hover:text-green-600"
                        : "bg-mastered/10 text-mastered/70 border-mastered/30 hover:bg-mastered/20 hover:border-mastered/50 hover:text-green-600"
                    )}
                  >
                    {t('filterMastered')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Middle Columns: Statistics Cards */}
            <div className="lg:col-span-3 grid grid-cols-3 gap-3 h-full">
              <div className="relative group border-2 border-primary/20 rounded-xl p-3 text-center flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-12 h-12"></div>
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mx-auto mb-2 border">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-xl font-bold text-foreground mb-1">{stats.total}</div>
                  <div className="text-xs font-medium text-primary uppercase tracking-wider">{t('total')}</div>
                </div>
              </div>

              {/* Learning Words Card */}
              <div className="relative group border-2 border-learning/20 rounded-xl p-3 text-center flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:shadow-learning/20 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-learning/5 to-transparent rounded-full -translate-y-6 translate-x-6"></div>
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-learning/20 to-learning/10 rounded-lg mx-auto mb-2 border border-learning/30">
                    <Plus className="h-5 w-5 text-learning" />
                  </div>
                  <div className="text-xl font-bold text-foreground mb-1">{stats.learning}</div>
                  <div className="text-xs font-medium text-learning uppercase tracking-wider">{t('learning')}</div>
                </div>
              </div>

              {/* Mastered Words Card */}
              <div className="relative group border-2 border-mastered/20 rounded-xl p-3 text-center flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:shadow-mastered/20 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-mastered/5 to-transparent rounded-full -translate-y-6 translate-x-6"></div>
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-mastered/20 to-mastered/10 rounded-lg mx-auto mb-2 border border-mastered/30">
                    <Target className="h-5 w-5 text-mastered" />
                  </div>
                  <div className="text-xl font-bold text-foreground mb-1">{stats.mastered}</div>
                  <div className="text-xs font-medium text-mastered uppercase tracking-wider">{t('mastered')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vocabulary Grid */}
        <section>
          {/* Words Grid */}
          {filteredWords.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedWords.map((word, index) => (
                  <div
                    key={word.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <VocabularyCard
                      word={word}
                      onEdit={handleEditWord}
                      onDelete={handleDeleteWord}
                      onToggleMastered={handleToggleMastered}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm border-2 border-muted/30 rounded-2xl p-2 shadow-lg">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={cn(
                        "h-10 px-4 rounded-xl font-semibold transition-all duration-200",
                        "border-2 hover:border-primary/30 hover:bg-primary/5",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-muted/30 disabled:hover:bg-transparent"
                      )}
                    >
                      {t('previous')}
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1;

                        if (!showPage) {
                          // Show ellipsis
                          if (page === 2 && currentPage > 4) {
                            return (
                              <span key={page} className="flex items-center justify-center w-10 h-10 text-muted-foreground font-bold">
                                ...
                              </span>
                            );
                          }
                          if (page === totalPages - 1 && currentPage < totalPages - 3) {
                            return (
                              <span key={page} className="flex items-center justify-center w-10 h-10 text-muted-foreground font-bold">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              "h-10 w-10 p-0 rounded-xl font-bold transition-all duration-200",
                              currentPage === page
                                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 border-primary"
                                : "border-2 hover:border-primary/30 hover:bg-primary/5 hover:scale-105"
                            )}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={cn(
                        "h-10 px-4 rounded-xl font-semibold transition-all duration-200",
                        "border-2 hover:border-primary/30 hover:bg-primary/5",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-muted/30 disabled:hover:bg-transparent"
                      )}
                    >
                      {t('next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : searchQuery.length === 0 ? (
            // Empty state - no search
            <div className="text-center py-20">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-learning/20 rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/15 to-primary/5 rounded-3xl border-2 border-primary/20 backdrop-blur-sm">
                  <Brain className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Start your learning journey
                </h3>
                <p className="text-muted-foreground/80 font-medium max-w-md mx-auto leading-relaxed">
                  Use the search bar above to look for words or add new discoveries from your book.
                </p>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className={cn(
                  "h-12 px-8 rounded-2xl font-semibold transition-all duration-300",
                  "bg-gradient-to-r from-primary to-primary/90",
                  "hover:from-primary/90 hover:to-primary/80",
                  "text-primary-foreground shadow-lg shadow-primary/25",
                  "hover:shadow-xl hover:shadow-primary/30 hover:scale-105",
                  "focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
                )}
              >
                <Plus className="h-5 w-5 mr-2" />
                <span className="font-bold">Add First Word</span>
              </Button>
            </div>
          ) : (
            // New word discovery state
            <div className="text-center py-20">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-learning/20 to-learning/10 rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-learning/15 to-learning/5 rounded-3xl border-2 border-learning/20 backdrop-blur-sm animate-pulse">
                  <Plus className="h-12 w-12 text-learning" />
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-learning to-learning/80 bg-clip-text text-transparent">
                  New word discovered!
                </h3>
                <p className="text-muted-foreground/80 font-medium max-w-md mx-auto leading-relaxed">
                  "<span className="font-bold text-learning">{searchQuery}</span>" is not in your vocabulary yet. How about adding it?
                </p>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className={cn(
                  "h-12 px-8 rounded-2xl font-semibold transition-all duration-300",
                  "bg-gradient-to-r from-learning to-learning/90",
                  "hover:from-learning/90 hover:to-learning/80",
                  "text-learning-foreground shadow-lg shadow-learning/25",
                  "hover:shadow-xl hover:shadow-learning/30 hover:scale-105",
                  "focus:ring-2 focus:ring-learning/30 focus:ring-offset-2",
                  "animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                )}
              >
                <Plus className="h-5 w-5 mr-2" />
                <span className="font-bold">Add "{searchQuery}"</span>
              </Button>
            </div>
          )}
        </section>
          </>
        )}
      </main>

      {/* Add Word Modal */}
      <AddWordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddWord}
        initialWord={searchQuery}
      />

      {/* Edit Word Modal */}
      <EditWordModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdate={handleUpdateWord}
        word={editingWord}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        word={deletingWord}
        isDeleting={isDeleting}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;