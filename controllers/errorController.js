const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}:${err.value}`;
    return new AppError(message, 404);
}

const handleDuplicateFieldsDB = err => {
    const message = `Duplication value: ${err.keyValue.name} . Please use another value :)`;
    return new AppError(message, 404);
}

const handleValidationError = err => {

    var message = "";

    const errors = Object.values(err.errors).map(el=>el.message);
    //console.log(error);
    errors.forEach(msg => {
        message = message.concat(` ${msg},`);
    });
    console.log(message);
    
    return new AppError(message, 404);
}

const handleJsonWebTokenError = err => {
    return new AppError('Invalid Toke.Please login again!', 401);
}

const handleJWTExpiredError = err => {
    return new AppError('Expired Token. Please Login Again !', 401);
}
const sendErrorDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        

        // set CSP header 
        res.set({
            'Content-Security-Policy': `default-src 'self' http: https: *;block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data: blob:;object-src 'none';script-src 'self' https://api.mapbox.com https://cdn.jsdelivr.net https://fonts.google.com/ https://cdnjs.cloudflare.com/ajax/l 'unsafe-inline'  'unsafe-eval';script-src-elem https: http: ;script-src-attr 'self' https://api.mapbox.com https://cdn.jsdelivr.net https://fonts.google.com/ 'unsafe-inline' ;style-src * 'self' https://api.mapbox.com https://fonts.googleapis.com https://fonts.google.com/ 'unsafe-inline'  ;worker-src 'self' blob:`
            // 'Content-Security-Policy': `default-src 'self' http: https: unsafe-inline;img-src 'self' data: blob:;connect-src *;style-src * unsafe-inline ;script-src-elem * unsafe-inline;`
        });
        
        // RENDERED WEBSITE
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg:err.message
        });
    }

}

const sendErrorProd = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        
        //Operational trusted error: send message to client
        
        if (err.isOperational) {
            
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
                
            });
            
        }
        //Programming or other unknown error:don't leak error details
        else {
            //1.Log error
            console.log(err.isOperational);
    
            //2.Send Generic Message
            res.status(500).json({
                status: 'fail',
                message: 'Something went very Wrong !'
            });
        }
    } else {

        // B) RENDERED WEBSITE
        //Operational trusted error: send message to client
        
        if (err.isOperational) {
            
            // set CSP header 
        res.set({
            'Content-Security-Policy': `default-src 'self' http: https: *;block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data: blob:;object-src 'none';script-src 'self' https://api.mapbox.com https://cdn.jsdelivr.net https://fonts.google.com/ https://cdnjs.cloudflare.com/ajax/l 'unsafe-inline'  'unsafe-eval';script-src-elem https: http: ;script-src-attr 'self' https://api.mapbox.com https://cdn.jsdelivr.net https://fonts.google.com/ 'unsafe-inline' ;style-src * 'self' https://api.mapbox.com https://fonts.googleapis.com https://fonts.google.com/ 'unsafe-inline'  ;worker-src 'self' blob:`
            // 'Content-Security-Policy': `default-src 'self' http: https: unsafe-inline;img-src 'self' data: blob:;connect-src *;style-src * unsafe-inline ;script-src-elem * unsafe-inline;`
        });
        
        // RENDERED WEBSITE
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg:"Please try again"
        });
            
        }
        //Programming or other unknown error:don't leak error details
        else {
            //1.Log error
            console.log(err.isOperational);
    
            //2.Send Generic Message
            // set CSP header 
        res.set({
            'Content-Security-Policy': `default-src 'self' http: https: *;block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data: blob:;object-src 'none';script-src 'self' https://api.mapbox.com https://cdn.jsdelivr.net https://fonts.google.com/ https://cdnjs.cloudflare.com/ajax/l 'unsafe-inline'  'unsafe-eval';script-src-elem https: http: ;script-src-attr 'self' https://api.mapbox.com https://cdn.jsdelivr.net https://fonts.google.com/ 'unsafe-inline' ;style-src * 'self' https://api.mapbox.com https://fonts.googleapis.com https://fonts.google.com/ 'unsafe-inline'  ;worker-src 'self' blob:`
            // 'Content-Security-Policy': `default-src 'self' http: https: unsafe-inline;img-src 'self' data: blob:;connect-src *;style-src * unsafe-inline ;script-src-elem * unsafe-inline;`
        });
        
        // RENDERED WEBSITE
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg:'Please Try again'
        });
        }
    }

}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err,req, res);
    } else if (process.env.NODE_ENV === 'production') {
        var error = { ...err };
        error.message = err.message;
      //  console.log(error);
        if (error.code === 11000) {
            error=handleDuplicateFieldsDB(error);
        } else if (error._message==="Validation failed") {
            error = handleValidationError(error);
        } else if (error.name === 'JsonWebTokenError') {
            error = handleJsonWebTokenError(error);
        } else if (error.name === 'TokenExpiredError') {
            error = handleJWTExpiredError(error);
        }
        else if (error) {
            error = handleCastErrorDB(error);
        }
        // if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        // if (error) error = handleCastErrorDB(error);

        sendErrorProd(error,req, res);
    }

    
};