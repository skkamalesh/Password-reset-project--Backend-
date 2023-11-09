const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGO_URI;


try {
  mongoose.connect(uri);
  console.log("connected to db");
} catch (error) {
  console.log(error);
}


module.exports = mongoose;