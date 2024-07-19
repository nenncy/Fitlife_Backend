const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const { Client } = require('pg')

const dbConfig= require('./config/dbconfig')

const app = express();

var corsOptions = {
  origin: "http://localhost:8080",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

const client = new Client(dbConfig);

const db= require('./queries')

// Connect to the database
client
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
    
    //query
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL database", err);
  });

 app.post("/registeruser", db.registeruser);
 app.post("/loginuser", db.Loginuser);
 app.get("/getusers", db.getuser);

  
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port on ${PORT}.`);
});
