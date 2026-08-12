const express = require('express');
const router = express.Router();
const contactCtrl = require("../controllers/contactCtrl");

// GET routes
router.get("/clientdata", contactCtrl.getClientdataPage);

// POST route
router.post("/contact", contactCtrl.submitContact);


module.exports = router;