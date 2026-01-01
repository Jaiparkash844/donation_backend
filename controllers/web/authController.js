const { User } = require('../../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register User
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, adminCode } = req.body;
        console.log("Registration Request:", req.body);

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide all required fields (name, email, password)" });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Admin Secret Verification
        const assignedRole = (adminCode && adminCode === process.env.ADMIN_SECRET) ? 'admin' : 'user';

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: assignedRole
        });

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login Request:", { email });

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid Credentials" });

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid Credentials" });

        // 3. Check for JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing in .env file");
            return res.status(500).json({ message: "Server configuration error (JWT_SECRET)" });
        }

        // 4. Create JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token,
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message });
    }
};