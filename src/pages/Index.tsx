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

const Index = () => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBook, setCurrentBook] = useState(() => {
    // Carrega livro atual do localStorage
    try {
      return localStorage.getItem('vocab-master-current-book') || "";
    } catch {
      return "";
    }
  });
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
          title: "Erro ao carregar dados",
          description: "Verifique se o servidor está rodando (npm run db)",
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

    // Aplica filtro de busca se houver query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = words.filter(word =>
        word.english.toLowerCase().includes(query) ||
        word.portuguese.toLowerCase().includes(query) ||
        word.book.toLowerCase().includes(query)
      );
    }

    // Ordena alfabeticamente por palavra em inglês
    return filtered.sort((a, b) =>
      a.english.toLowerCase().localeCompare(b.english.toLowerCase())
    );
  }, [words, searchQuery]);

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
        title: "Palavra adicionada!",
        description: `"${newWordData.english}" foi adicionada ao seu vocabulário.`,
      });
    } catch (error) {
      console.error('Erro ao adicionar palavra:', error);
      toast({
        title: "Erro ao adicionar palavra",
        description: "Verifique se o servidor está rodando",
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
        title: "Palavra atualizada!",
        description: `"${updatedWord.english}" foi atualizada com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar palavra:', error);
      toast({
        title: "Erro ao atualizar palavra",
        description: "Verifique se o servidor está rodando",
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
        title: "Palavra removida",
        description: `"${deletingWord.english}" foi removida do seu vocabulário.`,
        variant: "destructive",
      });

      // Fecha o modal
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Erro ao deletar palavra:', error);
      toast({
        title: "Erro ao deletar palavra",
        description: "Verifique se o servidor está rodando",
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
        title: "Erro ao salvar livro",
        description: "O livro foi atualizado localmente, mas não foi salvo no servidor",
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
        title: updatedWord.mastered ? "Palavra dominada!" : "Voltando a praticar",
        description: `"${updatedWord.english}" ${updatedWord.mastered ? 'foi marcada como dominada' : 'voltou para a lista de prática'}.`,
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro ao alterar status",
        description: "Verifique se o servidor está rodando",
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
              <p className="text-muted-foreground">Carregando palavras...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Current Book Section */}
        <section className="mb-6">
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Livro Atual</h3>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={currentBook}
                onChange={(e) => handleCurrentBookChange(e.target.value)}
                placeholder="Ex: Django 5 by example - Antonio Melé"
                className="flex-1 h-12 px-4 text-base bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {currentBook && (
                <Button
                  onClick={() => handleCurrentBookChange("")}
                  variant="outline"
                  size="sm"
                  className="h-12 px-4"
                >
                  Limpar
                </Button>
              )}
            </div>
            {currentBook && (
              <p className="text-sm text-muted-foreground mt-3">
                📖 Novas palavras serão automaticamente associadas a este livro
              </p>
            )}
          </div>
        </section>

        {/* Statistics Dashboard */}
            <section className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-card-border rounded-2xl p-6 text-center">
              <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto mb-3">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total de Palavras</div>
            </div>
            
            <div className="bg-card border border-card-border rounded-2xl p-6 text-center">
              <div className="p-3 bg-mastered/10 rounded-2xl w-fit mx-auto mb-3">
                <Target className="h-6 w-6 text-mastered" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.mastered}</div>
              <div className="text-sm text-muted-foreground">Dominadas</div>
            </div>
            
            <div className="bg-card border border-card-border rounded-2xl p-6 text-center">
              <div className="p-3 bg-learning/10 rounded-2xl w-fit mx-auto mb-3">
                <Plus className="h-6 w-6 text-learning" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.learning}</div>
              <div className="text-sm text-muted-foreground">Aprendendo</div>
            </div>
            
            <div className="bg-card border border-card-border rounded-2xl p-6 text-center">
              <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.books}</div>
              <div className="text-sm text-muted-foreground">Livros</div>
            </div>
          </div>
        </section>

        {/* Vocabulary Grid */}
        <section>
          {searchQuery.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {isNewWord ? "Nova palavra descoberta" : "Resultados da busca"}
              </h2>
              <p className="text-muted-foreground">
                {isNewWord 
                  ? `"${searchQuery}" ainda não está no seu vocabulário`
                  : `${filteredWords.length} palavra${filteredWords.length !== 1 ? 's' : ''} encontrada${filteredWords.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          )}

          {/* Words Grid */}
          {filteredWords.length > 0 ? (
            <>
              {/* Sorting indicator */}
              {!searchQuery.trim() && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>A</span>
                      <div className="w-4 h-px bg-muted-foreground/30"></div>
                      <span>Z</span>
                    </div>
                    <span>Ordenado alfabeticamente</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filteredWords.length} palavra{filteredWords.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}

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
            </>
          ) : searchQuery.length === 0 ? (
            // Empty state - no search
            <div className="text-center py-16">
              <div className="p-4 bg-primary/10 rounded-3xl w-fit mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Comece sua jornada de aprendizado
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Use a barra de busca acima para procurar palavras ou adicionar novas descobertas do seu livro.
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Primeira Palavra
              </Button>
            </div>
          ) : (
            // New word discovery state
            <div className="text-center py-16">
              <div className="p-4 bg-learning/10 rounded-3xl w-fit mx-auto mb-6">
                <Plus className="h-12 w-12 text-learning" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nova palavra descoberta!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                "{searchQuery}" ainda não está no seu vocabulário. Que tal adicioná-la?
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-learning hover:bg-learning/90 text-learning-foreground px-6 py-3 rounded-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar "{searchQuery}"
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