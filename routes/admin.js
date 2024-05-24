const express = require("express");
const path = require("path");
const router = express.Router();
const rootDir = require("../util/path")

const adminController = require("../controllers/admin")

router.get("/add-product",adminController.getAddProduct);

router.get("/edit-product/:productId",adminController.getEditProduct);
router.post("/edit-product",adminController.postEditProduct);

router.post("/add-product",adminController.postAddProduct);

router.get('/products',adminController.getProducts);
exports.routes = router;
