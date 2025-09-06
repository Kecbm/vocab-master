import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import { initSecurity } from './utils/security'
import { initAntiDebug, detectIframeEmbedding, detectAutomation } from './utils/antiDebug'
import { securityMonitor } from './utils/securityMonitoring'

// Initialize security measures (temporarily disabled for debugging)
if (process.env.NODE_ENV === 'production') {
  // Only enable in production after confirming app works
  // initSecurity();
  // initAntiDebug();
  // detectIframeEmbedding();
  // detectAutomation();
}

// Initialize security monitoring
securityMonitor;

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </AuthProvider>
);
