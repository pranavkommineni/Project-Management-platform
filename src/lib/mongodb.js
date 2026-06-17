import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MAX_RETRIES = Number(process.env.MONGODB_MAX_RETRIES || 5);
const RETRY_DELAY_MS = Number(process.env.MONGODB_RETRY_DELAY_MS || 1000);

/* ---------------------------------------------------------
   Environment validation
   --------------------------------------------------------- */
function validateEnv() {
  if (!MONGODB_URI) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Define it in .env.local, e.g. MONGODB_URI=mongodb+srv://user:pass@cluster/dbname"
    );
  }
  if (!/^mongodb(\+srv)?:\/\//.test(MONGODB_URI)) {
    throw new Error(
      "MONGODB_URI looks malformed - it must start with mongodb:// or mongodb+srv://"
    );
  }
}

validateEnv();

/* ---------------------------------------------------------
   Lightweight structured logging
   --------------------------------------------------------- */
function log(level, message, meta = {}) {
  const entry = { level, message, time: new Date().toISOString(), ...meta };
  if (level === "error") console.error("[mongodb]", entry);
  else console.log("[mongodb]", entry);
}

/* ---------------------------------------------------------
   Connection cache (survives hot-reloads in dev, and is
   reused across serverless invocations on a warm lambda)
   --------------------------------------------------------- */
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const connectionOptions = {
  // Connection pooling
  maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
  minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 1),
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ---------------------------------------------------------
   Retry mechanism with linear backoff
   --------------------------------------------------------- */
async function connectWithRetry(attempt = 1) {
  try {
    log("info", `Connecting to MongoDB (attempt ${attempt}/${MAX_RETRIES})...`);
    const conn = await mongoose.connect(MONGODB_URI, connectionOptions);
    log("info", "MongoDB connected", {
      host: conn.connection.host,
      db: conn.connection.name,
    });
    return conn;
  } catch (err) {
    log("error", "MongoDB connection attempt failed", {
      attempt,
      error: err.message,
    });

    if (attempt >= MAX_RETRIES) {
      throw new Error(
        `Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${err.message}`
      );
    }

    const delay = RETRY_DELAY_MS * attempt;
    await wait(delay);
    return connectWithRetry(attempt + 1);
  }
}

/* ---------------------------------------------------------
   Connection event logging
   --------------------------------------------------------- */
mongoose.connection.on("connected", () => log("info", "Mongoose connection established"));
mongoose.connection.on("error", (err) =>
  log("error", "Mongoose connection error", { error: err.message })
);
mongoose.connection.on("disconnected", () => log("info", "Mongoose connection disconnected"));

/* ---------------------------------------------------------
   Public API
   --------------------------------------------------------- */
export async function connectDB() {
  // Reuse a healthy cached connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connectWithRetry().catch((err) => {
      // Allow a future call to retry from scratch instead of being
      // stuck with a rejected promise forever.
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    log("info", "MongoDB disconnected manually");
  }
}