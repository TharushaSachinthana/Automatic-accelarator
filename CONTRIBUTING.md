# Contributing to DevOps Pipeline Accelerator

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report any unacceptable behavior.

## 🚀 Getting Started

### Prerequisites

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/Automatic-accelarator.git
   cd Automatic-accelarator
   ```
3. Install dependencies:
   ```bash
   make setup
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Branching Strategy

We follow a structured branching strategy:

```
main          ← Production-ready code
  └── develop ← Integration branch
       └── feature/*   ← New features
       └── fix/*       ← Bug fixes
       └── docs/*      ← Documentation
       └── chore/*     ← Maintenance tasks
```

### Steps

1. **Create an issue** describing the change you want to make
2. **Create a feature branch** from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/issue-number-description
   ```
3. **Make your changes** following code style guidelines
4. **Write/update tests** for your changes
5. **Run tests locally**:
   ```bash
   make test
   make lint
   ```
6. **Commit your changes** using conventional commits
7. **Push your branch** and create a Pull Request

## 📝 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |
| `perf` | Performance improvements |
| `build` | Build system changes |

### Examples

```bash
feat(api): add task filtering by priority
fix(auth): resolve token expiration issue
docs(readme): update deployment instructions
ci(actions): add Trivy security scanning step
chore(deps): update Express to v4.18.2
test(tasks): add integration tests for CRUD operations
```

## 🔀 Pull Request Process

1. **Title**: Use the same format as commit messages
2. **Description**: Fill out the PR template completely
3. **Checks**: Ensure all CI checks pass
4. **Review**: Request review from maintainers
5. **Merge**: PRs are merged via squash merge

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Tests have been added/updated
- [ ] Documentation has been updated
- [ ] All CI checks pass
- [ ] PR title follows conventional commit format

## 🎨 Code Style

### JavaScript

- Use **ESLint** with the project's configuration
- Use **async/await** over callbacks
- Use **const/let** (never `var`)
- Write **descriptive** variable and function names
- Add **JSDoc** comments for public functions

### Docker

- Use **multi-stage builds**
- Run as **non-root** user
- Use **specific** base image tags (not `latest`)
- Order layers for optimal **caching**

### Kubernetes

- Use **Kustomize** for environment overlays
- Follow **least privilege** principle
- Set **resource limits** and requests
- Include **health checks** (liveness/readiness)

### YAML

- Use **2-space indentation**
- Add **comments** for non-obvious configurations
- Use **descriptive names** for resources

---

## ❓ Questions?

Feel free to open an issue for any questions or concerns. We're happy to help!
