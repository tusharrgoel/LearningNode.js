const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sgt = require("nodemailer-sendgrid-transport");
const nodeMailer = require("nodemailer");
const { validationResult } = require("express-validator");
const { ReturnDocument } = require("mongodb");
const { error } = require("console");
const transporter = nodeMailer.createTransport(
  sgt({
    auth: {
      api_key:
        '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',
    },
  })
);
exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  try {
    res.render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      isAuthenticated: false,
      errorMessage: message,
      oldData: { email: " ", password: " " },
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
};
exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        isAuthenticated: false,
        errorMessage: errors.array()[0].msg,
        oldData: { email: email, password: password },
        validationErrors: errors.array(),
      });
    }
    const userExists = await User.findOne({ email: email });
    const passwordMatched = await bcrypt.compare(password, userExists.password);

    if (passwordMatched) {
      req.session.isLoggedIn = true;
      req.session.user = userExists;
      req.session.save((err) => {
        console.log("User logged in successfully");
        res.redirect("/");
      });
    } else {
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        isAuthenticated: false,
        errorMessage: "Invalid  Password",
        oldData: { email: email, password: password },
        validationErrors: [{ path: "password" }],
      });
    }
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
};
exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log("User logged out");
    res.redirect("/");
  });
};
exports.getSignUp = (req, res, next) => {
  try {
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
      oldData: {
        email: "",
        password: "",
        confirmPassword: "",
      },
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
};
exports.postSignUp = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        path: "/signup",
        pageTitle: "SignUp",
        isAuthenticated: false,
        errorMessage: errors.array()[0].msg,
        oldData: { email: email },
        validationErrors: errors.array(),
      });
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
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
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
      console.log("this is th new error",err);
      res.redirect("/resetpassword");
    }
    const token = buffer.toString("hex");
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "No account with the email exists");
      return res.redirect("/resetpassword");
    }
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();
    res.redirect("/login");
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
        console.log("semd grid error",err)
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
