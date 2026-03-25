#!/bin/bash

# AK Golf Academy - Automated Endpoint Testing Script
# Tests all critical API endpoints quickly

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_BASE="http://localhost:3000/api/v1"
FRONTEND_BASE="http://localhost:3001"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  AK Golf Academy - Endpoint Testing${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Counters
TOTAL=0
PASSED=0
FAILED=0

test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4

    TOTAL=$((TOTAL + 1))

    printf "%-50s" "$description"

    if [ "$method" = "GET" ]; then
        status=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")
    else
        # Send empty JSON body with proper Content-Type for POST/PUT
        status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d '{}' "$endpoint")
    fi

    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} ($status)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (got $status, expected $expected_status)"
        FAILED=$((FAILED + 1))
    fi
}

echo -e "${YELLOW}=== Infrastructure Health Checks ===${NC}"
test_endpoint "GET" "http://localhost:3000/health" "200" "Backend Health"
test_endpoint "GET" "$FRONTEND_BASE" "200" "Frontend Availability"
echo ""

echo -e "${YELLOW}=== Authentication Endpoints ===${NC}"
test_endpoint "POST" "$API_BASE/auth/login" "400" "Login (without credentials)"
test_endpoint "POST" "$API_BASE/auth/logout" "401" "Logout (without token)"
echo ""

echo -e "${YELLOW}=== Protected Routes (without auth) ===${NC}"
test_endpoint "GET" "$API_BASE/players" "401" "GET /players"
test_endpoint "GET" "$API_BASE/tests" "401" "GET /tests"
test_endpoint "GET" "$API_BASE/goals" "401" "GET /goals"
test_endpoint "GET" "$API_BASE/notes" "401" "GET /notes"
test_endpoint "GET" "$API_BASE/achievements" "401" "GET /achievements"
test_endpoint "GET" "$API_BASE/archive" "401" "GET /archive"
echo ""

echo -e "${YELLOW}=== Training Plan Endpoints (Task 2) ===${NC}"
# These should return 401 without token
test_endpoint "POST" "$API_BASE/training-plan/generate" "401" "Generate Plan"
# GET with fake ID should return 401 (auth required)
test_endpoint "GET" "$API_BASE/training-plan/00000000-0000-0000-0000-000000000000/full" "401" "Get Full Plan"
test_endpoint "PUT" "$API_BASE/training-plan/00000000-0000-0000-0000-000000000000/accept" "401" "Accept Plan"
test_endpoint "POST" "$API_BASE/training-plan/00000000-0000-0000-0000-000000000000/modification-request" "401" "Request Modifications"
test_endpoint "PUT" "$API_BASE/training-plan/00000000-0000-0000-0000-000000000000/reject" "401" "Reject Plan"
echo ""

echo -e "${YELLOW}=== Frontend Routes ===${NC}"
test_endpoint "GET" "$FRONTEND_BASE/login" "200" "Login Page"
test_endpoint "GET" "$FRONTEND_BASE/" "200" "Dashboard (redirects to login)"
test_endpoint "GET" "$FRONTEND_BASE/profil" "200" "Profile Page"
test_endpoint "GET" "$FRONTEND_BASE/maalsetninger" "200" "Goals Page"
test_endpoint "GET" "$FRONTEND_BASE/aarsplan" "200" "Annual Plan Page"
test_endpoint "GET" "$FRONTEND_BASE/testprotokoll" "200" "Test Protocol Page"
test_endpoint "GET" "$FRONTEND_BASE/testresultater" "200" "Test Results Page"
test_endpoint "GET" "$FRONTEND_BASE/treningsprotokoll" "200" "Training Protocol"
test_endpoint "GET" "$FRONTEND_BASE/treningsstatistikk" "200" "Training Stats"
test_endpoint "GET" "$FRONTEND_BASE/oevelser" "200" "Exercises Page"
test_endpoint "GET" "$FRONTEND_BASE/notater" "200" "Notes Page"
test_endpoint "GET" "$FRONTEND_BASE/arkiv" "200" "Archive Page"
test_endpoint "GET" "$FRONTEND_BASE/kalender" "200" "Calendar Page"
test_endpoint "GET" "$FRONTEND_BASE/progress" "200" "Progress Page"
test_endpoint "GET" "$FRONTEND_BASE/achievements" "200" "Achievements Page"
echo ""

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Test Results Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "Total Tests:  ${TOTAL}"
echo -e "${GREEN}Passed:       ${PASSED}${NC}"
echo -e "${RED}Failed:       ${FAILED}${NC}"
echo ""

PASS_RATE=$((PASSED * 100 / TOTAL))
echo -e "Pass Rate:    ${PASS_RATE}%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! System is healthy.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please investigate.${NC}"
    exit 1
fi
