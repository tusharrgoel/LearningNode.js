const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = async (req, res) => {
  const products = await Product.find();

  res.render("shop/product-list", {
    pageTitle: "All Products",
    prods: products,
    path: "/products",
    isAuthenticated : req.session.isLoggedIn

  });
};
exports.getProductDetail = async (req, res) => {
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  res.render("shop/product-detail", {
    pageTitle: " Product Details ",
    path: "/products",
    product: product,
    isAuthenticated : req.session.isLoggedIn

  });
};
exports.getIndex = async (req, res) => {
  const products = await Product.find();
  res.render("shop/index", {
    pageTitle: "shop",
    prods: products,
    path: "/index",
    isAuthenticated : req.session.isLoggedIn

  });
};
exports.getCart = async (req, res) => {
  const cartProducts = await req.user.populate("cart.items.productId");
  const products = cartProducts.cart.items;
  // const cartProducts = await cart.getProducts();
  res.render("shop/cart", {
    path: "/cart",
    pageTitle: "Your Cart",
    products: products,
    isAuthenticated :req.session.isLoggedIn

  });
};
exports.postCart = async (req, res) => {
  const prodId = req.body.productId;
  const product = await Product.findById(prodId);
  await req.user.addToCart(product);
  res.redirect("/cart");
};
exports.postDeleteCartItem = async (req, res) => {
  const prodId = req.body.productId;
  await req.user.removeFromCart(prodId);
  res.redirect("/cart");
};
exports.getOrders = async (req, res) => {
  const orders = await Order.find({ "user.userId": req.user._id });
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your orders",
    orders: orders,
    isAuthenticated : req.session.isLoggedIn
  });
};
exports.postOrders = async (req, res) => {
  const cartProducts = await req.user.populate("cart.items.productId");
  const products = cartProducts.cart.items.map((i) => {
    return { quantity: i.quantity, product: { ...i.productId._doc } };
  });
  const order = new Order({
    user: {
      name: req.user.name,
      userId: req.user._id,
    },
    products: products,
  });
  await order.save();
  await req.user.clearCart();
  res.redirect("/orders");
};
exports.getCheckout = (req, res) => {
  res.render("/shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
