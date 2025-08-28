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

export const getAllWordsFromFirebase = async (): Promise<VocabularyWord[]> => {
  try {
    const wordsRef = collection(db, WORDS_COLLECTION);
    const q = query(wordsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const words: VocabularyWord[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirebaseWord;
      words.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString().split('T')[0] // Convert to YYYY-MM-DD
      });
    });
    
    return words;
  } catch (error) {
    console.error('Error fetching words from Firebase:', error);
    throw error;
  }
};

export const addWordToFirebase = async (word: Omit<VocabularyWord, 'id'>): Promise<VocabularyWord> => {
  try {
    const wordsRef = collection(db, WORDS_COLLECTION);
    const firebaseWord: FirebaseWord = {
      ...word,
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

export const updateWordInFirebase = async (word: VocabularyWord): Promise<VocabularyWord> => {
  try {
    const wordRef = doc(db, WORDS_COLLECTION, word.id);
    const firebaseWord: FirebaseWord = {
      foreignWord: word.foreignWord,
      language: word.language,
      portuguese: word.portuguese,
      book: word.book,
      mastered: word.mastered,
      createdAt: Timestamp.fromDate(new Date(word.createdAt || new Date().toISOString().split('T')[0]))
    };
    
    await updateDoc(wordRef, firebaseWord);
    return word;
  } catch (error) {
    console.error('Error updating word in Firebase:', error);
    throw error;
  }
};

export const deleteWordFromFirebase = async (id: string): Promise<void> => {
  try {
    const wordRef = doc(db, WORDS_COLLECTION, id);
    await deleteDoc(wordRef);
  } catch (error) {
    console.error('Error deleting word from Firebase:', error);
    throw error;
  }
};

// ==================== SETTINGS ====================

export const getSettingsFromFirebase = async (): Promise<FirebaseSettings> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
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
      console.log('✅ Default settings created in Firebase');
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error fetching settings from Firebase:', error);
    throw error;
  }
};

export const updateSettingsInFirebase = async (settings: FirebaseSettings): Promise<FirebaseSettings> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    // Usar setDoc para garantir que o documento seja criado se não existir
    await setDoc(settingsRef, settings, { merge: true });
    console.log('✅ Settings updated in Firebase');
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
