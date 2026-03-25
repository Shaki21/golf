#!/bin/bash
# Demo Smoke Test Script
# Usage: ./scripts/demo-smoke.sh [OPTIONS]
#
# Options:
#   --url URL       Base API URL (default: https://iupgolf-demo-api.up.railway.app)
#   --local         Use local development URL (http://localhost:3000)
#   --verbose       Show detailed output
#   --help          Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
BASE_URL="https://iupgolf-demo-api.up.railway.app"
VERBOSE=false
PASSED=0
FAILED=0
TESTS=()

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --url)
            BASE_URL="$2"
            shift 2
            ;;
        --local)
            BASE_URL="http://localhost:3000"
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Demo Smoke Test Script"
            echo ""
            echo "Usage: ./scripts/demo-smoke.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --url URL       Base API URL (default: https://iupgolf-demo-api.up.railway.app)"
            echo "  --local         Use local development URL (http://localhost:3000)"
            echo "  --verbose       Show detailed output"
            echo "  --help          Show this help message"
            echo ""
            echo "Demo Credentials:"
            echo "  Player: player@demo.com / player123"
            echo "  Coach:  coach@demo.com / coach123"
            echo "  Admin:  admin@demo.com / admin123"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Helper functions
log_test() {
    local name="$1"
    local status="$2"
    local details="$3"

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $name"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $name"
        if [ -n "$details" ]; then
            echo -e "  ${RED}$details${NC}"
        fi
        ((FAILED++))
    fi
    TESTS+=("$name:$status")
}

log_info() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${YELLOW}→${NC} $1"
    fi
}

# Test functions
test_health() {
    log_info "Testing health endpoint..."
    local response
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ]; then
        log_test "Health check (/health)" "PASS"
    else
        log_test "Health check (/health)" "FAIL" "HTTP $http_code"
    fi
}

test_api_health() {
    log_info "Testing API health endpoint..."
    local response
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/v1/health" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        log_test "API health check (/api/v1/health)" "PASS"
    else
        log_test "API health check (/api/v1/health)" "FAIL" "HTTP $http_code"
    fi
}

test_auth_login() {
    log_info "Testing player login..."
    local response
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"player@demo.com","password":"player123"}' \
        "$BASE_URL/api/v1/auth/login" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ]; then
        # Extract token for subsequent tests
        TOKEN=$(echo "$body" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$TOKEN" ]; then
            log_test "Player login (/api/v1/auth/login)" "PASS"
            export TOKEN
        else
            log_test "Player login (/api/v1/auth/login)" "FAIL" "No token in response"
        fi
    else
        log_test "Player login (/api/v1/auth/login)" "FAIL" "HTTP $http_code"
    fi
}

test_player_profile() {
    if [ -z "$TOKEN" ]; then
        log_test "Player profile (/api/v1/players/me)" "FAIL" "No auth token"
        return
    fi

    log_info "Testing player profile..."
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL/api/v1/players/me" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        log_test "Player profile (/api/v1/players/me)" "PASS"
    else
        log_test "Player profile (/api/v1/players/me)" "FAIL" "HTTP $http_code"
    fi
}

test_dashboard() {
    if [ -z "$TOKEN" ]; then
        log_test "Dashboard (/api/v1/dashboard)" "FAIL" "No auth token"
        return
    fi

    log_info "Testing dashboard..."
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL/api/v1/dashboard" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        log_test "Dashboard (/api/v1/dashboard)" "PASS"
    else
        log_test "Dashboard (/api/v1/dashboard)" "FAIL" "HTTP $http_code"
    fi
}

test_goals() {
    if [ -z "$TOKEN" ]; then
        log_test "Goals (/api/v1/goals)" "FAIL" "No auth token"
        return
    fi

    log_info "Testing goals..."
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL/api/v1/goals" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        log_test "Goals (/api/v1/goals)" "PASS"
    else
        log_test "Goals (/api/v1/goals)" "FAIL" "HTTP $http_code"
    fi
}

test_badges() {
    if [ -z "$TOKEN" ]; then
        log_test "Badges (/api/v1/badges)" "FAIL" "No auth token"
        return
    fi

    log_info "Testing badges..."
    local response
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL/api/v1/badges" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        log_test "Badges (/api/v1/badges)" "PASS"
    else
        log_test "Badges (/api/v1/badges)" "FAIL" "HTTP $http_code"
    fi
}

# Main execution
echo ""
echo "================================"
echo "   IUP Golf Demo Smoke Test    "
echo "================================"
echo ""
echo "Target: $BASE_URL"
echo ""

# Run tests
test_health
test_api_health
test_auth_login
test_player_profile
test_dashboard
test_goals
test_badges

# Summary
echo ""
echo "================================"
echo "          Summary              "
echo "================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi
