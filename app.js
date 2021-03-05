const path = require('path');
const { json } = require('express');
const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookinController');

const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
app.enable('trust proxy'); // heoru will not work unless

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


console.log(`\n****   running environment: ${process.env.NODE_ENV}  ****\n`);

    
    // 1) GLOBAL MIDDLEWARES

    // implement CORS
app.use(cors());
// this set Access-Control-Allow-Origin header to * (all)

// backend hosted @ api.natours.com & frontend hosted @ natours.com
// app.use(cors({
//     origin: 'https://www.natours.com'
// }));

app.options('*', cors());
// app.options('/api/v1/tours/:id',cors());

    // serving static files
    app.use(express.static(path.join(__dirname, 'public')));
    
    // Set Secure HTTP headers
    app.use(helmet());
    
    // Log developmen t environment
    if (process.env.NODE_ENV === 'development') { 
        app.use(morgan('dev'));
    }
    
    // Limit no of requests from same IP
    const limiter = rateLimit({
        max: 100,
        windowMs: 60 * 60 * 1000,
        message: 'Too many requests from this IP, please try again in an hour ! '
    });

app.post('/webhook-checkout', bodyParser.raw({ type: 'application/json' }), bookingController.webhookCheckout);
    
// Body parser. Reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

app.use(express.urlencoded({ extended: true, limit: '10kb' })); // read data coming from html forms.


// data sanitization against NoSql query injection
app.use(mongoSanitize());

// prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration','ratingsAverage','ratingsQuantity','maxGroupSize','difficulty','price'
    ]
}));

// data sanitization against XSS
app.use(xss());

app.use('/api', limiter);


// test middleware

app.use((req, res, next) => {
    // console.log(req.cookies);
    next();
});

// compress text,json messages sent to the client
app.use(compression());
    
 //Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find this url -> ' ${req.originalUrl} ' on ther server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;