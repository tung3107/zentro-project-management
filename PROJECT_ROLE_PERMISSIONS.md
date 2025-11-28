# Project Role-Based Permissions System

## Overview

Implemented a role-based permission system for projects with 3 distinct roles:

- **Trưởng nhóm** (Team Leader) - Full access
- **Nhân viên** (Employee) - Limited access
- **Người xem** (Viewer) - Read-only access

## Roles & Permissions

### 1. Người xem (Viewer)

- ✅ Can VIEW project and all content
- ❌ Cannot perform ANY actions (edit, create, delete)
- Shows toast error: "Bạn không có quyền..." when attempting restricted actions

### 2. Nhân viên (Employee)

- ✅ Can VIEW project
- ✅ Can EDIT tasks (change status, update details)
- ❌ Cannot DELETE tasks or subtasks
- ❌ Cannot CREATE tasks
- ❌ Cannot access Reports tab (hidden)

### 3. Trưởng nhóm (Team Leader)

- ✅ Full access to all features
- ✅ Can DELETE tasks/subtasks
- ✅ Can CREATE tasks/subtasks
- ✅ Can access Reports tab
- ✅ Can perform all edit operations

## Implementation Files

### 1. Custom Hook: `useProjectRole.ts`

**Location:** `client/zentro-frontend/src/feature/member/hooks/useProjectRole.ts`

**Purpose:** Centralized hook to fetch and manage user's role in a project

**Features:**

- Fetches user's role from project members
- Provides permission flags (canView, canEdit, canDelete, canAccessReports, canCreateTask)
- Returns role type and boolean flags (isLeader, isEmployee, isViewer)
- Automatic re-fetching when projectId or user changes

**Usage:**

```typescript
const { permissions, isLoading } = useProjectRole();

if (permissions.canDelete) {
  // Show delete button
}
```

### 2. Dashboard Tab Visibility

**File:** `client/zentro-frontend/src/feature/member/pages/Dashboard.tsx`

**Changes:**

- Import `useProjectRole` hook
- Filter tabs based on `permissions.canAccessReports`
- Hide "Báo cáo" (Reports) tab for non-leaders
- Added `requiresLeader: true` flag to Reports tab

### 3. Board View Permissions

**Files Modified:**

- `client/zentro-frontend/src/feature/member/components/board/BoardTab.tsx`
- `client/zentro-frontend/src/feature/member/components/board/DragnDropColumn.tsx`
- `client/zentro-frontend/src/components/ColumnCard.tsx`
- `client/zentro-frontend/src/components/TaskItem.tsx`

**Implemented Restrictions:**

#### BoardTab.tsx

- Check `permissions.canCreateTask` before opening Add Task modal
- Show toast error if viewer/employee tries to create task
- Pass `canDelete` and `canEdit` props to DragnDropColumn

#### DragnDropColumn.tsx

- Check `canEdit` on drag & drop operations
- Check `canEdit` on status change
- Check `canDelete` before deleting task
- Show appropriate toast errors for each permission

#### ColumnCard.tsx

- Accept and forward `canDelete` prop
- Pass to TaskItem component

#### TaskItem.tsx

- Accept `canDelete` prop (default: true)
- Conditionally render delete button in dropdown menu
- Hide delete option for viewers and employees

## Permission Checks Flow

```
User opens project
    ↓
useProjectRole() fetches user's role
    ↓
Determines permissions based on role name
    ↓
Components receive permission props
    ↓
UI elements conditionally rendered/enabled
    ↓
Actions blocked with toast errors if no permission
```

## Role Detection Logic

The system uses role name matching with `.includes()`:

```typescript
const roleName = currentMember.role.role_name as string;
const isLeader = roleName.includes("Trưởng nhóm");
const isEmployee = roleName.includes("Nhân viên");
const isViewer = roleName.includes("Người xem");
```

This allows flexibility for role names like:

- "Trưởng nhóm A"
- "Nhân viên Dev"
- "Người xem"

## Toast Error Messages

All permission errors show user-friendly Vietnamese messages:

- `"Bạn không có quyền tạo công việc"` - Cannot create task
- `"Bạn không có quyền xóa công việc"` - Cannot delete task
- `"Bạn không có quyền thay đổi trạng thái công việc"` - Cannot change status

## Frontend-Only Implementation

⚠️ **Important:** This is a frontend-only implementation as requested.

- Backend API calls are NOT blocked
- Permissions only control UI visibility and client-side actions
- Backend should implement its own authorization for security

## Testing Checklist

### Người xem (Viewer)

- [ ] Can view all project content
- [ ] Cannot drag & drop tasks
- [ ] Cannot change task status via dropdown
- [ ] Cannot delete tasks (button hidden)
- [ ] Cannot create new tasks
- [ ] Cannot see Reports tab
- [ ] Gets toast error when attempting any action

### Nhân viên (Employee)

- [ ] Can view all project content
- [ ] Can drag & drop tasks to change status
- [ ] Can update task details
- [ ] Cannot delete tasks (button hidden)
- [ ] Cannot create new tasks
- [ ] Cannot see Reports tab
- [ ] Gets toast error when attempting delete/create

### Trưởng nhóm (Team Leader)

- [ ] Can perform all actions
- [ ] Can delete tasks
- [ ] Can create tasks
- [ ] Can see and access Reports tab
- [ ] No restrictions on any features

## Future Enhancements

1. **Backend Authorization:** Implement server-side permission checks
2. **More Granular Permissions:** Add permissions for specific features (edit sprint, manage members, etc.)
3. **Custom Role Editor:** Allow admins to create custom roles with specific permissions
4. **Permission Caching:** Cache user permissions to reduce API calls
5. **Audit Logging:** Track permission-denied attempts for security monitoring

## Migration Notes

To apply these permissions to other views (List, Calendar, etc.):

1. Import `useProjectRole` hook
2. Get permissions: `const { permissions } = useProjectRole()`
3. Add permission checks before actions
4. Hide UI elements based on permissions
5. Show toast errors when actions are blocked

Example:

```typescript
const handleDelete = () => {
  if (!permissions.canDelete) {
    toast.error("Bạn không có quyền xóa công việc");
    return;
  }
  // Proceed with delete
};
```
