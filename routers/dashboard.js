const express = require('express');
const router = express.Router();
const dashboardCtrl = require('../controllers/dashboardCtrl');

router.get('/', dashboardCtrl.getDashboardPage);

module.exports = router;