const express = require("express");
const router = express.Router();
const authController = require('../controllers/auth')

router.get('/login',authController.getLogin);
router.post('/login',authController.postLogin);
router.post('/logout',authController.postLogout);
router.get('/signup', authController.getSignUp);
router.post('/signup', authController.postSignUp);
router.get('/resetpassword',authController.getReset);
router.post('/resetpassword',authController.postResetPassword)
router.get('/resetpassword/:token',authController.getNewPassword)
router.post('/new-password',authController.postNewPassword)
module.exports = router;