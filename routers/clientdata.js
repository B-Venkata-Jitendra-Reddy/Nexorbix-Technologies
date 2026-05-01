const express = require('express');
const router = express.Router();
const clientdataCtrl = require('../controllers/clientdataCtrl');

router.get('/', clientdataCtrl.getClientdataPage);

module.exports = router;