const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        unique: true,
        trim: true,
        maxlength:[40,'A tour name must not exceed 40 characters'],
        minlength: [10, 'A tour name must have at least 10 characters']
    },
    slug:String,
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message:'Difficulty must be either: easy,medium or difficult'
        }
    }
    ,
    duration: {
        type: String,
        required: [true, "A tour must have a duration"]
    }, maxGroupSize: {
        type: Number,
        required: [true, "A tour must have max group size"]
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, "Rating must above 1.0"],
        max: [5, "Rating must below 5.0"]
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            // this only  point s to current doc on NEW doc Creation. doesn't work on update
            validator: function (val) {
                return val < this.price;
            },
            message:'The discount price ({VALUE}) must be lower than regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a summary"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "A tour must have an image cover"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // disabled . It wil not send to the user
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false,
    }

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Document Middleware: run before .save() and .create()

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// });

// Query Middleware : run before .find()

tourSchema.pre(/^find/, function (next) {    // /^find/  <-- reg expression. this runs for all the methods start from find, find,findOne....
    this.find({ secretTour: { $ne: true } });
    
    this.startTime = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    
    console.log(`Query took: ${Date.now()-this.startTime} milliseconds`);
    next();
});

// Aggregation Middleware

tourSchema.pre('aggregate', function (next) {
    
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    
    next();
})


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;