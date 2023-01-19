const mongoose = require('mongoose')
require("dotenv").config();

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASEURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    keepAlive: true, 
    keepAliveInitialDelay: 300000
});

mongoose.connection.on("connected", () => {
    console.log("Connected to Mongoose");
});

mongoose.connection.on("disconnected ", () => {
    console.log("Disconnected from Mongoose");
});

mongoose.connection.on("error", (err) => {
    console.log("Error from Mongoose", err);
});
