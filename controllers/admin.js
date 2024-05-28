const Product = require("../models/product");

exports.getAddProduct = (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};
exports.postAddProduct = (req, res) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  req.user
    .createProduct({
      title: title,
      imageUrl: imageUrl,
      price: price,
      description: description,
    })
    .then((result) => {
      console.log("Product Created");
      res.redirect("/products");
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getProducts = (req, res) => {
  req.user
    .getProducts()
    .then((products) => {
      res.render("admin/products", {
        pageTitle: "Admin Products",
        prods: products,
        path: "/admin/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getEditProduct =  async(req, res) => {
  const editMode = req.query.edit; //returns a string
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  const products = await req.user.getProducts({ where: { id: prodId } })
  //Product.findByPk(prodId)
    //.then(products => {
      const product = products[0];
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product,
      });
   // })
    //.catch((err) => {
      //console.log(err);
    //});
};
exports.postEditProduct = async (req, res) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

 const product = await Product.findByPk(prodId)
    //.then( (product) => {
      product.title = updatedTitle;
      product.description = updatedDescription;
      product.price = updatedPrice;
      product.imageUrl = updatedImageUrl;
      await product.save();

  res.redirect("/admin/products");
};
exports.postDeleteProduct = async (req, res) => {
  const prodId = req.body.productId;
  const product = await Product.findByPk(prodId)
  await product.destroy();
  res.redirect("/admin/products");
};
