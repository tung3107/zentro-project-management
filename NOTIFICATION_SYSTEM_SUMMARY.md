# Notification System Implementation Summary

## Backend Implementation

### 1. Database Model

- **File**: `d:/doanha/server/models/Notification.js`
- **Table**: `notifications`
- **SQL Script**: `d:/doanha/server/migrations/create_notifications_table.sql`

**Fields**:

- notification_id (primary key)
- user_id (recipient)
- type (enum: task_assigned, comment_mention, comment_on_task, sprint_started, sprint_completed)
- title, message
- task_id, sprint_id, comment_id, project_id (references)
- actor_id (who triggered the notification)
- is_read (boolean)
- link (navigation URL)
- created_at

### 2. Service Layer

- **File**: `d:/doanha/server/services/notification.service.js`

**Key Methods**:

- `createNotification()` - Create and emit new notification
- `getUserNotifications()` - Get notifications with pagination and filters
- `getUnreadCount()` - Count unread notifications
- `markAsRead()` - Mark single notification as read
- `markAllAsRead()` - Mark all user notifications as read
- `notifyTaskAssigned()` - Send task assignment notification
- `notifyCommentMention()` - Send mention notification
- `notifyCommentOnTask()` - Notify task assignee/reporter of new comment
- `notifySprintStarted()` - Notify all project members of sprint start
- `notifySprintCompleted()` - Notify all project members of sprint completion

### 3. Controller Layer

- **File**: `d:/doanha/server/controllers/notification.controller.js`

**Endpoints**:

- GET `/api/v1/notifications` - Get all notifications
- GET `/api/v1/notifications/unread-count` - Get unread count
- PATCH `/api/v1/notifications/:notificationId/read` - Mark as read
- PATCH `/api/v1/notifications/mark-all-read` - Mark all as read
- DELETE `/api/v1/notifications/:notificationId` - Delete notification

### 4. Routes

- **File**: `d:/doanha/server/routes/notification.routes.js`
- All routes protected with authentication

### 5. Integration with Existing Services

**Task Service** (`d:/doanha/server/services/task.service.js`):

- Added notification trigger when assignee changes

**Comment Service** (`d:/doanha/server/services/comment.service.js`):

- Send notifications for user mentions
- Send notifications to task assignee/reporter when commented

**Sprint Service** (`d:/doanha/server/services/sprint.service.js`):

- Send notifications when sprint starts
- Send notifications when sprint completes

### 6. Real-time with Socket.io

- Notifications emitted via existing socket connection
- Event: `new_notification`
- Automatically sent to user's socket when notification created

## Frontend Implementation

### 1. TypeScript Types

- **File**: `d:/doanha/client/zentro-frontend/src/types/notification.ts`
- Defines Notification interface with all fields and relationships

### 2. API Service

- **File**: `d:/doanha/client/zentro-frontend/src/feature/member/service/notification.service.ts`

**Methods**:

- `getNotifications()` - Fetch notifications with filters
- `getUnreadCount()` - Get unread count
- `markAsRead()` - Mark single as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification()` - Delete notification

### 3. Components

#### NotificationProvider

- **File**: `d:/doanha/client/zentro-frontend/src/feature/member/components/notification/NotificationProvider.tsx`
- Context provider for notification state
- Socket.io connection for real-time notifications
- Manages unread count globally
- Shows toast notifications

#### NotificationToast

- **File**: `d:/doanha/client/zentro-frontend/src/feature/member/components/notification/NotificationToast.tsx`
- Real-time toast notification popup
- Auto-dismisses after 5 seconds
- Shows at top-right of screen
- Click to navigate to relevant page
- Animated entrance/exit

#### NotificationModal

- **File**: `d:/doanha/client/zentro-frontend/src/feature/member/components/notification/NotificationModal.tsx`
- Full notification center modal
- Filter by all/unread
- Mark individual or all as read
- Delete notifications
- Navigate to relevant pages on click
- Skeleton loading states

### 4. Integration

**MemberSideBar** (`d:/doanha/client/zentro-frontend/src/feature/member/components/layout/MemberSideBar.tsx`):

- Added notification bell icon with unread badge
- Opens notification modal on click
- Uses `useNotification()` hook for unread count

**MemberMainLayout** (`d:/doanha/client/zentro-frontend/src/feature/member/components/layout/MemberMainLayout.tsx`):

- Wrapped with `NotificationProvider`
- Enables notifications throughout member area

## Features

### Notification Types

1. **Task Assigned** (task_assigned)

   - Triggered when a user is assigned to a task
   - Link: Task detail in backlog

2. **Comment Mention** (comment_mention)

   - Triggered when user is @mentioned in a comment
   - Link: Task detail with comment

3. **Comment on Task** (comment_on_task)

   - Triggered when someone comments on user's assigned/reported task
   - Link: Task detail with comment

4. **Sprint Started** (sprint_started)

   - Triggered when sprint begins
   - Notifies all project members
   - Link: Project backlog

5. **Sprint Completed** (sprint_completed)
   - Triggered when sprint is completed
   - Notifies all project members
   - Link: Project backlog

### UI Features

- **Real-time Toast Notifications**: Pop up immediately when notification received
- **Unread Badge**: Red badge showing unread count on notification bell
- **Filter**: View all or only unread notifications
- **Mark as Read**: Individual or bulk marking
- **Delete**: Remove individual notifications
- **Navigation**: Click to go to relevant page
- **Actor Info**: Shows who triggered the notification with avatar
- **Timestamps**: Relative time display (e.g., "5 minutes ago")
- **Type Icons**: Different icons for each notification type
- **Loading States**: Skeleton loaders while fetching

## Database Migration

Run the SQL script to create the notifications table:

```bash
mysql -u your_username -p your_database < d:/doanha/server/migrations/create_notifications_table.sql
```

Or execute the SQL directly in your database:

```sql
-- See d:/doanha/server/migrations/create_notifications_table.sql
```

## Usage

1. **Backend**: Already integrated with task, comment, and sprint services
2. **Frontend**: Notification system active in all member pages
3. **Real-time**: Socket.io automatically handles real-time delivery
4. **Unread Count**: Updates automatically across all tabs/windows

## Styling

All components use:

- Font: 'Space Grotesk' (consistent with CalendarTab and CalendarView)
- Tailwind CSS classes
- Smooth transitions and animations
- Responsive design

## Notes

- Notifications are user-specific and only visible to the recipient
- Real-time requires active socket connection
- Unread count refreshes on page load and real-time updates
- Deleted notifications are removed from database
- All routes are protected with authentication
