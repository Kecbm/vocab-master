import { VocabularyWord } from "@/components/VocabularyCard";

// URL base da API do json-server
const API_BASE_URL = 'http://localhost:3001';

// Classe para gerenciar as operações da API
class VocabularyAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Buscar todas as palavras
  async getAllWords(): Promise<VocabularyWord[]> {
    try {
      const response = await fetch(`${this.baseUrl}/words`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const words = await response.json();
      return words;
    } catch (error) {
      console.error('❌ Erro ao buscar palavras:', error);
      throw error;
    }
  }

  // Adicionar nova palavra
  async addWord(word: Omit<VocabularyWord, 'id'>): Promise<VocabularyWord> {
    try {
      const response = await fetch(`${this.baseUrl}/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...word,
          id: Date.now().toString(), // Gera ID único
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newWord = await response.json();
      console.log('✅ Palavra adicionada:', newWord.english);
      return newWord;
    } catch (error) {
      console.error('❌ Erro ao adicionar palavra:', error);
      throw error;
    }
  }

  // Atualizar palavra existente
  async updateWord(word: VocabularyWord): Promise<VocabularyWord> {
    try {
      const response = await fetch(`${this.baseUrl}/words/${word.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(word),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedWord = await response.json();
      console.log('✅ Palavra atualizada:', updatedWord.english);
      return updatedWord;
    } catch (error) {
      console.error('❌ Erro ao atualizar palavra:', error);
      throw error;
    }
  }

  // Deletar palavra
  async deleteWord(wordId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/words/${wordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Palavra deletada');
    } catch (error) {
      console.error('❌ Erro ao deletar palavra:', error);
      throw error;
    }
  }

  // Alternar status de dominada
  async toggleWordMastered(wordId: string): Promise<VocabularyWord> {
    try {
      // Primeiro busca a palavra atual
      const response = await fetch(`${this.baseUrl}/words/${wordId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const word = await response.json();

      // Atualiza o status
      const updatedWord = {
        ...word,
        mastered: !word.mastered,
      };

      // Salva a atualização
      return await this.updateWord(updatedWord);
    } catch (error) {
      console.error('❌ Erro ao alternar status:', error);
      throw error;
    }
  }
}

// Instância da API
export const vocabularyAPI = new VocabularyAPI();

// Funções de conveniência (mantém compatibilidade com código existente)
export const getAllWords = () => vocabularyAPI.getAllWords();
export const addWordToData = (word: Omit<VocabularyWord, 'id'>) => vocabularyAPI.addWord(word);
export const updateWordInData = (word: VocabularyWord) => vocabularyAPI.updateWord(word);
export const deleteWordFromData = (wordId: string) => vocabularyAPI.deleteWord(wordId);
export const toggleWordMastered = (wordId: string) => vocabularyAPI.toggleWordMastered(wordId);

// Função para obter estatísticas
export const getWordsStats = async () => {
  try {
    const words = await getAllWords();
    return {
      total: words.length,
      mastered: words.filter(w => w.mastered).length,
      learning: words.filter(w => !w.mastered).length,
      books: new Set(words.map(w => w.book)).size,
    };
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas:', error);
    return {
      total: 0,
      mastered: 0,
      learning: 0,
      books: 0,
    };
  }
};

// Array inicial vazio (será carregado da API)
export const initialWords: VocabularyWord[] = [];
