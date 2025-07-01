import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Use environment variable with fallback for local development
const connectionString: string =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/gitfund";

// Create a connection pool
let client;

// Only create the client if we're in a production environment or have a valid connection string
if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL) {
  // Disable prefetch as it is not supported for "Transaction" pool mode
  client = postgres(connectionString, { prepare: false });
} else {
  console.warn("No DATABASE_URL provided. Database operations will fail.");
  // Create a mock client that logs errors instead of crashing
  client = {
    // Mock the minimum required interface
    query: async () => {
      throw new Error("Database connection not configured");
    },
    // Add other methods as needed
  };
}

export const db = drizzle(client);
