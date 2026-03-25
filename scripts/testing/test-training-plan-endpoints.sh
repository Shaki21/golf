#!/bin/bash

# Training Plan API Endpoints Test Script
# Tests all 4 newly implemented endpoints

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000/api/v1}"
AUTH_TOKEN="${AUTH_TOKEN:-}"
PLAN_ID="${PLAN_ID:-}"

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}Training Plan API Endpoints Test${NC}"
echo -e "${YELLOW}======================================${NC}"
echo ""

# Check if API is running
echo -e "${YELLOW}Checking API health...${NC}"
if curl -s -f "${API_BASE_URL%/api/v1}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API is running${NC}"
else
    echo -e "${RED}✗ API is not running. Start with: npm run dev${NC}"
    exit 1
fi

# Check required variables
if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}✗ AUTH_TOKEN not set. Export it first:${NC}"
    echo "  export AUTH_TOKEN='your-jwt-token'"
    exit 1
fi

if [ -z "$PLAN_ID" ]; then
    echo -e "${YELLOW}⚠ PLAN_ID not set. Will use placeholder.${NC}"
    echo "  To test with real plan: export PLAN_ID='uuid'"
    PLAN_ID="00000000-0000-0000-0000-000000000000"
fi

echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  API_BASE_URL: $API_BASE_URL"
echo "  PLAN_ID: $PLAN_ID"
echo ""

# Test 1: GET /:planId/full
echo -e "${YELLOW}Test 1: GET /:planId/full${NC}"
echo "  Endpoint: GET $API_BASE_URL/training-plan/$PLAN_ID/full"
echo ""

response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    "$API_BASE_URL/training-plan/$PLAN_ID/full")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "  HTTP Status: $http_code"

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}  ✓ Success${NC}"
    echo "$body" | jq -r '.data | "  Plan: \(.annualPlan.planName // "N/A")\n  Daily Assignments: \(.dailyAssignments | length)\n  Periodizations: \(.periodizations | length)\n  Tournaments: \(.tournaments | length)"' 2>/dev/null || echo "  Response: $body"
elif [ "$http_code" -eq 404 ]; then
    echo -e "${YELLOW}  ⚠ Plan not found (expected if using placeholder ID)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
elif [ "$http_code" -eq 403 ]; then
    echo -e "${RED}  ✗ Access denied${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
else
    echo -e "${RED}  ✗ Failed${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
fi

echo ""

# Test 1b: GET /:planId/full with query params
echo -e "${YELLOW}Test 1b: GET /:planId/full?includeSessionDetails=true${NC}"
echo "  Endpoint: GET $API_BASE_URL/training-plan/$PLAN_ID/full?includeSessionDetails=true"
echo ""

response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    "$API_BASE_URL/training-plan/$PLAN_ID/full?includeSessionDetails=true&includeExercises=false")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "  HTTP Status: $http_code"

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}  ✓ Success (with session details)${NC}"
elif [ "$http_code" -eq 404 ]; then
    echo -e "${YELLOW}  ⚠ Plan not found${NC}"
else
    echo -e "${RED}  ✗ Failed${NC}"
fi

echo ""

# Test 2: PUT /:planId/accept
echo -e "${YELLOW}Test 2: PUT /:planId/accept${NC}"
echo "  Endpoint: PUT $API_BASE_URL/training-plan/$PLAN_ID/accept"
echo ""

response=$(curl -s -w "\n%{http_code}" \
    -X PUT \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    "$API_BASE_URL/training-plan/$PLAN_ID/accept")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "  HTTP Status: $http_code"

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}  ✓ Plan accepted and activated${NC}"
    echo "$body" | jq -r '.data | "  Plan ID: \(.planId)\n  Status: \(.status)\n  Activated At: \(.activatedAt)"' 2>/dev/null || echo "  Response: $body"
elif [ "$http_code" -eq 400 ]; then
    echo -e "${YELLOW}  ⚠ Cannot accept (plan not in draft status)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
elif [ "$http_code" -eq 404 ]; then
    echo -e "${YELLOW}  ⚠ Plan not found${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
elif [ "$http_code" -eq 403 ]; then
    echo -e "${RED}  ✗ Access denied${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
else
    echo -e "${RED}  ✗ Failed${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
fi

echo ""

# Test 3: POST /:planId/modification-request
echo -e "${YELLOW}Test 3: POST /:planId/modification-request${NC}"
echo "  Endpoint: POST $API_BASE_URL/training-plan/$PLAN_ID/modification-request"
echo ""

payload='{
  "concerns": [
    "Too many sessions per week",
    "Tournament dates conflict with work schedule"
  ],
  "notes": "I have an important work trip during week 15-16",
  "urgency": "high"
}'

response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$API_BASE_URL/training-plan/$PLAN_ID/modification-request")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "  HTTP Status: $http_code"

if [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}  ✓ Modification request created${NC}"
    echo "$body" | jq -r '.data | "  Request ID: \(.requestId)\n  Status: \(.status)\n  Created At: \(.createdAt)"' 2>/dev/null || echo "  Response: $body"
elif [ "$http_code" -eq 404 ]; then
    echo -e "${YELLOW}  ⚠ Plan not found${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
elif [ "$http_code" -eq 400 ]; then
    echo -e "${RED}  ✗ Validation error${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
else
    echo -e "${RED}  ✗ Failed${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
fi

echo ""

# Test 4: PUT /:planId/reject
echo -e "${YELLOW}Test 4: PUT /:planId/reject${NC}"
echo "  Endpoint: PUT $API_BASE_URL/training-plan/$PLAN_ID/reject"
echo ""

payload='{
  "reason": "This plan does not align with my training goals and schedule constraints",
  "willCreateNewIntake": true
}'

response=$(curl -s -w "\n%{http_code}" \
    -X PUT \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$API_BASE_URL/training-plan/$PLAN_ID/reject")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "  HTTP Status: $http_code"

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}  ✓ Plan rejected${NC}"
    echo "$body" | jq -r '.data | "  Plan ID: \(.planId)\n  Status: \(.status)\n  Rejected At: \(.rejectedAt)"' 2>/dev/null || echo "  Response: $body"
elif [ "$http_code" -eq 404 ]; then
    echo -e "${YELLOW}  ⚠ Plan not found${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
elif [ "$http_code" -eq 400 ]; then
    echo -e "${RED}  ✗ Validation error${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
else
    echo -e "${RED}  ✗ Failed${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "  $body"
fi

echo ""

# Summary
echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}Test Summary${NC}"
echo -e "${YELLOW}======================================${NC}"
echo ""
echo "All 4 endpoints have been tested."
echo ""
echo -e "${YELLOW}Notes:${NC}"
echo "  - 404 errors are expected if using placeholder PLAN_ID"
echo "  - 400 errors on accept/reject are expected if plan is not in correct status"
echo "  - To test with real data:"
echo "    1. Create a player and intake form"
echo "    2. Generate a training plan"
echo "    3. Export the plan ID: export PLAN_ID='uuid'"
echo "    4. Run this script again"
echo ""
echo -e "${GREEN}Testing complete!${NC}"
