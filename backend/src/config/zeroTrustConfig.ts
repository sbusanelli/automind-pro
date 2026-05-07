export const ZERO_TRUST_CONFIG = {
  // Authentication settings
  authentication: {
    sessionTimeout: 3600000, // 1 hour in milliseconds
    maxFailedAttempts: 5,
    lockoutDuration: 900000, // 15 minutes in milliseconds
    tokenExpiry: 3600000, // 1 hour
    refreshTokenExpiry: 604800000, // 7 days
    mfaRequiredForHighRisk: true,
    deviceVerificationRequired: true,
    locationValidationRequired: true
  },

  // Risk assessment settings
  riskAssessment: {
    thresholds: {
      low: 30,
      medium: 60,
      high: 80,
      critical: 95
    },
    weights: {
      newDevice: 25,
      newLocation: 20,
      unusualTime: 15,
      failedAttempts: 10,
      behavioralAnomaly: 20,
      privilegedAccess: 10
    },
    decayRate: 0.1, // Risk score decay per hour
    maxRiskScore: 100
  },

  // Security policies
  policies: {
    authentication: {
      strict: true,
      mfaRequired: true,
      deviceFingerprinting: true,
      behavioralAnalysis: true
    },
    authorization: {
      leastPrivilege: true,
      contextual: true,
      timeBased: true,
      locationBased: true
    },
    device: {
      registrationRequired: true,
      trustDecay: true,
      anomalyDetection: true
    },
    location: {
      geoFencing: true,
      velocityChecking: true,
      anomalyDetection: true
    }
  },

  // Monitoring and logging
  monitoring: {
    logLevel: 'info',
    securityEventsRetention: 90, // days
    sessionRetention: 30, // days
    auditRetention: 365, // days
    realTimeAlerting: true,
    anomalyDetection: true,
    threatIntelligence: true
  },

  // Compliance settings
  compliance: {
    frameworks: ['SOC2', 'ISO27001', 'GDPR', 'HIPAA'],
    auditFrequency: 'quarterly',
    reportingFrequency: 'monthly',
    dataRetention: 7, // years
    encryptionRequired: true,
    accessLogging: true
  },

  // Performance settings
  performance: {
    cacheTimeout: 300, // seconds
    maxConcurrentSessions: 10000,
    requestTimeout: 30000, // milliseconds
    batchSize: 100,
    parallelProcessing: true
  },

  // Integration settings
  integrations: {
    vault: {
      enabled: true,
      provider: 'hashicorp',
      timeout: 5000
    },
    mfa: {
      enabled: true,
      providers: ['totp', 'sms', 'email', 'push'],
      timeout: 30000
    },
    threatIntelligence: {
      enabled: true,
      providers: ['crowdstrike', 'mandiant', 'recordedfuture'],
      updateFrequency: 3600 // seconds
    },
    behavioralAnalysis: {
      enabled: true,
      provider: 'ml_model',
      confidenceThreshold: 0.8
    }
  },

  // Zero Trust principles
  principles: {
    neverTrustAlwaysVerify: true,
    leastPrivilegeAccess: true,
    microSegmentation: true,
    assumeBreach: true,
    continuousValidation: true,
    contextAwareAccess: true,
    riskBasedAuthentication: true,
    automatedResponse: true
  }
};

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Opener-Policy': 'same-origin'
};

export const RATE_LIMITS = {
  authentication: {
    windowMs: 900000, // 15 minutes
    maxRequests: 5,
    skipSuccessfulRequests: false
  },
  authorization: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    skipSuccessfulRequests: false
  },
  mfa: {
    windowMs: 300000, // 5 minutes
    maxRequests: 3,
    skipSuccessfulRequests: false
  },
  deviceVerification: {
    windowMs: 600000, // 10 minutes
    maxRequests: 10,
    skipSuccessfulRequests: false
  },
  riskAssessment: {
    windowMs: 60000, // 1 minute
    maxRequests: 50,
    skipSuccessfulRequests: false
  },
  securityEvents: {
    windowMs: 60000, // 1 minute
    maxRequests: 200,
    skipSuccessfulRequests: true
  }
};

export const TRUST_LEVELS = {
  LOW: {
    score: 0,
    color: 'red',
    description: 'Low trust - Additional authentication required',
    restrictions: ['no_privileged_access', 'session_timeout_short', 'enhanced_monitoring']
  },
  MEDIUM: {
    score: 50,
    color: 'yellow',
    description: 'Medium trust - Standard access with monitoring',
    restrictions: ['limited_privileged_access', 'standard_monitoring']
  },
  HIGH: {
    score: 80,
    color: 'green',
    description: 'High trust - Full access with minimal restrictions',
    restrictions: ['full_access', 'minimal_monitoring']
  }
};

export const RISK_FACTORS = {
  NEW_DEVICE: {
    type: 'new_device',
    weight: 25,
    description: 'Authentication from new device',
    mitigation: 'device_verification',
    decayTime: 86400000 // 24 hours
  },
  NEW_LOCATION: {
    type: 'new_location',
    weight: 20,
    description: 'Authentication from new location',
    mitigation: 'location_verification',
    decayTime: 86400000 // 24 hours
  },
  UNUSUAL_TIME: {
    type: 'unusual_time',
    weight: 15,
    description: 'Authentication at unusual time',
    mitigation: 'time_based_challenge',
    decayTime: 3600000 // 1 hour
  },
  FAILED_ATTEMPTS: {
    type: 'failed_attempts',
    weight: 10,
    description: 'Recent failed authentication attempts',
    mitigation: 'account_lockout',
    decayTime: 3600000 // 1 hour
  },
  BEHAVIORAL_ANOMALY: {
    type: 'behavioral_anomaly',
    weight: 20,
    description: 'Behavioral anomaly detected',
    mitigation: 'behavioral_challenge',
    decayTime: 7200000 // 2 hours
  },
  PRIVILEGED_ACCESS: {
    type: 'privileged_access',
    weight: 10,
    description: 'Privileged access requested',
    mitigation: 'enhanced_verification',
    decayTime: 1800000 // 30 minutes
  }
};

export const SECURITY_EVENTS = {
  AUTHENTICATION_SUCCESS: {
    type: 'authentication_success',
    severity: 'low',
    description: 'Successful authentication',
    alerting: false
  },
  AUTHENTICATION_FAILURE: {
    type: 'authentication_failure',
    severity: 'medium',
    description: 'Failed authentication',
    alerting: true
  },
  AUTHORIZATION_DENIED: {
    type: 'authorization_denied',
    severity: 'medium',
    description: 'Authorization denied',
    alerting: true
  },
  SUSPICIOUS_ACTIVITY: {
    type: 'suspicious_activity',
    severity: 'high',
    description: 'Suspicious activity detected',
    alerting: true
  },
  SECURITY_VIOLATION: {
    type: 'security_violation',
    severity: 'critical',
    description: 'Security violation detected',
    alerting: true
  },
  POLICY_VIOLATION: {
    type: 'policy_violation',
    severity: 'high',
    description: 'Security policy violation',
    alerting: true
  },
  ANOMALY_DETECTED: {
    type: 'anomaly_detected',
    severity: 'medium',
    description: 'Anomaly detected',
    alerting: false
  },
  THREAT_INTELLIGENCE: {
    type: 'threat_intelligence',
    severity: 'high',
    description: 'Threat intelligence alert',
    alerting: true
  }
};

export const COMPLIANCE_REQUIREMENTS = {
  SOC2: {
    controls: ['access_control', 'security_monitoring', 'incident_response'],
    evidenceRetention: 365, // days
    auditFrequency: 'quarterly',
    reporting: true
  },
  ISO27001: {
    controls: ['information_security', 'risk_management', 'incident_management'],
    evidenceRetention: 1825, // 5 years
    auditFrequency: 'annual',
    reporting: true
  },
  GDPR: {
    controls: ['data_protection', 'privacy_by_design', 'breach_notification'],
    evidenceRetention: 2555, // 7 years
    auditFrequency: 'annual',
    reporting: true
  },
  HIPAA: {
    controls: ['phi_protection', 'access_control', 'audit_logging'],
    evidenceRetention: 2555, // 7 years
    auditFrequency: 'annual',
    reporting: true
  }
};

export const ZERO_TRUST_WORKFLOWS = {
  AUTHENTICATION: {
    steps: ['credential_validation', 'risk_assessment', 'policy_evaluation', 'mfa_verification', 'session_creation'],
    timeout: 30000, // milliseconds
    retries: 3
  },
  AUTHORIZATION: {
    steps: ['context_validation', 'policy_check', 'permission_verification', 'access_grant'],
    timeout: 5000, // milliseconds
    retries: 1
  },
  SESSION_MANAGEMENT: {
    steps: ['session_validation', 'trust_assessment', 'policy_application', 'session_extension'],
    timeout: 10000, // milliseconds
    retries: 2
  },
  INCIDENT_RESPONSE: {
    steps: ['threat_detection', 'risk_assessment', 'response_execution', 'recovery_verification'],
    timeout: 60000, // milliseconds
    retries: 3
  }
};
