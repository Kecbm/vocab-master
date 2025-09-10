// Firebase App Check configuration for bot protection
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check';
import { app } from './firebase';

// Configuração do App Check
export const initAppCheck = () => {
  // Apenas inicializar App Check se estivermos em produção E temos a chave reCAPTCHA
  if (process.env.NODE_ENV === 'production' && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
    try {
      const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true
      });

      return appCheck;
    } catch (_error) {
      console.error('Failed to initialize App Check');
    }
  } else {
    // Em desenvolvimento, não inicializar App Check
    console.log('App Check disabled in development mode');
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
