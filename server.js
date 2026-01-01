const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

/* ================= MongoDB CONFIG ================= */

mongoose.set("bufferCommands", false);

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

/* ================= Middleware ================= */

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
  "https://donation-beta-one.vercel.app"
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

/* ================= START SERVER AFTER DB ================= */

async function startServer() {
  try {
    await connectDB(); // 🔥 IMPORTANT FIX

    const authRoutes = require("./routes/web/authRoutes");
    const donationRoutes = require("./routes/web/donationRoutes");
    const campaignRoutes = require("./routes/web/campaignRoutes");
    const adminRoutes = require("./routes/admin/adminRoutes");

    app.use("/api/auth", authRoutes);
    app.use("/api/donations", donationRoutes);
    app.use("/api/campaigns", campaignRoutes);
    app.use("/api/admin", adminRoutes);

    app.get("/", (req, res) => {
      res.json({ status: "API running" });
    });

    // Local only
    if (process.env.NODE_ENV !== "production") {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () =>
        console.log(`🚀 Server running at http://localhost:${PORT}`)
      );
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
  }
}

startServer();

/* ================= Export for Vercel ================= */
module.exports = app;
