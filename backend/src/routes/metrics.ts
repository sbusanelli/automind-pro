import { Router, Request, Response } from 'express';
import { getCache } from '../config/redis';

const router = Router();

// Get system metrics
router.get('/system', async (req: Request, res: Response) => {
  try {
    const cache = getCache();
    
    // Simulate getting real system metrics
    // In a real implementation, these would come from actual system monitoring
    const metrics = {
      timestamp: new Date().toISOString(),
      performance: {
        cpu: Math.random() * 40 + 30, // 30-70%
        memory: Math.random() * 30 + 50, // 50-80%
        disk: Math.random() * 20 + 60, // 60-80%
        network: Math.random() * 10 + 5 // 5-15ms latency
      },
      jobs: {
        total: Math.floor(Math.random() * 100 + 50),
        running: Math.floor(Math.random() * 20 + 5),
        completed: Math.floor(Math.random() * 80 + 40),
        failed: Math.floor(Math.random() * 10 + 1)
      },
      resources: {
        activeConnections: Math.floor(Math.random() * 100 + 20),
        queueLength: Math.floor(Math.random() * 50 + 5),
        avgResponseTime: Math.random() * 100 + 50, // 50-150ms
        throughput: Math.floor(Math.random() * 1000 + 500) // 500-1500 req/min
      }
    };

    // Cache metrics for 30 seconds
    await cache.set('system:metrics', metrics, 30);

    res.json(metrics);
  } catch (error) {
    console.error('Get system metrics error:', error);
    res.status(500).json({ error: 'Failed to retrieve system metrics' });
  }
});

// Get AI insights based on system metrics
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const cache = getCache();
    
    // Try to get cached metrics first
    let metrics = await cache.get('system:metrics');
    
    if (!metrics) {
      // Generate fresh metrics if not cached
      metrics = {
        performance: {
          cpu: Math.random() * 40 + 30,
          memory: Math.random() * 30 + 50,
          disk: Math.random() * 20 + 60,
          network: Math.random() * 10 + 5
        },
        jobs: {
          total: Math.floor(Math.random() * 100 + 50),
          running: Math.floor(Math.random() * 20 + 5),
          completed: Math.floor(Math.random() * 80 + 40),
          failed: Math.floor(Math.random() * 10 + 1)
        },
        resources: {
          activeConnections: Math.floor(Math.random() * 100 + 20),
          queueLength: Math.floor(Math.random() * 50 + 5),
          avgResponseTime: Math.random() * 100 + 50,
          throughput: Math.floor(Math.random() * 1000 + 500)
        }
      };
    }

    // Generate insights based on actual metrics
    const insights = [
      {
        type: 'performance',
        title: 'System Efficiency',
        description: 'Overall system performance',
        value: Math.round((100 - (metrics.performance.cpu + metrics.performance.memory) / 2) + (Math.random() * 10 - 5)),
        trend: metrics.performance.cpu < 50 ? 'up' : metrics.performance.cpu > 65 ? 'down' : 'stable',
        severity: metrics.performance.cpu > 70 ? 'high' : metrics.performance.cpu > 55 ? 'medium' : 'low'
      },
      {
        type: 'prediction',
        title: 'Job Failure Risk',
        description: 'Predicted failures in next 24h',
        value: Math.max(1, Math.round((metrics.jobs.failed / metrics.jobs.total) * 100 + (metrics.resources.queueLength / 10) + (metrics.performance.memory / 10))),
        severity: metrics.jobs.failed > 5 ? 'high' : metrics.jobs.failed > 2 ? 'medium' : 'low'
      },
      {
        type: 'optimization',
        title: 'Resource Utilization',
        description: 'CPU and memory usage',
        value: Math.round((metrics.performance.cpu + metrics.performance.memory) / 2),
        trend: metrics.performance.memory > 70 ? 'up' : 'stable',
        severity: metrics.performance.memory > 75 ? 'high' : metrics.performance.memory > 60 ? 'medium' : 'low'
      }
    ];

    res.json({
      insights,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to retrieve insights' });
  }
});

// Get 24-hour problem history
router.get('/problems/history', async (req: Request, res: Response) => {
  try {
    const cache = getCache();
    
    // Generate simulated 24-hour problem history
    const now = new Date();
    const problems = [];
    
    // Generate random problems over the last 24 hours
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const problemCount = Math.floor(Math.random() * 5);
      
      if (problemCount > 0) {
        problems.push({
          timestamp: hour.toISOString(),
          count: problemCount,
          severity: problemCount > 3 ? 'high' : problemCount > 1 ? 'medium' : 'low',
          types: [
            'Database Connection',
            'Memory Usage',
            'Job Queue',
            'Disk I/O',
            'Network Latency'
          ].slice(0, problemCount)
        });
      }
    }
    
    // Sort by timestamp
    problems.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Cache for 5 minutes
    await cache.set('problems:history', problems, 300);

    res.json({
      problems,
      summary: {
        total: problems.reduce((sum, p) => sum + p.count, 0),
        highSeverity: problems.filter(p => p.severity === 'high').length,
        mediumSeverity: problems.filter(p => p.severity === 'medium').length,
        lowSeverity: problems.filter(p => p.severity === 'low').length,
        timeRange: '24 hours'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get problem history error:', error);
    res.status(500).json({ error: 'Failed to retrieve problem history' });
  }
});

export { router as metricsRoutes };
