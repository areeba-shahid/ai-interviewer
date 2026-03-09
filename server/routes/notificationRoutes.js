import express from "express";
import { verifyToken } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get all notifications for user
router.get("/", verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { user: req.dbUser._id };
    if (unreadOnly === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: req.dbUser._id,
      read: false,
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notifications",
    });
  }
});

// Mark notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.dbUser._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark notification as read",
    });
  }
});

// Mark all as read
router.put("/read-all", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.dbUser._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark all as read",
    });
  }
});

// Delete notification
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.dbUser._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete notification",
    });
  }
});

// Delete all read notifications
router.delete("/read-all", verifyToken, async (req, res) => {
  try {
    await Notification.deleteMany({
      user: req.dbUser._id,
      read: true,
    });

    res.json({
      success: true,
      message: "All read notifications deleted",
    });
  } catch (error) {
    console.error("Delete read all error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete read notifications",
    });
  }
});

export default router;
