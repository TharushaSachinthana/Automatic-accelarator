// ============================================================================
// Prometheus Metrics Middleware
// ============================================================================
// Exposes application metrics for Prometheus scraping at /metrics endpoint.
// Collects: HTTP request duration, request count, active connections.
// ============================================================================

const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({
    register,
    prefix: 'taskmanager_',
});

// ============================================================================
// Custom Metrics
// ============================================================================

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
    name: 'taskmanager_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
    registers: [register],
});

// HTTP request counter
const httpRequestTotal = new client.Counter({
    name: 'taskmanager_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

// Active connections gauge
const activeConnections = new client.Gauge({
    name: 'taskmanager_active_connections',
    help: 'Number of active connections',
    registers: [register],
});

// Task operations counter
const taskOperations = new client.Counter({
    name: 'taskmanager_task_operations_total',
    help: 'Total number of task operations',
    labelNames: ['operation'],
    registers: [register],
});

// ============================================================================
// Middleware Function
// ============================================================================

const metricsMiddleware = (req, res, next) => {
    // Skip metrics endpoint itself
    if (req.path === '/metrics') {
        return next();
    }

    activeConnections.inc();
    const end = httpRequestDuration.startTimer();

    // Override res.end to capture metrics after response
    const originalEnd = res.end;
    res.end = function (...args) {
        const route = req.route ? req.route.path : req.path;
        const labels = {
            method: req.method,
            route: route,
            status_code: res.statusCode,
        };

        end(labels);
        httpRequestTotal.inc(labels);
        activeConnections.dec();

        // Track task operations
        if (req.path.startsWith('/api/tasks')) {
            const operationMap = {
                GET: 'read',
                POST: 'create',
                PUT: 'update',
                DELETE: 'delete',
            };
            const operation = operationMap[req.method];
            if (operation) {
                taskOperations.inc({ operation });
            }
        }

        originalEnd.apply(this, args);
    };

    next();
};

// ============================================================================
// Metrics Endpoint Handler
// ============================================================================

const metricsEndpoint = async (_req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.end(metrics);
    } catch (err) {
        res.status(500).end(err.message);
    }
};

module.exports = {
    metricsMiddleware,
    metricsEndpoint,
    register,
    httpRequestDuration,
    httpRequestTotal,
    activeConnections,
    taskOperations,
};
