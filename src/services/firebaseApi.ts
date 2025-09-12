import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { VocabularyWord } from '@/components/VocabularyCard';

// Tipos para o Firebase
export interface FirebaseWord extends Omit<VocabularyWord, 'id' | 'createdAt'> {
  userId: string; // 🔒 ID do usuário proprietário
  createdAt: Timestamp;
}



// Coleções do Firestore
const WORDS_COLLECTION = 'words';

// ==================== WORDS ====================

export const getAllWordsFromFirebase = async (userId: string): Promise<VocabularyWord[]> => {
  try {
    const wordsRef = collection(db, WORDS_COLLECTION);

    // 🔒 FILTRAR APENAS PALAVRAS DO USUÁRIO ATUAL
    const q = query(
      wordsRef,
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    const words: VocabularyWord[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirebaseWord;

      words.push({
        id: doc.id,
        foreignWord: data.foreignWord,
        portuguese: data.portuguese,
        pronunciation: data.pronunciation || '',
        language: data.language,
        mastered: data.mastered || false,
        createdAt: data.createdAt.toDate().toISOString().split('T')[0] // Convert to YYYY-MM-DD
      });
    });

    // Ordenar por data de criação (mais recentes primeiro)
    words.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

    return words;
  } catch (error) {
    console.error('Error fetching words from Firebase:', error);
    throw error;
  }
};

export const addWordToFirebase = async (word: Omit<VocabularyWord, 'id'>, userId: string): Promise<VocabularyWord> => {
  try {
    const wordsRef = collection(db, WORDS_COLLECTION);
    const firebaseWord: FirebaseWord = {
      ...word,
      userId, // 🔒 ADICIONAR ID DO USUÁRIO
      createdAt: Timestamp.fromDate(new Date(word.createdAt || new Date().toISOString().split('T')[0]))
    };

    const docRef = await addDoc(wordsRef, firebaseWord);


    return {
      id: docRef.id,
      ...word
    };
  } catch (error) {
    console.error('Error adding word to Firebase:', error);
    throw error;
  }
};

export const updateWordInFirebase = async (word: VocabularyWord, userId: string): Promise<VocabularyWord> => {
  try {
    const wordRef = doc(db, WORDS_COLLECTION, word.id);

    // 🔒 VERIFICAR SE A PALAVRA PERTENCE AO USUÁRIO
    const wordDoc = await getDoc(wordRef);
    if (!wordDoc.exists()) {
      throw new Error('Word not found');
    }

    const wordData = wordDoc.data() as FirebaseWord;
    if (wordData.userId !== userId) {
      throw new Error('Unauthorized: You can only update your own words');
    }

    // ✅ INCLUIR TODOS OS CAMPOS OBRIGATÓRIOS PARA AS REGRAS DE SEGURANÇA
    const firebaseWord: Partial<FirebaseWord> = {
      foreignWord: word.foreignWord,
      portuguese: word.portuguese,
      pronunciation: word.pronunciation,
      language: word.language,
      mastered: word.mastered,
      userId: userId, // ✅ INCLUIR userId para satisfazer as regras de segurança
      createdAt: wordData.createdAt, // ✅ MANTER createdAt original
    };

    await updateDoc(wordRef, firebaseWord);

    return word;
  } catch (error) {
    console.error('Error updating word in Firebase:', error);
    throw error;
  }
};

export const deleteWordFromFirebase = async (id: string, userId: string): Promise<void> => {
  try {
    const wordRef = doc(db, WORDS_COLLECTION, id);

    // 🔒 VERIFICAR SE A PALAVRA PERTENCE AO USUÁRIO
    const wordDoc = await getDoc(wordRef);
    if (!wordDoc.exists()) {
      throw new Error('Word not found');
    }

    const wordData = wordDoc.data() as FirebaseWord;
    if (wordData.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own words');
    }

    await deleteDoc(wordRef);

  } catch (error) {
    console.error('Error deleting word from Firebase:', error);
    throw error;
  }
};



// ==================== UTILITY FUNCTIONS ====================

export const getWordsByLanguageFromFirebase = async (language: 'english' | 'french'): Promise<VocabularyWord[]> => {
  try {
    const wordsRef = collection(db, WORDS_COLLECTION);
    const q = query(
      wordsRef, 
      where('language', '==', language),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const words: VocabularyWord[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirebaseWord;
      words.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString().split('T')[0]
      });
    });
    
    return words;
  } catch (error) {
    console.error('Error fetching words by language from Firebase:', error);
    throw error;
  }
};


