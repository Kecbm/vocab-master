import { useState, useMemo, useEffect, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import VocabularyCard, { VocabularyWord } from "@/components/VocabularyCard";
import AddWordModal from "@/components/AddWordModal";
import EditWordModal from "@/components/EditWordModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import { Plus, Brain, Target, Loader2 } from "lucide-react";
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
    <div className="min-h-screen">
      {/* Search Header */}
      <SearchBar
        onSearch={handleSearch}
        onAddNew={() => setIsModalOpen(true)}
        searchQuery={searchQuery}
        hasResults={hasResults}
        isNewWord={isNewWord}
      />

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{t('loadingWords')}</p>
            </div>
          </div>
        ) : (
          <>
        {/* Controls and Statistics */}
        <section className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-stretch min-h-[120px]">
            {/* Left Column: Sort and Filter Controls */}
            <div className="lg:col-span-2 flex flex-col justify-between h-full py-2">
              {/* Sort Controls - Top Left */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">{t('sort')}</span>
                <div className="flex gap-2">
                  <Button
                    variant={sortOrder === "alphabetical" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortOrder("alphabetical")}
                    className="h-8 text-xs"
                  >
                    {t('sortAZ')}
                  </Button>
                  <Button
                    variant={sortOrder === "recent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortOrder("recent")}
                    className="h-8 text-xs"
                  >
                    {t('sortRecent')}
                  </Button>
                </div>
              </div>

              {/* Filter Controls - Below Sort */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">{t('filter')}</span>
                <div className="flex gap-1">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className="h-8 text-xs px-2"
                  >
                    {t('filterAll')}
                  </Button>
                  <Button
                    variant={statusFilter === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("new")}
                    className="h-8 text-xs px-2 bg-learning/10 text-learning border-learning/20 hover:bg-learning/20"
                  >
                    {t('filterNew')}
                  </Button>
                  <Button
                    variant={statusFilter === "learning" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("learning")}
                    className="h-8 text-xs px-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  >
                    {t('filterLearning')}
                  </Button>
                  <Button
                    variant={statusFilter === "mastered" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("mastered")}
                    className="h-8 text-xs px-2 bg-mastered/10 text-mastered border-mastered/20 hover:bg-mastered/20"
                  >
                    {t('filterMastered')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Middle Columns: Statistics Cards */}
            <div className="lg:col-span-3 grid grid-cols-3 gap-2 h-full">
              <div className="bg-card border border-card-border rounded-xl p-3 text-center flex flex-col justify-center">
                <div className="p-1.5 bg-primary/10 rounded-lg w-fit mx-auto mb-1.5">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="text-lg font-bold text-foreground">{stats.total}</div>
                <div className="text-xs text-muted-foreground">{t('total')}</div>
              </div>

              <div className="bg-card border border-card-border rounded-xl p-3 text-center flex flex-col justify-center">
                <div className="p-1.5 bg-learning/10 rounded-lg w-fit mx-auto mb-1.5">
                  <Plus className="h-3.5 w-3.5 text-learning" />
                </div>
                <div className="text-lg font-bold text-foreground">{stats.learning}</div>
                <div className="text-xs text-muted-foreground">{t('learning')}</div>
              </div>

              <div className="bg-card border border-card-border rounded-xl p-3 text-center flex flex-col justify-center">
                <div className="p-1.5 bg-mastered/10 rounded-lg w-fit mx-auto mb-1.5">
                  <Target className="h-3.5 w-3.5 text-mastered" />
                </div>
                <div className="text-lg font-bold text-foreground">{stats.mastered}</div>
                <div className="text-xs text-muted-foreground">{t('mastered')}</div>
              </div>
            </div>

            {/* Right Column: Word Count and Pagination Info */}
            <div className="flex flex-col justify-center h-full py-2">
              <div className="text-sm text-muted-foreground text-right">
                {filteredWords.length > 0 ? (
                  <>
                    {filteredWords.length} {t('wordsCount')}
                    {totalPages > 1 && (
                      <span className="ml-2">
                        • {t('page')} {currentPage} {t('of')} {totalPages}
                      </span>
                    )}
                  </>
                ) : (
                  t('noWordsFound')
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Vocabulary Grid */}
        <section>

          {/* Words Grid */}
          {filteredWords.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedWords.map((word) => (
                  <VocabularyCard
                    key={word.id}
                    word={word}
                    onEdit={handleEditWord}
                    onDelete={handleDeleteWord}
                    onToggleMastered={handleToggleMastered}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-9 px-3"
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
                            return <span key={page} className="px-2 text-muted-foreground">...</span>;
                          }
                          if (page === totalPages - 1 && currentPage < totalPages - 3) {
                            return <span key={page} className="px-2 text-muted-foreground">...</span>;
                          }
                          return null;
                        }

                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="h-9 w-9 p-0"
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
                      className="h-9 px-3"
                    >
                      {t('next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : searchQuery.length === 0 ? (
            // Empty state - no search
            <div className="text-center py-16">
              <div className="p-4 bg-primary/10 rounded-3xl w-fit mx-auto mb-6">
                <Brain className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Start your learning journey
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Use the search bar above to look for words or add new discoveries from your book.
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add First Word
              </Button>
            </div>
          ) : (
            // New word discovery state
            <div className="text-center py-16">
              <div className="p-4 bg-learning/10 rounded-3xl w-fit mx-auto mb-6">
                <Plus className="h-12 w-12 text-learning" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                New word discovered!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                "{searchQuery}" is not in your vocabulary yet. How about adding it?
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-learning hover:bg-learning/90 text-learning-foreground px-6 py-3 rounded-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add "{searchQuery}"
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