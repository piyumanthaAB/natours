const express = require('express');

const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookinController');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guides'));

router.route('/').get(authController.protect,bookingController.getAllBooking).post(bookingController.createBookin);
router.route('/:id').get(bookingController.getBooking).patch(bookingController.updateBooking).delete(bookingController.deleteBooking);


module.exports = router;