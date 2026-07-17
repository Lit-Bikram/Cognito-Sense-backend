"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("./jwt");
function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = { userId: payload.userId, email: payload.email };
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
exports.requireAuth = requireAuth;
