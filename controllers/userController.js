const { findOneAndUpdate, findByIdAndUpdate } = require("../models/userModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {

    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}

exports.getMe = (req, res, next) => {
    
    req.params.id = req.user.id;

    next();
}


exports.updateMe = catchAsync(async (req, res, next) => { // currently logged in user to update his data

    //1) Send an error if POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password update !. Please use /updateMyPassword route.', 400));
    }

    //2) Filtered out unwanted fields that are not allowed to update
    const filterBody = filterObj(req.body, 'name', 'email');

    //console.log(filterBody);

    //3) Update the user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, { new: true, runValidators: true });

    res.status(200).json({
        status: 'success',
        data: {
            updatedUser
        }
    })
});

exports.deleteMe = catchAsync(async (req, res, next) => { // delete currently logged in user

    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        message: null
    });
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "this path is not yet defined"
    });
}
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Do NOT update passwords with this !

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
