const mongoose = require('mongoose');
const dotenv = require('dotenv');


process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception ! Shutting down...');
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log("DB connection success !");
})




const server = app.listen(process.env.PORT, () => {
    console.log(`server is listening on port ${process.env.PORT}`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Unhandled Rejection :(  Shutting down....');
    server.close(() => {
        process.exit(1);
    })
})