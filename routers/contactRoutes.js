const express = require('express');
const router = express.Router();
const contactCtrl = require("../controllers/contactCtrl");

// POST route
router.post("/contact", contactCtrl.submitContact);


module.exports = router;