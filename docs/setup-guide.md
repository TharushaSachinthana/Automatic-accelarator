# 📖 Setup Guide

Complete step-by-step guide to set up the DevOps Pipeline Accelerator from scratch.

---

## Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Git | 2.30+ | [git-scm.com](https://git-scm.com/downloads) |
| Docker Desktop | 20.10+ | [docker.com](https://docs.docker.com/get-docker/) |
| kubectl | 1.25+ | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| Minikube | 1.30+ | [minikube.sigs.k8s.io](https://minikube.sigs.k8s.io/docs/start/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| Helm | 3.0+ | [helm.sh](https://helm.sh/docs/intro/install/) |

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 4 GB | 8 GB |
| Disk | 10 GB | 20 GB |
| CPU | 2 cores | 4 cores |

---

## Phase 0: Environment Setup

### Step 0.1: Verify System Requirements

```bash
# Check RAM (Linux/Mac)
free -h

# Check disk space
df -h

# Windows (PowerShell)
Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property capacity -Sum
Get-PSDrive C
```

### Step 0.2: Install Git

```bash
# Verify installation
git --version

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

### Step 0.3: Install Docker Desktop

```bash
# Verify installation
docker --version
docker-compose --version

# Test Docker
docker run hello-world
```

### Step 0.4: Install kubectl

```bash
# Verify installation
kubectl version --client
```

### Step 0.5: Install Minikube

```bash
# Verify installation
minikube version

# Start with recommended resources
minikube start --cpus=2 --memory=4096 --driver=docker
```

### Step 0.6: Install Helm

```bash
# Verify installation
helm version
```

---

## Phase 1: Running the Application Locally

### Option A: Without Docker

```bash
# Install dependencies
cd app
npm install

# Run the application
npm run dev

# Application runs at http://localhost:3000
```

### Option B: With Docker Compose

```bash
# Build and run
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop
docker-compose down
```

### Test the API

```bash
# Health check
curl http://localhost:3000/health

# List tasks
curl http://localhost:3000/api/tasks

# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "priority": "high"}'

# Prometheus metrics
curl http://localhost:3000/metrics
```

---

## Phase 2: Running Tests

```bash
cd app

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

---

## Phase 3: Kubernetes Deployment

### Step 3.1: Start Minikube

```bash
# Start cluster
make k8s-setup

# Or manually:
minikube start --profile=devops-accelerator --cpus=2 --memory=4096 --driver=docker
```

### Step 3.2: Build Docker Image (in Minikube)

```bash
# Use Minikube's Docker daemon
eval $(minikube docker-env --profile=devops-accelerator)

# Build the image
docker build -t task-manager-api:latest ./app
```

### Step 3.3: Deploy to Dev

```bash
# Create namespace
kubectl create namespace task-manager

# Deploy with Kustomize (dev overlay)
kubectl apply -k k8s/overlays/dev/

# Check status
kubectl get pods -n task-manager
kubectl get svc -n task-manager
```

### Step 3.4: Access the Application

```bash
# Port forward
kubectl port-forward svc/dev-task-manager-service -n task-manager 3000:80

# Or use Minikube service
minikube service dev-task-manager-service -n task-manager --profile=devops-accelerator
```

---

## Phase 4: ArgoCD Setup

### Step 4.1: Install ArgoCD

```bash
make argocd-install

# Or manually:
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Step 4.2: Access ArgoCD UI

```bash
# Get admin password
make argocd-password

# Port forward
make argocd-ui

# Access at https://localhost:8080
# Username: admin
# Password: (from above command)
```

### Step 4.3: Create Application

```bash
make argocd-app
```

---

## Phase 5: Monitoring Setup

### Step 5.1: Deploy Prometheus + Grafana

```bash
make monitoring
```

### Step 5.2: Access Grafana

```bash
# Get admin password
make grafana-password

# Port forward
make grafana-ui

# Access at http://localhost:3001
# Username: admin
# Password: admin (or from above command)
```

### Step 5.3: Access Prometheus

```bash
make prometheus-ui
# Access at http://localhost:9090
```

---

## Phase 6: CI/CD Pipeline Setup

### GitHub Secrets Required

Go to your GitHub repo → Settings → Secrets and variables → Actions:

| Secret Name | Description |
|-------------|-------------|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Your Docker Hub access token |
| `SONAR_TOKEN` | SonarQube authentication token |
| `SONAR_HOST_URL` | SonarQube server URL |

### Trigger CI Pipeline

```bash
# Make a change and push
git checkout -b feature/test-pipeline
echo "// test change" >> app/src/app.js
git add .
git commit -m "ci: test pipeline trigger"
git push origin feature/test-pipeline

# Create a PR on GitHub to trigger the full pipeline
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Minikube won't start | Ensure Docker Desktop is running |
| Pods not starting | Check `kubectl describe pod <pod-name> -n task-manager` |
| Image pull errors | Build image in Minikube's Docker context |
| Port already in use | Change port in docker-compose.yml or use a different port-forward |

### Useful Commands

```bash
# View pod logs
kubectl logs -f <pod-name> -n task-manager

# Describe a pod (debug startup issues)
kubectl describe pod <pod-name> -n task-manager

# Exec into a pod
kubectl exec -it <pod-name> -n task-manager -- /bin/sh

# View all resources
kubectl get all -n task-manager

# View events
kubectl get events -n task-manager --sort-by=.metadata.creationTimestamp
```

---

## Cleanup

```bash
# Full teardown
./scripts/teardown.sh

# Or use Makefile
make clean
```
