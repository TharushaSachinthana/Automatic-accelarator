// ============================================================================
// Health Endpoint Tests
// ============================================================================

const request = require('supertest');
const app = require('../src/app');

describe('Health Endpoints', () => {
    // ==========================================================================
    // GET /health
    // ==========================================================================
    describe('GET /health', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/health');

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('healthy');
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body).toHaveProperty('uptime');
            expect(res.body).toHaveProperty('memory');
        });

        it('should include memory information', async () => {
            const res = await request(app).get('/health');

            expect(res.body.memory).toHaveProperty('rss');
            expect(res.body.memory).toHaveProperty('heapUsed');
            expect(res.body.memory).toHaveProperty('heapTotal');
        });

        it('should include version information', async () => {
            const res = await request(app).get('/health');

            expect(res.body).toHaveProperty('version');
            expect(res.body).toHaveProperty('environment');
        });
    });

    // ==========================================================================
    // GET /ready
    // ==========================================================================
    describe('GET /ready', () => {
        it('should return ready status', async () => {
            const res = await request(app).get('/ready');

            // May return 200 or 503 depending on uptime
            expect([200, 503]).toContain(res.statusCode);
            expect(res.body).toHaveProperty('status');
            expect(res.body).toHaveProperty('timestamp');
        });
    });

    // ==========================================================================
    // GET / (Root)
    // ==========================================================================
    describe('GET /', () => {
        it('should return API info', async () => {
            const res = await request(app).get('/');

            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('Task Manager API');
            expect(res.body).toHaveProperty('version');
            expect(res.body).toHaveProperty('endpoints');
        });

        it('should list available endpoints', async () => {
            const res = await request(app).get('/');

            expect(res.body.endpoints).toHaveProperty('tasks');
            expect(res.body.endpoints).toHaveProperty('health');
            expect(res.body.endpoints).toHaveProperty('ready');
            expect(res.body.endpoints).toHaveProperty('metrics');
        });
    });

    // ==========================================================================
    // GET /metrics
    // ==========================================================================
    describe('GET /metrics', () => {
        it('should return Prometheus metrics', async () => {
            const res = await request(app).get('/metrics');

            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toContain('text/plain');
        });
    });

    // ==========================================================================
    // 404 Handler
    // ==========================================================================
    describe('404 Handler', () => {
        it('should return 404 for unknown routes', async () => {
            const res = await request(app).get('/unknown-route');

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Not Found');
        });
    });
});
