const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs')
const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const User = require("../models/user");
router.get("/login", authController.getLogin);
router.post(
  "/login",
  check("email")
    .isEmail()
    .withMessage("Please enter a valid e-mail")
    .custom(async (value, { req }) => {
      const userExists = await User.findOne({ email: value });
      if (!userExists) {
        throw new Error("Invalid Email");
      }
      return true;
    })
    .normalizeEmail(),
  body(
    "password",
    "Please enter the password with 5 characters and only to be AlphaNumeric"
  )
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),
  authController.postLogin
);
router.post("/logout", authController.postLogout);
router.get("/signup", authController.getSignUp);
router.post(
  "/signup",
  check("email")
    .isEmail()
    .withMessage("Invalid e-mail, Please check agin")
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email-id already exists, please login");
      }
      return true;
    })
    .normalizeEmail(),
  body(
    "password",
    "Please enter a password with only numbers and text and atleast of 5 characters"
  )
    .notEmpty()
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Both Passwords should match");
      }
      return true;
    }),
  authController.postSignUp
);
router.get("/resetpassword", authController.getReset);
router.post("/resetpassword", authController.postResetPassword);
router.get("/resetpassword/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);
module.exports = router;
