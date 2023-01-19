const mongoose = require('mongoose') // Require the Mongoose library
require("dotenv").config(); // Require the Dotenv library to access environment variables

mongoose.set('strictQuery', true); // Enable strict query mode in Mongoose
mongoose.connect(process.env.DATABASEURL, { // Connect to the MongoDB database using the URL stored in the DATABASEURL environment variable
    useNewUrlParser: true, // set options for the connection including using the new URL parser and unified topology,
    useUnifiedTopology: true, 
    keepAlive: true,  //  keeping the connection alive, and setting an initial delay for the keep alive option
    keepAliveInitialDelay: 300000
});

// Log a message to the console when the connection is successful
mongoose.connection.on("connected", () => {
    console.log("Connected to Mongoose");
});

// Log a message to the console when the connection is disconnected
mongoose.connection.on("disconnected ", () => {
    console.log("Disconnected from Mongoose");
});

// Log an error message and the error object to the console when an error occurs
mongoose.connection.on("error", (err) => {
    console.log("Error from Mongoose", err);
});
