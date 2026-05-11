import express from "express";
import {
  seedDatabase,
  cleanupDatabaseEndpoint,
  getSeedStatus,
} from "../controllers/seederController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Seeder Routes
 * All endpoints require authentication
 */

/**
 * GET /api/seeders/status
 * Check if database is seeded (public endpoint - can be accessed to check status)
 */
router.get("/status", getSeedStatus);

/**
 * POST /api/seeders/seed-default-data
 * Seed database with default industries, organizations, branches, and wards
 * Protected: super_admin only
 */
router.post("/seed-default-data", authMiddleware, seedDatabase);

/**
 * POST /api/seeders/cleanup
 * DANGER: Delete all data from the database
 * Protected: super_admin only
 * Requires explicit confirmation
 */
router.post("/cleanup", authMiddleware, cleanupDatabaseEndpoint);

export default router;
