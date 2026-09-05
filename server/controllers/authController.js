import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Helper to set cookie
const setTokenCookie = (res, payload) => {
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "30d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
    });
};

// Register
export async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Name, email, and password are required",
            });
        }

        const trimmedEmail = email.trim().toLowerCase();

        const existing = await User.findOne({
            email: trimmedEmail,
        });

        if (existing) {
            return res.status(400).json({
                error: "User with that email already exists",
            });
        }

        const user = await User.create({
            name: name.trim(),
            email: trimmedEmail,
            password,
        });

        setTokenCookie(res, {
            userId: user._id.toString(),
            email: user.email,
        });

        return res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            error: "Server error during registration",
        });
    }
}

// Login
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        const isValid = await user.comparePassword(password);

        if (!isValid) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        setTokenCookie(res, {
            userId: user._id.toString(),
            email: user.email,
        });

        return res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            error: "Server error during login",
        });
    }
}

// Logout
export async function logout(_req, res) {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });

    return res.json({
        success: true,
    });
}

// Get current user
export async function me(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: "Not authenticated",
            });
        }

        const user = await User.findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        return res.json({
            user,
        });
    } catch (error) {
        console.error("Me error:", error);

        return res.status(500).json({
            error: "Server error",
        });
    }
}