import IndustryType from "../models/IndustryType.js";
import Organization from "../models/Organization.js";
import Branch from "../models/Branch.js";
import Ward from "../models/Ward.js";

/**
 * Default data configuration for seeding the database
 * Contains industries, organizations, branches, and wards
 */
const DEFAULT_DATA = {
  industries: [
    {
      name: "Hospital",
      code: "hospital",
      description: "Healthcare institutions providing medical services",
      unitLabel: "Department",
      staffLabel: "Doctor",
      clientLabel: "Patient",
    },
    {
      name: "Bank",
      code: "bank",
      description: "Financial institutions providing banking services",
      unitLabel: "Counter",
      staffLabel: "Teller",
      clientLabel: "Customer",
    },
    {
      name: "Police",
      code: "police",
      description: "Law enforcement agencies and police stations",
      unitLabel: "Section",
      staffLabel: "Officer",
      clientLabel: "Citizen",
    },
  ],
  organizations: [
    {
      tenantType: "hospital",
      organizationName: "Central Hospital",
      shortName: "CH",
      city: "Central City",
      contactNumber: "+1-555-0100",
      email: "info@centralhospital.com",
      status: "active",
    },
    {
      tenantType: "bank",
      organizationName: "National Bank",
      shortName: "NB",
      city: "Financial District",
      contactNumber: "+1-555-0200",
      email: "info@nationalbank.com",
      status: "active",
    },
    {
      tenantType: "police",
      organizationName: "City Police Department",
      divisionName: "Main Division",
      shortName: "CPD",
      city: "Downtown",
      contactNumber: "+1-555-0300",
      email: "info@citypd.com",
      status: "active",
    },
  ],
  branches: [
    // Hospital branches
    {
      tenantType: "hospital",
      branchName: "Central Hospital - Main Campus",
      shortName: "CH-Main",
      branchCode: "HOSPITAL-001",
      city: "Central City",
      address: "123 Medical Avenue, Central City",
      contactNumber: "+1-555-0101",
      email: "main@centralhospital.com",
      organizationName: "Central Hospital",
      status: "active",
      branchAdminAccess: true,
      wards: [
        { name: "OPD (Outpatient Department)", description: "General outpatient services" },
        { name: "Pharmacy", description: "Medication dispensing and pharmacy services" },
        { name: "Emergency", description: "Emergency and critical care services" },
        { name: "Laboratory", description: "Lab tests and diagnostics" },
      ],
    },
    // Bank branches
    {
      tenantType: "bank",
      branchName: "National Bank - Downtown",
      shortName: "NB-DT",
      branchCode: "BANK-001",
      city: "Financial District",
      address: "456 Banking Street, Downtown",
      contactNumber: "+1-555-0201",
      email: "downtown@nationalbank.com",
      organizationName: "National Bank",
      status: "active",
      branchAdminAccess: true,
      wards: [
        { name: "Cashier", description: "Cash withdrawal and deposit services" },
        { name: "Inquiries", description: "General customer inquiries and support" },
        { name: "Loans", description: "Loan application and processing" },
        { name: "Investments", description: "Investment advisory services" },
      ],
    },
    {
      tenantType: "bank",
      branchName: "National Bank - Westside",
      shortName: "NB-WS",
      branchCode: "BANK-002",
      city: "West City",
      address: "789 West Avenue, West City",
      contactNumber: "+1-555-0202",
      email: "westside@nationalbank.com",
      organizationName: "National Bank",
      status: "active",
      branchAdminAccess: true,
      wards: [
        { name: "Cashier", description: "Cash withdrawal and deposit services" },
        { name: "Inquiries", description: "General customer inquiries and support" },
        { name: "Account Opening", description: "New account creation services" },
      ],
    },
    // Police branches
    {
      tenantType: "police",
      branchName: "City Police Department - Main Station",
      shortName: "CPD-Main",
      branchCode: "POLICE-001",
      city: "Downtown",
      address: "999 Law Enforcement Blvd, Downtown",
      contactNumber: "+1-555-0301",
      email: "main@citypd.com",
      organizationName: "City Police Department",
      divisionName: "Main Division",
      status: "active",
      branchAdminAccess: true,
      isMain: true,
      wards: [
        { name: "Complaints", description: "General complaints and FIR registration" },
        { name: "Traffic", description: "Traffic regulation and violations" },
        { name: "Lost & Found", description: "Lost and found items management" },
        { name: "Records", description: "Police records and documentation" },
      ],
    },
    {
      tenantType: "police",
      branchName: "City Police Department - North Station",
      shortName: "CPD-North",
      branchCode: "POLICE-002",
      city: "North City",
      address: "111 North Precinct Road, North City",
      contactNumber: "+1-555-0302",
      email: "north@citypd.com",
      organizationName: "City Police Department",
      divisionName: "North Division",
      status: "active",
      branchAdminAccess: true,
      wards: [
        { name: "Complaints", description: "General complaints and FIR registration" },
        { name: "Traffic", description: "Traffic regulation and violations" },
        { name: "Patrol", description: "Patrol operations and dispatch" },
      ],
    },
  ],
};

/**
 * Seed the database with default industries, organizations, branches, and wards
 * @returns {Object} - Results of the seeding operation
 */
export const seedDefaultData = async () => {
  try {
    const results = {
      industriesCreated: 0,
      organizationsCreated: 0,
      branchesCreated: 0,
      wardsCreated: 0,
      errors: [],
    };

    // 1. Seed Industries
    console.log("🌱 Seeding Industries...");
    for (const industryData of DEFAULT_DATA.industries) {
      try {
        const existingIndustry = await IndustryType.findOne({
          code: industryData.code,
        });

        if (!existingIndustry) {
          await IndustryType.create(industryData);
          results.industriesCreated++;
          console.log(`✅ Created industry: ${industryData.name}`);
        } else {
          console.log(`⏭️  Industry already exists: ${industryData.name}`);
        }
      } catch (error) {
        results.errors.push({
          type: "Industry",
          data: industryData.name,
          error: error.message,
        });
        console.error(`❌ Error creating industry ${industryData.name}:`, error.message);
      }
    }

    // 2. Seed Organizations
    console.log("\n🌱 Seeding Organizations...");
    const organizationMap = {};

    for (const orgData of DEFAULT_DATA.organizations) {
      try {
        const existingOrg = await Organization.findOne({
          organizationName: orgData.organizationName,
          tenantType: orgData.tenantType,
        });

        if (!existingOrg) {
          const newOrg = await Organization.create(orgData);
          organizationMap[orgData.organizationName] = newOrg._id;
          results.organizationsCreated++;
          console.log(`✅ Created organization: ${orgData.organizationName}`);
        } else {
          organizationMap[orgData.organizationName] = existingOrg._id;
          console.log(`⏭️  Organization already exists: ${orgData.organizationName}`);
        }
      } catch (error) {
        results.errors.push({
          type: "Organization",
          data: orgData.organizationName,
          error: error.message,
        });
        console.error(`❌ Error creating organization ${orgData.organizationName}:`, error.message);
      }
    }

    // 3. Seed Branches and Wards
    console.log("\n🌱 Seeding Branches and Wards...");
    for (const branchData of DEFAULT_DATA.branches) {
      try {
        const existingBranch = await Branch.findOne({
          branchCode: branchData.branchCode,
        });

        if (!existingBranch) {
          // Get industry type
          const industryType = await IndustryType.findOne({
            code: branchData.tenantType,
          });

          if (!industryType) {
            throw new Error(
              `IndustryType not found for ${branchData.tenantType}`
            );
          }

          // Get organization ID
          const organizationId = organizationMap[branchData.organizationName];
          if (!organizationId && branchData.tenantType !== "police") {
            throw new Error(
              `Organization not found: ${branchData.organizationName}`
            );
          }

          // Extract wards from branch data
          const wards = branchData.wards || [];
          delete branchData.wards;

          // Create branch
          const newBranch = await Branch.create({
            ...branchData,
            industryType: industryType._id,
            organizationId: organizationId || null,
          });

          results.branchesCreated++;
          console.log(`✅ Created branch: ${branchData.branchName}`);

          // Create wards for this branch
          for (const wardData of wards) {
            try {
              const existingWard = await Ward.findOne({
                branchId: newBranch._id,
                name: wardData.name,
              });

              if (!existingWard) {
                await Ward.create({
                  branchId: newBranch._id,
                  ...wardData,
                  status: "active",
                  createdBy: "system-seeder",
                });
                results.wardsCreated++;
                console.log(`  ├─ ✅ Created ward: ${wardData.name}`);
              } else {
                console.log(
                  `  ├─ ⏭️  Ward already exists: ${wardData.name}`
                );
              }
            } catch (wardError) {
              results.errors.push({
                type: "Ward",
                branch: branchData.branchName,
                data: wardData.name,
                error: wardError.message,
              });
              console.error(
                `  ├─ ❌ Error creating ward ${wardData.name}:`,
                wardError.message
              );
            }
          }
        } else {
          console.log(`⏭️  Branch already exists: ${branchData.branchName}`);
        }
      } catch (error) {
        results.errors.push({
          type: "Branch",
          data: branchData.branchName,
          error: error.message,
        });
        console.error(`❌ Error creating branch ${branchData.branchName}:`, error.message);
      }
    }

    console.log("\n✨ Seeding completed!");
    console.log(
      `📊 Summary: ${results.industriesCreated} industries, ${results.organizationsCreated} organizations, ${results.branchesCreated} branches, ${results.wardsCreated} wards`
    );

    if (results.errors.length > 0) {
      console.log(`\n⚠️  ${results.errors.length} errors occurred during seeding`);
    }

    return results;
  } catch (error) {
    console.error("Fatal error during seeding:", error);
    throw error;
  }
};

/**
 * Clean up the database (for testing purposes)
 */
export const cleanupDatabase = async () => {
  try {
    console.log("🗑️  Cleaning up database...");
    await Ward.deleteMany({});
    await Branch.deleteMany({});
    await Organization.deleteMany({});
    await IndustryType.deleteMany({});
    console.log("✅ Database cleaned");
  } catch (error) {
    console.error("Error cleaning database:", error);
    throw error;
  }
};

/**
 * Check if database is already seeded
 */
export const isDatabaseSeeded = async () => {
  try {
    const industryCount = await IndustryType.countDocuments();
    const branchCount = await Branch.countDocuments();
    return industryCount > 0 && branchCount > 0;
  } catch (error) {
    console.error("Error checking database seed status:", error);
    return false;
  }
};
