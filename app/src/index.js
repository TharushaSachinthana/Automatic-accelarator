// ============================================================================
// Task Manager API - Application Entry Point
// ============================================================================
// Starts the Express server on the configured port.
// Handles graceful shutdown for container orchestration (Kubernetes).
// ============================================================================

const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Task Manager API running on http://${HOST}:${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`📊 Metrics available at http://${HOST}:${PORT}/metrics`);
    // eslint-disable-next-line no-console
    console.log(`🏥 Health check at http://${HOST}:${PORT}/health`);
    // eslint-disable-next-line no-console
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ============================================================================
// Graceful Shutdown
// ============================================================================
// Essential for Kubernetes — allows in-flight requests to complete before
// the pod is terminated. Kubernetes sends SIGTERM, waits for
// terminationGracePeriodSeconds, then sends SIGKILL.
// ============================================================================

const gracefulShutdown = (signal) => {
    // eslint-disable-next-line no-console
    console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);

    server.close(() => {
        // eslint-disable-next-line no-console
        console.log('✅ HTTP server closed. Process exiting.');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        // eslint-disable-next-line no-console
        console.error('❌ Forced shutdown — could not close connections in time');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
