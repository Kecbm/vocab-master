import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initAppCheck } from './appCheck';

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Authentication
export const auth = getAuth(app);

// Configurações de segurança adicionais
if (process.env.NODE_ENV === 'production') {
  // Inicializar App Check em produção
  initAppCheck();
} else {
  // Conectar aos emuladores em desenvolvimento (se disponível)
  if (!auth.emulatorConfig) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
    } catch (error) {
      // Emulator não está rodando, continuar normalmente
    }
  }

  if (!(db as any)._delegate._databaseId.projectId.includes('demo-')) {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (error) {
      // Emulator não está rodando, continuar normalmente
    }
  }
}

export { app };
export default app;
