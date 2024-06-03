const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

exports.getProducts = async (req, res) => {
  const products = await Product.find();

  res.render("shop/product-list", {
    pageTitle: "All Products",
    prods: products,
    path: "/products",
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.getProductDetail = async (req, res) => {
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  res.render("shop/product-detail", {
    pageTitle: " Product Details ",
    path: "/products",
    product: product,
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.getIndex = async (req, res) => {
  const products = await Product.find();
  res.render("shop/index", {
    pageTitle: "shop",
    prods: products,
    path: "/index",
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.getCart = async (req, res, next) => {
  try {
    const cartProducts = await req.user.populate("cart.items.productId");
    const products = cartProducts.cart.items;
    // const cartProducts = await cart.getProducts();
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products,
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
};
exports.postCart = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId);
    console.log(req.user);
    await req.user.addToCart(product);
    res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
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
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.postOrders = async (req, res) => {
  const cartProducts = await req.user.populate("cart.items.productId");
  const products = cartProducts.cart.items.map((i) => {
    return { quantity: i.quantity, product: { ...i.productId._doc } };
  });
  const order = new Order({
    user: {
      email: req.user.email,
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
exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new Error("No error found"));
  }
  if (order.user.userId.toString() !== req.user._id.toString()) {
    return next(new Error("Unauthorized"));
  }
  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("data", "invoices", invoiceName);
  const pdfDoc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline;filename="' + invoiceName + '"');
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);
  pdfDoc.fontSize(26).text("E - Dukkan", { bold: true });
  pdfDoc.fontSize(20).text("Invoice of your order with order id " + orderId, {
    underline: true,
  });

  pdfDoc.text("--------------------------------");
  let totalPrice = 0;
  order.products.forEach((prod) => {
    totalPrice += prod.quantity * prod.product.price;
    pdfDoc.text(
      prod.product.title +
        " - " +
        prod.quantity +
        " * " +
        "Rs " +
        prod.product.price
    );
  });
  pdfDoc.text("-------------------------");
  pdfDoc.text("Total Price = Rs " + totalPrice);
  pdfDoc.end();
  // fs.readFile(invoicePath, (err, data) => {
  //   if (err) {
  //     return next(err);
  //   }
  //   res.setHeader("Content-Type", "application/pdf");
  //   res.setHeader(
  //     "Content-Disposition",
  //     'inline;filename="' + invoiceName + '"'
  //   );
  //   res.send(data);
  // });
};
