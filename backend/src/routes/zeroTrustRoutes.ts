import { Router } from 'express';
import { ZeroTrustController } from '../controllers/zeroTrustController';
import { zeroTrustMiddleware } from '../middleware/zeroTrustMiddleware';

const router = Router();
const controller = new ZeroTrustController();

// Authentication routes
router.post('/authenticate', controller.authenticate);
router.post('/verify-mfa', controller.verifyMFA);
router.post('/verify-device', controller.verifyDevice);

// Authorization routes
router.post('/authorize', 
  zeroTrustMiddleware.authenticate,
  controller.authorize
);

// Risk assessment routes
router.post('/assess-risk', controller.assessRisk);
router.get('/assess-trust-level', 
  zeroTrustMiddleware.authenticate,
  controller.assessTrustLevel
);

// Security events routes
router.get('/security-events', 
  zeroTrustMiddleware.authenticate,
  zeroTrustMiddleware.authorize('security', 'read'),
  controller.getSecurityEvents
);

// Security policies routes
router.get('/security-policies', 
  zeroTrustMiddleware.authenticate,
  zeroTrustMiddleware.authorize('security', 'read'),
  controller.getSecurityPolicies
);

// Session management routes
router.post('/session/manage', 
  zeroTrustMiddleware.authenticate,
  controller.manageSession
);

// Security dashboard routes
router.get('/security-dashboard', 
  zeroTrustMiddleware.authenticate,
  zeroTrustMiddleware.authorize('dashboard', 'read'),
  controller.getSecurityDashboard
);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'zero-trust',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

export default router;
