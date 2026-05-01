const express = require("express");
const router = express.Router();
const contactCtrl = require("../controllers/contactCtrl");

// POST route
router.post("/", contactCtrl.submitContact);

module.exports = router;