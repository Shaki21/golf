#!/bin/bash

# Live Streak Tracking Test Script
# Tests the streak endpoints with a real API server

API_URL="http://localhost:4000/api/v1"
echo "🧪 Testing Live Streak Tracking System"
echo "API: $API_URL"
echo "======================================"

# Step 1: Login to get auth token
echo ""
echo "📝 Step 1: Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Response:"
  echo "$LOGIN_RESPONSE" | jq '.'
  echo ""
  echo "💡 Tip: Make sure you have a test user or use valid credentials"
  exit 1
fi

echo "✅ Authenticated successfully"
echo "Token: ${TOKEN:0:20}..."

# Step 2: Get current streak
echo ""
echo "📝 Step 2: Getting current streak..."
STREAK_RESPONSE=$(curl -s -X GET "$API_URL/goals/streak" \
  -H "Authorization: Bearer $TOKEN")

echo "$STREAK_RESPONSE" | jq '.'

# Step 3: Create a test goal
echo ""
echo "📝 Step 3: Creating a test goal..."
GOAL_RESPONSE=$(curl -s -X POST "$API_URL/goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Live Test Goal - Lower Handicap",
    "description": "Testing streak tracking",
    "goalType": "score",
    "timeframe": "short",
    "targetValue": 10,
    "currentValue": 15,
    "startValue": 20,
    "unit": "HCP",
    "startDate": "'$(date +%Y-%m-%d)'",
    "targetDate": "'$(date -v+90d +%Y-%m-%d 2>/dev/null || date -d '+90 days' +%Y-%m-%d)'"
  }')

GOAL_ID=$(echo "$GOAL_RESPONSE" | jq -r '.data.id // empty')

if [ -z "$GOAL_ID" ]; then
  echo "❌ Failed to create goal. Response:"
  echo "$GOAL_RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Goal created: $GOAL_ID"
echo "$GOAL_RESPONSE" | jq '.data | {id, title, currentValue, targetValue, progressPercent}'

# Step 4: Update goal progress (triggers streak update)
echo ""
echo "📝 Step 4: Updating goal progress (should trigger streak update)..."
PROGRESS_RESPONSE=$(curl -s -X PUT "$API_URL/goals/$GOAL_ID/progress" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentValue": 14}')

echo "✅ Progress updated"
echo "$PROGRESS_RESPONSE" | jq '.data | {id, currentValue, progressPercent}'

# Step 5: Get updated streak
echo ""
echo "📝 Step 5: Getting updated streak..."
STREAK_RESPONSE_2=$(curl -s -X GET "$API_URL/goals/streak" \
  -H "Authorization: Bearer $TOKEN")

echo "$STREAK_RESPONSE_2" | jq '.data'

# Step 6: Get badges
echo ""
echo "📝 Step 6: Checking unlocked badges..."
BADGES_RESPONSE=$(curl -s -X GET "$API_URL/goals/badges" \
  -H "Authorization: Bearer $TOKEN")

echo "$BADGES_RESPONSE" | jq '.data | {unlockedCount, totalBadges, recentUnlocks}'

# Step 7: Get goal stats
echo ""
echo "📝 Step 7: Getting goal statistics..."
STATS_RESPONSE=$(curl -s -X GET "$API_URL/goals/stats" \
  -H "Authorization: Bearer $TOKEN")

echo "$STATS_RESPONSE" | jq '.data | {totalActive, totalCompleted, averageProgress, completedThisMonth}'

echo ""
echo "======================================"
echo "✅ Live streak tracking test completed!"
echo "======================================"
