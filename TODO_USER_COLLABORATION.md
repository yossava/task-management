# TODO: User Collaboration & Team Features

## Overview
This document outlines the plan for implementing a proper user invitation and collaboration system for the task management application.

## Current State
- User authentication is implemented with NextAuth
- Users can create and manage their own boards and tasks
- Assignee functionality has been removed (was using localStorage mock data)
- Guest access is supported for non-authenticated users

## Future Implementation Plan

### Phase 1: User Invitation System

#### 1. Email Infrastructure Setup
- [ ] Configure SMTP service (SendGrid, AWS SES, or similar)
- [ ] Create email templates for invitations
- [ ] Set up environment variables for email configuration
- [ ] Implement email sending service (`src/lib/services/emailService.ts`)

#### 2. Database Schema Updates
```prisma
model Invitation {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  email       String
  token       String   @unique
  boardId     String?  @db.ObjectId
  role        String   @default("member") // owner, admin, member, viewer
  invitedBy   String   @db.ObjectId
  expiresAt   DateTime
  acceptedAt  DateTime?
  createdAt   DateTime @default(now())

  board       Board?   @relation(fields: [boardId], references: [id], onDelete: Cascade)
  inviter     User     @relation("SentInvitations", fields: [invitedBy], references: [id])

  @@index([email])
  @@index([token])
  @@index([boardId])
  @@map("invitations")
}

model BoardMember {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  boardId   String   @db.ObjectId
  userId    String   @db.ObjectId
  role      String   @default("member") // owner, admin, member, viewer
  joinedAt  DateTime @default(now())

  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([boardId, userId])
  @@index([boardId])
  @@index([userId])
  @@map("board_members")
}

// Add to Task model
model Task {
  // ... existing fields
  assigneeId  String?  @db.ObjectId
  assignee    User?    @relation(fields: [assigneeId], references: [id], onDelete: SetNull)
}

// Add to User model
model User {
  // ... existing fields
  invitationsSent     Invitation[]  @relation("SentInvitations")
  boardMemberships    BoardMember[]
  assignedTasks       Task[]
}
```

#### 3. API Endpoints

**Invitation Management:**
- `POST /api/boards/[id]/invitations` - Send invitation
- `GET /api/invitations` - List user's invitations
- `POST /api/invitations/[token]/accept` - Accept invitation
- `DELETE /api/invitations/[id]` - Revoke invitation

**Board Member Management:**
- `GET /api/boards/[id]/members` - List board members
- `PUT /api/boards/[id]/members/[userId]` - Update member role
- `DELETE /api/boards/[id]/members/[userId]` - Remove member

**Task Assignment:**
- `POST /api/tasks/[id]/assign` - Assign task to user
- `DELETE /api/tasks/[id]/assign` - Unassign task

#### 4. UI Components

**Invitation Flow:**
- `InviteUsersModal.tsx` - Modal to send invitations
- `InvitationList.tsx` - List of pending invitations
- `AcceptInvitationPage.tsx` - Public page to accept invitation
- `BoardMembersList.tsx` - Display and manage board members

**Task Assignment:**
- `AssigneeSelector.tsx` - Dropdown to select assignee from board members
- `AssigneeAvatar.tsx` - Display assigned user avatar
- `MyTasksView.tsx` - Filter to show only tasks assigned to current user

#### 5. Permissions & Authorization
- [ ] Implement role-based access control (RBAC)
- [ ] Board roles: Owner, Admin, Member, Viewer
- [ ] Define permissions for each role:
  - **Owner**: Full control, can delete board, manage all members
  - **Admin**: Can invite users, manage tasks, cannot delete board
  - **Member**: Can create and edit tasks, cannot manage members
  - **Viewer**: Read-only access
- [ ] Middleware to check permissions on API routes
- [ ] UI components that respect user permissions

### Phase 2: Real-time Collaboration

#### 1. WebSocket Integration
- [ ] Set up WebSocket server (Socket.io or Pusher)
- [ ] Implement real-time task updates
- [ ] Show online/offline status of board members
- [ ] Live cursor/presence indicators

#### 2. Activity Feed
- [ ] Log all board/task changes
- [ ] Display activity timeline
- [ ] Notifications for mentions and assignments

### Phase 3: Team Features

#### 1. Mentions & Notifications
- [ ] @mention users in comments
- [ ] Email notifications for mentions
- [ ] In-app notification center
- [ ] Notification preferences

#### 2. Team Workload View
- [ ] Dashboard showing tasks per user
- [ ] Capacity planning
- [ ] Team velocity metrics

## Technical Considerations

### Security
- Use secure, random tokens for invitations
- Set expiration time for invitation links (e.g., 7 days)
- Validate user permissions on every API request
- Implement rate limiting on invitation endpoints
- CSRF protection for all mutation endpoints

### Email Best Practices
- Use transactional email service with good deliverability
- Implement email verification for new users
- Unsubscribe links for notification emails
- Email templates with proper styling and branding

### Performance
- Index database queries on userId, boardId, email
- Cache board member lists
- Optimize WebSocket connection handling
- Lazy load user avatars

### User Experience
- Clear onboarding flow for invited users
- Graceful handling of expired invitations
- Intuitive role management UI
- Mobile-friendly invitation acceptance page

## Migration Path

1. Implement core invitation system (Phase 1.1-1.3)
2. Add UI components for inviting users (Phase 1.4)
3. Implement permissions system (Phase 1.5)
4. Test thoroughly with multiple users
5. Deploy to production
6. Monitor and iterate based on user feedback
7. Proceed with Phase 2 (real-time features)

## Dependencies

### NPM Packages
```json
{
  "@sendgrid/mail": "^7.7.0",  // or similar email service
  "nanoid": "^5.0.0",           // for secure token generation
  "socket.io": "^4.6.0",        // for real-time features (Phase 2)
  "socket.io-client": "^4.6.0"
}
```

### Environment Variables
```env
# Email Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-api-key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your App Name

# Application URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com
INVITATION_EXPIRY_DAYS=7
```

## Testing Strategy

1. **Unit Tests**
   - Email service functions
   - Token generation and validation
   - Permission checking logic

2. **Integration Tests**
   - Invitation flow end-to-end
   - Role-based access control
   - Board member CRUD operations

3. **E2E Tests**
   - User receives and accepts invitation
   - Board owner manages members
   - Task assignment workflow

## Open Questions

1. Should board invitations require email verification for new users?
2. Should we support team-level organizations (multiple boards)?
3. What should happen to tasks when a user is removed from a board?
4. Should we allow public board sharing (view-only links)?
5. Do we need a waiting room for join requests?

## References

- [NextAuth.js Invitations Guide](https://next-auth.js.org/)
- [Prisma RBAC Pattern](https://www.prisma.io/blog/authorization)
- [SendGrid API Documentation](https://docs.sendgrid.com/)
- [Socket.io Best Practices](https://socket.io/docs/v4/)

---

**Status**: Planned - Not yet implemented
**Last Updated**: 2025-10-12
**Priority**: High (required for multi-user collaboration)
