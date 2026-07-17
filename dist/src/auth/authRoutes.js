"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const pool_1 = require("../db/pool");
const jwt_1 = require("./jwt");
const authMiddleware_1 = require("./authMiddleware");
const router = (0, express_1.Router)();
function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}
/* ================= CREATE ACCOUNT ================= */
router.post("/register", async (req, res) => {
    try {
        const name = String(req.body.name || req.body.username || "").trim();
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || "");
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        if (password.length < 6) {
            return res
                .status(400)
                .json({ error: "Password must be at least 6 characters" });
        }
        const existing = await (0, pool_1.query)("SELECT id FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "An account with this email already exists" });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const result = await (0, pool_1.query)(`INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`, [name, email, passwordHash]);
        const user = result.rows[0];
        const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email });
        res.status(201).json({ token, user });
    }
    catch (err) {
        console.error("❌ Register failed:", err);
        res.status(500).json({ error: "Failed to create account" });
    }
});
/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || "");
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const result = await (0, pool_1.query)("SELECT id, name, email, password_hash FROM users WHERE email = $1", [email]);
        const row = result.rows[0];
        if (!row || !(await bcryptjs_1.default.compare(password, row.password_hash))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const token = (0, jwt_1.signToken)({ userId: row.id, email: row.email });
        res.json({
            token,
            user: { id: row.id, name: row.name, email: row.email },
        });
    }
    catch (err) {
        console.error("❌ Login failed:", err);
        res.status(500).json({ error: "Failed to log in" });
    }
});
/* ================= WHO AM I ================= */
router.get("/me", authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const result = await (0, pool_1.query)("SELECT id, name, email FROM users WHERE id = $1", [req.user.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ user: result.rows[0] });
    }
    catch (err) {
        console.error("❌ /me failed:", err);
        res.status(500).json({ error: "Failed to load user" });
    }
});
exports.default = router;
