import { useState, useMemo, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import VocabularyCard, { VocabularyWord } from "@/components/VocabularyCard";
import AddWordModal from "@/components/AddWordModal";
import EditWordModal from "@/components/EditWordModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Brain, Target, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllWords,
  addWordToData,
  updateWordInData,
  deleteWordFromData,
  toggleWordMastered,
  getSettings,
  updateCurrentBook
} from "@/utils/vocabularyData";
import { isToday } from "@/utils/dateUtils";

const Index = () => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBook, setCurrentBook] = useState("");
  const [sortOrder, setSortOrder] = useState<"alphabetical" | "recent">("alphabetical");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "learning" | "mastered">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingWord, setDeletingWord] = useState<VocabularyWord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
    let filtered = words;

    // Aplica filtro de busca se houver query (apenas palavras em inglês)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = words.filter(word =>
        word.english.toLowerCase().includes(query)
      );
    }

    // Aplica filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter(word => {
        switch (statusFilter) {
          case "new":
            return isToday(word.createdAt);
          case "learning":
            return !word.mastered && !isToday(word.createdAt);
          case "mastered":
            return word.mastered;
          default:
            return true;
        }
      });
    }

    // Aplica ordenação
    if (sortOrder === "alphabetical") {
      return filtered.sort((a, b) =>
        a.english.toLowerCase().localeCompare(b.english.toLowerCase())
      );
    } else {
      // Ordenação por data (mais recentes primeiro)
      return filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || "1970-01-01");
        const dateB = new Date(b.createdAt || "1970-01-01");
        return dateB.getTime() - dateA.getTime();
      });
    }
  }, [words, searchQuery, statusFilter, sortOrder]);

  const hasResults = filteredWords.length > 0;
  const isNewWord = searchQuery.length > 0 && !hasResults;

  // Statistics
  const stats = useMemo(() => ({
    total: words.length,
    mastered: words.filter(w => w.mastered).length,
    learning: words.filter(w => !w.mastered).length,
    books: new Set(words.map(w => w.book)).size,
  }), [words]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddWord = async (newWordData: Omit<VocabularyWord, 'id'>) => {
    try {
      // Adiciona via API
      const newWord = await addWordToData(newWordData);

      // Adiciona ao estado atual
      setWords(prev => [newWord, ...prev]);

      setSearchQuery("");

      toast({
        title: "Word added!",
        description: `"${newWordData.english}" was added to your vocabulary.`,
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
        description: `"${updatedWord.english}" was updated successfully.`,
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
        description: `"${deletingWord.english}" was removed from your vocabulary.`,
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
        description: `"${updatedWord.english}" ${updatedWord.mastered ? 'was marked as mastered' : 'is back to learning'}.`,
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
              <p className="text-muted-foreground">Loading words...</p>
            </div>
          </div>
        ) : (
          <>
        {/* Compact Statistics & Current Book */}
        <section className="mb-6">
          {/* Statistics - Compact horizontal layout */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-card border border-card-border rounded-xl p-4 text-center">
              <div className="p-2 bg-primary/10 rounded-lg w-fit mx-auto mb-2">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            
            <div className="bg-card border border-card-border rounded-xl p-4 text-center">
              <div className="p-2 bg-mastered/10 rounded-lg w-fit mx-auto mb-2">
                <Target className="h-4 w-4 text-mastered" />
              </div>
              <div className="text-xl font-bold text-foreground">{stats.mastered}</div>
              <div className="text-xs text-muted-foreground">Mastered</div>
            </div>
            
            <div className="bg-card border border-card-border rounded-xl p-4 text-center">
              <div className="p-2 bg-learning/10 rounded-lg w-fit mx-auto mb-2">
                <Plus className="h-4 w-4 text-learning" />
              </div>
              <div className="text-xl font-bold text-foreground">{stats.learning}</div>
              <div className="text-xs text-muted-foreground">Learning</div>
            </div>
            
            <div className="bg-card border border-card-border rounded-xl p-4 text-center">
              <div className="p-2 bg-primary/10 rounded-lg w-fit mx-auto mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground">{stats.books}</div>
              <div className="text-xs text-muted-foreground">Books</div>
            </div>
          </div>

          {/* Current Book - Integrated compact design */}
          <div className="bg-card border border-card-border rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Current Book:</span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={currentBook}
                  onChange={(e) => handleCurrentBookChange(e.target.value)}
                  placeholder="Ex: Django 5 by example"
                  className="flex-1 h-9 px-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                />
                {currentBook && (
                  <Button
                    onClick={() => handleCurrentBookChange("")}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {currentBook && (
              <p className="text-xs text-muted-foreground mt-2 ml-7">
                📖 New words will be associated with this book
              </p>
            )}
          </div>
        </section>

        {/* Vocabulary Grid */}
        <section>
          {searchQuery.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {isNewWord ? "New word discovered" : "Search results"}
              </h2>
              <p className="text-muted-foreground">
                {isNewWord
                  ? `"${searchQuery}" is not in your vocabulary yet`
                  : `${filteredWords.length} word${filteredWords.length !== 1 ? 's' : ''} found`
                }
              </p>
            </div>
          )}

          {/* Filter Controls */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Sort Filters */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Sort:</span>
                <div className="flex gap-2">
                  <Button
                    variant={sortOrder === "alphabetical" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortOrder("alphabetical")}
                    className="h-8 text-xs"
                  >
                    A-Z
                  </Button>
                  <Button
                    variant={sortOrder === "recent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortOrder("recent")}
                    className="h-8 text-xs"
                  >
                    Recent
                  </Button>
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className="h-8 text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("new")}
                    className="h-8 text-xs bg-learning/10 text-learning border-learning/20 hover:bg-learning/20"
                  >
                    New
                  </Button>
                  <Button
                    variant={statusFilter === "learning" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("learning")}
                    className="h-8 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  >
                    Learning
                  </Button>
                  <Button
                    variant={statusFilter === "mastered" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("mastered")}
                    className="h-8 text-xs bg-mastered/10 text-mastered border-mastered/20 hover:bg-mastered/20"
                  >
                    Mastered
                  </Button>
                </div>
              </div>

              {/* Word Count */}
              <div className="text-sm text-muted-foreground">
                {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Words Grid */}
          {filteredWords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWords.map((word) => (
                  <VocabularyCard
                    key={word.id}
                    word={word}
                    onEdit={handleEditWord}
                    onDelete={handleDeleteWord}
                    onToggleMastered={handleToggleMastered}
                  />
                ))}
              </div>
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
    </div>
  );
};

export default Index;