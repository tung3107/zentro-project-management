# Tính năng Block/Unblock trong Chat 1-1

## Tổng quan

Đã hoàn thành tính năng block/unblock người dùng trong chat 1-1 với UI tương tự Messenger. Khi một người dùng bị block hoặc block người khác, phần input chat sẽ được ẩn đi và hiển thị UI thông báo với khả năng unblock.

## Các thay đổi

### Backend

#### 1. **Service Layer** (`server/services/chat.service.js`)

- **Thêm method `unblockUser()`**: Cho phép người dùng bỏ chặn người khác

  - Chỉ người thực hiện block mới có quyền unblock
  - Cập nhật các trường `is_blocked`, `blocked_by`, `blocked_at` trong bảng `ChatMember`

- **Cập nhật method `getAllChatsForUser()`**:
  - Include thông tin block status từ bảng `ChatMember`
  - Trả về các trường mới:
    - `isBlocked`: Có block hay không
    - `blockedBy`: ID người thực hiện block
    - `iBlockedThem`: Bạn đã block người kia
    - `theyBlockedMe`: Người kia đã block bạn

#### 2. **Controller Layer** (`server/controllers/chat.controller.js`)

- **Thêm controller `unblockUser`**: Xử lý request POST `/api/chats/:chatId/unblock`

#### 3. **Routes** (`server/routes/chat.routes.js`)

- **Thêm route**: `POST /api/chats/:chatId/unblock`

#### 4. **Socket Events** (`server/socket.js`)

- **Thêm event handlers**:
  - `user_blocked`: Khi có người bị block
  - `user_unblocked`: Khi có người được unblock
- Cả hai event đều broadcast đến tất cả người dùng trong chat room và notify trực tiếp cho người bị ảnh hưởng

### Frontend

#### 1. **Types** (`client/zentro-frontend/src/types/chat.tsx`)

- **Cập nhật interface `Chat`** với các trường mới:
  ```typescript
  isBlocked?: boolean
  blockedBy?: string | null
  iBlockedThem?: boolean
  theyBlockedMe?: boolean
  ```

#### 2. **Service Layer** (`client/zentro-frontend/src/feature/member/service/chat.service.ts`)

- **Thêm method `unblockUser()`**: Gọi API unblock

#### 3. **Component BlockedChatUI** (`client/zentro-frontend/src/feature/member/components/chat/BlockedChatUI.tsx`)

- **Component mới** thay thế ChatInput khi có block
- **2 trạng thái hiển thị**:
  1. **Bạn đã block người khác**:
     - Hiển thị icon Ban màu đỏ
     - Text: "Bạn đã chặn {tên người dùng}"
     - Button "Bỏ chặn" để unblock
  2. **Người khác block bạn**:
     - Hiển thị icon Ban màu xám
     - Text: "Bạn không thể gửi tin nhắn"
     - Không có button (chỉ người block mới unblock được)

#### 4. **Chat Page** (`client/zentro-frontend/src/feature/member/pages/Chat.tsx`)

- **Cập nhật logic render**:

  - Kiểm tra `selectedChat.isBlocked` và `selectedChat.is_group`
  - Nếu là chat 1-1 và có block → hiển thị `BlockedChatUI`
  - Nếu không → hiển thị `ChatInput` bình thường

- **Thêm handlers**:

  - `handleUnblockUser()`: Xử lý unblock, emit socket event, reload chats
  - `handleUserBlocked()`: Socket listener để reload chats khi có block
  - `handleUserUnblocked()`: Socket listener để reload chats khi có unblock

- **Cập nhật `handleBlockUser()`**:
  - Emit socket event sau khi block
  - Reload chats để cập nhật UI
  - Đóng settings panel

#### 5. **Socket Client** (`client/zentro-frontend/src/util/socketClient.ts`)

- **Thêm emit methods**:

  - `userBlocked(chatId, userId)`
  - `userUnblocked(chatId, userId)`

- **Thêm listeners**:

  - `onUserBlocked(callback)`
  - `onUserUnblocked(callback)`

- **Thêm off methods**:
  - `offUserBlocked()`
  - `offUserUnblocked()`

## Luồng hoạt động

### Block User

1. User A click "Chặn" trong Settings Panel của chat với User B
2. Frontend gọi API `POST /api/chats/:chatId/block`
3. Backend cập nhật `is_blocked = true` cho User B trong `ChatMember`
4. Frontend emit socket event `user_blocked`
5. Backend broadcast event đến tất cả users trong chat
6. Cả User A và User B đều reload chats list
7. User A thấy UI "Bạn đã chặn {User B}" với button "Bỏ chặn"
8. User B thấy UI "Bạn không thể gửi tin nhắn"

### Unblock User

1. User A (người đã block) click "Bỏ chặn"
2. Frontend gọi API `POST /api/chats/:chatId/unblock`
3. Backend kiểm tra quyền (chỉ người block mới unblock được)
4. Backend cập nhật `is_blocked = false` cho User B
5. Frontend emit socket event `user_unblocked`
6. Backend broadcast event đến tất cả users trong chat
7. Cả User A và User B đều reload chats list
8. UI trở về bình thường với ChatInput

## UI/UX

### Khi bạn block người khác

```
┌─────────────────────────────────────┐
│     🚫 (icon màu đỏ)                │
│                                      │
│   Bạn đã chặn Nguyễn Văn A          │
│   Bạn sẽ không thể nhận tin nhắn    │
│   từ người này cho đến khi bỏ chặn  │
│                                      │
│   [ 🛡️ Bỏ chặn ]                    │
└─────────────────────────────────────┘
```

### Khi bạn bị block

```
┌─────────────────────────────────────┐
│     🚫 (icon màu xám)               │
│                                      │
│   Bạn không thể gửi tin nhắn        │
│   Bạn không thể gửi tin nhắn hoặc   │
│   gọi cho Nguyễn Văn A              │
└─────────────────────────────────────┘
```

## Database Schema

Bảng `chat_members` đã có sẵn các trường:

- `is_blocked` (BOOLEAN): Trạng thái block
- `blocked_by` (STRING): ID người thực hiện block
- `blocked_at` (DATE): Thời gian block

## API Endpoints

### Block User

```
POST /api/chats/:chatId/block
Body: { user_id: string }
```

### Unblock User (MỚI)

```
POST /api/chats/:chatId/unblock
Body: { user_id: string }
```

## Socket Events

### Emit Events

- `user_blocked`: { chatId, userId }
- `user_unblocked`: { chatId, userId }

### Listen Events

- `user_blocked`: Khi có user bị block
- `user_unblocked`: Khi có user được unblock

## Lưu ý

1. **Chỉ áp dụng cho chat 1-1**: Group chat không có chức năng block
2. **Quyền unblock**: Chỉ người thực hiện block mới có quyền unblock
3. **Real-time updates**: Sử dụng Socket.IO để cập nhật real-time cho cả hai bên
4. **UI responsive**: Chat list tự động reload khi có thay đổi block status

## Testing

Để test tính năng:

1. Tạo chat 1-1 giữa 2 users
2. User A block User B từ Settings Panel
3. Kiểm tra UI của User A (hiển thị "Bạn đã chặn..." với button Bỏ chặn)
4. Kiểm tra UI của User B (hiển thị "Bạn không thể gửi tin nhắn...")
5. User A click "Bỏ chặn"
6. Kiểm tra cả 2 users đều trở về UI bình thường với ChatInput
