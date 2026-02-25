// ============================================================================
// Global Error Handler Middleware
// ============================================================================
// Catches all unhandled errors and sends a structured JSON response.
// In production, stack traces are hidden from the client.
// ============================================================================

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
    // eslint-disable-next-line no-console
    console.error('❌ Unhandled Error:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
    });

    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: 'Server Error',
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
