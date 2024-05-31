const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sgt = require("nodemailer-sendgrid-transport");
const nodeMailer = require("nodemailer");
const transporter = nodeMailer.createTransport(
  sgt({
    auth: {
      api_key:
        "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",
    },
  })
);
exports.getLogin = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
    errorMessage: message,
  });
};
exports.postLogin = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userExists = await User.findOne({ email: email });
  if (!userExists) {
    req.flash("error", "Invalid Email or Password");
    res.redirect("/login");
  } else {
    const passwordMatched = await bcrypt.compare(password, userExists.password);
    if (passwordMatched) {
      req.session.isLoggedIn = true;
      req.session.user = userExists;
      req.session.save((err) => {
        console.log("User logged in successfully");
        res.redirect("/");
      });
    } else {
      req.flash("error", "Invalid Email or Password");
      res.redirect("/login");
    }
  }
};
exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log("User logged out");
    res.redirect("/");
  });
};
exports.postSignUp = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const user = await User.findOne({ email: email });

  if (user) {
    req.flash("error", "Email id already exists, please login");
    return res.redirect("/signup");
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({
    email: email,
    password: hashedPassword,
    cart: { items: [] },
  });
  await newUser.save();
  res.redirect("/login");
  console.log("Registered User successfully");
  return transporter
    .sendMail({
      to: email,
      from: "tg.codes31@gmail.com",
      subject: "User registered successfully",
      html: "<h1> You have successfully registered in E-Dukaan</h1>",
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getSignUp = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "SignUp",
    isAuthenticated: false,
    errorMessage: message,
  });
};
exports.getReset = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/resetpassword",
    pageTitle: "Reset your Password",
    isAuthenticated: false,
    errorMessage: message,
  });
};
exports.postResetPassword = (req, res) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      res.redirect("/resetpassword");
    }
    const token = buffer.toString("hex");
    const user = await User.findOne({ email: req.body.email });
    console.log(user);
    if (!user) {
      req.flash("error", "No account with the email exists");
      return res.redirect("/resetpassword");
    }
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();
    res.redirect("/");
    return transporter
      .sendMail({
        to: req.body.email,
        from: "tg.codes31@gmail.com",
        subject: "Reset your Password",
        html: `
      <p>Your have requested to reset your password</p>
      <p>Kindly click on the <a href = 'http://localhost:3000/resetpassword/${token}'>link</a> to reset your password</p>`,
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
exports.getNewPassword = async (req, res) => {
  const token = req.params.token;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });

  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/new-password", {
    path: "/new-password",
    pageTitle: "Reset Password",
    errorMessage: message,
    passwordToken: token,
    userId: user._id.toString(),
  });
};
exports.postNewPassword = async (req, res) => {
  const password = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  const user = await User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });
  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();
  console.log("User Password Changed Successfully");
  res.redirect("/login");
};
