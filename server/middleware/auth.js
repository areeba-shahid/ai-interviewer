import admin from "../config/firebase.js";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  try {
    // Keep essential logs only
    console.log("\n🔐 ===== AUTH MIDDLEWARE =====");
    console.log("📨 Request URL:", req.url);

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ User authenticated:", decodedToken.uid);

    req.user = decodedToken;

    // Get or create user in MongoDB
    let dbUser = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!dbUser) {
      console.log("📝 Creating new user...");
      dbUser = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split("@")[0],
        photoURL: decodedToken.picture || "",
      });
      console.log("✅ New user created with ID:", dbUser._id);
    } else {
      console.log("✅ User found with ID:", dbUser._id);
    }

    req.dbUser = dbUser;
    console.log("🔐 ===== AUTH SUCCESS =====\n");
    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};
