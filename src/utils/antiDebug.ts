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

  // In production, just log the violation without blocking the app
  if (process.env.NODE_ENV === 'production') {
    // Log to analytics/monitoring service if available
    try {
      // Example: Send to your monitoring service
      // analytics.track('security_violation', { reason });
    } catch (error) {
      // Fail silently
    }

    // Show a subtle warning instead of blocking
    showSecurityWarning(reason);
  }
};

// Show security warning (non-blocking)
const showSecurityWarning = (reason: string) => {
  // Only show a console warning in production to avoid blocking the app
  console.warn(`Security Alert: ${reason}`);

  // Optionally show a subtle notification
  if (!document.getElementById('security-notification')) {
    const notification = document.createElement('div');
    notification.id = 'security-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    notification.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>🔒 Security monitoring active</span>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          margin-left: 10px;
        ">×</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Fade in
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 100);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      const notificationEl = document.getElementById('security-notification');
      if (notificationEl) {
        notificationEl.style.opacity = '0';
        setTimeout(() => notificationEl.remove(), 300);
      }
    }, 3000);
  }
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

  // Check for headless browser indicators (without using deprecated plugins API)
  if (!navigator.userAgent || navigator.userAgent.includes('HeadlessChrome')) {
    handleSecurityViolation('Headless browser detected');
  }
};

export default {
  initAntiDebug,
  detectIframeEmbedding,
  detectAutomation
};
