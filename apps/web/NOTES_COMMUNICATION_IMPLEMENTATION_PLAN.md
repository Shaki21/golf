# Notes & Communication Enhancement - Implementation Plan

**Sprint:** 5.13 - Notes & Communication
**Date:** 2026-01-12
**Status:** 📋 Planning

---

## Executive Summary

### Current State

**Existing Notes System:**
- Basic text-only notes (`coach-notes` feature)
- Created date + delivered status
- List view of notes per athlete
- Simple add/view interface

**Existing Messaging System:**
- Message compose (`CoachMessageCompose`)
- Message list (`CoachMessageList`)
- Scheduled messages (`CoachScheduledMessages`)
- Basic conversation threading

**Limitations:**
1. ❌ No rich text formatting (bold, lists, etc.)
2. ❌ No file attachments (images, videos, PDFs)
3. ❌ No note templates for common scenarios
4. ❌ No categorization or tagging
5. ❌ No search across notes/messages
6. ❌ No integration between notes and messages
7. ❌ No quick notes from dashboard/other views
8. ❌ No note sharing with other coaches
9. ❌ No voice notes or multimedia
10. ❌ Limited notification system

### Enhancement Goals

Transform notes and communication into a comprehensive system:

1. **Rich Note Editor** - Formatting, attachments, templates
2. **Smart Organization** - Categories, tags, search, filters
3. **Quick Capture** - Create notes from anywhere
4. **Enhanced Messaging** - Threading, reactions, read receipts
5. **Unified Inbox** - All communication in one place
6. **Collaboration** - Share notes, mention coaches
7. **Templates** - Common note patterns
8. **Voice Notes** - Audio recording for quick feedback

---

## Phase 1: Rich Note Editor (8 hours)

### 1.1 Rich Text Editor Integration

**Library:** Tiptap or Lexical (React-based rich text editors)

**File:** `src/features/coach-notes/components/RichNoteEditor.tsx`

**Features:**
- Text formatting (bold, italic, underline)
- Lists (bulleted, numbered)
- Headings (H1-H3)
- Links
- Code blocks (for drill instructions)
- Tables
- Mentions (@athlete, @coach)
- Emoji picker
- Keyboard shortcuts (Ctrl+B for bold, etc.)

**UI Example:**
```
┌─────────────────────────────────────────────────┐
│ [B] [I] [U] [List] [Link] [H1▾] [@] [😊]       │
├─────────────────────────────────────────────────┤
│ Note content with **bold** and *italic* text   │
│                                                  │
│ - Bulleted lists                                 │
│ - With multiple items                            │
│                                                  │
│ @JohnDoe remember to focus on...                │
└─────────────────────────────────────────────────┘
```

### 1.2 File Attachments

**File:** `src/features/coach-notes/components/NoteAttachments.tsx`

**Features:**
- Drag-and-drop file upload
- Image preview
- Video preview (with play button)
- PDF preview
- File size validation (max 10MB per file)
- Multiple file support
- Remove attachment before saving

**Supported Types:**
- Images: JPG, PNG, GIF
- Videos: MP4, MOV
- Documents: PDF
- Archives: ZIP (for multiple files)

**UI Example:**
```
┌─────────────────────────────────────────────────┐
│ Attachments (2)                                  │
│ ┌──────────┐ ┌──────────┐                       │
│ │[IMG]     │ │[PDF]     │                       │
│ │swing.jpg │ │drill.pdf │                       │
│ │  [×]     │ │  [×]     │                       │
│ └──────────┘ └──────────┘                       │
│ [+ Add Files] or drag files here                │
└─────────────────────────────────────────────────┘
```

### 1.3 Note Templates

**File:** `src/features/coach-notes/components/NoteTemplates.tsx`

**Template Categories:**
1. **Session Feedback**
   - "Great session today! Focus areas for next time..."
   - Pre-filled structure with sections

2. **Technique Correction**
   - "Technical observation: [Area]"
   - "Current state: ..."
   - "Target state: ..."
   - "Drill recommendation: ..."

3. **Progress Check-in**
   - "Weekly progress review"
   - Checklist of areas to review

4. **Competition Prep**
   - "Pre-tournament reminders"
   - Mental game tips
   - Strategy notes

5. **Custom Templates**
   - Coach can create and save custom templates
   - Share templates with other coaches

**UI:**
```
┌─────────────────────────────────────────────────┐
│ Start from template                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ Session  │ │Technique │ │ Progress │         │
│ │ Feedback │ │Correction│ │ Check-in │         │
│ └──────────┘ └──────────┘ └──────────┘         │
│ [+ Create Custom Template]                       │
└─────────────────────────────────────────────────┘
```

**Estimated Time:** 8 hours
- Rich text editor setup: 3h
- File attachments: 2.5h
- Note templates: 2.5h

---

## Phase 2: Smart Organization (6 hours)

### 2.1 Note Categories & Tags

**File:** `src/features/coach-notes/types/note.types.ts`

```typescript
export interface EnhancedNote {
  id: string;
  content: string; // Rich text HTML or JSON
  plainTextPreview: string; // For search/display
  category: NoteCategory;
  tags: string[];
  attachments: NoteAttachment[];
  athleteId: string;
  coachId: string;
  createdAt: string;
  updatedAt: string;
  delivered: boolean;
  deliveredAt?: string;
  pinned: boolean;
  sharedWith?: string[]; // Other coach IDs
}

export type NoteCategory =
  | 'technique'
  | 'mental-game'
  | 'fitness'
  | 'strategy'
  | 'general'
  | 'progress'
  | 'competition';

export interface NoteAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
}
```

### 2.2 Category Selector Component

**File:** `src/features/coach-notes/components/CategorySelector.tsx`

**Features:**
- Dropdown with icon for each category
- Color-coded categories
- Quick keyboard shortcuts (1-7 for categories)
- "Most used" suggestions

### 2.3 Tag Input Component

**File:** `src/features/coach-notes/components/TagInput.tsx`

**Features:**
- Autocomplete from existing tags
- Create new tags inline
- Tag suggestions based on note content (AI-powered)
- Bulk tag operations (add/remove tags from multiple notes)

**UI Example:**
```
┌─────────────────────────────────────────────────┐
│ Category: [Technique ▾]                          │
│ Tags: [putting] [short-game] [+ Add tag]        │
│       └─ [lag putts] [speed control] [arc]      │ ← Suggestions
└─────────────────────────────────────────────────┘
```

**Estimated Time:** 6 hours
- Type definitions: 1h
- Category selector: 1.5h
- Tag input with autocomplete: 2.5h
- Category/tag filtering: 1h

---

## Phase 3: Search & Filters (4 hours)

### 3.1 Unified Search Component

**File:** `src/features/coach-notes/components/NoteSearch.tsx`

**Features:**
- Full-text search across note content
- Search in attachments (PDF text extraction)
- Search filters:
  - By athlete
  - By category
  - By tags
  - By date range
  - By delivery status
  - Has attachments
- Sort options:
  - Most recent
  - Oldest first
  - Most relevant (search)
  - Alphabetical

**UI Example:**
```
┌─────────────────────────────────────────────────┐
│ Search: [putting technique..................] 🔍 │
│ Filters: [Category▾] [Tags▾] [Date▾] [More▾]  │
├─────────────────────────────────────────────────┤
│ 23 results                    Sort: [Recent ▾]  │
│ ┌──────────────────────────────────────────┐   │
│ │ John Doe • Dec 18 • Technique            │   │
│ │ Focus on **putting** stroke tempo...     │   │
│ │ [technique] [putting] [short-game]       │   │
│ └──────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────┐   │
│ │ Jane Smith • Dec 15 • Technique          │   │
│ │ Lag **putting** drill results...         │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 3.2 Saved Searches / Smart Views

**File:** `src/features/coach-notes/components/SavedSearches.tsx`

**Pre-defined Smart Views:**
- "Recent notes" (last 7 days)
- "Undelivered notes" (drafts)
- "Notes with attachments"
- "Pinned notes"
- "Shared with me"

**Custom Saved Searches:**
- Coach can save frequently used filter combinations
- Name saved searches
- Pin saved searches to sidebar

**Estimated Time:** 4 hours
- Search component: 2h
- Search backend integration: 1h
- Saved searches UI: 1h

---

## Phase 4: Quick Capture (3 hours)

### 4.1 Quick Note Modal

**File:** `src/features/coach-notes/components/QuickNoteModal.tsx`

**Features:**
- Global shortcut to open (Cmd/Ctrl + N)
- Lightweight modal overlay
- Athlete selector (autocomplete)
- Basic rich text editor
- Category quick-select
- Tag quick-select
- Save as draft or send immediately
- Quick attachment (drag-and-drop)

**Trigger Locations:**
- Global app header (+ button)
- Player card hover actions
- Training plan sessions
- Dashboard player lists
- Athlete detail page

**UI Example:**
```
┌─────────────────────────────────────────────────┐
│ Quick Note                            [Save] [×] │
├─────────────────────────────────────────────────┤
│ To: [John Doe ▾]                                │
│ Category: [Technique ▾] Tags: [putting]         │
│ ┌─────────────────────────────────────────┐    │
│ │ Note content...                         │    │
│ │                                         │    │
│ └─────────────────────────────────────────┘    │
│ [+ Attach] [Template ▾] [Save Draft] [Send]    │
└─────────────────────────────────────────────────┘
```

### 4.2 Context-Aware Quick Notes

**Integration Points:**

**From Dashboard:**
```typescript
// When clicking "Add note" on player card
<PlayerCard>
  <QuickActionMenu>
    <MenuItem onClick={() => openQuickNote(playerId)}>
      Add note
    </MenuItem>
  </QuickActionMenu>
</PlayerCard>
```

**From Training Session:**
```typescript
// When coach finishes session
<SessionEvaluationForm>
  <Button onClick={() => openQuickNote(playerId, {
    category: 'progress',
    prefill: sessionSummary
  })}>
    Send follow-up note
  </Button>
</SessionEvaluationForm>
```

**Estimated Time:** 3 hours
- Quick note modal: 1.5h
- Global shortcut: 0.5h
- Integration points: 1h

---

## Phase 5: Enhanced Messaging (6 hours)

### 5.1 Message Threading

**File:** `src/features/coach-messages/components/MessageThread.tsx`

**Features:**
- Group messages by conversation
- Show reply context
- Nested replies (up to 2 levels)
- Collapse/expand threads
- Unread indicator per thread
- Mark thread as resolved

**UI Example:**
```
┌─────────────────────────────────────────────────┐
│ John Doe                          [Resolved ✓]  │
├─────────────────────────────────────────────────┤
│ You: What time is practice tomorrow?            │
│ Dec 18, 2:30 PM                                  │
│                                                  │
│   John: 9 AM at the range                       │
│   Dec 18, 3:15 PM                                │
│                                                  │
│     You: Perfect, see you then 👍               │
│     Dec 18, 3:20 PM                              │
│                                                  │
│ [Reply to thread...]                             │
└─────────────────────────────────────────────────┘
```

### 5.2 Message Reactions

**File:** `src/features/coach-messages/components/MessageReactions.tsx`

**Features:**
- Quick reactions (👍 ❤️ 😊 🎉 ⚠️)
- Hover to add reaction
- Show who reacted
- Remove own reaction

### 5.3 Read Receipts

**File:** `src/features/coach-messages/types/message.types.ts`

```typescript
export interface EnhancedMessage {
  id: string;
  content: string;
  senderId: string;
  recipientIds: string[];
  threadId?: string;
  parentMessageId?: string;
  createdAt: string;
  readBy: {
    userId: string;
    readAt: string;
  }[];
  reactions: {
    emoji: string;
    userId: string;
  }[];
  attachments: MessageAttachment[];
  scheduled?: {
    sendAt: string;
    status: 'pending' | 'sent' | 'cancelled';
  };
}
```

**UI Example:**
```
┌─────────────────────────────────────────────────┐
│ Great job today!                                 │
│ Read by John Doe • 2 mins ago              👍 2 │
└─────────────────────────────────────────────────┘
```

### 5.4 Message Attachments

Same as note attachments - images, videos, PDFs, etc.

**Estimated Time:** 6 hours
- Message threading: 2.5h
- Reactions: 1.5h
- Read receipts: 1h
- Attachments: 1h

---

## Phase 6: Unified Communication Hub (5 hours)

### 6.1 Unified Inbox

**File:** `src/features/communication/UnifiedInbox.tsx`

**Features:**
- Combined view of:
  - Undelivered notes (drafts)
  - Unread messages
  - Scheduled messages
  - Shared notes
- Filter by type
- Sort by date/priority
- Batch actions (mark as read, delete, archive)

**UI Example:**
```
┌─────────────────────────────────────────────────┐
│ Inbox (12)          [All▾] [Unread▾] [Today▾]  │
├─────────────────────────────────────────────────┤
│ ● [Note] John Doe • Draft • Technique           │
│   Putting stroke feedback...                     │
│                                                  │
│ ● [Msg] Jane Smith • Unread • 2 mins ago        │
│   Can we reschedule tomorrow's session?          │
│                                                  │
│   [Scheduled] Mike Johnson • Tomorrow 9 AM       │
│   Pre-tournament reminder...                     │
└─────────────────────────────────────────────────┘
```

### 6.2 Communication Timeline

**File:** `src/features/communication/CommunicationTimeline.tsx`

**Features:**
- Chronological view of all interactions with athlete
- Notes + messages + sessions combined
- Filter by type
- Jump to specific date
- Export timeline as PDF

**UI Example:**
```
┌─────────────────────────────────────────────────┐
│ John Doe - Communication Timeline                │
├─────────────────────────────────────────────────┤
│ ● Dec 18 • Note • Technique                      │
│   Focus on putting tempo...                      │
│                                                  │
│ ● Dec 17 • Message                               │
│   Practice at 9 AM tomorrow                      │
│                                                  │
│ ● Dec 15 • Session • 90 min                      │
│   Short game practice                            │
│                                                  │
│ ● Dec 10 • Note • Progress                       │
│   Great improvement this week...                 │
└─────────────────────────────────────────────────┘
```

**Estimated Time:** 5 hours
- Unified inbox: 2.5h
- Communication timeline: 2h
- Backend API integration: 0.5h

---

## Phase 7: Collaboration Features (4 hours)

### 7.1 Note Sharing

**File:** `src/features/coach-notes/components/NoteSharing.tsx`

**Features:**
- Share note with other coaches
- Permission levels:
  - View only
  - Can comment
  - Can edit
- Share link generation
- Notification to shared coaches
- Activity log (who viewed, edited)

### 7.2 Mentions & Notifications

**File:** `src/features/coach-notes/components/MentionsInput.tsx`

**Features:**
- @mention coaches in notes (@CoachName)
- @mention athletes (@AthleteName)
- Autocomplete for mentions
- Notification when mentioned
- Jump to mention location

### 7.3 Comments on Notes

**File:** `src/features/coach-notes/components/NoteComments.tsx`

**Features:**
- Add comments to notes
- Comment threading
- Resolve comments
- Notification on new comments

**UI Example:**
```
┌─────────────────────────────────────────────────┐
│ Note: Putting technique observation              │
│ Focus on keeping the putter face square...       │
│                                                  │
│ Comments (2)                                     │
│ ┌─────────────────────────────────────────┐    │
│ │ @CoachJane: Good observation! I noticed  │    │
│ │ the same thing last week.                │    │
│ │ Dec 18, 3:00 PM                          │    │
│ └─────────────────────────────────────────┘    │
│ [Add comment...]                                 │
└─────────────────────────────────────────────────┘
```

**Estimated Time:** 4 hours
- Note sharing: 1.5h
- Mentions: 1.5h
- Comments: 1h

---

## Phase 8: Voice Notes & Media (4 hours)

### 8.1 Voice Recording

**File:** `src/features/coach-notes/components/VoiceRecorder.tsx`

**Features:**
- Browser audio recording (Web Audio API)
- Real-time waveform visualization
- Play/pause recording
- Maximum duration (5 minutes)
- Save as note attachment
- Transcription (optional, using speech-to-text API)

**UI Example:**
```
┌─────────────────────────────────────────────────┐
│ Voice Note                                       │
│ ┌─────────────────────────────────────────┐    │
│ │ ▓▓░░▓▓░░▓▓▓░░░▓░░▓▓▓░░                 │    │
│ │ [●] Recording... 0:23 / 5:00            │    │
│ └─────────────────────────────────────────┘    │
│ [Stop] [Cancel]                                  │
└─────────────────────────────────────────────────┘
```

### 8.2 Video Recording

**File:** `src/features/coach-notes/components/VideoRecorder.tsx`

**Features:**
- Camera access (front/back camera)
- Record short video clips (max 2 minutes)
- Preview before saving
- Attach to note

**Use Cases:**
- Quick swing analysis feedback
- Drill demonstration
- Verbal encouragement

**Estimated Time:** 4 hours
- Voice recording: 2h
- Video recording: 1.5h
- Transcription integration: 0.5h

---

## Technical Architecture

### Component Hierarchy

```
UnifiedInbox
├── InboxList
│   ├── NotePreviewCard
│   ├── MessagePreviewCard
│   └── ScheduledItemCard
└── InboxFilters

CommunicationTimeline
├── TimelineItem
│   ├── NoteTimelineItem
│   ├── MessageTimelineItem
│   └── SessionTimelineItem
└── TimelineFilters

EnhancedNoteEditor
├── RichTextEditor (Tiptap)
│   ├── FormattingToolbar
│   └── MentionsPlugin
├── NoteAttachments
│   ├── FileUpload
│   └── AttachmentPreview
├── CategorySelector
├── TagInput
├── NoteTemplates
└── VoiceRecorder

EnhancedMessageCompose
├── MessageThreadView
├── MessageReactions
├── MessageAttachments
└── ReadReceipts

NoteSharing
├── ShareModal
├── PermissionSelector
└── SharedUsersList
```

### Data Flow

```
API Endpoints:

Notes:
GET    /notes                              → List notes (with filters)
POST   /notes                              → Create note
GET    /notes/:id                          → Get note details
PUT    /notes/:id                          → Update note
DELETE /notes/:id                          → Delete note
POST   /notes/:id/share                    → Share note
POST   /notes/:id/comments                 → Add comment
GET    /notes/search?q=...                 → Search notes
GET    /notes/templates                    → List templates
POST   /notes/templates                    → Create template

Messages:
GET    /messages                           → List messages
POST   /messages                           → Send message
GET    /messages/:threadId                 → Get thread
PUT    /messages/:id/read                  → Mark as read
POST   /messages/:id/reactions             → Add reaction
POST   /messages/:id/schedule              → Schedule message

Communication:
GET    /communication/inbox                → Unified inbox
GET    /communication/timeline/:athleteId  → Timeline

Attachments:
POST   /attachments/upload                 → Upload file
GET    /attachments/:id                    → Download file
DELETE /attachments/:id                    → Delete file

Voice:
POST   /voice/transcribe                   → Transcribe audio
```

### State Management

```typescript
// React Query Hooks
useNotes(filters)              → { notes, isLoading, refetch }
useNote(id)                    → { note, isLoading }
useCreateNote()                → { mutate, isLoading }
useUpdateNote(id)              → { mutate, isLoading }
useNoteTemplates()             → { templates, isLoading }

useMessages(filters)           → { messages, isLoading }
useMessageThread(threadId)     → { thread, isLoading }
useSendMessage()               → { mutate, isLoading }

useUnifiedInbox()              → { items, isLoading }
useCommunicationTimeline(athleteId) → { timeline, isLoading }

useFileUpload()                → { upload, progress, cancel }
useVoiceRecording()            → { startRecording, stopRecording, audioBlob }
```

---

## Implementation Checklist

### Phase 1: Rich Note Editor ✅ (8h)
- [ ] Install Tiptap or Lexical
- [ ] Create RichNoteEditor component
- [ ] Implement formatting toolbar
- [ ] Add file upload component
- [ ] Create note templates
- [ ] Test rich text rendering

### Phase 2: Smart Organization ✅ (6h)
- [ ] Define enhanced note types
- [ ] Create CategorySelector component
- [ ] Create TagInput with autocomplete
- [ ] Implement tag suggestions
- [ ] Test categorization

### Phase 3: Search & Filters ✅ (4h)
- [ ] Create NoteSearch component
- [ ] Implement full-text search
- [ ] Add filter controls
- [ ] Create saved searches
- [ ] Test search performance

### Phase 4: Quick Capture ✅ (3h)
- [ ] Create QuickNoteModal
- [ ] Implement global shortcut
- [ ] Add integration points
- [ ] Test quick note flow

### Phase 5: Enhanced Messaging ✅ (6h)
- [ ] Implement message threading
- [ ] Add message reactions
- [ ] Implement read receipts
- [ ] Add message attachments
- [ ] Test messaging features

### Phase 6: Unified Hub ✅ (5h)
- [ ] Create UnifiedInbox component
- [ ] Create CommunicationTimeline
- [ ] Implement filters
- [ ] Test unified view

### Phase 7: Collaboration ✅ (4h)
- [ ] Implement note sharing
- [ ] Add mentions functionality
- [ ] Create comments system
- [ ] Test collaboration features

### Phase 8: Voice & Media ✅ (4h)
- [ ] Implement voice recording
- [ ] Add video recording
- [ ] Integrate transcription
- [ ] Test media features

### Integration & Testing (4h)
- [ ] Integrate all phases
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Create documentation

**Total Estimated Time:** 44 hours

---

## Success Metrics

### User Experience
- [ ] Coaches can create rich notes in < 30 seconds
- [ ] Search returns results in < 1 second
- [ ] Voice notes reduce typing time by 50%
- [ ] Quick capture increases note frequency by 30%

### Communication Quality
- [ ] 80%+ of notes use categories/tags
- [ ] Message threads reduce notification fatigue
- [ ] Read receipts improve response time
- [ ] File attachments add visual context

### Collaboration
- [ ] Shared notes facilitate coach coordination
- [ ] Comments enable asynchronous discussion
- [ ] Mentions ensure relevant coaches are looped in

---

## Dependencies

### New Dependencies
```json
{
  "@tiptap/react": "^2.1.0",
  "@tiptap/starter-kit": "^2.1.0",
  "@tiptap/extension-mention": "^2.1.0",
  "@tiptap/extension-link": "^2.1.0",
  "emoji-picker-react": "^4.5.0",
  "react-dropzone": "^14.2.0"
}
```

### Optional Dependencies
```json
{
  "wavesurfer.js": "^7.0.0", // For audio waveforms
  "react-webcam": "^7.1.0",  // For video recording
  "tesseract.js": "^5.0.0"   // For OCR in images
}
```

---

## Future Enhancements (Post-Sprint)

### Advanced Features
- [ ] AI-powered note suggestions
- [ ] Auto-categorization using ML
- [ ] Smart reminders based on note content
- [ ] Integration with calendar (schedule follow-ups)
- [ ] Bulk operations (tag multiple notes)
- [ ] Note versioning (history)
- [ ] Export notes as PDF
- [ ] Print-friendly note formatting
- [ ] Offline support with sync
- [ ] Mobile app with push notifications

### Analytics
- [ ] Note engagement metrics
- [ ] Most used categories/tags
- [ ] Response time analysis
- [ ] Communication patterns

---

## Conclusion

Sprint 5.13 will transform the basic notes system into a comprehensive communication platform. Key deliverables:

1. **Rich Content** - Formatted text, attachments, voice/video
2. **Smart Organization** - Categories, tags, search, filters
3. **Quick Access** - Capture notes from anywhere
4. **Better Messaging** - Threading, reactions, read receipts
5. **Unified View** - All communication in one place
6. **Collaboration** - Share, comment, mention
7. **Voice Notes** - Quick audio feedback
8. **Templates** - Reusable note patterns

**Expected Impact:**
- 50% faster note creation
- Better communication quality
- Improved coach collaboration
- Reduced response time

**Ready for:** Implementation

---

**Status:** 📋 Plan Complete
**Next Step:** Begin Phase 1 (Rich Note Editor)
**Estimated Completion:** 44 hours (1 week, full-time)

