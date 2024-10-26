/*import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const port = 3000;

// Get current directory name
const __dirname = dirname(fileURLToPath(import.meta.url));

// Set the view engine to EJS
app.set("view engine", "ejs");

// Serve static files from the public directory
app.use(express.static("public"));

// Parse incoming requests with urlencoded payloads
app.use(bodyParser.urlencoded({ extended: true }));

// Route for the homepage
app.get("/", (req, res) => {
  res.render("login", { response: "" });
});

//Render the signup.ejs file
app.get("/signup", (req, res) => {
  res.render(__dirname + "/views/signup.ejs");
});

app.get("/forgot_password",(req,res)=>{
  res.render(__dirname+"/views/forgot_password.ejs");
});

app.post("/login", async (req, res) => {
  const username = req.body.Username;
  const password = req.body.Password;
  if(username!='Admin@iitdh.ac.in'){
  try {
      db.query("SELECT * FROM users WHERE email=?", [username], function (err, result) {
          if (err) {
              console.error("Error: ", err);
          } else {
              if (result.length > 0) {
                  const pass = result[0].password;
                  name = result[0].fName;
                  email = result[0].email;
                  bcrypt.compare(password, pass, async (err, result) => {
                      if (err) {
                          console.error("Error: ", err);
                      } else {
                          if (result) {
                             

                              res.render(__dirname + "/views/upload.ejs", {
                                  Name: name,
                                  email: email,
                                  books: books,
                              });
                          } else {
                              res.render(__dirname + "/views/login.ejs", {
                                  response: "Invalid Credentials. Try Again.",
                              });
                          }
                      }
                  });
              } else {
                  res.render(__dirname + "/views/login.ejs", {
                      response: "User does not exist.",
                  });
              }
          }
      });
  } catch (err) {
      console.error("Error: ", err.message);
      res.redirect("/");
  }}
  else{
      try{
          db.query("SELECT * FROM users WHERE email='Admin@iitdh.ac.in'",function(err,result){
              if(err)
              console.error("Error: ",err);
              else{
                  const pass=result[0].password;
                  name = result[0].fName;
                  email = result[0].email;
                  bcrypt.compare(password, pass, (err, result) => {
                      if (err) {
                          console.error("Error: ", err);
                      } else {
                          if (result) {
                              res.render(__dirname + "/views/admin_open.ejs", {
                                  Name: name,
                                  email: email,
                                  books: books,
                              });
                          } else {
                              res.render(__dirname + "/views/login.ejs", {
                                  response: "Invalid Credentials. Try Again.",
                              });
                          }
                      }
                  });
              }
          });
      }
      catch(err){
      console.error("Error: ",err);}
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});*/

import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt"; // For password hashing and comparison
import mongoose from "mongoose"; // MongoDB ODM
import { fileURLToPath } from "url";
import { dirname } from "path";

// Initialize express app
const app = express();
const port = 3000;

// Get current directory name
const __dirname = dirname(fileURLToPath(import.meta.url));

// Set the view engine to EJS
app.set("view engine", "ejs");

// Serve static files from the public directory
app.use(express.static("public"));

// Parse incoming requests with urlencoded payloads
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB using Mongoose
mongoose
  .connect("mongodb+srv://cs23bt076:vZGQ7GgCopadMQRD@datafort.qka8h.mongodb.net/")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err.message));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  fName: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// Route for the homepage (login page)
app.get("/", (req, res) => {
  res.render("login", { response: "" });
});

// Render the signup page
app.get("/signup", (req, res) => {
  res.render(__dirname + "/views/signup.ejs");
});

// Render the forgot password page
app.get("/forgot_password", (req, res) => {
  res.render(__dirname + "/views/forgot_password.ejs");
});

// Helper function to handle login (Admin or Regular User)
const handleLogin = (user, password, res, isAdmin) => {
  const { fName, email } = user;
  const page = isAdmin ? "admin_open" : "upload";

  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      console.error("Error comparing passwords:", err);
      return res.render("login", { response: "Server error. Try again." });
    }

    if (result) {
      res.render(__dirname + `/views/${page}.ejs`, {
        Name: fName,
        email: email,
        books: [], // Replace with books fetched from DB if necessary
      });
    } else {
      res.render("login", { response: "Invalid Credentials. Try Again." });
    }
  });
};

// Login Route
app.post("/login", async (req, res) => {
  const { Username, Password } = req.body;
  const isAdmin = Username === "Admin@iitdh.ac.in";

  try {
    // Fetch user from the database
    const user = await User.findOne({ email: Username });

    if (!user) {
      return res.render("login", { response: "User does not exist." });
    }

    // Handle login based on user type (Admin or Regular)
    handleLogin(user, Password, res, isAdmin);
  } catch (err) {
    console.error("Error fetching user:", err.message);
    res.render("login", { response: "Server error. Try again." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

