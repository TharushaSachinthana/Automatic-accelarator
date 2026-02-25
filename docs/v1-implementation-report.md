# 📄 DevOps Pipeline Accelerator: v1.0 Implementation Report

## 🌟 Project Overview
This document captures the journey of building **Version 1.0** of the DevOps Pipeline Accelerator. It serves as both a technical record and a learning guide for understanding how production-grade CI/CD and Observability work in a real-world scenario.

---

## 🏗️ Version 1.0 Implementation
In this first phase, we successfully established a **Zero-Cost Production Stack** running entirely on a local machine (8GB RAM). 

### High-Level Architecture
1.  **Application**: A Node.js Express REST API with built-in health probes and Prometheus instrumentation.
2.  **CI/CD**: GitHub Actions for automated building, linting, testing, and security scanning.
3.  **Registry**: Docker Hub for storing immutable versioned images.
4.  **Orchestration**: Kubernetes via Minikube (Control plane for our containers).
5.  **Observability**: Prometheus (Time-series database) & Grafana (Visualization).

---

## 🚧 Challenges Faced & Key Learnings
Building a pipeline is rarely smooth. Here are the real-world problems we hit and how we solved them:

### 1. The GitHub Actions "403 Forbidden" Error
*   **The Problem**: The CI pipeline successfully built the image but failed when trying to update the Kubernetes manifests back in the repository. The GitHub Actions bot was denied permission to push.
*   **The Solution**: We updated the `ci.yml` workflow to include an explicit `permissions: contents: write` block and used an authenticated Git push URL with the `GITHUB_TOKEN`.
*   **Learning**: Security by default is tight. You must explicitly grant "Write" permissions to automation bots.

### 2. SonarCloud Integration
*   **The Problem**: Standard SonarQube configurations failed to connect to the cloud version.
*   **The Solution**: We switched from the generic `sonarqube-scan-action` to the official `sonarcloud-github-action` and configured the specific `organization` and `projectKey` from your SonarCloud dashboard.
*   **Learning**: Cloud-hosted tools often requires specific authentication flows compared to self-hosted versions.

### 3. Kubernetes Resource Pressure (The Memory Wall)
*   **The Problem**: On an 8GB RAM machine, running Minikube (2GB), Docker Desktop, Chrome, and the IDE created severe memory pressure. When we added ArgoCD *and* Monitoring, the system couldn't schedule the pods, causing `Connection Refused`.
*   **The Solution**: We made a strategic decision to **delete the ArgoCD namespace** to free up RAM for the Monitoring stack. We prioritized "Observability" for the v1.0 learning goal.
*   **Learning**: Infrastructure requires resources. In local dev, you must often balance which tools are active at one time.

### 4. Port-Forwarding "Silence"
*   **The Problem**: Port forwards seemed to be active but weren't responding in the browser.
*   **The Solution**: We cleaned up stuck `kubectl` processes and targeted the specific `Service` names instead of generic Pod names to ensure traffic reached the right destination.
*   **Learning**: Port-forwarding is a "tunnel." If the tunnel is clogged with old processes, no data gets through.

---

## 🔍 How Real Application Monitoring Happens
In this project, we implemented the **Pull Model** of monitoring:

1.  **Instrument Information**: Inside `app/src/middleware/metrics.js`, the app records every request's duration and status.
2.  **The Expose Step**: The app opens a special endpoint at `/metrics`. This is human-readable text showing current stats.
3.  **The Scrape Step**: Prometheus (the database) is configured to "scrape" (visit) our `/metrics` URL every 15-30 seconds.
4.  **Data Storage**: Prometheus saves these values in a time-series format (Value + Timestamp).
5.  **The Visualization Step**: Grafana connects to Prometheus, asks "Give me all request counts for the last hour," and draws the beautiful lines and gauges you see.

---

## 🚀 Daily Operations Guide (How to run this)

If you have just started your computer, follow these steps to bring the stack online:

### 1. Start Infrastructure
```powershell
# 1. Open Docker Desktop (Wait for green status)
# 2. Start Minikube
minikube start --profile=devops-accelerator --memory=2048 --cpus=2 --driver=docker
```

### 2. Build & Deploy (If not already running)
```powershell
# Set your shell to point to Minikube's Docker
& minikube -p devops-accelerator docker-env --shell powershell | Invoke-Expression

# Build image
docker build -t task-manager-api:latest ./app

# Deploy App
kubectl apply -k k8s/overlays/dev/
```

### 3. Open Access Tunnels (Crucial)
You need **three terminal windows** (or background processes) to keep the doors open:

*   **API**: `kubectl port-forward svc/dev-task-manager-service -n task-manager 3000:80`
*   **Grafana**: `kubectl port-forward svc/monitoring-grafana -n monitoring 3001:80`
*   **Prometheus**: `kubectl port-forward svc/monitoring-kube-prometheus-prometheus -n monitoring 9090:9090`

### 4. Verify Dashboard
1.  Visit **http://localhost:3001** (Grafana).
2.  Login with `admin` / `admin123`.
3.  Go to **Dashboards -> Kubernetes / Compute Resources / Namespace (Pods)**.
4.  Select `task-manager` in the dropdown.

---

## 📈 Roadmap to Version 2.0
- [ ] **Infrastructure Upgrade**: Move to a cloud provider (AWS/GCP/Azure) to resolve the memory issues.
- [ ] **Database Persistence**: Add a MongoDB or Postgres container to save tasks across restarts.
- [ ] **Alerting**: Configure Slack/Discord notifications when the API goes down.
- [ ] **Blue/Green Automation**: Automate the traffic switching script we built in Version 1.

---
*Created by Tharusha Sachinthana & Antigravity AI*
