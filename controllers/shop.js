const Product = require("../models/product");
exports.getProducts = async (req, res) => {
  const products = await Product.find();

  res.render("shop/product-list", {
    pageTitle: "All Products",
    prods: products,
    path: "/products",
  });
};
exports.getProductDetail = async (req, res) => {
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  res.render("shop/product-detail", {
    pageTitle: " Product Details ",
    path: "/products",
    product: product,
  });
};
exports.getIndex = async (req, res) => {
  const products = await Product.find();
  res.render("shop/index", {
    pageTitle: "shop",
    prods: products,
    path: "/index",
  });
};
exports.getCart = async (req, res) => {
  const cartProducts = await req.user.populate('cart.items.productId');
  const products = (cartProducts.cart.items);
 // const cartProducts = await cart.getProducts();
  res.render("shop/cart", {
    path: "/cart",
    pageTitle: "Your Cart",
    products: products,
  });

  // Cart.getCart((cart) => {
  //   Product.fetchAll((products) => {
  //     const cartProducts = [];
  //     for (p of products) {
  //       const cartProductData = cart.products.find((prod) => prod.id === p.id);
  //       if (cartProductData) {
  //         cartProducts.push({ productData: p, qty: cartProductData.qty });
  //       }
  //     }
  //   });
  // });
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
  const order = await req.user.getOrders({ include: ["products"] });

  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your orders",
    orders: order,
  });
};
exports.postOrders = async (req, res) => {
  const cart = await req.user.getCart();
  const cartProducts = await cart.getProducts();
  const order = await req.user.createOrder();
  await order.addProducts(
    cartProducts.map((cp) => {
      cp.orderItem = { quantity: cp.cartItem.quantity };
      return cp;
    })
  );
  await cart.setProducts(null);
  res.redirect("/orders");
};
exports.getCheckout = (req, res) => {
  res.render("/shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
