import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createInterview,
  getUserInterviews,
  getInterview,
  updateInterview,
  deleteInterview,
} from "../controllers/interviewController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Interview CRUD
router.post("/", createInterview);
router.get("/", getUserInterviews);
router.get("/:id", getInterview);
router.put("/:id", updateInterview);
router.delete("/:id", deleteInterview);

export default router;
