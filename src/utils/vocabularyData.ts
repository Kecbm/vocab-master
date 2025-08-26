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

  // Obter próximo ID sequencial
  async getNextId(): Promise<string> {
    try {
      const words = await this.getAllWords();
      if (words.length === 0) {
        return "1";
      }

      // Encontra o maior ID numérico
      const maxId = Math.max(...words.map(word => {
        const id = parseInt(word.id);
        return isNaN(id) ? 0 : id;
      }));

      return (maxId + 1).toString();
    } catch (error) {
      console.error('❌ Erro ao obter próximo ID:', error);
      // Fallback para timestamp se houver erro
      return Date.now().toString();
    }
  }

  // Adicionar nova palavra
  async addWord(word: Omit<VocabularyWord, 'id'>): Promise<VocabularyWord> {
    try {
      const nextId = await this.getNextId();

      const response = await fetch(`${this.baseUrl}/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...word,
          id: nextId, // Usa ID sequencial
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newWord = await response.json();
      console.log('✅ Palavra adicionada:', newWord.english, 'ID:', nextId);
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

// Interface para configurações
interface AppSettings {
  id: number;
  currentBook: string;
  oldBooks: string[];
}

// Classe para gerenciar configurações
class SettingsAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Buscar configurações
  async getSettings(): Promise<AppSettings> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const settings = await response.json();
      return settings;
    } catch (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      // Retorna configurações padrão se houver erro
      return { id: 1, currentBook: "", oldBooks: [] };
    }
  }

  // Atualizar configurações
  async updateSettings(settings: AppSettings): Promise<AppSettings> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedSettings = await response.json();
      console.log('✅ Configurações atualizadas');
      return updatedSettings;
    } catch (error) {
      console.error('❌ Erro ao atualizar configurações:', error);
      throw error;
    }
  }

  // Atualizar apenas o livro atual
  async updateCurrentBook(currentBook: string): Promise<AppSettings> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = {
        ...currentSettings,
        currentBook,
      };
      return await this.updateSettings(updatedSettings);
    } catch (error) {
      console.error('❌ Erro ao atualizar livro atual:', error);
      throw error;
    }
  }

  // Finalizar livro atual (mover para oldBooks)
  async finishCurrentBook(newCurrentBook: string = ""): Promise<AppSettings> {
    try {
      const currentSettings = await this.getSettings();

      // Se há um livro atual e não está vazio, adiciona aos livros antigos
      const updatedOldBooks = currentSettings.currentBook && currentSettings.currentBook.trim()
        ? [...(currentSettings.oldBooks || []), currentSettings.currentBook]
        : (currentSettings.oldBooks || []);

      const updatedSettings = {
        ...currentSettings,
        currentBook: newCurrentBook,
        oldBooks: updatedOldBooks,
      };

      return await this.updateSettings(updatedSettings);
    } catch (error) {
      console.error('❌ Erro ao finalizar livro:', error);
      throw error;
    }
  }
}

// Instância da API de configurações
export const settingsAPI = new SettingsAPI();

// Funções de conveniência para configurações
export const getSettings = () => settingsAPI.getSettings();
export const updateCurrentBook = (currentBook: string) => settingsAPI.updateCurrentBook(currentBook);
export const finishCurrentBook = (newCurrentBook?: string) => settingsAPI.finishCurrentBook(newCurrentBook);

// Array inicial vazio (será carregado da API)
export const initialWords: VocabularyWord[] = [];
