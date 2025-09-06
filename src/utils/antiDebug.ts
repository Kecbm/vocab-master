// Advanced anti-debugging techniques
// These are additional security measures for production

export const initAntiDebug = () => {
  if (process.env.NODE_ENV !== 'production') return;

  // 1. Detect debugging attempts
  detectDebugger();
  
  // 2. Prevent source code viewing
  preventSourceViewing();
  
  // 3. Detect performance monitoring
  detectPerformanceMonitoring();
  
  // 4. Obfuscate critical functions
  obfuscateCriticalFunctions();
};

// Detect debugger statements and breakpoints
const detectDebugger = () => {
  setInterval(() => {
    const start = performance.now();
    debugger; // This will cause a pause if DevTools is open
    const end = performance.now();
    
    // If the time difference is significant, debugger was hit
    if (end - start > 100) {
      handleSecurityViolation('Debugger detected');
    }
  }, 1000);
};

// Prevent common source viewing methods
const preventSourceViewing = () => {
  // Disable text selection
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable drag
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable print
  window.addEventListener('beforeprint', (e) => {
    e.preventDefault();
    handleSecurityViolation('Print attempt detected');
    return false;
  });

  // Override print function
  (window as any).print = () => {
    handleSecurityViolation('Print function called');
  };
};

// Detect performance monitoring tools
const detectPerformanceMonitoring = () => {
  // Check for common debugging variables
  const checkInterval = setInterval(() => {
    const suspiciousVars = [
      '__REACT_DEVTOOLS_GLOBAL_HOOK__',
      '__VUE_DEVTOOLS_GLOBAL_HOOK__',
      '__REDUX_DEVTOOLS_EXTENSION__',
      'webkitStorageInfo',
      'webkitIndexedDB'
    ];

    suspiciousVars.forEach(varName => {
      if ((window as any)[varName]) {
        handleSecurityViolation(`Debugging tool detected: ${varName}`);
      }
    });

    // Check for unusual timing
    const start = performance.now();
    const end = performance.now();
    if (end - start > 50) {
      handleSecurityViolation('Performance monitoring detected');
    }
  }, 2000);

  // Cleanup after 30 seconds to avoid performance impact
  setTimeout(() => {
    clearInterval(checkInterval);
  }, 30000);
};

// Obfuscate critical functions
const obfuscateCriticalFunctions = () => {
  // Override toString methods to hide function source
  Function.prototype.toString = function() {
    return 'function() { [native code] }';
  };

  // Override valueOf
  Function.prototype.valueOf = function() {
    return 'function() { [native code] }';
  };

  // Hide constructor
  Object.defineProperty(Function.prototype, 'constructor', {
    value: Function,
    writable: false,
    enumerable: false,
    configurable: false
  });
};

// Handle security violations
const handleSecurityViolation = (reason: string) => {
  console.warn('Security violation detected:', reason);
  
  // In production, you might want to:
  // 1. Log to your analytics/monitoring service
  // 2. Redirect user away from the app
  // 3. Show a warning message
  // 4. Disable certain features
  
  if (process.env.NODE_ENV === 'production') {
    // Example: Redirect to a security warning page
    // window.location.href = '/security-warning';
    
    // Or show an overlay
    showSecurityWarning(reason);
  }
};

// Show security warning overlay
const showSecurityWarning = (reason: string) => {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: Arial, sans-serif;
    z-index: 999999;
    backdrop-filter: blur(10px);
  `;

  overlay.innerHTML = `
    <div style="text-align: center; max-width: 500px; padding: 2rem;">
      <h1 style="font-size: 2.5rem; margin-bottom: 1rem; color: #ff4444;">🔒</h1>
      <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">Security Alert</h2>
      <p style="font-size: 1.1rem; margin-bottom: 2rem; line-height: 1.5;">
        Unauthorized access attempt detected. This incident has been logged.
      </p>
      <p style="font-size: 0.9rem; color: #ccc; margin-bottom: 2rem;">
        Reason: ${reason}
      </p>
      <button onclick="window.location.reload()" style="
        padding: 1rem 2rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.3s;
      " onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#007bff'">
        Reload Application
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Auto-reload after 10 seconds
  setTimeout(() => {
    window.location.reload();
  }, 10000);
};

// Additional protection: Detect if running in iframe
export const detectIframeEmbedding = () => {
  if (window.self !== window.top) {
    handleSecurityViolation('Application embedded in iframe');
    // Prevent iframe embedding
    window.top!.location.href = window.self.location.href;
  }
};

// Detect virtual machines or automated browsers
export const detectAutomation = () => {
  // Check for common automation indicators
  const automationIndicators = [
    'webdriver' in window,
    'callPhantom' in window,
    'callSelenium' in window,
    '_phantom' in window,
    '__nightmare' in window,
    navigator.webdriver,
    (window as any).domAutomation,
    (window as any).domAutomationController
  ];

  if (automationIndicators.some(indicator => indicator)) {
    handleSecurityViolation('Automation detected');
  }

  // Check for unusual navigator properties
  if (navigator.languages && navigator.languages.length === 0) {
    handleSecurityViolation('Suspicious navigator properties');
  }

  // Check for missing plugins (common in headless browsers)
  if (navigator.plugins.length === 0) {
    handleSecurityViolation('No browser plugins detected');
  }
};

export default {
  initAntiDebug,
  detectIframeEmbedding,
  detectAutomation
};
