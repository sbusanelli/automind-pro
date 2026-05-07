import { logger } from './logger';

export class ZeroTrustLogger {
  private static instance: ZeroTrustLogger;
  private auditLog: any[] = [];
  private securityEvents: any[] = [];

  private constructor() {}

  static getInstance(): ZeroTrustLogger {
    if (!ZeroTrustLogger.instance) {
      ZeroTrustLogger.instance = new ZeroTrustLogger();
    }
    return ZeroTrustLogger.instance;
  }

  // Security event logging
  logSecurityEvent(event: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    sessionId?: string;
    ipAddress: string;
    userAgent: string;
    description: string;
    details: Record<string, any>;
    timestamp: Date;
    resolved: boolean;
  }): void {
    const logEntry = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      service: 'zero-trust'
    };

    // Add to security events array
    this.securityEvents.push(logEntry);

    // Log to main logger
    const logLevel = this.getLogLevel(event.severity);
    logger[logLevel]('Security Event', {
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      sessionId: event.sessionId,
      ipAddress: event.ipAddress,
      description: event.description,
      details: event.details
    });

    // Send to external monitoring if critical
    if (event.severity === 'critical') {
      this.sendCriticalAlert(logEntry);
    }
  }

  // Authentication logging
  logAuthentication(event: {
    userId: string;
    success: boolean;
    method: string;
    ipAddress: string;
    userAgent: string;
    riskScore: number;
    trustLevel: string;
    mfaUsed?: boolean;
    deviceVerified?: boolean;
    locationVerified?: boolean;
    error?: string;
  }): void {
    const logEntry = {
      type: 'authentication',
      success: event.success,
      userId: event.userId,
      method: event.method,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      riskScore: event.riskScore,
      trustLevel: event.trustLevel,
      mfaUsed: event.mfaUsed,
      deviceVerified: event.deviceVerified,
      locationVerified: event.locationVerified,
      error: event.error,
      timestamp: new Date(),
      service: 'zero-trust'
    };

    if (event.success) {
      logger.info('Authentication Success', {
        userId: event.userId,
        method: event.method,
        riskScore: event.riskScore,
        trustLevel: event.trustLevel
      });
    } else {
      logger.warn('Authentication Failure', {
        userId: event.userId,
        method: event.method,
        error: event.error,
        ipAddress: event.ipAddress
      });
    }

    this.auditLog.push(logEntry);
  }

  // Authorization logging
  logAuthorization(event: {
    userId: string;
    resource: string;
    action: string;
    authorized: boolean;
    reason?: string;
    riskScore: number;
    trustLevel: string;
    additionalAuthRequired?: boolean;
    ipAddress: string;
  }): void {
    const logEntry = {
      type: 'authorization',
      userId: event.userId,
      resource: event.resource,
      action: event.action,
      authorized: event.authorized,
      reason: event.reason,
      riskScore: event.riskScore,
      trustLevel: event.trustLevel,
      additionalAuthRequired: event.additionalAuthRequired,
      ipAddress: event.ipAddress,
      timestamp: new Date(),
      service: 'zero-trust'
    };

    if (event.authorized) {
      logger.info('Authorization Success', {
        userId: event.userId,
        resource: event.resource,
        action: event.action,
        trustLevel: event.trustLevel
      });
    } else {
      logger.warn('Authorization Denied', {
        userId: event.userId,
        resource: event.resource,
        action: event.action,
        reason: event.reason,
        trustLevel: event.trustLevel
      });
    }

    this.auditLog.push(logEntry);
  }

  // Risk assessment logging
  logRiskAssessment(event: {
    userId: string;
    sessionId: string;
    riskFactors: any[];
    totalRiskScore: number;
    riskLevel: string;
    recommendations: string[];
    ipAddress: string;
    userAgent: string;
  }): void {
    const logEntry = {
      type: 'risk_assessment',
      userId: event.userId,
      sessionId: event.sessionId,
      riskFactors: event.riskFactors,
      totalRiskScore: event.totalRiskScore,
      riskLevel: event.riskLevel,
      recommendations: event.recommendations,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: new Date(),
      service: 'zero-trust'
    };

    logger.info('Risk Assessment', {
      userId: event.userId,
      riskLevel: event.riskLevel,
      riskScore: event.totalRiskScore,
      factors: event.riskFactors.length
    });

    this.auditLog.push(logEntry);
  }

  // Policy violation logging
  logPolicyViolation(event: {
    policyId: string;
    policyName: string;
    violationType: string;
    userId?: string;
    sessionId?: string;
    ipAddress: string;
    userAgent: string;
    description: string;
    details: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): void {
    const logEntry = {
      type: 'policy_violation',
      policyId: event.policyId,
      policyName: event.policyName,
      violationType: event.violationType,
      userId: event.userId,
      sessionId: event.sessionId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      description: event.description,
      details: event.details,
      severity: event.severity,
      timestamp: new Date(),
      service: 'zero-trust'
    };

    const logLevel = this.getLogLevel(event.severity);
    logger[logLevel]('Policy Violation', {
      policyId: event.policyId,
      policyName: event.policyName,
      violationType: event.violationType,
      userId: event.userId,
      severity: event.severity
    });

    this.auditLog.push(logEntry);
  }

  // Session management logging
  logSessionManagement(event: {
    sessionId: string;
    userId: string;
    action: 'create' | 'extend' | 'terminate' | 'validate';
    ipAddress: string;
    userAgent: string;
    trustLevel: string;
    riskScore: number;
    duration?: number;
    reason?: string;
  }): void {
    const logEntry = {
      type: 'session_management',
      sessionId: event.sessionId,
      userId: event.userId,
      action: event.action,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      trustLevel: event.trustLevel,
      riskScore: event.riskScore,
      duration: event.duration,
      reason: event.reason,
      timestamp: new Date(),
      service: 'zero-trust'
    };

    logger.info('Session Management', {
      sessionId: event.sessionId,
      userId: event.userId,
      action: event.action,
      trustLevel: event.trustLevel,
      riskScore: event.riskScore
    });

    this.auditLog.push(logEntry);
  }

  // Behavioral analysis logging
  logBehavioralAnalysis(event: {
    userId: string;
    sessionId: string;
    behaviorType: string;
    anomaly: boolean;
    confidence: number;
    riskScore: number;
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
  }): void {
    const logEntry = {
      type: 'behavioral_analysis',
      userId: event.userId,
      sessionId: event.sessionId,
      behaviorType: event.behaviorType,
      anomaly: event.anomaly,
      confidence: event.confidence,
      riskScore: event.riskScore,
      details: event.details,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: new Date(),
      service: 'zero-trust'
    };

    if (event.anomaly) {
      logger.warn('Behavioral Anomaly Detected', {
        userId: event.userId,
        behaviorType: event.behaviorType,
        confidence: event.confidence,
        riskScore: event.riskScore
      });
    } else {
      logger.info('Behavioral Analysis', {
        userId: event.userId,
        behaviorType: event.behaviorType,
        confidence: event.confidence
      });
    }

    this.auditLog.push(logEntry);
  }

  // Compliance logging
  logCompliance(event: {
    framework: string;
    control: string;
    status: 'compliant' | 'non_compliant';
    details: Record<string, any>;
    evidence?: any;
    auditor?: string;
  }): void {
    const logEntry = {
      type: 'compliance',
      framework: event.framework,
      control: event.control,
      status: event.status,
      details: event.details,
      evidence: event.evidence,
      auditor: event.auditor,
      timestamp: new Date(),
      service: 'zero-trust'
    };

    if (event.status === 'non_compliant') {
      logger.warn('Compliance Issue', {
        framework: event.framework,
        control: event.control,
        details: event.details
      });
    } else {
      logger.info('Compliance Check', {
        framework: event.framework,
        control: event.control,
        status: event.status
      });
    }

    this.auditLog.push(logEntry);
  }

  // Performance logging
  logPerformance(event: {
    operation: string;
    duration: number;
    success: boolean;
    userId?: string;
    sessionId?: string;
    details: Record<string, any>;
  }): void {
    const logEntry = {
      type: 'performance',
      operation: event.operation,
      duration: event.duration,
      success: event.success,
      userId: event.userId,
      sessionId: event.sessionId,
      details: event.details,
      timestamp: new Date(),
      service: 'zero-trust'
    };

    if (event.duration > 5000) { // 5 seconds threshold
      logger.warn('Performance Issue', {
        operation: event.operation,
        duration: event.duration,
        success: event.success
      });
    } else {
      logger.info('Performance Metric', {
        operation: event.operation,
        duration: event.duration,
        success: event.success
      });
    }

    this.auditLog.push(logEntry);
  }

  // Get audit logs
  getAuditLogs(filters?: {
    userId?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): any[] {
    let logs = [...this.auditLog];

    // Apply filters
    if (filters?.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }
    if (filters?.type) {
      logs = logs.filter(log => log.type === filters.type);
    }
    if (filters?.startDate) {
      logs = logs.filter(log => log.timestamp >= filters.startDate);
    }
    if (filters?.endDate) {
      logs = logs.filter(log => log.timestamp <= filters.endDate);
    }

    // Apply pagination
    if (filters?.offset) {
      logs = logs.slice(filters.offset);
    }
    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  // Get security events
  getSecurityEvents(filters?: {
    severity?: string;
    type?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): any[] {
    let events = [...this.securityEvents];

    // Apply filters
    if (filters?.severity) {
      events = events.filter(event => event.severity === filters.severity);
    }
    if (filters?.type) {
      events = events.filter(event => event.type === filters.type);
    }
    if (filters?.userId) {
      events = events.filter(event => event.userId === filters.userId);
    }
    if (filters?.startDate) {
      events = events.filter(event => event.timestamp >= filters.startDate);
    }
    if (filters?.endDate) {
      events = events.filter(event => event.timestamp <= filters.endDate);
    }

    // Apply pagination
    if (filters?.offset) {
      events = events.slice(filters.offset);
    }
    if (filters?.limit) {
      events = events.slice(0, filters.limit);
    }

    return events;
  }

  // Generate compliance report
  generateComplianceReport(framework: string): any {
    const complianceLogs = this.auditLog.filter(log => 
      log.type === 'compliance' && log.framework === framework
    );

    const controls = complianceLogs.reduce((acc, log) => {
      if (!acc[log.control]) {
        acc[log.control] = {
          compliant: 0,
          nonCompliant: 0,
          lastChecked: log.timestamp,
          issues: []
        };
      }

      if (log.status === 'compliant') {
        acc[log.control].compliant++;
      } else {
        acc[log.control].nonCompliant++;
        acc[log.control].issues.push(log.details);
      }

      return acc;
    }, {});

    const totalControls = Object.keys(controls).length;
    const compliantControls = Object.values(controls).filter(control => 
      control.nonCompliant === 0
    ).length;

    return {
      framework,
      totalControls,
      compliantControls,
      compliancePercentage: (compliantControls / totalControls) * 100,
      controls,
      generatedAt: new Date()
    };
  }

  // Private helper methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getLogLevel(severity: string): 'info' | 'warn' | 'error' {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warn';
      case 'high':
      case 'critical':
        return 'error';
      default:
        return 'info';
    }
  }

  private async sendCriticalAlert(event: any): Promise<void> {
    // Send critical alerts to external monitoring systems
    try {
      // This would integrate with your alerting system
      logger.error('CRITICAL SECURITY ALERT', event);
      
      // Send to Slack, PagerDuty, etc.
      await this.sendToSlack(event);
      await this.sendToPagerDuty(event);
    } catch (error) {
      logger.error('Failed to send critical alert', error);
    }
  }

  private async sendToSlack(event: any): Promise<void> {
    // Implement Slack integration
    logger.info('Sending alert to Slack', { eventId: event.id });
  }

  private async sendToPagerDuty(event: any): Promise<void> {
    // Implement PagerDuty integration
    logger.info('Sending alert to PagerDuty', { eventId: event.id });
  }

  // Cleanup old logs
  cleanup(): void {
    const now = Date.now();
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days

    // Clean audit logs
    this.auditLog = this.auditLog.filter(log => 
      now - log.timestamp.getTime() < maxAge
    );

    // Clean security events
    this.securityEvents = this.securityEvents.filter(event => 
      now - event.timestamp.getTime() < maxAge
    );

    logger.info('Zero Trust logs cleaned up', {
      auditLogsRemaining: this.auditLog.length,
      securityEventsRemaining: this.securityEvents.length
    });
  }
}

export const zeroTrustLogger = ZeroTrustLogger.getInstance();
