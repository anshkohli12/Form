
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static("public")); 

const usersFilePath = path.join(__dirname, "users.json");

function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error);
  }
}

// Register route
app.post("/register", (req, res) => {
  const {
    "register-username": username,
    "register-password": password,
    "college-name": collegeName,
    "mobile-number": mobileNumber,
    dob,
    country,
    email,
    "roll-number": rollNumber,
  } = req.body;

  if (!username || !password || !collegeName || !mobileNumber || !dob || !country || !email || !rollNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!/^\d{10}$/.test(mobileNumber)) {
    return res.status(400).json({ message: "Invalid mobile number" });
  }

  if (!/^\d+$/.test(rollNumber)) {
    return res.status(400).json({ message: "Roll number must be numeric" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const users = readUsers();
  const userExists = users.some((u) => u.username === username || u.email === email);
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const newUser = { username, password, collegeName, mobileNumber, dob, country, email, rollNumber };
  users.push(newUser);
  writeUsers(users);

  return res.status(201).json({ message: "User registered successfully" });
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if all required fields are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Read users from the JSON file
  const users = readUsers();

  // Check if the user exists and the password matches
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // If login is successful
  return res.status(200).json({ message: "Login successful" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
