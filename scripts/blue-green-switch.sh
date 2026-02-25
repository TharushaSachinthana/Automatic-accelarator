#!/bin/bash
# ============================================================================
# Blue-Green Switch Script
# ============================================================================
# Switches traffic between blue and green deployments.
# Usage: ./scripts/blue-green-switch.sh [blue|green]
# ============================================================================

set -euo pipefail

NAMESPACE="task-manager"
SERVICE="task-manager-service"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

TARGET_VERSION="${1:-}"

if [ -z "$TARGET_VERSION" ]; then
    echo -e "${RED}Usage: $0 [blue|green]${NC}"
    echo ""
    echo "  blue  - Switch traffic to blue (v1) deployment"
    echo "  green - Switch traffic to green (v2) deployment"
    exit 1
fi

if [[ "$TARGET_VERSION" != "blue" && "$TARGET_VERSION" != "green" ]]; then
    echo -e "${RED}Error: Invalid version. Use 'blue' or 'green'.${NC}"
    exit 1
fi

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  🔄 Blue-Green Deployment Switch${NC}"
echo -e "${CYAN}============================================================${NC}"

# Check current active version
CURRENT=$(kubectl get svc "$SERVICE" -n "$NAMESPACE" -o jsonpath='{.spec.selector.version}' 2>/dev/null || echo "unknown")
echo -e "${YELLOW}Current active version: ${CURRENT}${NC}"
echo -e "${CYAN}Switching to: ${TARGET_VERSION}${NC}"

# Verify target deployment is healthy
echo -e "\n${YELLOW}⏳ Checking ${TARGET_VERSION} deployment health...${NC}"
TARGET_DEPLOY="task-manager"
if [ "$TARGET_VERSION" == "green" ]; then
    TARGET_DEPLOY="task-manager-green"
fi

READY=$(kubectl get deployment "$TARGET_DEPLOY" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
DESIRED=$(kubectl get deployment "$TARGET_DEPLOY" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")

if [ "$READY" != "$DESIRED" ] || [ "$READY" == "0" ]; then
    echo -e "${RED}❌ Target deployment is not healthy! (Ready: ${READY}/${DESIRED})${NC}"
    echo -e "${RED}   Aborting switch.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Target deployment is healthy (${READY}/${DESIRED} pods ready)${NC}"

# Switch traffic
echo -e "\n${YELLOW}🔄 Switching Service selector to version=${TARGET_VERSION}...${NC}"

if [ "$TARGET_VERSION" == "green" ]; then
    kubectl patch svc "$SERVICE" -n "$NAMESPACE" \
        -p '{"spec":{"selector":{"version":"green"}}}'
else
    kubectl patch svc "$SERVICE" -n "$NAMESPACE" \
        -p '{"spec":{"selector":{"version":"v1"}}}'
fi

echo -e "${GREEN}✅ Traffic switched to ${TARGET_VERSION}!${NC}"

# Verify the switch
echo -e "\n${YELLOW}📊 Verification:${NC}"
echo -e "Service selector:"
kubectl get svc "$SERVICE" -n "$NAMESPACE" -o jsonpath='{.spec.selector}' | python3 -m json.tool 2>/dev/null || kubectl get svc "$SERVICE" -n "$NAMESPACE" -o jsonpath='{.spec.selector}'
echo ""

echo -e "\n${GREEN}============================================================${NC}"
echo -e "${GREEN}  ✅ Blue-Green switch complete!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "Active: ${GREEN}${TARGET_VERSION}${NC}"
echo -e "Standby: ${YELLOW}$([ "$TARGET_VERSION" == "blue" ] && echo "green" || echo "blue")${NC}"
echo ""
echo "To rollback, run: $0 $([ "$TARGET_VERSION" == "blue" ] && echo "green" || echo "blue")"
