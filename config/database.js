const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        // await mongoose.connect(process.env.DB_URI, {
        //     useUnifiedTopology: true // uses new server discovery and monitoring engine.
        // });
        console.log('MongoDb Connected!');
    } catch (error) {
        console.error('MongoDb Connection Failed!: ', error);
        process.exit(1);
    }
}

module.exports = connectDb;