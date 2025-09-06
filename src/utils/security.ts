// Security utilities to protect the application from console access
// Note: These are deterrents, not foolproof security measures

class SecurityManager {
  private static instance: SecurityManager;
  private devToolsOpen = false;
  private debugDetectionInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.init();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private init() {
    if (process.env.NODE_ENV === 'production') {
      this.disableConsole();
      this.detectDevTools();
      this.preventRightClick();
      this.preventKeyboardShortcuts();
      this.obfuscateGlobalVariables();
    }
  }

  // Disable console methods in production
  private disableConsole() {
    const consoleMethods = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml', 'group', 'groupEnd', 'time', 'timeEnd', 'count', 'trace', 'profile', 'profileEnd'];
    
    consoleMethods.forEach(method => {
      (console as any)[method] = () => {};
    });

    // Override console object
    Object.defineProperty(window, 'console', {
      value: {},
      writable: false,
      configurable: false
    });
  }

  // Detect if DevTools is open
  private detectDevTools() {
    const threshold = 160;
    
    this.debugDetectionInterval = setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!this.devToolsOpen) {
          this.devToolsOpen = true;
          this.handleDevToolsDetected();
        }
      } else {
        this.devToolsOpen = false;
      }
    }, 500);

    // Alternative detection method
    let devtools = {
      open: false,
      orientation: null as string | null
    };

    const threshold2 = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold2 || 
          window.outerWidth - window.innerWidth > threshold2) {
        if (!devtools.open) {
          devtools.open = true;
          this.handleDevToolsDetected();
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }

  // Handle when DevTools is detected
  private handleDevToolsDetected() {
    // Only show warning, don't completely block the app
    console.warn('Developer tools detected');

    // Show a less intrusive warning
    if (!document.getElementById('dev-tools-warning')) {
      const warning = document.createElement('div');
      warning.id = 'dev-tools-warning';
      warning.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 999999;
        font-family: Arial, sans-serif;
        font-size: 14px;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      warning.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>⚠️ Developer tools detected</span>
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
      document.body.appendChild(warning);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        const warningEl = document.getElementById('dev-tools-warning');
        if (warningEl) warningEl.remove();
      }, 5000);
    }
  }

  // Prevent right-click context menu
  private preventRightClick() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  }

  // Prevent common keyboard shortcuts for DevTools
  private preventKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+C (Element Inspector)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    });
  }

  // Obfuscate global variables
  private obfuscateGlobalVariables() {
    // Remove common debugging variables
    delete (window as any).React;
    delete (window as any).ReactDOM;
    delete (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;

    // Override common debugging functions
    (window as any).eval = () => {
      throw new Error('eval is disabled for security reasons');
    };

    (window as any).Function = () => {
      throw new Error('Function constructor is disabled for security reasons');
    };
  }

  // Clean up intervals
  public destroy() {
    if (this.debugDetectionInterval) {
      clearInterval(this.debugDetectionInterval);
    }
  }
}

// Initialize security manager
export const initSecurity = () => {
  if (process.env.NODE_ENV === 'production') {
    SecurityManager.getInstance();
    
    // Additional protection: Clear console on load
    setTimeout(() => {
      if (typeof console.clear === 'function') {
        console.clear();
      }
    }, 1000);
  }
};

// Export for cleanup if needed
export const destroySecurity = () => {
  SecurityManager.getInstance().destroy();
};

export default SecurityManager;
