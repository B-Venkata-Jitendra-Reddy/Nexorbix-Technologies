
const express = require("express");
const router = express.Router();

const {
    registerInternship,
} = require("../controllers/internshipController");

// POST /internships/register
router.post("/register", registerInternship);

module.exports = router;
