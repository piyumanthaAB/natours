const express = require('express');
const viewController = require('./../controllers/viewsController');
const router = express.Router();
const authCOntroller = require('./../controllers/authController');


router.use(authCOntroller.isLoggedIn);

router.get('/', viewController.getOverview);
router.get('/tour/:tourSlug', viewController.getTour);
router.get('/login', viewController.getLogin);

module.exports = router;