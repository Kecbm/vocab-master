// Security monitoring and logging utilities
import { auth } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface SecurityEvent {
  type: 'auth_attempt' | 'data_access' | 'suspicious_activity' | 'rate_limit_exceeded';
  userId?: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private rateLimitMap = new Map<string, number[]>();

  private constructor() {
    this.initAuthMonitoring();
    this.initRateLimiting();
  }

  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // Monitor authentication events
  private initAuthMonitoring() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.logEvent({
          type: 'auth_attempt',
          userId: user.uid,
          timestamp: new Date(),
          details: {
            email: user.email,
            provider: user.providerData[0]?.providerId,
            lastSignIn: user.metadata.lastSignInTime,
            creationTime: user.metadata.creationTime
          },
          severity: 'low'
        });

        // Check for suspicious login patterns
        this.checkSuspiciousLogin(user);
      }
    });
  }

  // Rate limiting implementation
  private initRateLimiting() {
    // Clean up old entries every minute
    setInterval(() => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;

      this.rateLimitMap.forEach((timestamps, key) => {
        const recentTimestamps = timestamps.filter(ts => ts > oneMinuteAgo);
        if (recentTimestamps.length === 0) {
          this.rateLimitMap.delete(key);
        } else {
          this.rateLimitMap.set(key, recentTimestamps);
        }
      });
    }, 60000);
  }

  // Check if user exceeds rate limit
  public checkRateLimit(userId: string, action: string, limit: number = 60): boolean {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const timestamps = this.rateLimitMap.get(key) || [];
    const recentTimestamps = timestamps.filter(ts => ts > oneMinuteAgo);

    if (recentTimestamps.length >= limit) {
      this.logEvent({
        type: 'rate_limit_exceeded',
        userId,
        timestamp: new Date(),
        details: { action, limit, attempts: recentTimestamps.length },
        severity: 'medium'
      });
      return false;
    }

    recentTimestamps.push(now);
    this.rateLimitMap.set(key, recentTimestamps);
    return true;
  }

  // Log security events
  public logEvent(event: SecurityEvent) {
    this.events.push(event);

    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Event:', event);
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(event);
    }

    // Handle critical events immediately
    if (event.severity === 'critical') {
      this.handleCriticalEvent(event);
    }
  }

  // Check for suspicious login patterns
  private checkSuspiciousLogin(user: any) {
    const now = new Date();
    const lastSignIn = new Date(user.metadata.lastSignInTime || now);
    const timeDiff = now.getTime() - lastSignIn.getTime();

    // Multiple logins in short time
    if (timeDiff < 30000) { // 30 seconds
      this.logEvent({
        type: 'suspicious_activity',
        userId: user.uid,
        timestamp: now,
        details: {
          reason: 'rapid_successive_logins',
          timeDiff: timeDiff
        },
        severity: 'medium'
      });
    }

    // Check for unusual login times (outside 6 AM - 11 PM)
    const hour = now.getHours();
    if (hour < 6 || hour > 23) {
      this.logEvent({
        type: 'suspicious_activity',
        userId: user.uid,
        timestamp: now,
        details: {
          reason: 'unusual_login_time',
          hour: hour
        },
        severity: 'low'
      });
    }
  }

  // Send events to external monitoring service
  private async sendToMonitoringService(event: SecurityEvent) {
    try {
      // Example: Send to your analytics/monitoring service
      // await fetch('/api/security-events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
      
      console.log('Security event logged:', event);
    } catch (error) {
      console.error('Failed to send security event:', error);
    }
  }

  // Handle critical security events
  private handleCriticalEvent(event: SecurityEvent) {
    // Force logout for critical events
    if (event.type === 'suspicious_activity' && event.severity === 'critical') {
      auth.signOut();
    }

    // Show security warning
    this.showSecurityAlert(event);
  }

  // Show security alert to user
  private showSecurityAlert(event: SecurityEvent) {
    // Create and show security alert modal
    const alert = document.createElement('div');
    alert.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: Arial, sans-serif;
    `;

    alert.innerHTML = `
      <div style="text-align: center; max-width: 400px; padding: 2rem;">
        <h2 style="color: #ff4444; margin-bottom: 1rem;">🔒 Security Alert</h2>
        <p style="margin-bottom: 2rem;">
          Suspicious activity detected. Please verify your identity.
        </p>
        <button onclick="this.parentElement.parentElement.remove(); window.location.reload();" 
                style="padding: 1rem 2rem; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Reload Application
        </button>
      </div>
    `;

    document.body.appendChild(alert);
  }

  // Get security events for analysis
  public getEvents(filter?: Partial<SecurityEvent>): SecurityEvent[] {
    if (!filter) return [...this.events];

    return this.events.filter(event => {
      return Object.entries(filter).every(([key, value]) => {
        return (event as any)[key] === value;
      });
    });
  }

  // Get security statistics
  public getStats() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    const recentEvents = this.events.filter(e => e.timestamp.getTime() > oneHourAgo);
    const dailyEvents = this.events.filter(e => e.timestamp.getTime() > oneDayAgo);

    return {
      totalEvents: this.events.length,
      recentEvents: recentEvents.length,
      dailyEvents: dailyEvents.length,
      criticalEvents: this.events.filter(e => e.severity === 'critical').length,
      suspiciousActivities: this.events.filter(e => e.type === 'suspicious_activity').length,
      rateLimitViolations: this.events.filter(e => e.type === 'rate_limit_exceeded').length
    };
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();

// Helper functions
export const logSecurityEvent = (event: Omit<SecurityEvent, 'timestamp'>) => {
  securityMonitor.logEvent({ ...event, timestamp: new Date() });
};

export const checkUserRateLimit = (userId: string, action: string, limit?: number) => {
  return securityMonitor.checkRateLimit(userId, action, limit);
};

export default SecurityMonitor;
