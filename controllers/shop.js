const Product = require("../models/product");
exports.getProducts = (req, res) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        pageTitle: "All Products",
        prods: products,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getProductDetail = (req, res) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        pageTitle: " Product Details ",
        path: "/products",
        product: product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getIndex = (req, res) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        pageTitle: "shop",
        prods: products,
        path: "/index",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getCart = async (req, res) => {
  const cart = await req.user.getCart();
  //console.log(cart);
  const cartProducts = await cart.getProducts();
  res.render("shop/cart", {
    path: "/cart",
    pageTitle: "Your Cart",
    products: cartProducts,
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
  const cart = await req.user.getCart();
  const products = await cart.getProducts({ where: { id: prodId } });
  let product;
  if (products.length > 0) {
    product = products[0];
  }
  let newQty = 1;
  if (product) {
    const oldQty = product.cartItem.quantity;
    const newQty = oldQty + 1;
    await cart.addProduct(product, { through: { quantity: newQty } });
    res.redirect("/cart");
  } else {
    const productData = await Product.findByPk(prodId);
    await cart.addProduct(productData, { through: { quantity: newQty } });
    res.redirect("/cart");
  }
};
exports.postDeleteCartItem = async (req, res) => {
  const prodId = req.body.productId;
  const cart = await req.user.getCart();
  const products = await cart.getProducts({ where: { id: prodId } });
  const product = products[0];
  console.log("message", product);
  await product.cartItem.destroy();
  res.redirect("/cart");
};
exports.getOrders = async (req, res) => {
  const order = await req.user.getOrders({include:['products']});

  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your orders",
    orders:order
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
