# Training Plan API Documentation

Complete API reference for the 12-month training plan system.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Plan Generation](#plan-generation)
  - [Plan Retrieval](#plan-retrieval)
  - [Calendar & Assignments](#calendar--assignments)
  - [Progress Tracking](#progress-tracking)
  - [Plan Review](#plan-review)
  - [Manual Adjustments](#manual-adjustments)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Overview

The Training Plan API provides complete lifecycle management for 12-month player training plans, including:

- Automatic plan generation based on player scoring average
- Daily session assignments (365 days)
- Period-based structure (Base → Specialization → Tournament)
- Tournament integration with tapering
- Progress tracking and analytics
- Coach review and manual adjustments

**Base URL**: `/api/v1/training-plan`

---

## Authentication

All endpoints require authentication via Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

The token must belong to a user with appropriate permissions (coach, admin, or the player themselves).

---

## Endpoints

### Plan Generation

#### `POST /generate`

Generate a new 12-month training plan for a player.

**Request Body:**

```json
{
  "playerId": "uuid",
  "startDate": "2025-01-06",
  "baselineAverageScore": 78.5,
  "baselineHandicap": 10.5,
  "baselineDriverSpeed": 106,
  "planName": "2025 Training Plan",
  "weeklyHoursTarget": 15,
  "tournaments": [
    {
      "name": "Spring Championship",
      "startDate": "2025-04-15",
      "endDate": "2025-04-17",
      "importance": "A",
      "tournamentId": "uuid"
    }
  ],
  "preferredTrainingDays": [1, 2, 3, 4, 5, 6],
  "excludeDates": ["2025-12-25", "2025-12-26"]
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "annualPlan": {
      "id": "uuid",
      "playerId": "uuid",
      "planName": "2025 Training Plan",
      "startDate": "2025-01-06",
      "endDate": "2025-12-31",
      "playerCategory": "I1",
      "basePeriodWeeks": 24,
      "specializationWeeks": 18,
      "tournamentWeeks": 8
    },
    "periodizations": {
      "created": 52,
      "weekRange": { "from": 1, "to": 52 }
    },
    "dailyAssignments": {
      "created": 365,
      "dateRange": {
        "from": "2025-01-06",
        "to": "2025-12-31"
      },
      "sessionsByType": {
        "technical": 120,
        "physical": 80,
        "mental": 40,
        "tactical": 60,
        "rest": 65
      }
    },
    "tournaments": {
      "scheduled": 2,
      "list": [
        {
          "name": "Spring Championship",
          "startDate": "2025-04-15",
          "importance": "A"
        }
      ]
    },
    "breakingPoints": {
      "linked": 3
    }
  }
}
```

**Business Logic:**

1. Selects periodization template based on `baselineAverageScore`:
   - < 70: Elite (16 base + 24 spec + 10 tourn weeks)
   - 70-75: Advanced (20 + 20 + 10)
   - 75-80: Intermediate (24 + 18 + 8)
   - 80-85: Developing (28 + 16 + 6)
   - \> 85: Beginner (32 + 14 + 4)

2. Creates 52 weeks of periodization records
3. Generates 365 daily assignments
4. Links breaking points from player's calibration
5. Schedules tournaments with tapering/topping periods

---

### Plan Retrieval

#### `GET /player/:playerId`

Get the active training plan for a specific player.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "playerId": "uuid",
    "planName": "2025 Training Plan",
    "startDate": "2025-01-06",
    "endDate": "2025-12-31",
    "status": "active",
    "baselineAverageScore": 78.5,
    "playerCategory": "I1",
    "basePeriodWeeks": 24,
    "specializationWeeks": 18,
    "tournamentWeeks": 8,
    "weeklyHoursTarget": 15,
    "periodizations": [
      {
        "weekNumber": 1,
        "period": "E",
        "periodPhase": "base",
        "weekInPeriod": 1,
        "volumeIntensity": "medium",
        "plannedHours": 12
      }
    ],
    "scheduledTournaments": [
      {
        "id": "uuid",
        "name": "Spring Championship",
        "startDate": "2025-04-15",
        "importance": "A",
        "weekNumber": 15,
        "toppingStartWeek": 12,
        "taperingDurationDays": 7
      }
    ],
    "dailyAssignments": [
      {
        "id": "uuid",
        "assignedDate": "2025-01-06",
        "weekNumber": 1,
        "dayOfWeek": 1,
        "sessionType": "technical",
        "estimatedDuration": 90,
        "period": "E",
        "learningPhase": "L1",
        "isRestDay": false,
        "status": "planned",
        "sessionTemplate": {
          "id": "uuid",
          "name": "Basic Swing Fundamentals",
          "sessionType": "technical",
          "duration": 90
        }
      }
    ]
  }
}
```

---

### Calendar & Assignments

#### `GET /:planId/calendar`

Get calendar view of daily assignments with filtering options.

**Query Parameters:**

- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)
- `weekNumber` (optional): Get specific week

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "id": "uuid",
        "assignedDate": "2025-01-06",
        "dayOfWeek": 1,
        "weekNumber": 1,
        "sessionType": "technical",
        "estimatedDuration": 90,
        "period": "E",
        "learningPhase": "L1",
        "clubSpeed": "CS110",
        "intensity": 5,
        "isRestDay": false,
        "status": "planned",
        "sessionTemplate": {
          "id": "uuid",
          "name": "Basic Swing Fundamentals",
          "duration": 90,
          "learningPhase": "L1"
        }
      }
    ],
    "summary": {
      "totalAssignments": 28,
      "planned": 25,
      "completed": 2,
      "skipped": 1,
      "restDays": 4,
      "totalMinutes": 2100,
      "bySessionType": {
        "technical": 10,
        "physical": 8,
        "mental": 4,
        "tactical": 2,
        "rest": 4
      }
    }
  }
}
```

#### `PUT /:planId/daily/:date`

Update a daily assignment (mark complete, add notes, etc.).

**URL Parameters:**

- `planId`: UUID
- `date`: YYYY-MM-DD format

**Request Body:**

```json
{
  "status": "completed",
  "sessionTemplateId": "uuid",
  "coachNotes": "Great progress on swing fundamentals",
  "playerNotes": "Felt good, focusing on tempo"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "assignedDate": "2025-01-06",
    "status": "completed",
    "completedAt": "2025-01-06T18:30:00Z",
    "coachNotes": "Great progress on swing fundamentals",
    "sessionTemplate": {
      "id": "uuid",
      "name": "Basic Swing Fundamentals"
    }
  }
}
```

---

### Progress Tracking

#### `GET /:planId/progress`

Get overall progress summary for a training plan.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "planId": "uuid",
    "playerId": "uuid",
    "overall": {
      "totalWeeks": 52,
      "weeksCompleted": 12,
      "weeksCurrent": 13,
      "weeksRemaining": 39,
      "progressPercent": 25
    },
    "currentPeriod": {
      "phase": "base",
      "weekNumber": 13,
      "weekInPeriod": 13,
      "period": "E"
    },
    "assignments": {
      "total": 365,
      "completed": 84,
      "skipped": 3,
      "planned": 278,
      "completionRate": 23
    },
    "training": {
      "totalMinutesPlanned": 32850,
      "totalMinutesCompleted": 7560,
      "averageMinutesPerWeek": 580,
      "targetHoursPerWeek": 15
    },
    "breakingPoints": {
      "total": 3,
      "inProgress": 2,
      "completed": 1,
      "avgProgress": 45.5
    }
  }
}
```

#### `GET /:planId/progress/week/:weekNumber`

Get detailed weekly progress report.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "weekNumber": 13,
    "weekStartDate": "2025-03-31",
    "weekEndDate": "2025-04-06",
    "period": "G",
    "periodPhase": "base",
    "targetHours": 15,
    "actualMinutes": 840,
    "actualHours": 14,
    "completionRate": 85.7,
    "sessionsByType": {
      "technical": { "completed": 3, "total": 3 },
      "physical": { "completed": 2, "total": 2 },
      "mental": { "completed": 1, "total": 1 },
      "rest": { "completed": 1, "total": 1 }
    }
  }
}
```

#### `GET /:planId/progress/monthly/:year/:month`

Get monthly summary statistics.

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "month": 3,
    "year": 2025,
    "totalAssignments": 31,
    "completedAssignments": 26,
    "completionRate": 83.9,
    "totalHours": 58.5,
    "averageHoursPerWeek": 14.6,
    "sessionsByType": {
      "technical": 12,
      "physical": 8,
      "mental": 4,
      "tactical": 2
    }
  }
}
```

---

### Plan Review

#### `POST /:planId/submit-for-review`

Submit a plan for coach review.

**Request Body:**

```json
{
  "submittedBy": "uuid"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Plan submitted for review. Coaches have been notified."
}
```

#### `POST /:planId/review`

Submit a review for a training plan (coaches only).

**Request Body:**

```json
{
  "reviewerId": "uuid",
  "status": "approved",
  "comments": "Excellent plan structure. Approved for implementation.",
  "suggestedChanges": [
    {
      "type": "volume_change",
      "weekNumber": 24,
      "currentValue": "18",
      "suggestedValue": "15",
      "reason": "Reduce volume before major tournament"
    }
  ]
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "planId": "uuid",
    "reviewerId": "uuid",
    "reviewerName": "Coach Smith",
    "status": "approved",
    "reviewDate": "2025-01-05T14:30:00Z",
    "comments": "Excellent plan structure"
  }
}
```

#### `GET /pending-reviews`

Get all plans pending review (coaches only).

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "planName": "Player X - 2025 Plan",
      "playerId": "uuid",
      "player": {
        "firstName": "John",
        "lastName": "Doe",
        "handicap": 10.5
      },
      "generatedAt": "2025-01-05T10:00:00Z",
      "status": "pending_review",
      "_count": {
        "dailyAssignments": 365,
        "scheduledTournaments": 3
      }
    }
  ]
}
```

---

### Manual Adjustments

#### `PUT /:planId/adjust/daily/:date`

Manually adjust a daily assignment (coaches only).

**Request Body:**

```json
{
  "sessionTemplateId": "uuid",
  "coachNotes": "Changed to focus on breaking point",
  "intensity": 7
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Daily assignment updated successfully"
}
```

#### `PUT /:planId/adjust/bulk`

Bulk update assignments for a week or date range.

**Request Body:**

```json
{
  "weekNumber": 15,
  "updates": {
    "intensity": 4
  },
  "reason": "Tapering for tournament"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "affectedAssignments": 7,
    "message": "Bulk update applied to week 15"
  }
}
```

#### `POST /:planId/adjust/swap-sessions`

Swap sessions between two dates.

**Request Body:**

```json
{
  "date1": "2025-01-06",
  "date2": "2025-01-08",
  "reason": "Player requested schedule change"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Sessions swapped successfully"
}
```

#### `POST /:planId/adjust/rest-day`

Insert or remove a rest day.

**Request Body:**

```json
{
  "action": "insert",
  "date": "2025-01-15",
  "reason": "Player feeling fatigued"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Rest day inserted for 2025-01-15"
}
```

---

## Data Models

### AnnualTrainingPlan

```typescript
{
  id: string;
  playerId: string;
  tenantId: string;
  planName: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'pending_review' | 'approved' | 'rejected' | 'archived';
  baselineAverageScore: number;
  baselineHandicap?: number;
  baselineDriverSpeed?: number;
  playerCategory: string; // E1, A1, I1, D1, B1
  basePeriodWeeks: number;
  specializationWeeks: number;
  tournamentWeeks: number;
  weeklyHoursTarget: number;
  intensityProfile: object;
  generatedAt: Date;
  generatedBy?: string;
  lastModifiedAt: Date;
}
```

### DailyTrainingAssignment

```typescript
{
  id: string;
  annualPlanId: string;
  playerId: string;
  assignedDate: Date;
  weekNumber: number;
  dayOfWeek: number; // 0-6
  sessionTemplateId?: string;
  sessionType: string;
  estimatedDuration: number; // minutes
  period: 'E' | 'G' | 'S' | 'T';
  learningPhase?: string; // L1-L5
  clubSpeed?: string; // CS20-CS120
  intensity?: number; // 1-10
  isRestDay: boolean;
  isOptional: boolean;
  canBeSubstituted: boolean;
  status: 'planned' | 'completed' | 'skipped' | 'rescheduled';
  completedSessionId?: string;
  completedAt?: Date;
  coachNotes?: string;
  playerNotes?: string;
}
```

### Periodization

```typescript
{
  id: string;
  playerId: string;
  weekNumber: number;
  period: 'E' | 'G' | 'S' | 'T';
  annualPlanId?: string;
  periodPhase?: string; // base, specialization, tournament, recovery
  weekInPeriod?: number;
  volumeIntensity?: string; // low, medium, high, peak, taper
  plannedHours?: number;
  actualHours?: number;
}
```

### ScheduledTournament

```typescript
{
  id: string;
  annualPlanId: string;
  tournamentId?: string;
  name: string;
  startDate: Date;
  endDate: Date;
  importance: 'A' | 'B' | 'C';
  weekNumber: number;
  period: 'T';
  toppingStartWeek?: number;
  toppingDurationWeeks: number;
  taperingStartDate?: Date;
  taperingDurationDays: number;
  focusAreas?: string[];
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

**Common Error Codes:**

- `PLAYER_NOT_FOUND` (404)
- `PLAN_NOT_FOUND` (404)
- `ACTIVE_PLAN_EXISTS` (409)
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `ASSIGNMENT_NOT_FOUND` (404)

---

## Examples

### Complete Workflow Example

```javascript
// 1. Generate a plan
const planResponse = await fetch('/api/v1/training-plan/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    playerId: 'player-uuid',
    startDate: '2025-01-06',
    baselineAverageScore: 78.5,
    baselineDriverSpeed: 106,
    weeklyHoursTarget: 15,
    tournaments: [{
      name: 'Spring Cup',
      startDate: '2025-04-15',
      endDate: '2025-04-17',
      importance: 'A'
    }]
  })
});

const plan = await planResponse.json();
console.log(`Created plan: ${plan.data.annualPlan.id}`);

// 2. Get calendar view for first month
const calendarResponse = await fetch(
  `/api/v1/training-plan/${plan.data.annualPlan.id}/calendar?startDate=2025-01-06&endDate=2025-02-06`,
  {
    headers: { 'Authorization': 'Bearer <token>' }
  }
);

const calendar = await calendarResponse.json();
console.log(`First month has ${calendar.data.assignments.length} assignments`);

// 3. Mark a session as completed
await fetch(`/api/v1/training-plan/${plan.data.annualPlan.id}/daily/2025-01-06`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    status: 'completed',
    playerNotes: 'Great session!'
  })
});

// 4. Get progress summary
const progressResponse = await fetch(
  `/api/v1/training-plan/${plan.data.annualPlan.id}/progress`,
  {
    headers: { 'Authorization': 'Bearer <token>' }
  }
);

const progress = await progressResponse.json();
console.log(`Completion rate: ${progress.data.assignments.completionRate}%`);
```

---

## Rate Limiting

- Plan generation: 5 requests per hour per user
- Other endpoints: 100 requests per minute per user

---

## Changelog

### v1.0.0 (2025-01-15)
- Initial release
- 12-month plan generation
- Daily assignment management
- Progress tracking
- Coach review system
- Manual adjustments

---

**For questions or support, contact the backend team.**
