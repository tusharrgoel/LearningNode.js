const Product = require("../models/product");
const User = require("../models/user");
exports.getAddProduct = (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.postAddProduct = async (req, res) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
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
exports.getProducts = async (req, res) => {
  const products = await Product.find({ userId: req.user._id });
  res.render("admin/products", {
    pageTitle: "Admin Products",
    prods: products,
    path: "/admin/products",
    isAuthenticated: req.session.isLoggedIn,
  });
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
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.postEditProduct = async (req, res) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

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
