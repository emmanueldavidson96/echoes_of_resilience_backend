# Creating Admin and Coach Accounts

## Quick Commands

### Create Admin Account (Default Credentials)
```bash
npm run create-admin
```
This creates:
- **Email:** admin@echoes.com
- **Password:** admin123
- **Role:** admin

### Create Coach Account (Default Credentials)
```bash
npm run create-coach
```
This creates:
- **Email:** coach@echoes.com
- **Password:** coach123
- **Role:** coach

## Custom Credentials

### Create Admin with Custom Details
```bash
node scripts/createUser.js admin "John" "Doe" "john.admin@echoes.com" "SecurePass123"
```

### Create Coach with Custom Details
```bash
node scripts/createUser.js coach "Jane" "Smith" "jane.coach@echoes.com" "SecurePass456"
```

## Login to Application

1. Go to: http://localhost:3000/sign-in
2. Enter the email and password
3. Admin users are redirected to: `/dashboard/dashboard-admin`
4. Coach users are redirected to: `/dashboard/dashboard-coach`

## Via Registration API (Alternative Method)

You can also create users via the registration endpoint:

### Create Admin via API
```bash
POST http://localhost:5001/api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@echoes.com",
  "password": "admin123",
  "role": "admin"
}
```

### Create Coach via API
```bash
POST http://localhost:5001/api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Coach",
  "lastName": "User",
  "email": "coach@echoes.com",
  "password": "coach123",
  "role": "coach"
}
```

## Available Roles
- `youth` - Youth users (default registration)
- `parent` - Parent/Guardian accounts
- `coach` - Mental health coaches
- `clinician` - Licensed clinicians
- `admin` - Platform administrators

## Notes
- All accounts created via script are automatically verified (emailVerified: true)
- Passwords are securely hashed before storage
- Each role has its own dashboard in the frontend
- Coach accounts automatically get a Coach profile created with default specializations
