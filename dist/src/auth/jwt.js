"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || "dev-insecure-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}
exports.signToken = signToken;
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, SECRET);
}
exports.verifyToken = verifyToken;
