const User = require("../models/user");

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.postLogin = (req, res) => {
  User.findById("665605dcbe1e5176b8a49337")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err)=>{
        console.log(err);
        res.redirect("/");
      });
    })
    .catch((err) => {
      console.log("failed to fetch user", err);
    });
};
exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
