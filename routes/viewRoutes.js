const express = require('express');
const viewsController = require('./../controllers/viewsController');
const router = express.Router();
const authCOntroller = require('./../controllers/authController');



router.get('/',authCOntroller.isLoggedIn, viewsController.getOverview);
router.get('/tour/:tourSlug',authCOntroller.isLoggedIn, viewsController.getTour);
router.get('/login',authCOntroller.isLoggedIn, viewsController.getLogin);
router.get('/me', authCOntroller.protect, viewsController.getAccount);

router.post('/submit-user-data',authCOntroller.protect, viewsController.updateUserData);

module.exports = router;