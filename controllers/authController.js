const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const Email = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}



const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIReS_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // cookies are sent only via https 
    
    res.cookie('jwt', token, cookieOptions);
   
    // remove password field from output
    user.password = undefined;
    
    
    res.status(statusCode).json({
        token,
        status: 'success',
        data: {
            user
        }
    });
};



exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    // const newUser = await User.create(req.body);

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    console.log(url);
    
    createSendToken(newUser, 201, res);
    
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    //1)check if email && psw exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password !', 400));
    }

    //2)check if user exist and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Invalid email or password !', 401));
    }

    console.log(user);
    

    //3)if everything ok ,send token to client
    createSendToken(user, 200, res);
    
});



// only for rendered pages. no errors!. check whether the user is logged in or not!. work for both logged and not users!
exports.isLoggedIn = async (req, res, next) => {
    
    try {
        let token;

    //1) Getting the token and check if its out there
    if (req.cookies.jwt) { // this is for brower. read the jwt from a cookie
        token = req.cookies.jwt;

        //1) Verification Token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        

        //2) Check if user still exists
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            return next();
        }

        //3) Check if user changed password after token was issued
        if (currentUser.passwordChangedAfter(decoded.iat)) {
            return next();
        }

        // there is a logged in user
        res.locals.user = currentUser;
        return next();
    }
    next();
    } catch (err) {
       return next();
    }


    
};


exports.protect = catchAsync(async (req, res, next) => {
    
    let token;

    //1) Getting the token and check if its out there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { // this is with postman . read jwt from request header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) { // this is for brower. read the jwt from a cookie
        token = req.cookies.jwt;
    }

    //console.log(token);

    if (!token) {
        return next(new AppError('You are not logged in !. Please login to access data.', 401));
    }

    //2) Verification Token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //3) Check if user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(new AppError('The user who had this token is no longer available !', 401));
    }

    //4) Check if user changed password after token was issued
    if (currentUser.passwordChangedAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Log in again', 401));
    }

    // Grant Access To The Protected Route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles= ['admin','tour-guide']
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You don\'t have permission to perform this action !', 403));
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    
    //1)Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with given email..', 404));
    }

    //2)Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // console.log(`from forgotpsw-> ${resetToken}`);


    //3)Send it to users email
    
    try {
        
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetUrl).sendPasswordReset();
    
        res.status(200).json({
            status: 'success',
            message: 'reset token has sent'
        });
        
    } catch (err) {
        user.passwordResetToken  = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError('Something went wrong while trying to send the email. Please try again later !'), 500);
    }

    
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
  
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
  
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // console.log("after save");

    //3) Update changePasswordAt property for the user.

    //4) Log the user in, send JWT
    createSendToken(user, 200, res);
    
});

exports.updatePassword = catchAsync(async (req, res, next) => {

    //1) GEt user from collection
    const user = await User.findById(req.user.id).select('+password');


    //2) Check if POSTed current password is correct
    const postedPassword = req.body.password;
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) return next(new AppError('Invalid password !', 401));

    //3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    console.log(user);

    await user.save();


    //4) Log user in, send JWT
    createSendToken(user, 200, res);
    
});

exports.logOut = (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
}