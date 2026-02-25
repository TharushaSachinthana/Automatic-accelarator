// ============================================================================
// Task API Tests
// ============================================================================

const request = require('supertest');
const app = require('../src/app');
const taskRouter = require('../src/routes/tasks');

describe('Task API', () => {
    // Reset tasks before each test
    beforeEach(() => {
        taskRouter._resetTasks();
    });

    // ==========================================================================
    // GET /api/tasks
    // ==========================================================================
    describe('GET /api/tasks', () => {
        it('should return all tasks', async () => {
            const res = await request(app).get('/api/tasks');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBe(3);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should return tasks with correct structure', async () => {
            const res = await request(app).get('/api/tasks');
            const task = res.body.data[0];

            expect(task).toHaveProperty('id');
            expect(task).toHaveProperty('title');
            expect(task).toHaveProperty('description');
            expect(task).toHaveProperty('priority');
            expect(task).toHaveProperty('status');
            expect(task).toHaveProperty('createdAt');
            expect(task).toHaveProperty('updatedAt');
        });
    });

    // ==========================================================================
    // GET /api/tasks/:id
    // ==========================================================================
    describe('GET /api/tasks/:id', () => {
        it('should return a single task by ID', async () => {
            const res = await request(app).get('/api/tasks/1');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe('1');
            expect(res.body.data.title).toBe('Set up CI/CD pipeline');
        });

        it('should return 404 for non-existent task', async () => {
            const res = await request(app).get('/api/tasks/non-existent-id');

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Task not found');
        });
    });

    // ==========================================================================
    // POST /api/tasks
    // ==========================================================================
    describe('POST /api/tasks', () => {
        it('should create a new task', async () => {
            const newTask = {
                title: 'Write documentation',
                description: 'Create comprehensive project documentation',
                priority: 'medium',
            };

            const res = await request(app)
                .post('/api/tasks')
                .send(newTask);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Write documentation');
            expect(res.body.data.priority).toBe('medium');
            expect(res.body.data.status).toBe('todo');
            expect(res.body.data).toHaveProperty('id');
        });

        it('should create a task with default values', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .send({ title: 'Minimal task' });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.priority).toBe('medium');
            expect(res.body.data.status).toBe('todo');
            expect(res.body.data.description).toBe('');
        });

        it('should return 400 if title is missing', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .send({ description: 'No title' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Validation Error');
        });

        it('should return 400 if title is empty', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .send({ title: '   ' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid priority', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .send({ title: 'Test', priority: 'invalid' });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Validation Error');
        });

        it('should return 400 for invalid status', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .send({ title: 'Test', status: 'invalid' });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Validation Error');
        });
    });

    // ==========================================================================
    // PUT /api/tasks/:id
    // ==========================================================================
    describe('PUT /api/tasks/:id', () => {
        it('should update an existing task', async () => {
            const res = await request(app)
                .put('/api/tasks/1')
                .send({ title: 'Updated title', status: 'done' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Updated title');
            expect(res.body.data.status).toBe('done');
        });

        it('should return 404 for non-existent task', async () => {
            const res = await request(app)
                .put('/api/tasks/non-existent')
                .send({ title: 'Updated' });

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid priority on update', async () => {
            const res = await request(app)
                .put('/api/tasks/1')
                .send({ priority: 'invalid' });

            expect(res.statusCode).toBe(400);
        });

        it('should preserve existing values when partially updating', async () => {
            const res = await request(app)
                .put('/api/tasks/1')
                .send({ status: 'done' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.title).toBe('Set up CI/CD pipeline');
            expect(res.body.data.status).toBe('done');
        });
    });

    // ==========================================================================
    // DELETE /api/tasks/:id
    // ==========================================================================
    describe('DELETE /api/tasks/:id', () => {
        it('should delete an existing task', async () => {
            const res = await request(app).delete('/api/tasks/1');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe('1');

            // Verify it's actually deleted
            const getRes = await request(app).get('/api/tasks/1');
            expect(getRes.statusCode).toBe(404);
        });

        it('should return 404 for non-existent task', async () => {
            const res = await request(app).delete('/api/tasks/non-existent');

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should reduce task count after deletion', async () => {
            await request(app).delete('/api/tasks/1');
            const res = await request(app).get('/api/tasks');

            expect(res.body.count).toBe(2);
        });
    });
});
