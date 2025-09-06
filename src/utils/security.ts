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
    // Redirect to a warning page or show alert
    document.body.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #1a1a1a;
        color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
        z-index: 999999;
      ">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Access Restricted</h1>
        <p style="font-size: 1.2rem; text-align: center; max-width: 600px;">
          Developer tools have been detected. Please close them to continue using the application.
        </p>
        <button onclick="window.location.reload()" style="
          margin-top: 2rem;
          padding: 1rem 2rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
        ">
          Reload Page
        </button>
      </div>
    `;
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
