const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');


exports.getOverview = catchAsync(async (req, res, next) => {

    //1)  get tour data from collection
    const tours = await Tour.find();

    //2) build template

    //3)  render that template sing tour data from 1)

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
    
    console.log(tour.reviews[0].user.photo);

    // 2)  build template


    // 3)  render template using data from 1)

    // set the header. remove CSP error
    res.set({
        'Content-Security-Policy': `default-src 'self' http: https: *;block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data: blob:;object-src 'none';script-src 'self' https://api.mapbox.com https://cdn.jsdelivr.net https://fonts.google.com/'unsafe-inline'  'unsafe-eval';script-src-elem https: http: ;script-src-attr 'self' https://api.mapbox.com https://cdn.jsdelivr.net https://fonts.google.com/ 'unsafe-inline' ;style-src * 'self' https://api.mapbox.com https://fonts.googleapis.com https://fonts.google.com/'unsafe-inline'  ;worker-src 'self' blob:`
        // 'Content-Security-Policy': `default-src 'self' http: https: unsafe-inline;img-src 'self' data: blob:;connect-src *;style-src * unsafe-inline ;script-src-elem * unsafe-inline;`
    });

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLogin = (req, res) => {
    // set the header. remove CSP error
    res.set({
        'Content-Security-Policy': `default-src 'self' http: https:;block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data: blob:;object-src 'none';script-src 'self' https://cdnjs.com/ 'unsafe-inline' 'unsafe-eval';script-src-elem https: http: ;script-src-attr 'self' https://cdnjs.com/ 'unsafe-inline';style-src 'self' https://cdnjs.com/ https://fonts.googleapis.com https://fonts.google.com/ 'unsafe-inline';worker-src 'self' blob:`
        });
    
    res.status(200).render('login', {
        title: 'Login'
    });
}