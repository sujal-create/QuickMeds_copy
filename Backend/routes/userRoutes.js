import express from "express";
import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();


// ======================================================
// USER LOGIN
// POST /api/users/login
// ======================================================
router.post("/login", async (req, res) => {
  try {
    console.log("Mongo ready state:", mongoose.connection.readyState);
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email?.trim().toLowerCase(),
    });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        isAdmin: user.isAdmin || false,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({
      message: "Invalid email or password",
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});


// ======================================================
// USER REGISTER / SIGNUP
// POST /api/users
// ======================================================
router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phone
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      phone,
      isAdmin: false,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid user data",
      });
    }

    return res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});


// ======================================================
// CUREGO SSO LOGIN
// POST /api/users/sso
// ======================================================
router.post("/sso", async (req, res) => {
  try {
    const { token } = req.body;

    // --------------------------------------------------
    // 1. Check CureGo token
    // --------------------------------------------------
    if (!token) {
      return res.status(400).json({
        message: "CureGo authentication token is missing",
      });
    }

    console.log("CureGo SSO token received");


    // --------------------------------------------------
    // 2. Verify CureGo JWT
    // --------------------------------------------------
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("CureGo decoded token:", decoded);


    // --------------------------------------------------
    // 3. Check decoded user ID
    // --------------------------------------------------
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: "Invalid CureGo token",
      });
    }


    // --------------------------------------------------
    // 4. Find SAME user in MongoDB
    // --------------------------------------------------
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message:
          "User not found in QuickMeds database",
      });
    }


    // --------------------------------------------------
    // 5. Don't allow admin through user SSO
    // --------------------------------------------------
    if (user.isAdmin === true) {
      return res.status(403).json({
        message:
          "Admin users cannot use user SSO",
      });
    }


    // --------------------------------------------------
    // 6. Generate QuickMeds JWT
    // --------------------------------------------------
    const quickMedsToken = generateToken(
      user._id
    );


    // --------------------------------------------------
    // 7. Send user + QuickMeds token
    // --------------------------------------------------
    return res.status(200).json({
      _id: user._id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      isAdmin: user.isAdmin || false,

      token: quickMedsToken,
    });

  } catch (error) {
    console.error(
      "CureGo SSO login error:",
      error
    );


    // --------------------------------------------------
    // Expired token
    // --------------------------------------------------
    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message:
          "CureGo authentication token has expired",
      });
    }


    // --------------------------------------------------
    // Invalid token / wrong JWT secret
    // --------------------------------------------------
    if (
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        message:
          "Invalid CureGo authentication token",
      });
    }


    // --------------------------------------------------
    // Other server error
    // --------------------------------------------------
    return res.status(500).json({
      message:
        "SSO authentication failed",
    });
  }
});


// ======================================================
// ADMIN LOGIN
// POST /api/users/admin/login
// ======================================================
router.post("/admin/login", async (req, res) => {
  try {
    const {
      username,
      password,
    } = req.body;

    const user = await User.findOne({
      email: username?.trim().toLowerCase(),
      isAdmin: true,
    });

    if (
      user &&
      (await user.matchPassword(password))
    ) {
      return res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({
      message:
        "Invalid admin credentials",
    });

  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
});


export default router;