const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must havea name !']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'A user must have an email address !'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email !']
    },
    photo: {
        type: String,
        default:'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'A user must have a password !'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A user must confirm password !'],
        validate: {
            // This works only on CREATE & SAVE !!!!
            validator: function (val) {
                return this.password === val;
            },
            message: 'Passwords doesn\'t match !'
        }
    },
    passwordChangedAt:Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// **** MUST COMMENT OUT BEFORE IMPORT DATA TO THE DATABASE, because PASSWORD will  encrypte twise otherwise. !!!!! ******

userSchema.pre('save', async function (next) {
    // Only run this if password is modified
    if (!this.isModified('password')) return next();

    // hash the password with 12 salt rounds
    this.password = await bcrypt.hash(this.password, 12);

    //delete the password confirm 
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: true });
    next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
    
    
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
       // console.log(changedTimeStamp, JWTTimestamp);
        return JWTTimestamp < changedTimeStamp;
    }
    // False means NOT changed !
    return false;
}

userSchema.methods.createPasswordResetToken = function () {

    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;


    console.log({ resetToken }, this.passwordResetToken);

    return resetToken;

}

const User = mongoose.model('User', userSchema);
module.exports = User;





