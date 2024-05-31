const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const adminController = require("../controllers/admin");

router.get("/add-product", isAuth, adminController.getAddProduct);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post("/edit-product", isAuth, adminController.postEditProduct);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

router.post("/add-product", isAuth, adminController.postAddProduct);

router.get("/products", isAuth, adminController.getProducts);


exports.routes = router;
