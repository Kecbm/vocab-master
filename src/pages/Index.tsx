import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import VocabularyCard, { VocabularyWord } from "@/components/VocabularyCard";
import AddWordModal from "@/components/AddWordModal";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Brain, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock initial data
const initialWords: VocabularyWord[] = [
  {
    id: "1",
    english: "serendipity",
    portuguese: "serendipidade, descoberta feliz",
    book: "The Hobbit - J.R.R. Tolkien",
    mastered: true,
  },
  {
    id: "2", 
    english: "ephemeral",
    portuguese: "efêmero, passageiro",
    book: "1984 - George Orwell",
    mastered: false,
  },
  {
    id: "3",
    english: "melancholy",
    portuguese: "melancolia, tristeza profunda",
    book: "Pride and Prejudice - Jane Austen",
    mastered: true,
  },
];

const Index = () => {
  const [words, setWords] = useState<VocabularyWord[]>(initialWords);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Search and filtering logic
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return words;
    
    return words.filter(word =>
      word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.portuguese.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleAddWord = (newWordData: Omit<VocabularyWord, 'id'>) => {
    const newWord: VocabularyWord = {
      ...newWordData,
      id: Date.now().toString(),
    };
    
    setWords(prev => [newWord, ...prev]);
    setSearchQuery("");
    
    toast({
      title: "Palavra adicionada!",
      description: `"${newWordData.english}" foi adicionada ao seu vocabulário.`,
    });
  };

  const handleEditWord = (word: VocabularyWord) => {
    // TODO: Implement edit functionality
    toast({
      title: "Em breve",
      description: "Funcionalidade de edição será implementada em breve.",
    });
  };

  const handleDeleteWord = (id: string) => {
    const word = words.find(w => w.id === id);
    setWords(prev => prev.filter(w => w.id !== id));
    
    if (word) {
      toast({
        title: "Palavra removida",
        description: `"${word.english}" foi removida do seu vocabulário.`,
        variant: "destructive",
      });
    }
  };

  const handleToggleMastered = (id: string) => {
    setWords(prev => prev.map(word => 
      word.id === id 
        ? { ...word, mastered: !word.mastered }
        : word
    ));
    
    const word = words.find(w => w.id === id);
    if (word) {
      toast({
        title: !word.mastered ? "Palavra dominada!" : "Voltando a praticar",
        description: `"${word.english}" ${!word.mastered ? 'foi marcada como dominada' : 'voltou para a lista de prática'}.`,
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
      </main>

      {/* Add Word Modal */}
      <AddWordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddWord}
        initialWord={searchQuery}
      />
    </div>
  );
};

export default Index;