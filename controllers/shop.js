const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const stripe = require("stripe")(
  "sk_test_51POcHOGXkJyvubQmPMtoBxeVASEXhCl1z54VLPeU2jjkUKUW6fSUGDuyBJfmhS8INnDvzJmed84REmPmEmmYjWw700GKP9QI9c"
);

const productsPerPage = 2;

exports.getProducts = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const numberOfProds = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * productsPerPage)
      .limit(productsPerPage);

    res.render("shop/index", {
      pageTitle: "All Products",
      prods: products,
      path: "/products",
      totalItems: numberOfProds,
      currentPage: page,
      hasPrevPage: page > 1,
      hasNextPage: productsPerPage * page < numberOfProds,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: Math.ceil(numberOfProds / productsPerPage),
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
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
  try {
    const page = +req.query.page || 1;
    const numberOfProds = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * productsPerPage)
      .limit(productsPerPage);

    res.render("shop/index", {
      pageTitle: "Shop",
      prods: products,
      totalItems: numberOfProds,
      currentPage: page,
      hasPrevPage: page > 1,
      hasNextPage: productsPerPage * page < numberOfProds,
      path: "/",
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: Math.ceil(numberOfProds / productsPerPage),
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
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
exports.getCheckout = async (req, res) => {
  try {
    const cartProducts = await req.user.populate("cart.items.productId");
    const products = cartProducts.cart.items;
    let total = 0;
    products.forEach((p) => {
      total += p.quantity * p.productId.price;
    }); 

    const session = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        line_items:products.map(p=>{
          return {
            price_data: {
              currency: 'inr',
              product_data: {
                name: p.productId.title,
                description: p.productId.description,
              },
              unit_amount: p.productId.price * 100, // amount in paise
            },
            quantity: p.quantity,
          };
        }),
        mode:'payment',
        success_url: req.protocol + "://" + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + "://" + req.get('host') + '/checkout/cancel'
    })

    res.render("shop/checkout", {
      path: "/checkout",
      pageTitle: "Checkout",
      products,
      totalSum: total,
      sessionId:session.id,
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (error) {
    console.log(error);
  }
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
