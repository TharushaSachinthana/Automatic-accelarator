// ============================================================================
// Task Routes - CRUD Operations for Task Manager
// ============================================================================

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// In-memory store (replace with database in production)
let tasks = [
    {
        id: '1',
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        priority: 'high',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'Configure Kubernetes manifests',
        description: 'Create deployment, service, and configmap YAML files',
        priority: 'high',
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        title: 'Set up monitoring stack',
        description: 'Deploy Prometheus and Grafana for observability',
        priority: 'medium',
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

// ============================================================================
// GET /api/tasks - List all tasks
// ============================================================================
router.get('/', (_req, res) => {
    res.json({
        success: true,
        count: tasks.length,
        data: tasks,
    });
});

// ============================================================================
// GET /api/tasks/:id - Get a single task
// ============================================================================
router.get('/:id', (req, res) => {
    const task = tasks.find((t) => t.id === req.params.id);

    if (!task) {
        return res.status(404).json({
            success: false,
            error: 'Task not found',
            message: `No task with id: ${req.params.id}`,
        });
    }

    res.json({
        success: true,
        data: task,
    });
});

// ============================================================================
// POST /api/tasks - Create a new task
// ============================================================================
router.post('/', (req, res) => {
    const { title, description, priority, status } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: 'Title is required and must be a non-empty string',
        });
    }

    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const validStatuses = ['todo', 'in-progress', 'done', 'cancelled'];

    if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: `Priority must be one of: ${validPriorities.join(', ')}`,
        });
    }

    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: `Status must be one of: ${validStatuses.join(', ')}`,
        });
    }

    const newTask = {
        id: uuidv4(),
        title: title.trim(),
        description: description ? description.trim() : '',
        priority: priority || 'medium',
        status: status || 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);

    res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: newTask,
    });
});

// ============================================================================
// PUT /api/tasks/:id - Update a task
// ============================================================================
router.put('/:id', (req, res) => {
    const taskIndex = tasks.findIndex((t) => t.id === req.params.id);

    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Task not found',
            message: `No task with id: ${req.params.id}`,
        });
    }

    const { title, description, priority, status } = req.body;

    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const validStatuses = ['todo', 'in-progress', 'done', 'cancelled'];

    if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: `Priority must be one of: ${validPriorities.join(', ')}`,
        });
    }

    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: `Status must be one of: ${validStatuses.join(', ')}`,
        });
    }

    const updatedTask = {
        ...tasks[taskIndex],
        title: title ? title.trim() : tasks[taskIndex].title,
        description: description !== undefined ? description.trim() : tasks[taskIndex].description,
        priority: priority || tasks[taskIndex].priority,
        status: status || tasks[taskIndex].status,
        updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;

    res.json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask,
    });
});

// ============================================================================
// DELETE /api/tasks/:id - Delete a task
// ============================================================================
router.delete('/:id', (req, res) => {
    const taskIndex = tasks.findIndex((t) => t.id === req.params.id);

    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Task not found',
            message: `No task with id: ${req.params.id}`,
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.json({
        success: true,
        message: 'Task deleted successfully',
        data: deletedTask,
    });
});

// Export for testing
router._resetTasks = () => {
    tasks = [
        {
            id: '1',
            title: 'Set up CI/CD pipeline',
            description: 'Configure GitHub Actions for automated testing and deployment',
            priority: 'high',
            status: 'in-progress',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '2',
            title: 'Configure Kubernetes manifests',
            description: 'Create deployment, service, and configmap YAML files',
            priority: 'high',
            status: 'todo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '3',
            title: 'Set up monitoring stack',
            description: 'Deploy Prometheus and Grafana for observability',
            priority: 'medium',
            status: 'todo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];
};

module.exports = router;
