import { VocabularyWord } from "@/components/VocabularyCard";
import * as firebaseApi from "@/services/firebaseApi";

// Classe para gerenciar as operações da API (usando Firebase)
class VocabularyAPI {
  constructor() {
    // Usando Firebase como banco principal
  }

  // Buscar todas as palavras
  async getAllWords(): Promise<VocabularyWord[]> {
    try {
      return await firebaseApi.getAllWordsFromFirebase();
    } catch (error) {
      console.error('❌ Erro ao buscar palavras:', error);
      throw error;
    }
  }

  // Nota: IDs são gerados automaticamente pela API híbrida (Firebase ou JSON Server)

  // Adicionar nova palavra
  async addWord(word: Omit<VocabularyWord, 'id'>): Promise<VocabularyWord> {
    try {
      const newWord = await firebaseApi.addWordToFirebase(word);
      console.log('✅ Palavra adicionada:', newWord.foreignWord, 'ID:', newWord.id);
      return newWord;
    } catch (error) {
      console.error('❌ Erro ao adicionar palavra:', error);
      throw error;
    }
  }

  // Atualizar palavra existente
  async updateWord(word: VocabularyWord): Promise<VocabularyWord> {
    try {
      const updatedWord = await firebaseApi.updateWordInFirebase(word);
      console.log('✅ Palavra atualizada:', updatedWord.foreignWord);
      return updatedWord;
    } catch (error) {
      console.error('❌ Erro ao atualizar palavra:', error);
      throw error;
    }
  }

  // Deletar palavra
  async deleteWord(wordId: string): Promise<void> {
    try {
      await firebaseApi.deleteWordFromFirebase(wordId);
      console.log('✅ Palavra deletada');
    } catch (error) {
      console.error('❌ Erro ao deletar palavra:', error);
      throw error;
    }
  }

  // Alternar status de dominada
  async toggleWordMastered(wordId: string): Promise<VocabularyWord> {
    try {
      // Primeiro busca todas as palavras para encontrar a palavra específica
      const allWords = await this.getAllWords();
      const word = allWords.find(w => w.id === wordId);

      if (!word) {
        throw new Error(`Word with ID ${wordId} not found`);
      }

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
  constructor() {
    // A API híbrida gerencia automaticamente Firebase vs JSON Server
  }

  // Buscar configurações
  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await firebaseApi.getSettingsFromFirebase();
      return {
        id: 1, // Manter compatibilidade com interface existente
        ...settings
      };
    } catch (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      // Retorna configurações padrão se houver erro
      return { id: 1, currentBook: "", oldBooks: [] };
    }
  }

  // Atualizar configurações
  async updateSettings(settings: AppSettings): Promise<AppSettings> {
    try {
      const { id, ...firebaseSettings } = settings; // Remove id para Firebase
      const updatedSettings = await firebaseApi.updateSettingsInFirebase(firebaseSettings);
      console.log('✅ Configurações atualizadas');
      return {
        id: 1, // Manter compatibilidade
        ...updatedSettings
      };
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
