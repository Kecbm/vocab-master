import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import { initSecurity } from './utils/security'
import { initAntiDebug, detectIframeEmbedding, detectAutomation } from './utils/antiDebug'

// Initialize security measures
initSecurity();
initAntiDebug();
detectIframeEmbedding();
detectAutomation();

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </AuthProvider>
);
