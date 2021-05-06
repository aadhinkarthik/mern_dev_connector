const mongoose = require('mongoose');

// To get global variable for default.json file {config}
const config = require('config');
const db = config.get('mongoURL');

const connectDB = async () => {

    try {

        await mongoose.connect(db, {
            // To avoid deprecated behaviour
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('Database: Connected successfully to MongoDB Atlas');

    } catch (error) {
        console.error(error.message);
        process.exit(1); // Exit process while failure
    }
};

// Better than module.exports = connectDB
exports.connectDB = connectDB;