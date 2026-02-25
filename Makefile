# ============================================================================
# DevOps Pipeline Accelerator - Makefile
# ============================================================================
# Usage: make <target>
# Run 'make help' for available commands
# ============================================================================

.PHONY: help setup dev test lint build push k8s-setup k8s-deploy monitoring clean urls

# Variables
APP_NAME := task-manager-api
DOCKER_USERNAME ?= your-dockerhub-username
IMAGE_NAME := $(DOCKER_USERNAME)/$(APP_NAME)
IMAGE_TAG ?= latest
MINIKUBE_PROFILE := devops-accelerator
K8S_NAMESPACE := task-manager
MONITORING_NAMESPACE := monitoring

# Colors for terminal output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
CYAN   := \033[0;36m
RESET  := \033[0m

# ============================================================================
# HELP
# ============================================================================

help: ## Show this help message
	@echo ""
	@echo "$(CYAN)DevOps Pipeline Accelerator$(RESET) - Available Commands:"
	@echo "============================================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ============================================================================
# SETUP & DEVELOPMENT
# ============================================================================

setup: ## Install all dependencies
	@echo "$(CYAN)📦 Installing dependencies...$(RESET)"
	cd app && npm install
	@echo "$(GREEN)✅ Setup complete!$(RESET)"

dev: ## Run locally with Docker Compose
	@echo "$(CYAN)🚀 Starting development environment...$(RESET)"
	docker-compose up --build
	@echo "$(GREEN)✅ Development environment running!$(RESET)"

dev-down: ## Stop Docker Compose
	@echo "$(YELLOW)🛑 Stopping development environment...$(RESET)"
	docker-compose down -v

dev-local: ## Run app locally without Docker
	@echo "$(CYAN)🚀 Starting local development server...$(RESET)"
	cd app && npm run dev

# ============================================================================
# TESTING & QUALITY
# ============================================================================

test: ## Run unit tests
	@echo "$(CYAN)🧪 Running tests...$(RESET)"
	cd app && npm test
	@echo "$(GREEN)✅ Tests complete!$(RESET)"

test-coverage: ## Run tests with coverage report
	@echo "$(CYAN)📊 Running tests with coverage...$(RESET)"
	cd app && npm run test:coverage

lint: ## Run ESLint
	@echo "$(CYAN)🔍 Running linter...$(RESET)"
	cd app && npm run lint

lint-fix: ## Run ESLint with auto-fix
	@echo "$(CYAN)🔧 Running linter with auto-fix...$(RESET)"
	cd app && npm run lint:fix

# ============================================================================
# DOCKER
# ============================================================================

build: ## Build Docker image
	@echo "$(CYAN)🐳 Building Docker image...$(RESET)"
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) ./app
	@echo "$(GREEN)✅ Image built: $(IMAGE_NAME):$(IMAGE_TAG)$(RESET)"

push: ## Push Docker image to Docker Hub
	@echo "$(CYAN)📤 Pushing image to Docker Hub...$(RESET)"
	docker push $(IMAGE_NAME):$(IMAGE_TAG)
	@echo "$(GREEN)✅ Image pushed!$(RESET)"

scan: ## Scan Docker image with Trivy
	@echo "$(CYAN)🔒 Scanning image with Trivy...$(RESET)"
	trivy image $(IMAGE_NAME):$(IMAGE_TAG)

# ============================================================================
# KUBERNETES
# ============================================================================

k8s-setup: ## Start Minikube and install prerequisites
	@echo "$(CYAN)☸️  Setting up Kubernetes cluster...$(RESET)"
	minikube start --profile=$(MINIKUBE_PROFILE) --cpus=2 --memory=4096 --driver=docker
	minikube addons enable ingress --profile=$(MINIKUBE_PROFILE)
	minikube addons enable metrics-server --profile=$(MINIKUBE_PROFILE)
	kubectl create namespace $(K8S_NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -
	kubectl create namespace $(MONITORING_NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -
	@echo "$(GREEN)✅ Kubernetes cluster ready!$(RESET)"

k8s-deploy-dev: ## Deploy to Kubernetes (dev overlay)
	@echo "$(CYAN)🚀 Deploying to dev environment...$(RESET)"
	kubectl apply -k k8s/overlays/dev/
	@echo "$(GREEN)✅ Deployed to dev!$(RESET)"

k8s-deploy-prod: ## Deploy to Kubernetes (prod overlay)
	@echo "$(CYAN)🚀 Deploying to prod environment...$(RESET)"
	kubectl apply -k k8s/overlays/prod/
	@echo "$(GREEN)✅ Deployed to prod!$(RESET)"

k8s-deploy: k8s-deploy-dev ## Deploy to Kubernetes (default: dev)

k8s-status: ## Show Kubernetes deployment status
	@echo "$(CYAN)📊 Kubernetes Status:$(RESET)"
	@echo "\n$(YELLOW)--- Pods ---$(RESET)"
	kubectl get pods -n $(K8S_NAMESPACE)
	@echo "\n$(YELLOW)--- Services ---$(RESET)"
	kubectl get svc -n $(K8S_NAMESPACE)
	@echo "\n$(YELLOW)--- Deployments ---$(RESET)"
	kubectl get deployments -n $(K8S_NAMESPACE)

k8s-logs: ## Show application logs
	kubectl logs -f -l app=task-manager -n $(K8S_NAMESPACE)

k8s-delete: ## Delete Kubernetes resources
	@echo "$(RED)🗑️  Deleting Kubernetes resources...$(RESET)"
	kubectl delete -k k8s/overlays/dev/ --ignore-not-found
	@echo "$(GREEN)✅ Resources deleted!$(RESET)"

# ============================================================================
# ARGOCD
# ============================================================================

argocd-install: ## Install ArgoCD on Minikube
	@echo "$(CYAN)🔄 Installing ArgoCD...$(RESET)"
	kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
	kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
	@echo "$(YELLOW)⏳ Waiting for ArgoCD pods to be ready...$(RESET)"
	kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
	@echo "$(GREEN)✅ ArgoCD installed!$(RESET)"

argocd-password: ## Get ArgoCD admin password
	@echo "$(CYAN)🔑 ArgoCD Admin Password:$(RESET)"
	kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
	@echo ""

argocd-ui: ## Port-forward ArgoCD UI
	@echo "$(CYAN)🌐 ArgoCD UI available at: https://localhost:8080$(RESET)"
	kubectl port-forward svc/argocd-server -n argocd 8080:443

argocd-app: ## Create ArgoCD application
	@echo "$(CYAN)📋 Creating ArgoCD application...$(RESET)"
	kubectl apply -f argocd/application.yaml
	@echo "$(GREEN)✅ ArgoCD application created!$(RESET)"

# ============================================================================
# MONITORING
# ============================================================================

monitoring: ## Deploy Prometheus and Grafana
	@echo "$(CYAN)📊 Deploying monitoring stack...$(RESET)"
	helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
	helm repo add grafana https://grafana.github.io/helm-charts
	helm repo update
	helm upgrade --install prometheus prometheus-community/prometheus \
		-n $(MONITORING_NAMESPACE) \
		-f monitoring/prometheus/values.yaml
	helm upgrade --install grafana grafana/grafana \
		-n $(MONITORING_NAMESPACE) \
		-f monitoring/grafana/values.yaml
	@echo "$(GREEN)✅ Monitoring stack deployed!$(RESET)"

grafana-password: ## Get Grafana admin password
	@echo "$(CYAN)🔑 Grafana Admin Password:$(RESET)"
	kubectl get secret grafana -n $(MONITORING_NAMESPACE) -o jsonpath="{.data.admin-password}" | base64 -d
	@echo ""

grafana-ui: ## Port-forward Grafana UI
	@echo "$(CYAN)🌐 Grafana UI available at: http://localhost:3001$(RESET)"
	kubectl port-forward svc/grafana -n $(MONITORING_NAMESPACE) 3001:80

prometheus-ui: ## Port-forward Prometheus UI
	@echo "$(CYAN)🌐 Prometheus UI available at: http://localhost:9090$(RESET)"
	kubectl port-forward svc/prometheus-server -n $(MONITORING_NAMESPACE) 9090:80

# ============================================================================
# UTILITIES
# ============================================================================

urls: ## Print all service URLs
	@echo ""
	@echo "$(CYAN)🌐 Service URLs:$(RESET)"
	@echo "============================================================"
	@echo "$(GREEN)App (local):$(RESET)        http://localhost:3000"
	@echo "$(GREEN)App Health:$(RESET)         http://localhost:3000/health"
	@echo "$(GREEN)App Metrics:$(RESET)        http://localhost:3000/metrics"
	@echo "$(GREEN)ArgoCD UI:$(RESET)          https://localhost:8080 (after port-forward)"
	@echo "$(GREEN)Grafana UI:$(RESET)         http://localhost:3001 (after port-forward)"
	@echo "$(GREEN)Prometheus UI:$(RESET)      http://localhost:9090 (after port-forward)"
	@echo ""

clean: ## Clean up everything
	@echo "$(RED)🧹 Cleaning up...$(RESET)"
	docker-compose down -v 2>/dev/null || true
	minikube delete --profile=$(MINIKUBE_PROFILE) 2>/dev/null || true
	cd app && rm -rf node_modules coverage dist 2>/dev/null || true
	@echo "$(GREEN)✅ Cleanup complete!$(RESET)"

version: ## Show current version
	@echo "$(CYAN)Version:$(RESET) $$(cat app/package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[",]//g' | tr -d ' ')"
