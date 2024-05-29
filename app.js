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
//const Product = require("./models/product");
const User = require("./models/user");
//const Cart = require("./models/cart");
//const CartItem = require("./models/cart-item");
//const Order = require("./models/order");
//const OrderItem = require("./models/order-item");
const MONGODB_URI =
  "mongodb+srv://tushargoel:IWHxXRJ1IX48wFrQ@cluster0.ziucdkc.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0";

const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log("failed to fetch user", err);
    });
});
app.use(authRoutes);
app.use(shopRoutes);
app.use("/admin", adminData.routes);

const PORT = 3000;
mongoose
  .connect(MONGODB_URI)
  .then(async (result) => {
    console.log("Connected to MongoDB");
    const userExists = await User.findOne();
    if (!userExists) {
      const user = new User({
        name: "Tushar",
        email: "tusharrgoel@gmail.com",
        cart: {
          items: [],
        },
      });
      user.save();
    }

    app.listen(PORT, (req, res) => {
      console.log(`Server is running at PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect ", err);
  });
app.use(errorController.pageNotFound);
