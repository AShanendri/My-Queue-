import {
  seedDefaultData,
  cleanupDatabase,
  isDatabaseSeeded,
} from "../seeders/seedDefaultData.js";
import { errorResponse, successResponse } from "../utils/responseHelpers.js";

/**
 * POST /api/seeders/seed-default-data
 * Seed the database with default industries, organizations, branches, and wards
 * Protected: Only accessible to super_admin users
 */
export const seedDatabase = async (req, res) => {
  try {
    // Check if user is authenticated and is super_admin
    if (!req.user) {
      return errorResponse(res, 401, "User authentication required");
    }

    const role = (req.user.role || "").toLowerCase().trim();
    if (!role.includes("super_admin")) {
      return errorResponse(
        res,
        403,
        "Only super_admin users can seed the database"
      );
    }

    // Check if database is already seeded
    const alreadySeeded = await isDatabaseSeeded();
    if (alreadySeeded) {
      return successResponse(
        res,
        200,
        "Database is already seeded with default data",
        {
          alreadySeeded: true,
          message:
            "Default data already exists. No changes were made. To reseed, use the cleanup endpoint first.",
        }
      );
    }

    // Seed the database
    const results = await seedDefaultData();

    return successResponse(res, 201, "Database seeded successfully", {
      results,
      message:
        "Default industries, organizations, branches, and wards have been created",
    });
  } catch (error) {
    console.error("seedDatabase error:", error);
    return errorResponse(res, 500, "Error seeding database", {
      error: error?.message || error,
    });
  }
};

/**
 * POST /api/seeders/cleanup
 * DANGER: Delete all data from the database (for development/testing only)
 * Protected: Only accessible to super_admin users
 */
export const cleanupDatabaseEndpoint = async (req, res) => {
  try {
    // Check if user is authenticated and is super_admin
    if (!req.user) {
      return errorResponse(res, 401, "User authentication required");
    }

    const role = (req.user.role || "").toLowerCase().trim();
    if (!role.includes("super_admin")) {
      return errorResponse(
        res,
        403,
        "Only super_admin users can cleanup the database"
      );
    }

    // Require confirmation
    const confirmCleanup = req.body?.confirmCleanup === true;
    if (!confirmCleanup) {
      return errorResponse(
        res,
        400,
        "Database cleanup requires explicit confirmation (confirmCleanup: true)",
        {
          warning:
            "This will delete all industries, organizations, branches, and wards",
        }
      );
    }

    // Clean up
    await cleanupDatabase();

    return successResponse(res, 200, "Database cleaned successfully", {
      message: "All default data has been removed",
    });
  } catch (error) {
    console.error("cleanupDatabaseEndpoint error:", error);
    return errorResponse(res, 500, "Error cleaning database", {
      error: error?.message || error,
    });
  }
};

/**
 * GET /api/seeders/status
 * Check if database is seeded with default data
 */
export const getSeedStatus = async (req, res) => {
  try {
    const isSeeded = await isDatabaseSeeded();

    return successResponse(res, 200, "Seed status retrieved", {
      isSeeded,
      message: isSeeded
        ? "Database contains default seed data"
        : "Database does not contain default seed data",
    });
  } catch (error) {
    console.error("getSeedStatus error:", error);
    return errorResponse(res, 500, "Error checking seed status", {
      error: error?.message || error,
    });
  }
};
