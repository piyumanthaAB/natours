const { json } = require('express');
const express = require('express');

const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');



console.log(`\n****   running environment: ${process.env.NODE_ENV}  ****\n`);

// app.use((req, res, next) => {
    //     console.log(req.headers);
    //     next();
    // })
    
    // 1) GLOBAL MIDDLEWARES
    
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

    
// Body parser. Reading data from body into req.body
app.use(express.json({ limit: '10kb' }));


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

// serving static files
app.use(express.static(`${__dirname}/public`));
    
    app.use('/api', limiter);

    const AppError = require('./utils/appError');
    const globalErrorHandler = require('./controllers/errorController');
    
 //Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find this url -> ' ${req.originalUrl} ' on ther server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;