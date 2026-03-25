# Club Speed Calibration - Frontend Integration Guide

Complete guide for integrating the Club Speed Calibration API into the frontend application.

---

## 📋 Overview

The Club Speed Calibration is a **one-time onboarding test** where players hit 3 balls with each club to establish baseline club speed percentages.

**When to use**: After player signup, before training plan generation.

---

## 🔗 API Endpoints

Base URL: `http://localhost:3000/api/v1`

All endpoints require authentication via JWT Bearer token.

---

### 1. Submit Club Speed Calibration

**POST** `/calibration`

Submit a new calibration for a player.

#### Request Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body
```json
{
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
  "notes": "Initial calibration - indoor testing facility"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "abc12345-e29b-41d4-a716-446655440001",
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
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
        "shots": [
          { "shotNumber": 1, "clubSpeed": 107 },
          { "shotNumber": 2, "clubSpeed": 106 },
          { "shotNumber": 3, "clubSpeed": 105 }
        ],
        "averageSpeed": 106.0,
        "percentOfDriver": 92.2
      },
      {
        "clubType": "5iron",
        "shots": [
          { "shotNumber": 1, "clubSpeed": 90 },
          { "shotNumber": 2, "clubSpeed": 89 },
          { "shotNumber": 3, "clubSpeed": 91 }
        ],
        "averageSpeed": 90.0,
        "percentOfDriver": 78.3
      },
      {
        "clubType": "7iron",
        "shots": [
          { "shotNumber": 1, "clubSpeed": 87 },
          { "shotNumber": 2, "clubSpeed": 86 },
          { "shotNumber": 3, "clubSpeed": 85 }
        ],
        "averageSpeed": 86.0,
        "percentOfDriver": 74.8
      },
      {
        "clubType": "pw",
        "shots": [
          { "shotNumber": 1, "clubSpeed": 79 },
          { "shotNumber": 2, "clubSpeed": 78 },
          { "shotNumber": 3, "clubSpeed": 80 }
        ],
        "averageSpeed": 79.0,
        "percentOfDriver": 68.7
      }
    ],
    "speedProfile": {
      "driverSpeed": 115,
      "speedDecay": "normal",
      "gapping": "good",
      "weakestClub": null,
      "strongestClub": null,
      "recommendations": [
        "Excellent driver speed - maintain and optimize efficiency",
        "Speed stays high through the bag - good speed maintenance"
      ]
    },
    "recommendations": [
      "Excellent driver speed - maintain and optimize efficiency",
      "Speed stays high through the bag - good speed maintenance"
    ]
  }
}
```

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid calibration data",
    "details": {
      "errors": [
        "Driver speed is required"
      ]
    }
  }
}
```

#### Error Response (409 Conflict)
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

### 2. Get Player's Calibration

**GET** `/calibration/player/:playerId`

Retrieve the calibration for a specific player.

#### Request Headers
```http
Authorization: Bearer <access_token>
```

#### URL Parameters
- `playerId` (UUID, required): The player's ID

#### Example Request
```http
GET /api/v1/calibration/player/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGc...
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "abc12345-e29b-41d4-a716-446655440001",
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "calibrationDate": "2025-12-15T10:00:00.000Z",
    "driverSpeed": 115,
    "clubs": [...], // Same structure as POST response
    "speedProfile": {...},
    "notes": "Initial calibration - indoor testing facility"
  }
}
```

#### Error Response (404 Not Found)
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

### 3. Update Player's Calibration

**PUT** `/calibration/player/:playerId`

Update or create a calibration for a player.

#### Request Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### URL Parameters
- `playerId` (UUID, required): The player's ID

#### Request Body
```json
{
  "calibrationDate": "2025-12-15T14:00:00Z",
  "clubs": [
    {
      "clubType": "driver",
      "shot1Speed": 118,
      "shot2Speed": 117,
      "shot3Speed": 116
    }
    // ... more clubs
  ],
  "notes": "Re-calibration after equipment change"
}
```

#### Response (200 OK)
Same structure as POST response.

---

### 4. Delete Player's Calibration

**DELETE** `/calibration/player/:playerId`

Delete a player's calibration.

#### Request Headers
```http
Authorization: Bearer <access_token>
```

#### URL Parameters
- `playerId` (UUID, required): The player's ID

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Calibration deleted successfully"
}
```

---

## 📊 Data Types

### Club Types
Valid club types (16 options):
```
driver, 3wood, 5wood, 3hybrid, 4hybrid,
3iron, 4iron, 5iron, 6iron, 7iron, 8iron, 9iron,
pw, gw, sw, lw
```

### Speed Profile Analysis

#### Speed Decay
- `"normal"`: 20-30% drop from driver to long iron (typical)
- `"steep"`: >30% drop (needs speed maintenance work)
- `"shallow"`: <20% drop (excellent speed maintenance)

#### Gapping
- `"good"`: Consistent speed gaps between clubs
- `"uneven"`: Inconsistent gaps (work needed)

---

## 🎨 UI Implementation Guide

### Step 1: Calibration Form

Create a multi-step form for collecting club speed data:

```tsx
// Pseudo-code example
const clubs = [
  { id: 'driver', name: 'Driver', icon: '🏌️' },
  { id: '3wood', name: '3-Wood', icon: '⛳' },
  { id: '5iron', name: '5-Iron', icon: '⚡' },
  { id: '7iron', name: '7-Iron', icon: '⚡' },
  { id: 'pw', name: 'Pitching Wedge', icon: '🎯' },
];

// For each club:
<ClubSpeedInput
  clubType={club.id}
  clubName={club.name}
  onSubmit={(shot1, shot2, shot3) => {
    // Add to calibration data
  }}
/>
```

**Fields per club:**
- Shot 1 Speed (mph): Number input, 40-150 range
- Shot 2 Speed (mph): Number input, 40-150 range
- Shot 3 Speed (mph): Number input, 40-150 range

**Validation:**
- All speeds must be 40-150 mph
- Driver is required (minimum)
- At least 3 clubs recommended

### Step 2: Results Display

Show calibration results with:

1. **Speed Chart**
   - Bar chart or line graph
   - X-axis: Club types
   - Y-axis: Speed (mph)
   - Show average speed per club

2. **Percentage Table**
   ```
   Club        Speed    % of Driver
   ─────────────────────────────────
   Driver      115 mph     100%
   3-Wood      106 mph      92%
   5-Iron       90 mph      78%
   7-Iron       86 mph      75%
   PW           79 mph      69%
   ```

3. **Speed Profile Badge**
   - Speed Decay: "Normal" ✅
   - Gapping: "Good" ✅

4. **Recommendations Card**
   - List of personalized recommendations
   - Highlight weak clubs
   - Suggest focus areas

### Step 3: Integration with Onboarding Flow

```
Signup → Profile Setup → Club Speed Calibration → Training Plan Generation
                              ↑ YOU ARE HERE
```

**Flow:**
1. Player completes signup
2. Player enters basic profile info
3. **→ Calibration screen** (new step)
4. Results shown immediately
5. Proceed to training plan generation (uses calibration data)

---

## 🧪 Test Data

### Example 1: Average Amateur (95 mph driver)
```json
{
  "playerId": "test-player-1",
  "calibrationDate": "2025-12-15",
  "clubs": [
    { "clubType": "driver", "shot1Speed": 96, "shot2Speed": 95, "shot3Speed": 94 },
    { "clubType": "3wood", "shot1Speed": 88, "shot2Speed": 87, "shot3Speed": 89 },
    { "clubType": "5iron", "shot1Speed": 75, "shot2Speed": 74, "shot3Speed": 76 },
    { "clubType": "7iron", "shot1Speed": 71, "shot2Speed": 70, "shot3Speed": 72 },
    { "clubType": "pw", "shot1Speed": 65, "shot2Speed": 64, "shot3Speed": 66 }
  ]
}
```

### Example 2: Advanced Player (115 mph driver)
```json
{
  "playerId": "test-player-2",
  "calibrationDate": "2025-12-15",
  "clubs": [
    { "clubType": "driver", "shot1Speed": 116, "shot2Speed": 115, "shot3Speed": 114 },
    { "clubType": "3wood", "shot1Speed": 107, "shot2Speed": 106, "shot3Speed": 105 },
    { "clubType": "5iron", "shot1Speed": 90, "shot2Speed": 89, "shot3Speed": 91 },
    { "clubType": "7iron", "shot1Speed": 87, "shot2Speed": 86, "shot3Speed": 85 },
    { "clubType": "pw", "shot1Speed": 79, "shot2Speed": 78, "shot3Speed": 80 }
  ]
}
```

### Example 3: Tour-Level Player (125 mph driver)
```json
{
  "playerId": "test-player-3",
  "calibrationDate": "2025-12-15",
  "clubs": [
    { "clubType": "driver", "shot1Speed": 126, "shot2Speed": 125, "shot3Speed": 124 },
    { "clubType": "3wood", "shot1Speed": 116, "shot2Speed": 115, "shot3Speed": 117 },
    { "clubType": "5iron", "shot1Speed": 98, "shot2Speed": 97, "shot3Speed": 99 },
    { "clubType": "7iron", "shot1Speed": 93, "shot2Speed": 92, "shot3Speed": 94 },
    { "clubType": "pw", "shot1Speed": 86, "shot2Speed": 85, "shot3Speed": 87 }
  ]
}
```

---

## 🔧 Error Handling

### Common Errors

| Error Code | HTTP Status | Meaning | User Message |
|------------|-------------|---------|--------------|
| `VALIDATION_ERROR` | 400 | Invalid input data | "Please check your input values" |
| `PLAYER_NOT_FOUND` | 404 | Player doesn't exist | "Player not found" |
| `CALIBRATION_EXISTS` | 400 | Calibration already exists | "You've already completed calibration" |
| `CALIBRATION_NOT_FOUND` | 404 | No calibration for player | "No calibration data found" |
| `UNAUTHORIZED` | 401 | Invalid/missing token | "Please log in again" |

### Frontend Error Handling Example

```typescript
try {
  const response = await submitCalibration(data);
  // Show success message
  navigate('/training-plan-setup');
} catch (error) {
  if (error.code === 'CALIBRATION_EXISTS') {
    // Offer to update instead
    showConfirmDialog('Update existing calibration?');
  } else if (error.code === 'VALIDATION_ERROR') {
    // Show field-specific errors
    setFieldErrors(error.details.errors);
  } else {
    // Generic error
    showErrorToast('Failed to save calibration');
  }
}
```

---

## 📱 Mobile Considerations

### Input Optimization
- Use numeric keyboard for speed inputs
- Large touch targets for buttons
- Swipe between clubs
- Auto-save progress

### Offline Support
- Cache calibration data locally
- Sync when connection restored
- Show "Saved locally" indicator

---

## ✅ Checklist for Frontend Integration

- [ ] Create calibration form component
- [ ] Implement club speed input fields
- [ ] Add form validation (40-150 mph range)
- [ ] Create results visualization (chart/table)
- [ ] Display speed profile analysis
- [ ] Show recommendations
- [ ] Add to onboarding flow
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test with sample data
- [ ] Mobile responsive design
- [ ] Accessibility (keyboard navigation, screen readers)

---

## 🚀 Quick Start

1. **Test the API** using Swagger UI:
   - Navigate to: http://localhost:3000/docs
   - Look for "calibration" tag
   - Try the endpoints with sample data

2. **Use curl** for testing:
   ```bash
   curl -X POST http://localhost:3000/api/v1/calibration \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "playerId": "uuid",
       "calibrationDate": "2025-12-15",
       "clubs": [
         {"clubType": "driver", "shot1Speed": 115, "shot2Speed": 114, "shot3Speed": 116}
       ]
     }'
   ```

3. **Integrate** into your frontend:
   - Copy TypeScript types (see CALIBRATION_TYPES.ts)
   - Use API service functions (see api-examples.ts)
   - Build UI components

---

**Ready to integrate! 🎉**

For questions or issues, refer to the main API documentation at `/docs`.
