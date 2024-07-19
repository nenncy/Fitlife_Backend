const Pool = require("pg").Pool;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = require("./config/dbconfig");
// Create a new PostgreSQL client
const client = new Pool(dbConfig);

const registeruser = async (req, res) => {
  const { firstname, lastname, password, email, age } = req.body;
  const data = await client.query(`SELECT * FROM users WHERE email= $1;`, [
    email,
  ]); //Checking if user already exist
  const arr = data.rows;
  if (arr.length != 0) {
    return res
      .status(400)
      .json({ error: "Email already there, No need to register again." });
  } else {
    bcrypt.hash(password, 10, (err, pass) => {
      if (err) {
        res.status(err).json({
          error: "Server error",
        });
      }
      hash=pass
      const user = {
        firstname,
        lastname,
        email,
        age,
        password: hash,
      };
      console.log(user)
      var flag = 1; //Declaring a flag

      client.query(
        "INSERT INTO users (firstname, lastname, password, email, age) VALUES ($1,$2,$3,$4,$5)",
        [user.firstname, user.lastname, user.password, user.email, user.age],
        (err , result) => {
          if (err) {
            res.status(500).json({
              error: "Database error" ,err,
            });
          } else {
            flag = 1;
            res.status(200).send({ message: "User added to database",result });
          }
        }
      );
      if (flag) {
        const token = jwt.sign(
          //Signing a jwt token
          {
            email: user.email,
          },
          process.env.SECRET_KEY
        );
      }
    });
  }

};
// /Login Function
const Loginuser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await client.query(`SELECT * FROM users WHERE email= $1;`, [
      email,
    ]); //Verifying if the user exists in the database
    const user = data.rows;
    if (user.length === 0) {
      res.status(400).json({
        error: "User is not registered, Sign Up first",
      });
    } else {
      bcrypt.compare(password, user[0].password, (err, result) => {
        //Comparing the hashed password
        if (err) {
          res.status(500).json({
            error: "Server error",
          });
        } else if (result === true) {
          //Checking if credentials match
          const token = jwt.sign(
            {
              email: email,
            },
            process.env.SECRET_KEY
          );
          res.status(200).json({
            message: "User signed in!",
            token: token,
          });
        } else {
          //Declaring the errors
          if (result != true)
            res.status(400).json({
              error: "Enter correct password!",
            });
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Database error occurred while signing in!", //Database connection error
    });
  }
};

const getuser = (req, res) => {
  client.query("SELECT * FROM users ORDER BY id ASC", (err, result) => {
    if (err) {
      res.status(401).send("Error inserting data", err);
      console.error("Error inserting data", err);
    } else {
      res.status(201).send(result);
      console.log("Data inserted successfully", result);
    }

    client.end();
  });
};

module.exports = { registeruser, getuser ,Loginuser};
