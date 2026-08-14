const express = require("express");

const router = express.Router();

const adminCtrl = require("../controllers/adminCtrl");
const adminAuth = require("../middleware/adminAuth");


// ==========================================
// ADMIN LOGIN
// ==========================================

router.get(
    "/login",
    adminAuth.checkAdmin,
    adminCtrl.getLogin
);

router.post(
    "/login",
    adminCtrl.login
);


// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get(
    "/dashboard",
    adminAuth.requireAdmin,
    adminCtrl.getDashboard
);


// ==========================================
// ADMIN TABLES
// CLIENT CONTACT DATA
// ==========================================

router.get(
    "/tables",
    adminAuth.requireAdmin,
    adminCtrl.getTables
);


// ==========================================
// DELETE CONTACT
// ==========================================

router.post(
    "/contacts/:id/delete",
    adminAuth.requireAdmin,
    adminCtrl.deleteContact
);


// ==========================================
// LOGOUT
// ==========================================

router.get(
    "/logout",
    adminCtrl.logout
);


module.exports = router;