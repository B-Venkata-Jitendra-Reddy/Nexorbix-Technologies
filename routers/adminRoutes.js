const express = require("express");

const router = express.Router();

const adminCtrl = require("../controllers/adminCtrl");
const adminAuth = require("../middleware/adminAuth");


// ==========================================
// ADMIN LOGIN
// ==========================================

// Show login page
router.get(
    "/login",
    adminAuth.checkAdmin,
    adminCtrl.getLogin
);


// Process login
router.post(
    "/login",
    adminCtrl.login
);


// ==========================================
// PROTECTED ADMIN AREA
// ==========================================

// Admin dashboard
router.get(
    "/dashboard",
    adminAuth.requireAdmin,
    adminCtrl.getDashboard
);


// ==========================================
// LOGOUT
// ==========================================

router.get(
    "/logout",
    adminCtrl.logout
);


module.exports = router;