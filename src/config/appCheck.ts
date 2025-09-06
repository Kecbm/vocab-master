// Firebase App Check configuration for bot protection
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check';
import { app } from './firebase';

// Configuração do App Check
export const initAppCheck = () => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''),
        isTokenAutoRefreshEnabled: true
      });

      // Verificar se o token é válido
      getToken(appCheck)
        .then((result) => {
          console.log('App Check token obtained successfully');
        })
        .catch((error) => {
          console.error('App Check token verification failed:', error);
        });

      return appCheck;
    } catch (error) {
      console.error('Failed to initialize App Check:', error);
    }
  } else {
    // Em desenvolvimento, usar debug token
    if (typeof window !== 'undefined') {
      (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
  }
};

// Função para verificar se App Check está funcionando
export const verifyAppCheck = async () => {
  try {
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''),
      isTokenAutoRefreshEnabled: true
    });
    
    const token = await getToken(appCheck);
    return token.token.length > 0;
  } catch (error) {
    console.error('App Check verification failed:', error);
    return false;
  }
};
