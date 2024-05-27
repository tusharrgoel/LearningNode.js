const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const app = express();
const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res,next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});
app.use(shopRoutes);
app.use("/admin", adminData.routes);

const PORT = 3000;

Product.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE",
});
User.hasMany(Product);

sequelize
  .sync()
  .then((result) => {
    return User.findByPk(1);
    //console.log(result)
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Tushar", email: "tushar@gmail.com" });
    }
    return user;
  })
  .then((user) => {
   // console.log(user);
    app.listen(PORT, (req, res) => {
      console.log(`Server is running at PORT ${PORT}`);
    });
  })
  .catch((err) => {
    //console.log(err);
  });

app.use(errorController.pageNotFound);
