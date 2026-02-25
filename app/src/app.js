// ============================================================================
// Task Manager API - Express Application Setup
// ============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const taskRoutes = require('./routes/tasks');
const healthRoutes = require('./routes/health');
const { metricsMiddleware, metricsEndpoint } = require('./middleware/metrics');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ============================================================================
// Security Middleware
// ============================================================================
app.use(helmet());
app.use(cors());

// ============================================================================
// Request Parsing
// ============================================================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// Logging & Metrics
// ============================================================================
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}
app.use(requestLogger);
app.use(metricsMiddleware);

// ============================================================================
// Routes
// ============================================================================

// Health & Readiness endpoints (for Kubernetes probes)
app.use('/', healthRoutes);

// Prometheus metrics endpoint
app.get('/metrics', metricsEndpoint);

// API routes
app.use('/api/tasks', taskRoutes);

// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: 'Task Manager API',
        version: '1.0.0',
        description: 'DevOps Pipeline Accelerator - Task Manager REST API',
        endpoints: {
            tasks: '/api/tasks',
            health: '/health',
            ready: '/ready',
            metrics: '/metrics',
        },
    });
});

// ============================================================================
// 404 Handler
// ============================================================================
app.use((_req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist',
        statusCode: 404,
    });
});

// ============================================================================
// Error Handler
// ============================================================================
app.use(errorHandler);

module.exports = app;
