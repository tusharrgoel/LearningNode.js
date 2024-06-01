const Product = require("../models/product");
const User = require("../models/user");
const { validationResult } = require("express-validator");
exports.getProducts = async (req, res) => {
  const products = await Product.find({ userId: req.user._id });
  res.render("admin/products", {
    pageTitle: "Admin Products",
    prods: products,
    path: "/admin/products",
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.getAddProduct = (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};
exports.postAddProduct = async (req, res) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty() > 0) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
      },
      isAuthenticated: req.session.isLoggedIn,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.user,
  });
  await product.save();
  console.log("Created a Product Successfully");
  res.redirect("/admin/products");
};
exports.getEditProduct = async (req, res) => {
  const editMode = req.query.edit; //returns a string
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  if (product.userId.toString() !== req.user._id.toString()) {
    console.log("Unable to edit");
    return res.redirect("/");
  }
  res.render("admin/edit-product", {
    pageTitle: "Edit Product",
    path: "/admin/edit-product",
    editing: editMode,
    product,
    hasError: false,
    errorMessage: null,
    isAuthenticated: req.session.isLoggedIn,
    validationErrors: [],
  });
};
exports.postEditProduct = async (req, res) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty() > 0) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      product: {
        _id: prodId,
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDescription,
      },
      isAuthenticated: req.session.isLoggedIn,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const product = await Product.findById(prodId);
  product.title = updatedTitle;
  product.description = updatedDescription;
  product.price = updatedPrice;
  product.imageUrl = updatedImageUrl;
  await product.save();
  console.log("Edited the product with id", prodId, "successfully");
  res.redirect("/admin/products");
};
exports.postDeleteProduct = async (req, res) => {
  const prodId = req.body.productId;
  await Product.deleteOne({ _id: prodId, userId: req.user._id });
  console.log("Deleted the product with id", prodId, "successfully");
  res.redirect("/admin/products");
};
