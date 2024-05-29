const express = require("express");
const path = require("path");
const router = express.Router();
const shopController = require("../controllers/shop")


router.get("/",shopController.getIndex);
router.get("/cart",shopController.getCart);
router.post('/cart',shopController.postCart);
router.post("/cart/delete-item",shopController.postDeleteCartItem);
router.get('/products',shopController.getProducts);
router.get('/checkout',shopController.getCheckout);
router.get('/orders',shopController.getOrders);
router.post('/create-order',shopController.postOrders);
router.get('/product-details/:productId',shopController.getProductDetail)

module.exports = router;