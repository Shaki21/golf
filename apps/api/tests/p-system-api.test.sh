#!/bin/bash

# P-System API Testing Script - Bash Version
# Tests all P-System endpoints after migration deployment

API_BASE="http://localhost:4000/api/v1"

echo "=========================================="
echo "P-System API Testing (Bash)"
echo "=========================================="
echo ""

# Step 1: Login
echo "1. Logging in as player@demo.com..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"player@demo.com","password":"player123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('accessToken', ''))" 2>/dev/null)
PLAYER_ID=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('user', {}).get('id', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful!"
echo "   Player ID: $PLAYER_ID"
echo "   Token: ${TOKEN:0:50}..."
echo ""

# Step 2: List existing tasks
echo "2. Listing existing technique tasks..."
curl -s -X GET "$API_BASE/technique-plan/tasks?limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool | head -30
echo ""

# Step 3: Create a new P-System task
echo "3. Creating a new P-System task (P3.0)..."
TASK_RESPONSE=$(curl -s -X POST "$API_BASE/technique-plan/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"playerId\": \"$PLAYER_ID\",
    \"title\": \"Master P3.0 Top of Backswing\",
    \"description\": \"Develop proper shoulder rotation and club position at top of backswing\",
    \"pLevel\": \"P3.0\",
    \"repetitions\": 50,
    \"priorityOrder\": 1,
    \"technicalArea\": \"swing\",
    \"priority\": \"high\"
  }")

echo "$TASK_RESPONSE" | python3 -m json.tool | head -40

TASK_ID=$(echo "$TASK_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('id', ''))" 2>/dev/null)
echo ""
echo "✅ Task created with ID: $TASK_ID"
echo ""

# Step 4: Get tasks by P-level
echo "4. Getting tasks filtered by P-level (P3.0)..."
curl -s -X GET "$API_BASE/technique-plan/tasks/by-p-level?playerId=$PLAYER_ID&pLevel=P3.0" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool | head -50
echo ""

# Step 5: Update task priority
if [ ! -z "$TASK_ID" ]; then
  echo "5. Updating task priority order (drag-and-drop simulation)..."
  curl -s -X PATCH "$API_BASE/technique-plan/tasks/$TASK_ID/priority" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"priorityOrder": 5}' \
    | python3 -m json.tool | head -30
  echo ""
fi

# Step 6: Get task with full details
if [ ! -z "$TASK_ID" ]; then
  echo "6. Getting task with full details..."
  curl -s -X GET "$API_BASE/technique-plan/tasks/$TASK_ID/full" \
    -H "Authorization: Bearer $TOKEN" \
    | python3 -m json.tool | head -60
  echo ""
fi

echo "=========================================="
echo "✅ P-System API Testing Complete!"
echo "=========================================="
