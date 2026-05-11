# Database Seeding Guide

This guide explains how to use the database seeding system to populate your Queue Management System with default data.

## Overview

The seeding system automatically creates default data for:

- **3 Industries**: Hospital, Bank, Police
- **3+ Organizations**: One for each industry type
- **5+ Branches**: Default branches for each organization
- **15+ Wards**: Department-specific wards for each branch

## What Gets Seeded

### Industries

```
1. Hospital
   - Unit Label: Department
   - Staff Label: Doctor
   - Client Label: Patient

2. Bank
   - Unit Label: Counter
   - Staff Label: Teller
   - Client Label: Customer

3. Police
   - Unit Label: Section
   - Staff Label: Officer
   - Client Label: Citizen
```

### Default Organizations

```
1. Central Hospital (Hospital)
   - City: Central City
   - Contact: +1-555-0100

2. National Bank (Bank)
   - City: Financial District
   - Contact: +1-555-0200

3. City Police Department (Police)
   - City: Downtown
   - Contact: +1-555-0300
```

### Default Branches & Wards

#### Hospital - Central Hospital

**Branch**: Central Hospital - Main Campus (HOSPITAL-001)

- OPD (Outpatient Department)
- Pharmacy
- Emergency
- Laboratory

#### Bank - National Bank

**Branch 1**: National Bank - Downtown (BANK-001)

- Cashier
- Inquiries
- Loans
- Investments

**Branch 2**: National Bank - Westside (BANK-002)

- Cashier
- Inquiries
- Account Opening

#### Police - City Police Department

**Branch 1**: Main Station (POLICE-001) - Main Division

- Complaints
- Traffic
- Lost & Found
- Records

**Branch 2**: North Station (POLICE-002) - North Division

- Complaints
- Traffic
- Patrol

## Automatic Seeding

### On Server Startup

The database is **automatically seeded** when the server starts:

```bash
npm start
# or
node server.js
```

The system will:

1. Check if the database is already seeded
2. If not, automatically create all default data
3. If already seeded, skip and continue

**Console output example**:

```
📋 Database not seeded. Running default data seeding...

🌱 Seeding Industries...
✅ Created industry: Hospital
✅ Created industry: Bank
✅ Created industry: Police

🌱 Seeding Organizations...
✅ Created organization: Central Hospital
✅ Created organization: National Bank
✅ Created organization: City Police Department

🌱 Seeding Branches and Wards...
✅ Created branch: Central Hospital - Main Campus
  ├─ ✅ Created ward: OPD (Outpatient Department)
  ├─ ✅ Created ward: Pharmacy
  ├─ ✅ Created ward: Emergency
  ├─ ✅ Created ward: Laboratory
✅ Created branch: National Bank - Downtown
  ├─ ✅ Created ward: Cashier
  ├─ ✅ Created ward: Inquiries
  ├─ ✅ Created ward: Loans
  ├─ ✅ Created ward: Investments
...

✨ Seeding completed!
📊 Summary: 3 industries, 3 organizations, 5 branches, 15 wards
```

## Manual Seeding (API Endpoints)

### 1. Check Seed Status

```http
GET /api/seeders/status
```

**Response**:

```json
{
  "success": true,
  "message": "Seed status retrieved",
  "data": {
    "isSeeded": true,
    "message": "Database contains default seed data"
  }
}
```

### 2. Seed Database

```http
POST /api/seeders/seed-default-data
Authorization: Bearer <super_admin_token>
```

**Response (if not already seeded)**:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Database seeded successfully",
  "data": {
    "results": {
      "industriesCreated": 3,
      "organizationsCreated": 3,
      "branchesCreated": 5,
      "wardsCreated": 15,
      "errors": []
    },
    "message": "Default industries, organizations, branches, and wards have been created"
  }
}
```

**Response (if already seeded)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Database is already seeded with default data",
  "data": {
    "alreadySeeded": true,
    "message": "Default data already exists. No changes were made..."
  }
}
```

### 3. Cleanup Database (DANGEROUS!)

```http
POST /api/seeders/cleanup
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "confirmCleanup": true
}
```

⚠️ **WARNING**: This deletes ALL industries, organizations, branches, and wards!

**Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Database cleaned successfully",
  "data": {
    "message": "All default data has been removed"
  }
}
```

## Full Management Capabilities

Even though the data is seeded by default, you have **complete control**:

### ✅ Delete Any Data

- Delete industries via `DELETE /api/industry-types/:id`
- Delete organizations via `DELETE /api/organizations/:id`
- Delete branches via `DELETE /api/branches/:id`
- Delete wards via `DELETE /api/branches/:branchId/wards/:wardId` (or similar)

### ✅ Add New Data

- Create new industries via `POST /api/industry-types`
- Create new organizations via `POST /api/organizations`
- Create new branches via `POST /api/branches`
- Create new wards via `POST /api/branches/:branchId/wards`

### ✅ Update Any Data

- Update industries, organizations, branches, wards with PATCH/PUT requests

### ✅ Modify Default Data

- Edit branch names, contact info, status
- Modify ward names and descriptions
- Update organization details

## Seeder Configuration

The default data is defined in: `Backend/seeders/seedDefaultData.js`

To customize the seeded data:

1. Open `Backend/seeders/seedDefaultData.js`
2. Modify the `DEFAULT_DATA` object
3. Add/remove industries, organizations, branches, or wards
4. Restart the server or call the seed endpoint

**Example**: To add a new default bank branch:

```javascript
{
  tenantType: "bank",
  branchName: "National Bank - Uptown",
  shortName: "NB-UT",
  branchCode: "BANK-003",
  city: "Uptown",
  address: "222 Uptown Plaza, Uptown",
  contactNumber: "+1-555-0203",
  email: "uptown@nationalbank.com",
  organizationName: "National Bank",
  status: "active",
  branchAdminAccess: true,
  wards: [
    { name: "Cashier", description: "Cash services" },
    { name: "Inquiries", description: "Customer support" },
  ],
}
```

## Important Notes

### Protection Against Duplicates

- The seeder checks for existing data before creating
- If data already exists, it skips creation with a message: `⏭️ [Item] already exists`
- Safe to run multiple times - won't create duplicates

### Error Handling

- If a single item fails to create, seeding continues
- Errors are logged and returned in the `errors` array
- The seed status endpoint shows whether core data exists

### Super Admin Only

- Seeding endpoints require super_admin role
- Unauthorized attempts return 403 Forbidden

### Database Integrity

- All IDs are properly linked (Branch → Organization, Ward → Branch)
- Unique constraints respected (branchCode, email, etc.)
- Timestamps automatically set by MongoDB

## Troubleshooting

### "Database is already seeded"

If you want to reseed:

1. Call the cleanup endpoint: `POST /api/seeders/cleanup` with `{"confirmCleanup": true}`
2. Then call the seed endpoint: `POST /api/seeders/seed-default-data`
3. Or restart the server

### Partial Seeding

Check the response `errors` array to see which items failed. Fix the issue and:

- Manually create missing items via API
- Or cleanup and reseed

### Seeding Not Running on Startup

Make sure:

1. `initializeDatabase()` is called in `Backend/server.js`
2. Database connection is successful (check console logs)
3. No errors in the seeder logs

## File Structure

```
Backend/
├── seeders/
│   ├── seedDefaultData.js        # Core seeding logic
│   └── initializeDatabase.js     # Auto-initialization on startup
├── controllers/
│   └── seederController.js       # API endpoints
├── routes/
│   └── seederRoutes.js           # Route definitions
├── app.js                        # Updated with seeder routes
└── server.js                     # Updated with initialization
```

## Next Steps

1. **Start your server** - default data will be created automatically
2. **Check the frontend** - industries, organizations, branches, and wards should be visible
3. **Test management operations**:
   - Delete a branch
   - Create a new organization
   - Add a new ward
   - Update branch details
4. **Customize default data** - modify `seedDefaultData.js` as needed

---

**Happy seeding!** 🌱✨
