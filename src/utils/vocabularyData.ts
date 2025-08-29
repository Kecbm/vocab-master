import { VocabularyWord } from "@/components/VocabularyCard";
import * as firebaseApi from "@/services/firebaseApi";
import { auth } from "@/config/firebase";

// Classe para gerenciar as operações da API (usando Firebase)
class VocabularyAPI {
  constructor() {
    // Usando Firebase como banco principal
  }

  // 🔒 Obter ID do usuário atual
  private getCurrentUserId(): string {
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ Usuário não autenticado');
      throw new Error('User not authenticated');
    }
    console.log('✅ Usuário autenticado:', user.uid);
    return user.uid;
  }

  // Buscar todas as palavras
  async getAllWords(): Promise<VocabularyWord[]> {
    try {
      const userId = this.getCurrentUserId();
      return await firebaseApi.getAllWordsFromFirebase(userId);
    } catch (error) {
      console.error('❌ Erro ao buscar palavras:', error);
      throw error;
    }
  }

  // Nota: IDs são gerados automaticamente pela API híbrida (Firebase ou JSON Server)



  // Adicionar nova palavra
  async addWord(word: Omit<VocabularyWord, 'id'>): Promise<VocabularyWord> {
    try {
      const userId = this.getCurrentUserId();
      const newWord = await firebaseApi.addWordToFirebase(word, userId);
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
      const userId = this.getCurrentUserId();
      const updatedWord = await firebaseApi.updateWordInFirebase(word, userId);
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
      const userId = this.getCurrentUserId();
      await firebaseApi.deleteWordFromFirebase(wordId, userId);
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





// Array inicial vazio (será carregado da API)
export const initialWords: VocabularyWord[] = [];
