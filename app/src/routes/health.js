// ============================================================================
// Health Routes - Kubernetes Probes & Health Checks
// ============================================================================
// /health  - Liveness probe  (is the app alive?)
// /ready   - Readiness probe (is the app ready to serve traffic?)
// ============================================================================

const express = require('express');
const router = express.Router();

const startTime = Date.now();

// ============================================================================
// GET /health - Liveness Probe
// ============================================================================
// Kubernetes uses this to determine if the container is alive.
// If this fails, K8s will restart the container.
// ============================================================================
router.get('/health', (_req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime)}s`,
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        },
    });
});

// ============================================================================
// GET /ready - Readiness Probe
// ============================================================================
// Kubernetes uses this to determine if the container is ready to
// receive traffic. If this fails, K8s removes the pod from the
// service load balancer.
// ============================================================================
router.get('/ready', (_req, res) => {
    // Check if the application has been running for at least 2 seconds
    // (simulates dependency readiness check)
    const isReady = (Date.now() - startTime) > 2000;

    if (isReady) {
        res.json({
            status: 'ready',
            timestamp: new Date().toISOString(),
            checks: {
                server: 'up',
                memory: process.memoryUsage().heapUsed < 500 * 1024 * 1024 ? 'ok' : 'warning',
            },
        });
    } else {
        res.status(503).json({
            status: 'not ready',
            timestamp: new Date().toISOString(),
            message: 'Application is still initializing',
        });
    }
});

module.exports = router;
