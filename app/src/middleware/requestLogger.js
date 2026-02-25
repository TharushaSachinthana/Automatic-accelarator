// ============================================================================
// Request Logger Middleware
// ============================================================================
// Structured logging for all incoming HTTP requests.
// Logs method, URL, status code, and response time.
// ============================================================================

const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Override res.end to log after response is sent
    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - start;
        const logEntry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent') || 'unknown',
            ip: req.ip || req.connection.remoteAddress,
        };

        // Log based on status code severity
        if (res.statusCode >= 500) {
            // eslint-disable-next-line no-console
            console.error('❌ [ERROR]', JSON.stringify(logEntry));
        } else if (res.statusCode >= 400) {
            // eslint-disable-next-line no-console
            console.warn('⚠️  [WARN]', JSON.stringify(logEntry));
        } else if (process.env.NODE_ENV !== 'test') {
            // eslint-disable-next-line no-console
            console.log('✅ [INFO]', JSON.stringify(logEntry));
        }

        originalEnd.apply(this, args);
    };

    next();
};

module.exports = requestLogger;
