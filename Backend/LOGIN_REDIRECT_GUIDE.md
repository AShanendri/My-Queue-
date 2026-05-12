# Login Redirect Implementation Guide

## Overview

The login system now includes role-based redirect URLs that tell the frontend where to send users after successful authentication.

## What Was Implemented

### 1. **Login Response Enhancement**

The `/auth/login` endpoint now returns a `redirectUrl` field along with the token and user data.

#### Login Request

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### Login Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "admin@example.com",
      "role": "hospital_super_admin",
      "tenantType": "hospital",
      "organizationId": "org_hospital_001"
    },
    "redirectUrl": "/admin/dashboard"
  }
}
```

### 2. **Redirect Logic by Role**

| Role                               | Redirect URL                  | Description                         |
| ---------------------------------- | ----------------------------- | ----------------------------------- |
| `super_admin`                      | `/admin-dashboard`            | Main admin dashboard                |
| `police_super_admin`               | `/admin/dashboard`            | Police industry dashboard           |
| `hospital_super_admin`             | `/admin/dashboard`            | Hospital industry dashboard         |
| `company_super_admin`              | `/admin/dashboard`            | Company/Bank/Supermarket dashboard  |
| `organization_admin` (police)      | `/police-admin/branches`      | Police organization management      |
| `organization_admin` (hospital)    | `/hospital-admin/branches`    | Hospital organization management    |
| `organization_admin` (bank)        | `/bank-admin/branches`        | Bank organization management        |
| `organization_admin` (supermarket) | `/supermarket-admin/branches` | Supermarket organization management |
| `branch_admin` (police)            | `/police-branch/dashboard`    | Police branch management            |
| `branch_admin` (hospital)          | `/hospital-branch/dashboard`  | Hospital branch management          |
| `branch_admin` (bank)              | `/bank-branch/dashboard`      | Bank branch management              |
| `staff` (police)                   | `/police-staff/dashboard`     | Police staff dashboard              |
| `staff` (hospital)                 | `/hospital-staff/dashboard`   | Hospital staff dashboard            |

### 3. **Get Redirect Info Endpoint (Optional)**

After login, the frontend can also call a dedicated endpoint to get redirect information:

```bash
GET /auth/redirect
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "redirectUrl": "/hospital-admin/branches",
  "user": {
    "id": "user_id",
    "role": "organization_admin",
    "tenantType": "hospital",
    "organizationId": "org_hospital_001"
  }
}
```

## Frontend Implementation Example

### Using the redirectUrl from Login Response

```javascript
// After login
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();

if (data.success) {
  // Save token
  localStorage.setItem("token", data.data.token);

  // Redirect based on role
  window.location.href = data.data.redirectUrl;
}
```

## Protecting Routes with authMiddleware

### Example: Protect a Route for Organization Admin Only

```javascript
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/authorizationMiddleware.js';

const router = express.Router();

// Protect route - only organization_admin can access
router.get(
  '/branches',
  authMiddleware,                          // Verify token
  authorizeRoles('organization_admin'),    // Check role
  (req, res) => {
    // req.user contains: id, email, role, tenantType, organizationId, etc.
    res.json({ branches: [...] });
  }
);

// Protect route - multiple roles allowed
router.get(
  '/staff',
  authMiddleware,
  authorizeRoles('organization_admin', 'branch_admin'),
  (req, res) => {
    res.json({ staff: [...] });
  }
);

// Protect route - industry-specific
router.get(
  '/hospital-stats',
  authMiddleware,
  authorizeRoles('hospital_super_admin', 'organization_admin'),
  requireTenantType('hospital'),  // Additional check for tenantType
  (req, res) => {
    res.json({ stats: [...] });
  }
);

export default router;
```

### Example: Protect Based on Tenant Type

```javascript
import { requireTenantType } from "../middlewares/authorizationMiddleware.js";

router.post(
  "/wards",
  authMiddleware,
  authorizeRoles("organization_admin", "branch_admin"),
  requireTenantType("hospital"), // Only allow for hospital tenants
  createWard,
);
```

## Available Middleware Functions

### authMiddleware

```javascript
import authMiddleware from "../middlewares/authMiddleware.js";

// Verifies JWT token and attaches req.user
router.get("/protected", authMiddleware, handler);
```

### authorizeRoles

```javascript
import { authorizeRoles } from "../middlewares/authorizationMiddleware.js";

// Checks if user has one of the specified roles
router.post(
  "/create-admin",
  authMiddleware,
  authorizeRoles("super_admin", "hospital_super_admin"),
  handler,
);
```

### requireTenantType

```javascript
import { requireTenantType } from "../middlewares/authorizationMiddleware.js";

// Checks if user's tenantType matches the requirement
router.put(
  "/branch/:id",
  authMiddleware,
  authorizeRoles("organization_admin"),
  requireTenantType("hospital"),
  handler,
);
```

## Protected Routes Examples

### Admin Routes (Hospital)

```javascript
// /api/admin/dashboard - for hospital_super_admin
router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("hospital_super_admin"),
  getDashboard,
);

// /api/admin/branches - for organization_admin with hospital tenantType
router.get(
  "/branches",
  authMiddleware,
  authorizeRoles("organization_admin"),
  requireTenantType("hospital"),
  getBranches,
);
```

### Branch Routes

```javascript
// /api/branch/:id/wards - for branch_admin with access to their own branch
router.get(
  "/:branchId/wards",
  authMiddleware,
  authorizeRoles("branch_admin", "staff"),
  getWards,
);
```

## Testing the Login Flow

### Step 1: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hospitaladmin@gmail.com",
    "password": "123456"
  }'
```

Expected response includes:

```json
{
  "redirectUrl": "/admin/dashboard",
  "user": {
    "role": "hospital_super_admin",
    "tenantType": "hospital"
  }
}
```

### Step 2: Use Redirect URL

The frontend should navigate to the `redirectUrl` provided in the login response.

### Step 3: Verify Protected Routes Work

```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer <token>"
```

## Environment Variables Required

```bash
# Super Admin Credentials (legacy/migration-safe)
SUPER_ADMIN_EMAIL=super@admin.com
SUPER_ADMIN_PASSWORD=superadminpass
SUPER_ADMIN_TENANT_TYPE=company

# Industry Super Admins
POLICE_ADMIN_EMAIL=police@admin.com
POLICE_ADMIN_PASSWORD=policepass

HOSPITAL_ADMIN_EMAIL=hospital@admin.com
HOSPITAL_ADMIN_PASSWORD=hospitalpass

COMPANY_ADMIN_EMAIL=company@admin.com
COMPANY_ADMIN_PASSWORD=companypass

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
```

## Summary

✅ **Login now returns redirectUrl** - Frontend can immediately redirect users to the correct page
✅ **authMiddleware protects all routes** - Verifies JWT tokens
✅ **authorizeRoles checks user roles** - Ensures role-based access control
✅ **requireTenantType enforces tenant isolation** - Prevents cross-tenant data access
✅ **Consistent role hierarchy** - Clear separation of concerns by role and industry
