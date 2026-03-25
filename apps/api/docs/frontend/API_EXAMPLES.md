# Club Speed Calibration - API Testing Examples

Complete collection of curl commands and Postman examples for testing the calibration API.

---

## 🔐 Authentication

First, get an access token:

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@example.com",
    "password": "your-password"
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "refreshToken": "...",
#     "expiresIn": 900
#   }
# }
```

**Save the `accessToken` for use in subsequent requests.**

---

## 📝 Example 1: Submit Calibration (Basic - 5 clubs)

```bash
curl -X POST http://localhost:3000/api/v1/calibration \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "calibrationDate": "2025-12-15T10:00:00Z",
    "clubs": [
      {
        "clubType": "driver",
        "shot1Speed": 116,
        "shot2Speed": 115,
        "shot3Speed": 114
      },
      {
        "clubType": "3wood",
        "shot1Speed": 107,
        "shot2Speed": 106,
        "shot3Speed": 105
      },
      {
        "clubType": "5iron",
        "shot1Speed": 90,
        "shot2Speed": 89,
        "shot3Speed": 91
      },
      {
        "clubType": "7iron",
        "shot1Speed": 87,
        "shot2Speed": 86,
        "shot3Speed": 85
      },
      {
        "clubType": "pw",
        "shot1Speed": 79,
        "shot2Speed": 78,
        "shot3Speed": 80
      }
    ],
    "notes": "Initial calibration - indoor facility"
  }'
```

### Expected Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "abc12345-...",
    "playerId": "550e8400-...",
    "driverSpeed": 115,
    "clubs": [
      {
        "clubType": "driver",
        "shots": [
          { "shotNumber": 1, "clubSpeed": 116 },
          { "shotNumber": 2, "clubSpeed": 115 },
          { "shotNumber": 3, "clubSpeed": 114 }
        ],
        "averageSpeed": 115.0,
        "percentOfDriver": 100.0
      },
      {
        "clubType": "3wood",
        "shots": [...],
        "averageSpeed": 106.0,
        "percentOfDriver": 92.2
      },
      {
        "clubType": "5iron",
        "averageSpeed": 90.0,
        "percentOfDriver": 78.3
      },
      {
        "clubType": "7iron",
        "averageSpeed": 86.0,
        "percentOfDriver": 74.8
      },
      {
        "clubType": "pw",
        "averageSpeed": 79.0,
        "percentOfDriver": 68.7
      }
    ],
    "speedProfile": {
      "driverSpeed": 115,
      "speedDecay": "normal",
      "gapping": "good",
      "recommendations": [
        "Excellent driver speed - maintain and optimize efficiency",
        "Speed stays high through the bag - good speed maintenance"
      ]
    },
    "recommendations": [...]
  }
}
```

---

## 📝 Example 2: Full Bag Calibration (16 clubs)

```bash
curl -X POST http://localhost:3000/api/v1/calibration \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "550e8400-e29b-41d4-a716-446655440001",
    "calibrationDate": "2025-12-15T14:00:00Z",
    "clubs": [
      {"clubType": "driver", "shot1Speed": 116, "shot2Speed": 115, "shot3Speed": 114},
      {"clubType": "3wood", "shot1Speed": 107, "shot2Speed": 106, "shot3Speed": 105},
      {"clubType": "5wood", "shot1Speed": 102, "shot2Speed": 101, "shot3Speed": 103},
      {"clubType": "3hybrid", "shot1Speed": 99, "shot2Speed": 100, "shot3Speed": 98},
      {"clubType": "4iron", "shot1Speed": 92, "shot2Speed": 93, "shot3Speed": 91},
      {"clubType": "5iron", "shot1Speed": 90, "shot2Speed": 89, "shot3Speed": 91},
      {"clubType": "6iron", "shot1Speed": 87, "shot2Speed": 88, "shot3Speed": 86},
      {"clubType": "7iron", "shot1Speed": 85, "shot2Speed": 84, "shot3Speed": 86},
      {"clubType": "8iron", "shot1Speed": 83, "shot2Speed": 82, "shot3Speed": 84},
      {"clubType": "9iron", "shot1Speed": 81, "shot2Speed": 80, "shot3Speed": 82},
      {"clubType": "pw", "shot1Speed": 79, "shot2Speed": 78, "shot3Speed": 80},
      {"clubType": "gw", "shot1Speed": 76, "shot2Speed": 77, "shot3Speed": 75},
      {"clubType": "sw", "shot1Speed": 74, "shot2Speed": 73, "shot3Speed": 75},
      {"clubType": "lw", "shot1Speed": 72, "shot2Speed": 71, "shot3Speed": 73}
    ],
    "notes": "Complete bag calibration - outdoor range, calm conditions"
  }'
```

---

## 📝 Example 3: Get Player's Calibration

```bash
curl -X GET http://localhost:3000/api/v1/calibration/player/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Expected Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "abc12345-...",
    "playerId": "550e8400-...",
    "calibrationDate": "2025-12-15T10:00:00.000Z",
    "driverSpeed": 115,
    "clubs": [...],
    "speedProfile": {...},
    "notes": "Initial calibration - indoor facility"
  }
}
```

### Expected Response (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "CALIBRATION_NOT_FOUND",
    "message": "No calibration found for this player"
  }
}
```

---

## 📝 Example 4: Update Calibration

```bash
curl -X PUT http://localhost:3000/api/v1/calibration/player/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "calibrationDate": "2025-12-16T10:00:00Z",
    "clubs": [
      {"clubType": "driver", "shot1Speed": 118, "shot2Speed": 117, "shot3Speed": 119},
      {"clubType": "7iron", "shot1Speed": 89, "shot2Speed": 88, "shot3Speed": 90}
    ],
    "notes": "Re-calibration after new driver fitting"
  }'
```

---

## 📝 Example 5: Delete Calibration

```bash
curl -X DELETE http://localhost:3000/api/v1/calibration/player/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Expected Response (200 OK)

```json
{
  "success": true,
  "message": "Calibration deleted successfully"
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Average Amateur (95 mph driver)

```bash
curl -X POST http://localhost:3000/api/v1/calibration \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "test-player-amateur",
    "calibrationDate": "2025-12-15T10:00:00Z",
    "clubs": [
      {"clubType": "driver", "shot1Speed": 96, "shot2Speed": 95, "shot3Speed": 94},
      {"clubType": "3wood", "shot1Speed": 88, "shot2Speed": 87, "shot3Speed": 89},
      {"clubType": "5iron", "shot1Speed": 75, "shot2Speed": 74, "shot3Speed": 76},
      {"clubType": "7iron", "shot1Speed": 71, "shot2Speed": 70, "shot3Speed": 72},
      {"clubType": "pw", "shot1Speed": 65, "shot2Speed": 64, "shot3Speed": 66}
    ]
  }'
```

**Expected Analysis:**
- Driver speed: 95 mph (average amateur)
- Speed decay: normal
- Recommendations will suggest speed training

### Scenario 2: Advanced Player (115 mph driver)

```bash
curl -X POST http://localhost:3000/api/v1/calibration \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "test-player-advanced",
    "calibrationDate": "2025-12-15T10:00:00Z",
    "clubs": [
      {"clubType": "driver", "shot1Speed": 116, "shot2Speed": 115, "shot3Speed": 114},
      {"clubType": "3wood", "shot1Speed": 107, "shot2Speed": 106, "shot3Speed": 105},
      {"clubType": "5iron", "shot1Speed": 90, "shot2Speed": 89, "shot3Speed": 91},
      {"clubType": "7iron", "shot1Speed": 87, "shot2Speed": 86, "shot3Speed": 85},
      {"clubType": "pw", "shot1Speed": 79, "shot2Speed": 78, "shot3Speed": 80}
    ]
  }'
```

**Expected Analysis:**
- Driver speed: 115 mph (advanced/tour-level)
- Speed decay: normal/shallow
- Excellent speed maintenance

### Scenario 3: Uneven Gapping

```bash
curl -X POST http://localhost:3000/api/v1/calibration \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "test-player-uneven",
    "calibrationDate": "2025-12-15T10:00:00Z",
    "clubs": [
      {"clubType": "driver", "shot1Speed": 110, "shot2Speed": 109, "shot3Speed": 111},
      {"clubType": "3wood", "shot1Speed": 101, "shot2Speed": 100, "shot3Speed": 102},
      {"clubType": "5iron", "shot1Speed": 75, "shot2Speed": 74, "shot3Speed": 76},
      {"clubType": "7iron", "shot1Speed": 83, "shot2Speed": 82, "shot3Speed": 84},
      {"clubType": "pw", "shot1Speed": 65, "shot2Speed": 64, "shot3Speed": 66}
    ]
  }'
```

**Expected Analysis:**
- Gapping: uneven
- Large gap between 3wood and 5iron
- 7iron faster than expected (strength)
- Recommendations will suggest addressing gaps

---

## ❌ Error Examples

### Error 1: Missing Driver

```bash
curl -X POST http://localhost:3000/api/v1/calibration \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "test-player",
    "calibrationDate": "2025-12-15T10:00:00Z",
    "clubs": [
      {"clubType": "7iron", "shot1Speed": 85, "shot2Speed": 84, "shot3Speed": 86}
    ]
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid calibration data",
    "details": {
      "errors": ["Driver speed is required"]
    }
  }
}
```

### Error 2: Invalid Speed Values

```bash
curl -X POST http://localhost:3000/api/v1/calibration \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "test-player",
    "calibrationDate": "2025-12-15T10:00:00Z",
    "clubs": [
      {"clubType": "driver", "shot1Speed": 200, "shot2Speed": 30, "shot3Speed": 115}
    ]
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid calibration data",
    "details": {
      "errors": [
        "Invalid speed for driver shot 1: 200 mph",
        "Invalid speed for driver shot 2: 30 mph"
      ]
    }
  }
}
```

### Error 3: Duplicate Calibration

```bash
# First submission succeeds
curl -X POST http://localhost:3000/api/v1/calibration ...

# Second submission fails
curl -X POST http://localhost:3000/api/v1/calibration ...
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "CALIBRATION_EXISTS",
    "message": "Calibration already exists for this player. Use PUT to update."
  }
}
```

---

## 📮 Postman Collection

Import this JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "Club Speed Calibration API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Submit Calibration",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"playerId\": \"{{playerId}}\",\n  \"calibrationDate\": \"2025-12-15T10:00:00Z\",\n  \"clubs\": [\n    {\"clubType\": \"driver\", \"shot1Speed\": 115, \"shot2Speed\": 114, \"shot3Speed\": 116}\n  ]\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}/calibration",
          "host": ["{{baseUrl}}"],
          "path": ["calibration"]
        }
      }
    },
    {
      "name": "Get Calibration",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/calibration/player/{{playerId}}",
          "host": ["{{baseUrl}}"],
          "path": ["calibration", "player", "{{playerId}}"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/v1"
    },
    {
      "key": "accessToken",
      "value": "your-token-here"
    },
    {
      "key": "playerId",
      "value": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

---

## 🚀 Quick Test Script

Save this as `test-calibration.sh`:

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:3000/api/v1"
EMAIL="coach@example.com"
PASSWORD="your-password"

# 1. Login
echo "Logging in..."
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | jq -r '.data.accessToken')

echo "Token: $TOKEN"

# 2. Submit calibration
echo -e "\nSubmitting calibration..."
curl -X POST $BASE_URL/calibration \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "calibrationDate": "2025-12-15T10:00:00Z",
    "clubs": [
      {"clubType": "driver", "shot1Speed": 115, "shot2Speed": 114, "shot3Speed": 116}
    ]
  }' | jq '.'

# 3. Get calibration
echo -e "\nGetting calibration..."
curl -X GET $BASE_URL/calibration/player/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

Make it executable and run:
```bash
chmod +x test-calibration.sh
./test-calibration.sh
```

---

**Ready to test! 🚀**

Visit Swagger UI for interactive testing: http://localhost:3000/docs
