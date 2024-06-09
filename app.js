const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const app = express();
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const errorController = require("./controllers/error");
const User = require("./models/user");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_USER_PASSWORD}@cluster0.ziucdkc.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0`;

const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();
app.set("view engine", "ejs");
app.set("views", "views");
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const date = new Date().toISOString().replace(/:/g, "-");
    cb(null, date + "-" + file.originalname);
  },
});

const accessLog = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});
app.use(helmet());
app.use(compression());
app.use(morgan("combined",{stream:accessLog}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(authRoutes);
app.use(shopRoutes);
app.use("/admin", adminData.routes);

app.use(errorController.getError);
app.use(errorController.pageNotFound);

app.use((error, req, res, next) => {
  res.redirect("/500");
});

const PORT = process.env.PORT || 3000;
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("Connected to MongoDB");
    app.listen(PORT, (req, res) => {
      console.log(`Server is running at PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect ", err);
  });
