import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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
  console.log('Initializing Firebase for production...');
  // Temporariamente desabilitar App Check para debug
  // try {
  //   if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  //     initAppCheck();
  //   }
  // } catch (error) {
  //   console.warn('App Check initialization failed:', error);
  // }
} else {
  console.log('Firebase initialized for development');
}

export { app };
export default app;
