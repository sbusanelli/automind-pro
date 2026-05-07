import { Request, Response, NextFunction } from 'express';
import { ZeroTrustService } from '../services/zeroTrustService';
import { logger } from '../utils/logger';

export interface ZeroTrustRequest extends Request {
  securityContext?: any;
  riskAssessment?: any;
  user?: any;
}

export class ZeroTrustMiddleware {
  private zeroTrustService: ZeroTrustService;

  constructor() {
    this.zeroTrustService = new ZeroTrustService({
      sessionTimeout: 3600000, // 1 hour
      maxFailedAttempts: 5,
      lockoutDuration: 900000, // 15 minutes
      deviceFingerprinting: true,
      locationValidation: true,
      behavioralAnalysis: true,
      adaptiveAuth: true,
      riskScoring: true
    });
  }

  // Main authentication middleware
  authenticate = async (req: ZeroTrustRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract authentication data
      const authData = this.extractAuthData(req);
      
      if (!authData) {
        res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      // Perform zero-trust authentication
      const authResult = await this.zeroTrustService.authenticate(authData);
      
      if (!authResult.success) {
        const statusCode = authResult.error?.includes('blocked') ? 403 : 401;
        
        res.status(statusCode).json({
          error: authResult.error || 'Authentication failed',
          code: 'AUTH_FAILED',
          requiresMFA: authResult.requiresMFA,
          requiresDeviceVerification: authResult.requiresDeviceVerification,
          riskAssessment: authResult.riskAssessment
        });
        return;
      }

      // Attach security context to request
      req.securityContext = authResult.securityContext;
      req.riskAssessment = authResult.riskAssessment;
      req.user = authResult.securityContext;

      // Add security headers
      this.addSecurityHeaders(res, authResult.securityContext);

      next();
    } catch (error) {
      logger.error('Zero Trust authentication middleware error', error);
      res.status(500).json({
        error: 'Authentication service unavailable',
        code: 'AUTH_SERVICE_ERROR'
      });
    }
  };

  // Authorization middleware
  authorize = (resource: string, action: string) => {
    return async (req: ZeroTrustRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.securityContext) {
          res.status(401).json({
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          });
          return;
        }

        // Perform zero-trust authorization
        const authResult = await this.zeroTrustService.authorize(
          req.securityContext,
          resource,
          action
        );

        if (!authResult.authorized) {
          const statusCode = authResult.reason?.includes('Additional authentication') ? 428 : 403;
          
          res.status(statusCode).json({
            error: authResult.reason || 'Access denied',
            code: 'ACCESS_DENIED',
            requiresAdditionalAuth: authResult.requiresAdditionalAuth,
            riskAssessment: authResult.riskAssessment
          });
          return;
        }

        // Update request with latest risk assessment
        req.riskAssessment = authResult.riskAssessment;

        next();
      } catch (error) {
        logger.error('Zero Trust authorization middleware error', error);
        res.status(500).json({
          error: 'Authorization service unavailable',
          code: 'AUTH_SERVICE_ERROR'
        });
      }
    };
  };

  // Risk-based authentication middleware
  riskBasedAuth = (minTrustLevel: 'low' | 'medium' | 'high' = 'medium') => {
    return async (req: ZeroTrustRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.securityContext) {
          res.status(401).json({
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          });
          return;
        }

        // Check trust level
        const trustLevels = { low: 1, medium: 2, high: 3 };
        const requiredLevel = trustLevels[minTrustLevel];
        const currentLevel = trustLevels[req.securityContext.trustLevel];

        if (currentLevel < requiredLevel) {
          res.status(428).json({
            error: 'Insufficient trust level',
            code: 'INSUFFICIENT_TRUST',
            requiredTrustLevel: minTrustLevel,
            currentTrustLevel: req.securityContext.trustLevel,
            riskAssessment: req.riskAssessment
          });
          return;
        }

        next();
      } catch (error) {
        logger.error('Risk-based authentication middleware error', error);
        res.status(500).json({
          error: 'Authentication service unavailable',
          code: 'AUTH_SERVICE_ERROR'
        });
      }
    };
  };

  // Device validation middleware
  validateDevice = async (req: ZeroTrustRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.securityContext) {
        res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      // Extract device information
      const deviceInfo = this.extractDeviceInfo(req);
      
      // Validate device
      const isValidDevice = await this.validateDeviceInfo(deviceInfo, req.securityContext);
      
      if (!isValidDevice) {
        res.status(403).json({
          error: 'Device validation failed',
          code: 'DEVICE_VALIDATION_FAILED'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Device validation middleware error', error);
      res.status(500).json({
        error: 'Device validation service unavailable',
        code: 'DEVICE_SERVICE_ERROR'
      });
    }
  };

  // Location validation middleware
  validateLocation = async (req: ZeroTrustRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.securityContext) {
        res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      // Extract location information
      const locationInfo = this.extractLocationInfo(req);
      
      // Validate location
      const isValidLocation = await this.validateLocationInfo(locationInfo, req.securityContext);
      
      if (!isValidLocation) {
        res.status(403).json({
          error: 'Location validation failed',
          code: 'LOCATION_VALIDATION_FAILED'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Location validation middleware error', error);
      res.status(500).json({
        error: 'Location validation service unavailable',
        code: 'LOCATION_SERVICE_ERROR'
      });
    }
  };

  // Session validation middleware
  validateSession = async (req: ZeroTrustRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.securityContext) {
        res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      // Validate session
      const isValidSession = await this.zeroTrustService.validateSession(req.securityContext.sessionId);
      
      if (!isValidSession.valid) {
        res.status(401).json({
          error: isValidSession.reason || 'Session invalid',
          code: 'SESSION_INVALID'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Session validation middleware error', error);
      res.status(500).json({
        error: 'Session validation service unavailable',
        code: 'SESSION_SERVICE_ERROR'
      });
    }
  };

  // Behavioral analysis middleware
  analyzeBehavior = async (req: ZeroTrustRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.securityContext) {
        res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      // Extract behavioral data
      const behaviorData = this.extractBehaviorData(req);
      
      // Analyze behavior
      const behaviorAnalysis = await this.analyzeBehaviorData(behaviorData, req.securityContext);
      
      if (behaviorAnalysis.anomaly) {
        res.status(428).json({
          error: 'Behavioral anomaly detected',
          code: 'BEHAVIOR_ANOMALY',
          anomaly: behaviorAnalysis.anomaly,
          confidence: behaviorAnalysis.confidence
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Behavioral analysis middleware error', error);
      res.status(500).json({
        error: 'Behavioral analysis service unavailable',
        code: 'BEHAVIOR_SERVICE_ERROR'
      });
    }
  };

  // Rate limiting middleware
  rateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return async (req: ZeroTrustRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const key = req.securityContext?.userId || req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean up old entries
        for (const [k, v] of requests.entries()) {
          if (v.resetTime < now) {
            requests.delete(k);
          }
        }

        // Check current requests
        const current = requests.get(key);
        
        if (current && current.resetTime > now) {
          if (current.count >= maxRequests) {
            res.status(429).json({
              error: 'Rate limit exceeded',
              code: 'RATE_LIMIT_EXCEEDED',
              retryAfter: Math.ceil((current.resetTime - now) / 1000)
            });
            return;
          }
          current.count++;
        } else {
          requests.set(key, {
            count: 1,
            resetTime: now + windowMs
          });
        }

        next();
      } catch (error) {
        logger.error('Rate limiting middleware error', error);
        next(); // Continue on error to avoid blocking legitimate requests
      }
    };
  };

  // Security headers middleware
  securityHeaders = (req: ZeroTrustRequest, res: Response, next: NextFunction): void => {
    this.addSecurityHeaders(res, req.securityContext);
    next();
  };

  // CORS middleware with security policies
  secureCors = (req: ZeroTrustRequest, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-ID, X-Location');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  };

  // Private helper methods
  private extractAuthData(req: Request): any {
    const authHeader = req.headers.authorization;
    const deviceId = req.headers['x-device-id'] as string;
    const userAgent = req.headers['user-agent'];
    const ipAddress = this.getClientIP(req);
    
    if (!authHeader) {
      return null;
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      // Parse JWT token
      const payload = this.parseJWT(token);
      
      return {
        credentials: {
          username: payload.sub,
          password: '', // Password not needed for token-based auth
          mfaCode: req.headers['x-mfa-code'] as string
        },
        deviceInfo: {
          deviceId: deviceId || this.generateDeviceId(req),
          userAgent: userAgent || '',
          fingerprint: this.generateFingerprint(req)
        },
        location: {
          ipAddress,
          coordinates: this.parseCoordinates(req.headers['x-location'] as string)
        },
        context: {
          timestamp: new Date(),
          requestId: this.generateRequestId(),
          source: 'api'
        }
      };
    } catch (error) {
      logger.error('Failed to extract authentication data', error);
      return null;
    }
  }

  private extractDeviceInfo(req: Request): any {
    return {
      deviceId: req.headers['x-device-id'] as string,
      userAgent: req.headers['user-agent'],
      fingerprint: this.generateFingerprint(req)
    };
  }

  private extractLocationInfo(req: Request): any {
    return {
      ipAddress: this.getClientIP(req),
      coordinates: this.parseCoordinates(req.headers['x-location'] as string)
    };
  }

  private extractBehaviorData(req: Request): any {
    return {
      requestPattern: {
        endpoint: req.path,
        method: req.method,
        timestamp: new Date(),
        userAgent: req.headers['user-agent'],
        ipAddress: this.getClientIP(req)
      },
      sessionData: {
        duration: Date.now() - (req as ZeroTrustRequest).securityContext?.timestamp || 0,
        requestCount: 1 // Would be tracked in a real implementation
      }
    };
  }

  private async validateDeviceInfo(deviceInfo: any, securityContext: any): Promise<boolean> {
    // Validate device ID matches security context
    return deviceInfo.deviceId === securityContext.deviceId;
  }

  private async validateLocationInfo(locationInfo: any, securityContext: any): Promise<boolean> {
    // Validate IP address matches security context
    return locationInfo.ipAddress === securityContext.ipAddress;
  }

  private async analyzeBehaviorData(behaviorData: any, securityContext: any): Promise<{
    anomaly: boolean;
    confidence: number;
    details?: any;
  }> {
    // Implement behavioral analysis
    // This would use ML models to detect anomalies
    return {
      anomaly: false,
      confidence: 0
    };
  }

  private addSecurityHeaders(res: Response, securityContext?: any): void {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    if (securityContext) {
      res.setHeader('X-Trust-Level', securityContext.trustLevel);
      res.setHeader('X-Risk-Score', securityContext.riskScore.toString());
    }
  }

  private getClientIP(req: Request): string {
    return req.ip || 
           req.headers['x-forwarded-for'] as string || 
           req.headers['x-real-ip'] as string || 
           req.connection.remoteAddress || 
           'unknown';
  }

  private generateDeviceId(req: Request): string {
    const userAgent = req.headers['user-agent'] || '';
    const accept = req.headers.accept || '';
    const encoding = req.headers['accept-encoding'] || '';
    const language = req.headers['accept-language'] || '';
    
    return this.hashString(`${userAgent}-${accept}-${encoding}-${language}`);
  }

  private generateFingerprint(req: Request): string {
    const data = {
      userAgent: req.headers['user-agent'],
      accept: req.headers.accept,
      encoding: req.headers['accept-encoding'],
      language: req.headers['accept-language'],
      platform: req.headers['sec-ch-ua-platform'],
      mobile: req.headers['sec-ch-ua-mobile']
    };
    
    return this.hashString(JSON.stringify(data));
  }

  private parseCoordinates(locationHeader?: string): { latitude: number; longitude: number } | undefined {
    if (!locationHeader) return undefined;
    
    try {
      const [lat, lon] = locationHeader.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lon)) {
        return { latitude: lat, longitude: lon };
      }
    } catch (error) {
      logger.error('Failed to parse coordinates', error);
    }
    
    return undefined;
  }

  private parseJWT(token: string): any {
    try {
      // Simple JWT parsing (in production, use proper JWT library)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return payload;
    } catch (error) {
      logger.error('Failed to parse JWT', error);
      throw error;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashString(input: string): string {
    // Simple hash function (in production, use proper crypto)
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}

// Export singleton instance
export const zeroTrustMiddleware = new ZeroTrustMiddleware();
