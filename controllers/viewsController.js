const Tour = require('./../models/tourModel');
const User = require('./../models//userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const setCSPHeader = (res) => {
    res.set({
        'Content-Security-Policy': `default-src 'self' http: https: *;block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data: blob:;object-src 'none';script-src 'self' https://api.mapbox.com https://cdn.jsdelivr.net https://fonts.google.com/ https://cdnjs.cloudflare.com/ajax/l 'unsafe-inline'  'unsafe-eval';script-src-elem https: http: ;script-src-attr 'self' https://api.mapbox.com https://cdn.jsdelivr.net https://fonts.google.com/ 'unsafe-inline' ;style-src * 'self' https://api.mapbox.com https://fonts.googleapis.com https://fonts.google.com/ 'unsafe-inline'  ;worker-src 'self' blob:`
        // 'Content-Security-Policy': `default-src 'self' http: https: unsafe-inline;img-src 'self' data: blob:;connect-src *;style-src * unsafe-inline ;script-src-elem * unsafe-inline;`
    });
    return res;
}

exports.getOverview = catchAsync(async (req, res, next) => {

    //1)  get tour data from collection
    const tours = await Tour.find();

    //2) build template

    //3)  render that template sing tour data from 1)
    
    // set the header. remove CSP error
    setCSPHeader(res);

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {

    // 1)  get the data for the requested tour including reviews and guides
    const tourSlug = req.params.tourSlug;
    const tour = await Tour.findOne({ slug: tourSlug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    // tour error send
    if (!tour) {
        return next(new AppError('No tour found !', 404));
    }
    // console.log(tour.reviews[0].user.photo);

    // 2)  build template


    // 3)  render template using data from 1)

    // set the header. remove CSP error
    setCSPHeader(res);

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLogin = (req, res) => {
    // set the header. remove CSP error
    setCSPHeader(res);
    
    res.status(200).render('login', {
        title: 'Login'
    });
}

exports.getAccount = (req, res) => {
    // set the header. remove CSP error
    setCSPHeader(res);
    
    res.status(200).render('account', {
        title: 'Your Account'
    });
}

exports.updateUserData = catchAsync(async (req, res, next) => {
    console.log(req.body);
    const updatedUser = await User.findByIdAndUpdate(req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        });
  
    res.status(200).render('account', {
        title: 'Your Account',
        user: updatedUser
    });
})

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings

    const bookings = await Booking.find({ user: req.user.id });

    // 2) Find tours with the returned IDs
    const tourIds = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIds } });

    res.status(200).render('overview',{
        title: 'My Tours',
        tours
    });
})