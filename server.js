const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/web/authRoutes");
dotenv.config();
const donationRoutes = require("./routes/web/donationRoutes");
const campaignRoutes = require("./routes/web/campaignRoutes");
const app = express();

//Middleware
app.use(express.json());
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: "Invalid JSON format" });
    }
    next();
});
app.use(cors());




//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ DB Connection Error:", err));


const adminRoutes = require("./routes/admin/adminRoutes");
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/admin', adminRoutes);

// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/donations', require('./routes/donationRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port  http://localhost:${PORT}`));