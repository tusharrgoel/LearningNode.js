const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const adminController = require("../controllers/admin");

router.get("/products", isAuth, adminController.getProducts);
router.get("/add-product", isAuth, adminController.getAddProduct);
router.post(
  "/add-product",
  check("title").isString().isLength({ min: 3 }).withMessage('Invalid Title'),
  check("imageUrl").isURL().withMessage('Invalid Image Url'),
  check("price").isFloat().withMessage('Invalid Price'),
  check("title").isLength({ min: 8, max: 400 }).withMessage('Invalid Description'),
  isAuth,
  adminController.postAddProduct
);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post(
  "/edit-product",
  check("title").isString().isLength({ min: 3 }).withMessage('Invalid Title'),
  check("imageUrl").isURL().withMessage('Invalid Image Url'),
  check("price").isFloat().withMessage('Invalid Price'),
  check("description").isLength({ min: 8, max: 400 }).withMessage('Invalid Description'),
  isAuth,
  adminController.postEditProduct
);
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

exports.routes = router;
