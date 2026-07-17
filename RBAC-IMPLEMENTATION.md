# Role-Based Access Control System - Implementation Guide

## Overview

This document outlines the complete role-based access control (RBAC) system implemented for the Student Risk System. The system supports three distinct user roles: **Student**, **Lecturer**, and **Admin**, each with separate models, dashboards, and access levels.

---

## System Architecture

### Backend Structure

#### 1. **User Model** ([backend/src/models/User.ts](backend/src/models/User.ts))
Base user model for all roles with the following fields:
- `email`: Unique identifier
- `password`: Hashed password
- `role`: Enum - 'student', 'lecturer', 'admin'
- `name`, `phoneNumber`, `profilePicture`
- `verified`, `isActive`
- `loginAttempts`, `lockoutUntil`
- `lastLogin`, timestamps

#### 2. **Role-Specific Models**

##### Student Model ([backend/src/models/Student.ts](backend/src/models/Student.ts))
Links to User via `userId`, includes:
- Academic metrics: GPA, attendance, assignment scores, participation
- Risk assessment: riskLevel, riskProbability
- Engagement tracking: libraryVisits, lmsActivity, lateSubmissions
- Wellbeing data: studyHours, sleepHours, stressLevel
- Academic advisor assignment

##### Lecturer Model ([backend/src/models/Lecturer.ts](backend/src/models/Lecturer.ts))
Links to User via `userId`, includes:
- Professional info: department, specialization, qualifications
- Teaching: taughtCourses list
- Advisory: advisedStudents list
- Office info: location, hours, bio

##### Admin Model ([backend/src/models/Admin.ts](backend/src/models/Admin.ts))
Links to User via `userId`, includes:
- Permissions: canCreateUsers, canDeleteUsers, canEditSystem, canViewReports, canManageLecturers, canManageStudents
- Activity log: tracks all admin actions
- User management: totalUsersManaged

---

## Authentication Flow

### Registration Process

**Endpoint**: `POST /api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "SecurePassword123",
  "role": "student",
  "additionalData": {
    "department": "Computer Science",
    "level": "200"
  }
}
```

**Flow**:
1. Validate input
2. Check if email exists
3. Hash password
4. Create User record
5. Create role-specific profile (Student/Lecturer/Admin)
6. Send verification email
7. Return user data with role

### Login Process

**Endpoint**: `POST /api/auth/login`

```json
{
  "email": "john@university.edu",
  "password": "SecurePassword123"
}
```

**Flow**:
1. Find user by email
2. Check account lockout status
3. Verify password
4. On failure: increment login attempts, lock if >= 5 attempts
5. On success: reset attempts, generate JWT tokens (15min access, 7day refresh)
6. Return user data with role
7. **Frontend saves user to localStorage for role-based routing**

---

## Backend Routes

### Authentication Routes
```
POST   /api/auth/register        - User registration
POST   /api/auth/login           - User login
POST   /api/auth/logout          - User logout
GET    /api/auth/refresh         - Refresh token
```

### Student Routes (Requires: student role)
```
GET    /api/student/dashboard    - Get student dashboard data
PUT    /api/student/profile      - Update student profile
GET    /api/student/predictions  - Get risk predictions
```

### Lecturer Routes (Requires: lecturer role)
```
GET    /api/lecturer/dashboard     - Get lecturer dashboard
PUT    /api/lecturer/profile       - Update lecturer profile
GET    /api/lecturer/students      - Get advised students
GET    /api/lecturer/students/:id  - Get specific student details
```

### Admin Routes (Requires: admin role)
```
GET    /api/admin/dashboard        - Get admin dashboard
GET    /api/admin/users            - List all users with filtering
POST   /api/admin/users            - Create new user
DELETE /api/admin/users/:userId    - Delete user
PUT    /api/admin/users/:id/status - Toggle user active status
GET    /api/admin/reports          - Get system reports
```

---

## Middleware Implementation

### Auth Middleware ([backend/src/middleware/auth.ts](backend/src/middleware/auth.ts))

**`authMiddleware`**
- Extracts JWT from cookies or Authorization header
- Verifies token signature
- Fetches user from database
- Checks if account is active
- Attaches user and role to request

**`roleMiddleware(...roles)`**
- Generic role checker for multiple roles
- Usage: `roleMiddleware('student', 'lecturer')`

**Specific Role Middleware**
- `studentOnly` - Only students can access
- `lecturerOnly` - Only lecturers can access
- `adminOnly` - Only admins can access

### Usage Example
```typescript
router.get('/dashboard', authMiddleware, studentOnly, controller);
```

---

## Frontend Structure

### Login Flow
1. User enters credentials
2. Backend validates and returns user object with role
3. **Frontend saves to localStorage**: `localStorage.setItem('user', JSON.stringify(user))`
4. User redirected to `/dashboard`

### Dashboard Routing

**Main Dashboard** ([app/dashboard/page.tsx](frontend/app/dashboard/page.tsx))
- Reads user role from localStorage
- Redirects to role-specific dashboard:
  - `student` → `/dashboard/student`
  - `lecturer` → `/dashboard/lecturer`
  - `admin` → `/dashboard/admin`

### Role-Specific Dashboards

#### Student Dashboard ([app/dashboard/student/page.tsx](frontend/app/dashboard/student/page.tsx))
- Personal academic metrics
- Current GPA, attendance, assignments
- Risk assessment status
- Wellbeing indicators
- Academic advisor information

#### Lecturer Dashboard ([app/dashboard/lecturer/page.tsx](frontend/app/dashboard/lecturer/page.tsx))
- Quick statistics: students advised, at-risk count, courses
- Profile information
- Table of advised students with GPA and risk status
- Clickable student records for detailed view

#### Admin Dashboard ([app/dashboard/admin/page.tsx](frontend/app/dashboard/admin/page.tsx))
- System-wide statistics: total users, active users, at-risk students
- Permissions overview
- User management table with filtering
- Actions: toggle active status, delete user (if permissions allow)

### Dashboard Layout ([app/dashboard/layout.tsx](frontend/app/dashboard/layout.tsx))
- Navigation bar with user info and logout
- Role badge display
- Mobile responsive menu
- Logout functionality

---

## Security Features

### Password Security
- Passwords hashed using bcrypt (12 salt rounds)
- Database stores only hashes
- Passwords never returned in API responses

### Account Lockout
- 5 failed login attempts lock account
- 30-minute lockout period
- Prevents brute force attacks

### Token Security
- JWT tokens signed with secret
- Access token: 15 minutes
- Refresh token: 7 days
- Tokens stored in HTTP-only cookies
- CSRF protection with SameSite

### Permission Enforcement
- Every protected route checks user role
- API returns 403 Forbidden if unauthorized
- Admin permissions granularly controlled

---

## Data Flow Example: Student View

```
1. Student logs in
   ↓
2. Backend validates credentials
   ↓
3. Backend returns user { id, role: 'student', name, email }
   ↓
4. Frontend saves to localStorage
   ↓
5. Frontend redirects to /dashboard
   ↓
6. Dashboard component reads role from localStorage
   ↓
7. Redirects to /dashboard/student
   ↓
8. Student dashboard fetches GET /api/student/dashboard
   ↓
9. Backend middleware verifies token and role
   ↓
10. Returns student profile + academic data
    ↓
11. Frontend displays student-specific dashboard
```

---

## Admin Operations Example

```
1. Admin logs in
   ↓
2. Navigates to /admin/users
   ↓
3. Can filter by role: student, lecturer, admin
   ↓
4. Views user list with status and actions
   ↓
5. Can toggle active/inactive status
   ↓
6. Can delete users (deletes role-specific profile too)
   ↓
7. Can view system reports
   ↓
8. All actions logged in Admin.activityLog
```

---

## Environment Variables

Backend (.env):
```
MONGO_URI=mongodb://localhost:27017/student-risk-system
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

---

## Testing Credentials

Use these for testing:

**Student**:
```json
{
  "email": "student@university.edu",
  "password": "StudentPass123"
}
```

**Lecturer**:
```json
{
  "email": "lecturer@university.edu",
  "password": "LecturerPass123"
}
```

**Admin**:
```json
{
  "email": "admin@university.edu",
  "password": "AdminPass123"
}
```

---

## Key Features Implemented

✅ Three distinct user roles with separate models  
✅ Role-based authentication with JWT  
✅ Account lockout after 5 failed attempts  
✅ Separate dashboards for each role  
✅ Role-specific API endpoints  
✅ Middleware for route protection  
✅ Admin user management  
✅ Activity logging for admins  
✅ Responsive design  
✅ Secure password handling  
✅ Token refresh mechanism  
✅ localStorage-based role detection  
✅ Automatic dashboard redirection  

---

## Future Enhancements

- Two-factor authentication
- Advanced permission management
- Role-based API rate limiting
- Audit trail for all user actions
- Email notifications for role-specific alerts
- SSO integration (LDAP/Active Directory)
- Session management per role
- API versioning for role compatibility
