import { isDatabaseSeeded, seedDefaultData } from "./seedDefaultData.js";

/**
 * Initialize database with default data if not already seeded
 * Call this function during server startup to ensure default data exists
 */
export const initializeDatabase = async () => {
  try {
    const isSeeded = await isDatabaseSeeded();

    if (!isSeeded) {
      console.log(
        "\n📋 Database not seeded. Running default data seeding...\n"
      );
      await seedDefaultData();
      console.log("\n✨ Database initialization complete!\n");
    } else {
      console.log("\n✅ Database already contains seed data.\n");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    console.error(
      "⚠️  Continue server startup but data may be incomplete\n"
    );
  }
};
