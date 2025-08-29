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

export interface FirebaseSettings {
  currentBook: string;
  oldBooks: string[];
}

// Coleções do Firestore
const WORDS_COLLECTION = 'words';
const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'app-settings';

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
        book: data.book || '',
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

    const firebaseWord: Partial<FirebaseWord> = {
      foreignWord: word.foreignWord,
      portuguese: word.portuguese, // ✅ Corrigido: usar 'portuguese' não 'nativeWord'
      pronunciation: word.pronunciation,
      language: word.language,
      book: word.book,
      mastered: word.mastered,
      // Não atualizar userId e createdAt
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

// ==================== SETTINGS ====================

export const getSettingsFromFirebase = async (userId: string): Promise<FirebaseSettings> => {
  try {
    // 🔒 CONFIGURAÇÕES POR USUÁRIO
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      return docSnap.data() as FirebaseSettings;
    } else {
      // Criar configurações padrão se não existirem
      const defaultSettings: FirebaseSettings = {
        currentBook: '',
        oldBooks: []
      };
      // Usar setDoc em vez de updateDoc para criar o documento
      await setDoc(settingsRef, defaultSettings);

      return defaultSettings;
    }
  } catch (error) {
    console.error('Error fetching settings from Firebase:', error);
    throw error;
  }
};

export const updateSettingsInFirebase = async (settings: FirebaseSettings, userId: string): Promise<FirebaseSettings> => {
  try {
    // 🔒 CONFIGURAÇÕES POR USUÁRIO
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    // Usar setDoc para garantir que o documento seja criado se não existir
    await setDoc(settingsRef, settings, { merge: true });

    return settings;
  } catch (error) {
    console.error('Error updating settings in Firebase:', error);
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

export const getWordsByBookFromFirebase = async (book: string): Promise<VocabularyWord[]> => {
  try {
    const wordsRef = collection(db, WORDS_COLLECTION);
    const q = query(
      wordsRef, 
      where('book', '==', book),
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
    console.error('Error fetching words by book from Firebase:', error);
    throw error;
  }
};
