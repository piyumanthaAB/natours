const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authCOntroller = require('./../controllers/authController');
const bookinController = require('./../controllers/bookinController');

const router = express.Router();


router.get('/', bookinController.createBookingCheckout, authCOntroller.isLoggedIn, viewsController.getOverview);
router.get('/tour/:tourSlug',authCOntroller.isLoggedIn, viewsController.getTour);
router.get('/login',authCOntroller.isLoggedIn, viewsController.getLogin);
router.get('/me', authCOntroller.protect, viewsController.getAccount);

router.get('/my-tours', authCOntroller.protect, viewsController.getMyTours);

router.post('/submit-user-data',authCOntroller.protect, viewsController.updateUserData);

module.exports = router;