import { VocabularyWord } from "@/components/VocabularyCard";

// Chave para localStorage
const STORAGE_KEY = 'vocab-master-words';

// Array inicial de palavras do vocabulário (fallback)
const defaultWords: VocabularyWord[] = [
  {
    id: "1",
    english: "way",
    portuguese: "caminho",
    book: "Django 5 by example",
    mastered: true,
  },
  {
    id: "2",
    english: "almost",
    portuguese: "quase",
    book: "Django 5 by example",
    mastered: false,
  },
  {
    id: "3",
    english: "been",
    portuguese: "estive",
    book: "Django 5 by example",
    mastered: true,
  },
];

// Função para carregar palavras do localStorage
const loadWordsFromStorage = (): VocabularyWord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Valida se é um array válido
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar palavras do localStorage:', error);
  }

  // Se não há dados salvos ou erro, usa palavras padrão
  return [...defaultWords];
};

// Função para salvar palavras no localStorage
const saveWordsToStorage = (words: VocabularyWord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    console.log('✅ Palavras salvas no localStorage');
  } catch (error) {
    console.error('❌ Erro ao salvar palavras no localStorage:', error);
  }
};

// Array de palavras carregado do localStorage
export const initialWords: VocabularyWord[] = loadWordsFromStorage();

// Função para adicionar nova palavra
export const addWordToData = (newWord: VocabularyWord) => {
  // Adiciona ao array em memória
  initialWords.unshift(newWord);

  // Salva no localStorage
  saveWordsToStorage(initialWords);
};

// Função para atualizar uma palavra existente
export const updateWordInData = (updatedWord: VocabularyWord) => {
  const index = initialWords.findIndex(word => word.id === updatedWord.id);
  if (index !== -1) {
    initialWords[index] = updatedWord;
    saveWordsToStorage(initialWords);
    return true;
  }
  return false;
};

// Função para deletar uma palavra
export const deleteWordFromData = (wordId: string) => {
  const index = initialWords.findIndex(word => word.id === wordId);
  if (index !== -1) {
    initialWords.splice(index, 1);
    saveWordsToStorage(initialWords);
    return true;
  }
  return false;
};

// Função para alternar status de dominada
export const toggleWordMastered = (wordId: string) => {
  const word = initialWords.find(w => w.id === wordId);
  if (word) {
    word.mastered = !word.mastered;
    saveWordsToStorage(initialWords);
    return word;
  }
  return null;
};

// Função para exportar palavras do localStorage para código
export const exportWordsToCode = () => {
  const wordsCode = initialWords.map(word =>
    `  {
    id: "${word.id}",
    english: "${word.english}",
    portuguese: "${word.portuguese}",
    book: "${word.book}",
    mastered: ${word.mastered},
  }`
  ).join(',\n');

  const code = `// Backup das palavras do localStorage (${new Date().toLocaleString()})
export const backupWords: VocabularyWord[] = [
${wordsCode}
];`;

  console.log('📋 BACKUP DAS PALAVRAS:');
  console.log(code);

  // Copia para clipboard se disponível
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      console.log('✅ Código copiado para a área de transferência!');
    }).catch(() => {
      console.log('❌ Erro ao copiar para área de transferência');
    });
  }

  return code;
};

// Função para limpar localStorage (útil para reset)
export const clearStoredWords = () => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Palavras removidas do localStorage');
};



// Função para obter todas as palavras
export const getAllWords = () => {
  return [...initialWords];
};

// Função para obter estatísticas
export const getWordsStats = () => {
  return {
    total: initialWords.length,
    mastered: initialWords.filter(w => w.mastered).length,
    learning: initialWords.filter(w => !w.mastered).length,
    books: new Set(initialWords.map(w => w.book)).size,
  };
};
