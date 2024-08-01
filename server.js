const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const connectDB = require("./db");
const User = require("./models/User");
const Message = require("./models/Message");
const engine = require("ejs-mate");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

connectDB();
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));



app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.flashMessages = req.flash();
  next();
});

const authMiddleware = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/",(req,res) => {
    res.render("home")
})

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/chat", authMiddleware, async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.render("index", { messages });
});

app.get("/login", (req, res) => {
  res.render("login", {
    layout: "layouts/boilerplate", // Use the main layout
    showNavbar: false, // Exclude the navbar
  });
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = user;
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup", {
    layout: "layouts/boilerplate", 
    showNavbar: false, 
  });
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash("error", "Username already exists");
      return res.redirect("/signup");
    }

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    req.session.user = newUser;
    res.redirect("/");
  } catch (error) {
    console.error("Error during signup:", error);
    req.flash("error", "An error occurred. Please try again.");
    res.redirect("/signup");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("chat message", async (msg) => {
    const message = new Message({
      username: msg.username,
      text: msg.text,
      timestamp: new Date(),
    });
    await message.save();
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
