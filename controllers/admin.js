const Product = require("../models/product");

exports.getAddProduct = (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
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
    userId: req.user._id,
  });
  await product.save();
  console.log("Created a Product Successfully");
  res.redirect("/admin/products");
};
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.render("admin/products", {
    pageTitle: "Admin Products",
    prods: products,
    path: "/admin/products",
  });
};
exports.getEditProduct = async (req, res) => {
  const editMode = req.query.edit; //returns a string
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  res.render("admin/edit-product", {
    pageTitle: "Edit Product",
    path: "/admin/edit-product",
    editing: editMode,
    product,
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
  await Product.findByIdAndDelete(prodId);
  console.log("Deleted the product with id", prodId, "successfully");
  res.redirect("/admin/products");
};
