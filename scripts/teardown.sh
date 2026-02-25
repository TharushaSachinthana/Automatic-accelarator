#!/bin/bash
# ============================================================================
# Teardown Script - DevOps Pipeline Accelerator
# ============================================================================
# Cleans up all resources created by the project.
# Usage: ./scripts/teardown.sh
# ============================================================================

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${RED}"
echo "============================================================"
echo "  🗑️  DevOps Pipeline Accelerator - Teardown"
echo "============================================================"
echo -e "${NC}"

echo -e "${YELLOW}⚠️  This will remove all project resources!${NC}"
read -p "Are you sure? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${CYAN}Cancelled.${NC}"
    exit 0
fi

# ============================================================================
# Stop Docker Compose
# ============================================================================

echo -e "${CYAN}🐳 Stopping Docker Compose...${NC}"
docker-compose down -v 2>/dev/null || echo "  (not running)"
echo ""

# ============================================================================
# Delete ArgoCD Application
# ============================================================================

echo -e "${CYAN}🔄 Removing ArgoCD application...${NC}"
kubectl delete -f argocd/application.yaml 2>/dev/null || echo "  (not found)"
echo ""

# ============================================================================
# Delete Kubernetes Resources
# ============================================================================

echo -e "${CYAN}☸️  Removing Kubernetes resources...${NC}"
kubectl delete -k k8s/overlays/dev/ --ignore-not-found 2>/dev/null || echo "  (not found)"
kubectl delete -k k8s/overlays/prod/ --ignore-not-found 2>/dev/null || echo "  (not found)"
echo ""

# ============================================================================
# Remove Monitoring Stack
# ============================================================================

echo -e "${CYAN}📊 Removing monitoring stack...${NC}"
helm uninstall grafana -n monitoring 2>/dev/null || echo "  grafana (not found)"
helm uninstall prometheus -n monitoring 2>/dev/null || echo "  prometheus (not found)"
echo ""

# ============================================================================
# Remove ArgoCD
# ============================================================================

echo -e "${CYAN}🔄 Removing ArgoCD...${NC}"
kubectl delete -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml 2>/dev/null || echo "  (not found)"
echo ""

# ============================================================================
# Delete Namespaces
# ============================================================================

echo -e "${CYAN}📁 Removing namespaces...${NC}"
kubectl delete namespace task-manager --ignore-not-found 2>/dev/null || true
kubectl delete namespace monitoring --ignore-not-found 2>/dev/null || true
kubectl delete namespace argocd --ignore-not-found 2>/dev/null || true
echo ""

# ============================================================================
# Stop Minikube
# ============================================================================

echo -e "${CYAN}☸️  Stopping Minikube...${NC}"
minikube delete --profile=devops-accelerator 2>/dev/null || echo "  (not running)"
echo ""

# ============================================================================
# Clean Node Modules
# ============================================================================

echo -e "${CYAN}📦 Cleaning node_modules...${NC}"
rm -rf app/node_modules app/coverage app/dist 2>/dev/null || true
echo ""

# ============================================================================
# Done
# ============================================================================

echo -e "${GREEN}"
echo "============================================================"
echo "  ✅ Teardown Complete!"
echo "============================================================"
echo -e "${NC}"
echo ""
echo "All resources have been removed."
echo "Run 'make setup' to start fresh."
echo ""
