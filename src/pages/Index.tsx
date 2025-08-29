import { useState, useMemo, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import VocabularyCard, { VocabularyWord } from "@/components/VocabularyCard";
import AddWordModal from "@/components/AddWordModal";
import EditWordModal from "@/components/EditWordModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Brain, Target, Loader2, Eraser, CheckCircle } from "lucide-react";
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
  toggleWordMastered,
  getSettings,
  updateCurrentBook,
  finishCurrentBook
} from "@/utils/vocabularyData";
import { isToday } from "@/utils/dateUtils";

const Index = () => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBook, setCurrentBook] = useState("");
  const [oldBooks, setOldBooks] = useState<string[]>([]);
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
        const [wordsFromAPI, settingsFromAPI] = await Promise.all([
          getAllWords(),
          getSettings()
        ]);

        setWords(wordsFromAPI);
        setCurrentBook(settingsFromAPI.currentBook);
        setOldBooks(settingsFromAPI.oldBooks || []);
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
      books: new Set(languageWords.map(w => w.book)).size,
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

  // Função para atualizar o livro atual
  const handleCurrentBookChange = async (newBook: string) => {
    setCurrentBook(newBook);

    try {
      await updateCurrentBook(newBook);
    } catch (error) {
      console.error('Erro ao salvar livro atual:', error);
      toast({
        title: "Error saving book",
        description: "The book was updated locally, but not saved on the server",
        variant: "destructive",
      });
    }
  };

  // Função para finalizar o livro atual
  const handleFinishCurrentBook = async () => {
    if (!currentBook.trim()) {
      toast({
        title: "No book to finish",
        description: "Please set a current book first",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedSettings = await finishCurrentBook("");
      setOldBooks(updatedSettings.oldBooks || []);
      setCurrentBook("");

      toast({
        title: "Book finished!",
        description: `"${currentBook}" was moved to completed books`,
      });
    } catch (error) {
      console.error('Erro ao finalizar livro:', error);
      toast({
        title: "Error finishing book",
        description: "Could not save the changes",
        variant: "destructive",
      });
    }
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
        {/* Current Book & Statistics */}
        <section className="mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Current Book Card - Takes 2 columns on large screens */}
            <div className="col-span-2 bg-card border border-card-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{t('currentBook')}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentBook}
                  onChange={(e) => handleCurrentBookChange(e.target.value)}
                  placeholder={t('currentBookPlaceholder')}
                  className="flex-1 h-8 px-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                />
                {currentBook && (
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleCurrentBookChange("")}
                      variant="outline"
                      size="sm"
                      title={t('clearCurrentBook')}
                      className="h-8 w-8 p-0"
                    >
                      <Eraser className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleFinishCurrentBook}
                      variant="outline"
                      size="sm"
                      title={t('finishCurrentBook')}
                      className="h-8 w-8 p-0"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {currentBook && (
                <p className="text-xs text-muted-foreground mt-2">
                  📖 {t('newWordsAssociated')}
                </p>
              )}
            </div>

            {/* Old Books Section */}
            {oldBooks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{t('completedBooks')}</span>
                </div>
                <div className="space-y-2">
                  {oldBooks.map((book, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                    >
                      <span className="text-xs text-muted-foreground">📚</span>
                      <span className="text-sm text-foreground flex-1">{book}</span>
                      <span className="text-xs text-muted-foreground">
                        {words.filter(w => w.book === book).length} {t('wordsCount')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="bg-card border border-card-border rounded-xl p-4 text-center">
              <div className="p-2 bg-primary/10 rounded-lg w-fit mx-auto mb-2">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground">{stats.total}</div>
              <div className="text-xs text-muted-foreground">{t('total')}</div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-4 text-center">
              <div className="p-2 bg-learning/10 rounded-lg w-fit mx-auto mb-2">
                <Plus className="h-4 w-4 text-learning" />
              </div>
              <div className="text-xl font-bold text-foreground">{stats.learning}</div>
              <div className="text-xs text-muted-foreground">{t('learning')}</div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-4 text-center">
              <div className="p-2 bg-mastered/10 rounded-lg w-fit mx-auto mb-2">
                <Target className="h-4 w-4 text-mastered" />
              </div>
              <div className="text-xl font-bold text-foreground">{stats.mastered}</div>
              <div className="text-xs text-muted-foreground">{t('mastered')}</div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-4 text-center">
              <div className="p-2 bg-primary/10 rounded-lg w-fit mx-auto mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground">{stats.books}</div>
              <div className="text-xs text-muted-foreground">{t('books')}</div>
            </div>
          </div>
        </section>

        {/* Vocabulary Grid */}
        <section>
          {/* Filter Controls */}
          <div className="mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
              {/* Sort Filters - Always in first position */}
              <div className="flex items-center gap-2">
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

              {/* Status Filters - Always in center position */}
              <div className="flex items-center gap-2 justify-center">
                <span className="text-sm font-medium text-muted-foreground">{t('filter')}</span>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className="h-8 text-xs"
                  >
                    {t('filterAll')}
                  </Button>
                  <Button
                    variant={statusFilter === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("new")}
                    className="h-8 text-xs bg-learning/10 text-learning border-learning/20 hover:bg-learning/20"
                  >
                    {t('filterNew')}
                  </Button>
                  <Button
                    variant={statusFilter === "learning" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("learning")}
                    className="h-8 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  >
                    {t('filterLearning')}
                  </Button>
                  <Button
                    variant={statusFilter === "mastered" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("mastered")}
                    className="h-8 text-xs bg-mastered/10 text-mastered border-mastered/20 hover:bg-mastered/20"
                  >
                    {t('filterMastered')}
                  </Button>
                </div>
              </div>

              {/* Word Count - Always in third position */}
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
                <BookOpen className="h-12 w-12 text-primary" />
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
        currentBook={currentBook}
      />

      {/* Edit Word Modal */}
      <EditWordModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdate={handleUpdateWord}
        word={editingWord}
        currentBook={currentBook}
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