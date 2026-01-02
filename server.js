const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

/* ================= MongoDB SERVERLESS FIX ================= */

// Disable mongoose buffering
mongoose.set("bufferCommands", false);

// Global cached connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB Connected");
  return cached.conn;
}

/* ================= MIDDLEWARE ================= */

app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON format" });
  }
  next();
});

/* ================= CORS ================= */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://donation-beta-one.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ================= DB CONNECT PER REQUEST (VERCEL SAFE) ================= */

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

/* ================= ROUTES (TOP LEVEL) ================= */

const authRoutes = require("./routes/web/authRoutes");
const donationRoutes = require("./routes/web/donationRoutes");
const campaignRoutes = require("./routes/web/campaignRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/admin", adminRoutes);

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.json({ status: "API running successfully" });
});

/* ================= LOCAL SERVER ONLY ================= */

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

/* ================= EXPORT FOR VERCEL ================= */

module.exports = app;
