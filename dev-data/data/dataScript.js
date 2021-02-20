const fs = require('fs');
const Tour = require('./../../models/tourModel');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './../../config.env' });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8"));


const writeData = async () => {
    try {
        await Tour.create(tours);
        console.log("data written to the DB successfully");
        process.exit();
    } catch (err) {
        console.log(err);
        process.exit();
    }
    
} 

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log("data deleted successsfully from DB");
        process.exit();
    } catch (err) {
        console.log(err);
        process.exit();
    }
}




const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log("DB connection success !");
});



if (process.argv[2] == "--import") {
    
    writeData();
} else if (process.argv[2] == "--delete") {
    deleteData();
}

