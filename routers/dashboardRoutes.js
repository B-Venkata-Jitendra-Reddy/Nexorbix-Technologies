const express = require('express');
const router = express.Router();
const dashboardCtrl = require('../controllers/dashboardCtrl');


// GET routes
router.get('/', dashboardCtrl.getHomePage);
router.get('/about', dashboardCtrl.getAboutPage);
router.get('/services', dashboardCtrl.getServicesPage);
router.get('/products', dashboardCtrl.getProductsPage);
router.get('/career', dashboardCtrl.getCareerPage);
router.get('/contact', dashboardCtrl.getContactPage);
router.get('/success', dashboardCtrl.getSuccessPage);


module.exports = router;