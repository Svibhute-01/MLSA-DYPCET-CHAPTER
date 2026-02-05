import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

export const db = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: Number(process.env.PG_PORT),
  ssl: { rejectUnauthorized: false },

  max: 5,                 // good for Supabase
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // ⬅ increase
});

db.on("connect", () => {
  console.log("✅ Connected to Supabase");
});

db.on("error", (err) => {
  console.error("❌ Unexpected PG pool error", err);
});

export default db;
