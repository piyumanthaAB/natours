const { Query } = require('mongoose');
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,difficulty,summary';
    next();
}



exports.getAllTours = catchAsync(async (req, res, next) => {
    
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limiting().paging();
        
    const tours = await features.query;
    

    //Send response
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            tours
        }
    });

    

        // console.log(req.query);

        // const query =  Tour.find()
        //     .where('duration')
        //     .equals(req.query.duration)
        //     .where('difficulty')
        //     .equals(req.query.difficulty);

        // Build query
        // 1A) Filtering

        // const queryObj = { ...req.query };
        // const excludes = ['page','sort', , 'limit', 'fields'];

        // excludes.forEach(el => {
        //     delete queryObj[el];
        // });

        // // 1B) Advanced Filtering
        
        // var queryStr = JSON.stringify(queryObj);
        // queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        
        // var query = Tour.find(JSON.parse(queryStr));

        // 2) Sort

        // if (req.query.sort) {
            
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     console.log(sortBy);
        //     query = query.sort(sortBy);
            
        // } 
        
        // 3) Fields

        // if (req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // } else {
        //     query = query.select('-__v');
        // }

        // 4) Pagination

        // const page = parseInt(req.query.page) || 1; // 1 is the default value
        // const limit = parseInt(req.query.limit) || 100; // 100 is the default

        // const skip = (page - 1) * limit;

        // query = query.skip(skip).limit(limit);

        // if (req.query.page) {
        //     const numTours = await tours.countDocuments();
        //     if (skip > numTours) throw new Error('This page does not exist');
        // }

        // Execute Query
      
    
    
});
exports.getTour = catchAsync(async (req, res, next) => {
    const id = (req.params.id);

    const tour = await Tour.findById(id);

    if (!tour) {
        return next(new AppError('No tour is found for that ID', 404));
    }
    res.status(200).json({
        message: "success",
        data: {
            tour
        }
    })
   
    
    
});



exports.createTour = catchAsync(async (req, res, next) => {
    
    // const newTour = new Tour({});
    // newTour.save();
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            tour: newTour
        }
    });

    

});

exports.updateTour = catchAsync(async(req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators:true
    });

    if (!tour) {
        return next(new AppError('No tour is found for that ID', 404));
    }


    res.status(200).json({
        status: "success",
        data: {
            tour
        }
    });
 
    
});
exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError('No tour is found for that ID', 404));
    }

        res.status(204).json({
            status: "success",
            data: null
        });
    
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        }, {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
                
            }
        }, {
            $sort: { avgPrice: 1 }
        }
        // {
        //     $match: { _id: { $ne: 'easy' } }
        // }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
  
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = parseInt(req.params.year);

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numToursStarts: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {
                    numToursStarts: -1
                }
            },
            {
                $limit: 12
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
   
});