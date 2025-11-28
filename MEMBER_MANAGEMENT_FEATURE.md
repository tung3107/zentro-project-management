# Member Management Feature

## Overview

A comprehensive member management feature that allows project leaders to add, remove, and manage team members within their projects.

## Features Implemented

### Frontend Components

1. **MembersTab** (`client/zentro-frontend/src/feature/member/components/members/MembersTab.tsx`)

   - Main container component following the CalendarTab pattern
   - Manages state for members, roles, and modals
   - Handles CRUD operations for project members

2. **MembersView** (`client/zentro-frontend/src/feature/member/components/members/MembersView.tsx`)

   - Grid layout displaying all project members
   - Search functionality to filter members
   - Role management and member removal (for leaders only)
   - Modern card-based UI following CalendarView design patterns

3. **AddMemberModal** (`client/zentro-frontend/src/feature/member/components/members/AddMemberModal.tsx`)
   - Modal for adding new members to the project
   - Real-time user search with debouncing
   - Multi-select with role assignment
   - Shows only users not already in the project

### Frontend Services

4. **member.service.ts** (`client/zentro-frontend/src/feature/member/service/member.service.ts`)
   - API integration for member management
   - Functions for getting, adding, updating members
   - Search for available users not in project

### Backend Implementation

5. **Member Service** (`server/services/member.service.js`)

   - Added `getAvailableUsers()` method to fetch users not in a project
   - Filters out existing members with proper SQL joins

6. **Member Controller** (`server/controllers/member.controller.js`)

   - Added `getAvailableUsers` controller endpoint

7. **Member Routes** (`server/routes/member.routes.js`)

   - Added `/members/available/:project_id` GET route

8. **Role Routes** (`server/routes/role.routes.js`)
   - Updated `/roles/project` to allow access without admin authorization

## Integration

The MembersTab is integrated into the Dashboard component:

```typescript
// Dashboard.tsx
import MembersTab from "../components/members/MembersTab";

const tabs = [
  // ... other tabs
  {
    path: "members",
    component: <MembersTab />,
    label: "Thành viên",
    icon: <Users size={20} />,
  },
];
```

Access the members tab at: `/projects/:projectId/members`

## API Endpoints

### Get Project Members

```
GET /api/members/:project_id
```

### Get Available Users (not in project)

```
GET /api/members/available/:project_id?search=query
```

### Add Members to Project

```
POST /api/members
Body: {
  project_id: string,
  members: [{ user: {...}, role: {...} }]
}
```

### Update Project Members

```
PUT /api/members
Body: {
  project_id: string,
  members: [{ user: {...}, role: {...} }]
}
```

### Get Project Roles

```
GET /api/roles/project
```

## UI Features

### Search & Filter

- Real-time search for members by name, email, or ID
- Debounced search for available users in add modal

### Role Management

- Dropdown to change member roles
- Validation: Exactly one Leader required per project
- Color-coded role badges

### Add Members

- Search across all users not in the project
- Multi-select with individual role assignment
- Visual feedback for selected users

### Remove Members

- Confirmation modal before deletion
- Leader validation (can't remove last leader)

## Design Patterns

Following the existing codebase patterns:

- **CalendarTab/CalendarView** pattern for component structure
- **Space Grotesk** font family
- **Tailwind CSS** for styling
- **PrimeReact** components (Skeleton for loading)
- **Toast notifications** for user feedback
- **Modal patterns** from OverlayCenterModal

## Permissions (TODO)

The `isLeader` flag is currently hardcoded to `true`. Future implementation should:

1. Check user's role in the current project
2. Verify permissions from the backend
3. Hide/disable actions for non-leaders

## Next Steps

1. **Permission Integration**: Connect to actual permission system
2. **Activity Logging**: Log member additions/removals to activity log
3. **Notifications**: Notify users when added to projects
4. **Bulk Actions**: Allow bulk member operations
5. **Export**: Export member list to CSV/Excel
