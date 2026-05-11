# Database Seeding System - Architecture Diagram

## System Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER STARTUP                          │
│                         (server.js)                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  connectDB() - Connect to MongoDB  │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │  initializeDatabase()              │ ◄─── NEW
        │  (seeders/initializeDatabase.js)   │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │  isDatabaseSeeded()                │
        │  - Check if data exists            │
        └────────────┬───────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
    Already Seeded?       Not Seeded?
          │                     │
          ▼                     ▼
      (skip)         seedDefaultData()
                     (seeders/seedDefaultData.js)
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Create Industries Create Orgs   Create Branches
        - Hospital        - Central    - Hospital
        - Bank            - National   - Bank
        - Police          - City PD    - Police
              │              │              │
              └──────────────┴──────────────┘
                             │
                             ▼
                    Create Wards for Branches
                    - OPD, Pharmacy, etc.
                    - Cashier, Inquiries, etc.
                    - Complaints, Traffic, etc.
                             │
                             ▼
                    ✨ Seeding Complete ✨
                    Server continues...
```

## Data Model Relationships

```
┌──────────────────────────┐
│   IndustryType (3)       │
│  ┌────────────────────┐  │
│  │ Hospital           │  │
│  │ Bank               │  │
│  │ Police             │  │
│  └────────────────────┘  │
└────────────┬─────────────┘
             │
             │ references
             ▼
┌──────────────────────────────┐
│  Organization (3)            │
│  ┌──────────────────────────┐│
│  │ Central Hospital         ││
│  │ National Bank            ││
│  │ City Police Department   ││
│  └──────────────────────────┘│
└────────────┬─────────────────┘
             │
             │ contains
             ▼
┌────────────────────────────────────┐
│  Branch (5)                        │
│  ┌────────────────────────────────┐│
│  │ Hospital - Main Campus         ││
│  │ Bank - Downtown                ││
│  │ Bank - Westside                ││
│  │ Police - Main Station          ││
│  │ Police - North Station         ││
│  └────────────────────────────────┘│
└────────────┬───────────────────────┘
             │
             │ contains
             ▼
┌────────────────────────────────────┐
│  Ward (15+)                        │
│  ┌────────────────────────────────┐│
│  │ OPD, Pharmacy, Emergency, Lab  ││
│  │ Cashier, Inquiries, Loans, ... ││
│  │ Complaints, Traffic, Patrol... ││
│  └────────────────────────────────┘│
└────────────────────────────────────┘
```

## File Structure & Integration

```
Backend/
│
├── 🌱 seeders/ (NEW DIRECTORY)
│   ├── seedDefaultData.js
│   │   └─► Default data configuration
│   │   └─► seedDefaultData() - Core seeding function
│   │   └─► cleanupDatabase() - Reset data
│   │   └─► isDatabaseSeeded() - Check status
│   │
│   ├── initializeDatabase.js
│   │   └─► Auto-init hook for server startup
│   │
│   ├── SEEDING_GUIDE.md
│   │   └─► Comprehensive documentation
│   │
│   └── QUICK_REFERENCE.md
│       └─► Quick lookup guide
│
├── controllers/
│   ├── branchController.js (existing)
│   └── seederController.js (NEW)
│       ├─► seedDatabase() endpoint
│       ├─► cleanupDatabaseEndpoint() endpoint
│       └─► getSeedStatus() endpoint
│
├── routes/
│   ├── branchRoutes.js (existing)
│   └── seederRoutes.js (NEW)
│       ├─► GET /api/seeders/status
│       ├─► POST /api/seeders/seed-default-data
│       └─► POST /api/seeders/cleanup
│
├── app.js (UPDATED)
│   └─► Added seederRouter import
│
├── server.js (UPDATED)
│   └─► Added initializeDatabase() call
│
└── [other existing files...]

INTEGRATION POINTS:
  • app.js: Imports seederRoutes
  • server.js: Calls initializeDatabase() after DB connect
  • Existing models: Used as-is (no changes needed)
```

## API Endpoint Flow

```
Request to /api/seeders/*
         │
         ├─► Public (/status)
         │   └─► No authentication required
         │       └─► Check if database is seeded
         │
         ├─► Protected (/seed-default-data, /cleanup)
         │   └─► authMiddleware
         │       └─► Verify super_admin role
         │           └─► Execute seeding logic
         │
         └─► Response
             ├─► 200 OK
             ├─► 201 Created
             ├─► 400 Bad Request
             ├─► 401 Unauthorized
             ├─► 403 Forbidden
             └─► 500 Server Error
```

## Data Flow on Server Start

```
1. Server starts (server.js)
   │
2. Connect to MongoDB ✓
   │
3. Call initializeDatabase() ◄─── NEW
   │
4. Check if data exists
   │
   ├─► YES ──► Skip seeding ──► Continue startup ✓
   │
   └─► NO ──► Call seedDefaultData() ──► Create all default data
                                           │
                                           ├─► 3 Industries
                                           ├─► 3 Organizations
                                           ├─► 5 Branches
                                           └─► 15+ Wards
                                               │
                                               └─► ✨ Ready to use!
```

## Default Data Summary

```
INDUSTRIES (3)                 ORGANIZATIONS (3)
┌─────────────────┐           ┌──────────────────────┐
│ Hospital        │           │ Central Hospital     │
│ Bank            │           │ National Bank        │
│ Police          │           │ City Police Dept     │
└─────────────────┘           └──────────────────────┘

BRANCHES (5)                   WARDS (15+)
┌─────────────────────────────┐ ┌──────────────────────┐
│ Hospital - Main Campus  (1) │ │ OPD                  │
│ Bank - Downtown         (2) │ │ Pharmacy             │
│ Bank - Westside         (2) │ │ Emergency            │
│ Police - Main Station   (2) │ │ Laboratory           │
│ Police - North Station  (2) │ │                      │
│                             │ │ Cashier              │
│ TOTAL: 5 Branches           │ │ Inquiries            │
│ TOTAL: 15+ Wards            │ │ Loans                │
└─────────────────────────────┘ │ Investments          │
                                │ Account Opening      │
                                │                      │
                                │ Complaints           │
                                │ Traffic              │
                                │ Lost & Found         │
                                │ Records              │
                                │ Patrol               │
                                └──────────────────────┘
```

## Request Flow for Seed Endpoint

```
POST /api/seeders/seed-default-data
│
├─► Check Authentication
│   └─► req.user exists? ──► NO ──► 401 Unauthorized
│                      │
│                      └─► YES ──► Check Role
│                                  │
│                                  ├─► super_admin? ──► NO ──► 403 Forbidden
│                                  │
│                                  └─► YES ──► Continue
│
├─► Check if Already Seeded
│   └─► isDatabaseSeeded() ──► YES ──► 200 (Already Seeded)
│                         │
│                         └─► NO ──► Continue
│
├─► Seed Industries
│   └─► Create 3 industries
│       └─► Check for duplicates before creating
│
├─► Seed Organizations
│   └─► Create 3 organizations
│       └─► Link to correct industry types
│
├─► Seed Branches
│   └─► Create 5 branches
│       ├─► Link to organization
│       ├─► Link to industry type
│       └─► Create wards for each branch
│
└─► Response 201 Created
    └─► Return stats: industries, organizations, branches, wards created
```

## Security & Access Control

```
AUTHENTICATION FLOW:
  Request ──► authMiddleware ──► Verify token
                                    │
                                    ├─► Invalid ──► 401
                                    │
                                    └─► Valid ──► Extract user
                                                   │
AUTHORIZATION FLOW:                              └─► Check role
  User role ──► is super_admin? ──► NO ──► 403 Forbidden
                              │
                              └─► YES ──► Allow operation
                                         │
                                         ├─► Seed database
                                         ├─► Cleanup database
                                         └─► Other operations

STATUS ENDPOINT:
  GET /api/seeders/status ──► No auth required ──► 200 OK (with seed status)
```

## Data Integrity

```
Database Checks:
  ┌─────────────────────────────────────────┐
  │ Before Creating Each Item:              │
  │ 1. Check if already exists              │
  │ 2. Validate required fields             │
  │ 3. Check foreign key references         │
  │ 4. Validate unique constraints          │
  │ 5. Create if all checks pass            │
  │ 6. Log errors if creation fails         │
  └─────────────────────────────────────────┘

Duplicate Prevention:
  - IndustryType: Check by code (hospital, bank, police)
  - Organization: Check by name + tenantType
  - Branch: Check by branchCode
  - Ward: Check by branchId + name

Relationships:
  - Branch.industryType → IndustryType._id (required)
  - Branch.organizationId → Organization._id (required for non-police)
  - Ward.branchId → Branch._id (required)
```

## Error Handling & Logging

```
Seeding Process:
  ┌──────────────┐
  │  Try Seed    │
  └──────┬───────┘
         │
    ┌────┴─────────┬─────────────┐
    ▼              ▼             ▼
 Success       Partial Error    Fatal Error
    │              │             │
    └─ Log stats   ├─ Log items  └─ Log error
    └─ Return 201  ├─ Log errors └─ Return 500
                   └─ Return 201 with errors
                     in response body
```

---

## Integration Checklist

- [x] seedDefaultData.js created with all default data
- [x] initializeDatabase.js created for auto-init
- [x] seederController.js created with 3 endpoints
- [x] seederRoutes.js created with route definitions
- [x] app.js updated to import seeder routes
- [x] server.js updated to call initializeDatabase()
- [x] Comprehensive documentation created
- [x] Quick reference guide created
- [x] Testing scripts created (bash + PowerShell)
- [x] No changes needed to existing models

---

**System is production-ready!** 🚀
