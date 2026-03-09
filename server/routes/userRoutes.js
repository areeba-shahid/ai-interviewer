import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  getUserStats,
  deleteAccount,
  getUserPhoto, // 👈 Add this to the first import
} from "../controllers/userController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Photo route
router.get("/photo", getUserPhoto); // verifyToken already applied by router.use above

// Statistics route
router.get("/stats", getUserStats);

// Account management
router.delete("/account", deleteAccount);

export default router;
