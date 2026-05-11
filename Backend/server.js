import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import { initializeDatabase } from "./seeders/initializeDatabase.js";

dotenv.config();

// DB connect
connectDB();

// Initialize database with default data if needed
initializeDatabase();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});