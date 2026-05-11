# Database Seeding - Quick Reference

## Automatic Seeding ✅

Runs automatically when server starts. No action needed.

```bash
npm start
```

## Manual API Endpoints

### Check Status

```bash
curl http://localhost:5000/api/seeders/status
```

### Seed Database

```bash
curl -X POST http://localhost:5000/api/seeders/seed-default-data \
  -H "Authorization: Bearer <super_admin_token>"
```

### Cleanup All Data ⚠️

```bash
curl -X POST http://localhost:5000/api/seeders/cleanup \
  -H "Content-Type: application/json" \
  -d '{"confirmCleanup": true}' \
  -H "Authorization: Bearer <super_admin_token>"
```

## What Gets Created

| Type          | Count | Examples                                          |
| ------------- | ----- | ------------------------------------------------- |
| Industries    | 3     | Hospital, Bank, Police                            |
| Organizations | 3     | Central Hospital, National Bank, City Police Dept |
| Branches      | 5     | Main campuses + additional locations              |
| Wards         | 15    | OPD, Pharmacy, Cashier, Complaints, etc.          |

## Hospital Defaults

**Organization**: Central Hospital

- **Branch**: Central Hospital - Main Campus
  - OPD (Outpatient Department)
  - Pharmacy
  - Emergency
  - Laboratory

## Bank Defaults

**Organization**: National Bank

- **Branch 1**: Downtown
  - Cashier
  - Inquiries
  - Loans
  - Investments
- **Branch 2**: Westside
  - Cashier
  - Inquiries
  - Account Opening

## Police Defaults

**Organization**: City Police Department

- **Branch 1**: Main Station
  - Complaints
  - Traffic
  - Lost & Found
  - Records
- **Branch 2**: North Station
  - Complaints
  - Traffic
  - Patrol

## Customization

Edit default data in: `Backend/seeders/seedDefaultData.js`

Default data structure:

- `DEFAULT_DATA.industries` - Industry definitions
- `DEFAULT_DATA.organizations` - Organization definitions
- `DEFAULT_DATA.branches` - Branch definitions (with nested wards)

## Reseed

1. Cleanup: `POST /api/seeders/cleanup` with `{"confirmCleanup": true}`
2. Seed: `POST /api/seeders/seed-default-data`
3. Or restart server

## File Locations

- **Seeder Logic**: `Backend/seeders/seedDefaultData.js`
- **Auto-Init**: `Backend/seeders/initializeDatabase.js`
- **Controller**: `Backend/controllers/seederController.js`
- **Routes**: `Backend/routes/seederRoutes.js`
- **Full Guide**: `Backend/seeders/SEEDING_GUIDE.md`

## Important Notes

✅ Safe to run multiple times - checks for duplicates
✅ All data is fully manageable - delete, add, update anytime
✅ Protected by super_admin authentication
✅ Auto-runs on server startup
⚠️ Cleanup endpoint requires explicit confirmation

---

For detailed information, see: `Backend/seeders/SEEDING_GUIDE.md`
