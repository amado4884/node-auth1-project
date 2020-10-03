const express = require("express");
const session = require("express-session");
const router = express.Router();
const Users = require("./users");
const bcrpyt = require("bcrypt");

const protected = async (req, res, next) => {
  if (req.session && req.session.userId) next();
  else res.status(401).send("Na duude");
};

const validateNewUser = async (req, res, next) => {
  if (!req.body)
    return res.status(400).json({ message: "Invalid new user data" });

  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "Missing new user data" });
  req.newUser = { username, email, password };
  next();
};

const server = express();
server.use(
  session({
    name: "joemama",
    secret: "the mighty nein",
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      secure: false,
    },
    httpOnly: true,
    resave: false,
    saveUninitialized: false,
  })
);

server.use(express.json());

router.get("/api/users", async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
});

router.post("/api/register", validateNewUser, async (req, res) => {
  const { newUser } = req;
  newUser.password = await bcrpyt.hash(newUser.password, 10);
  try {
    const user = await Users.add(newUser);
    if (!user)
      res.status(500).json({ message: "There was an error registering" });
    res
      .status(200)
      .json({ message: "You have registered, you can now log in." });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint"));
    res.status(500).json({ message: "That user already exists" });
    res.status(500).json({ message: err.message });
  }
});

router.post("/api/login", async (req, res) => {
  if (!req.body)
    return res.status(400).json({ message: "Missing login information" });

  const { login, password } = req.body;

  if (!login || !password)
    return res.status(400).json({
      message: "Please provide a username (or email) and password to log in",
    });

  try {
    const user = await Users.findByLogin(login);
    if (!user || !(await bcrpyt.compare(password, user.password)))
      return res.status(400).json({
        message: "Invalid credentials",
      });
    req.session.userId = user.id;
    return res.status(200).json({ message: "should log in ok" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Could not log in" });
  }
});

server.use("/api/users", (req, res, next) => {
  if (req.session && req.session.userId) next();
  else res.status(401).send("Na duude");
});
server.use(router);

module.exports = server;
