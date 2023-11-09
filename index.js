const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const UserRoute = require('./src/routes/user');

const app = express();
dotenv.config();

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use('/', UserRoute);





app.listen(PORT, () => console.log(`server listening at ${PORT}`));