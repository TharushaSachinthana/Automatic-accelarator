#!/bin/bash
# ============================================================================
# Setup Script - DevOps Pipeline Accelerator
# ============================================================================
# Automates the initial setup of the development environment.
# Usage: ./scripts/setup.sh
# ============================================================================

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "============================================================"
echo "  🚀 DevOps Pipeline Accelerator - Setup"
echo "============================================================"
echo -e "${NC}"

# ============================================================================
# Check Prerequisites
# ============================================================================

check_command() {
    if command -v "$1" &> /dev/null; then
        local version=$($1 --version 2>/dev/null | head -1)
        echo -e "${GREEN}✅ $1 found:${NC} $version"
        return 0
    else
        echo -e "${RED}❌ $1 not found. Please install $1.${NC}"
        return 1
    fi
}

echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
echo "------------------------------------------------------------"

MISSING=0

check_command "git" || ((MISSING++))
check_command "docker" || ((MISSING++))
check_command "kubectl" || ((MISSING++))
check_command "minikube" || ((MISSING++))
check_command "node" || ((MISSING++))
check_command "npm" || ((MISSING++))
check_command "helm" || ((MISSING++))

echo "------------------------------------------------------------"

if [ $MISSING -gt 0 ]; then
    echo -e "${RED}❌ $MISSING prerequisites missing. Please install them before continuing.${NC}"
    echo ""
    echo "Installation guides:"
    echo "  Git:      https://git-scm.com/downloads"
    echo "  Docker:   https://docs.docker.com/get-docker/"
    echo "  kubectl:  https://kubernetes.io/docs/tasks/tools/"
    echo "  Minikube: https://minikube.sigs.k8s.io/docs/start/"
    echo "  Node.js:  https://nodejs.org/"
    echo "  Helm:     https://helm.sh/docs/intro/install/"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met!${NC}"
echo ""

# ============================================================================
# Install Node.js Dependencies
# ============================================================================

echo -e "${CYAN}📦 Installing Node.js dependencies...${NC}"
cd app && npm install
cd ..
echo -e "${GREEN}✅ Dependencies installed!${NC}"
echo ""

# ============================================================================
# Check System Resources
# ============================================================================

echo -e "${YELLOW}🖥️  System Resources:${NC}"
echo "------------------------------------------------------------"

# Check available memory (Linux/Mac)
if command -v free &> /dev/null; then
    TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
    echo -e "  RAM: ${TOTAL_MEM}MB"
    if [ "$TOTAL_MEM" -lt 4096 ]; then
        echo -e "${YELLOW}  ⚠️  Recommended: At least 4GB RAM for Minikube${NC}"
    else
        echo -e "${GREEN}  ✅ Sufficient RAM${NC}"
    fi
elif command -v sysctl &> /dev/null; then
    TOTAL_MEM=$(sysctl -n hw.memsize 2>/dev/null | awk '{print $0/1024/1024}')
    echo -e "  RAM: ${TOTAL_MEM}MB"
fi

# Check available disk space
DISK_AVAIL=$(df -h . | awk 'NR==2{print $4}')
echo -e "  Available Disk: $DISK_AVAIL"
echo "------------------------------------------------------------"
echo ""

# ============================================================================
# Docker Check
# ============================================================================

echo -e "${CYAN}🐳 Checking Docker...${NC}"
if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker daemon is running${NC}"
else
    echo -e "${RED}❌ Docker daemon is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo ""

# ============================================================================
# Done
# ============================================================================

echo -e "${GREEN}"
echo "============================================================"
echo "  ✅ Setup Complete!"
echo "============================================================"
echo -e "${NC}"
echo ""
echo "Next steps:"
echo "  1. Run locally:     make dev"
echo "  2. Run tests:       make test"
echo "  3. Start Minikube:  make k8s-setup"
echo "  4. Deploy:          make k8s-deploy"
echo "  5. Monitoring:      make monitoring"
echo ""
