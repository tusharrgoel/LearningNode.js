const Product = require("../models/product");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");
const productsPerPage = 2;
exports.getProducts = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const numberOfProds = await Product.find({ userId: req.user._id }).countDocuments();
    const products = await Product.find({ userId: req.user._id })
      .skip((page - 1) * productsPerPage)
      .limit(productsPerPage);

    res.render("admin/products", {
      pageTitle: "Admin Products",
      prods: products,
      totalItems: numberOfProds,
      currentPage: page,
      hasPrevPage: page > 1,
      hasNextPage: (productsPerPage * page) < numberOfProds,
      path: "/admin/products",
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: Math.ceil(numberOfProds / productsPerPage),
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
  // const products = await Product.find({ userId: req.user._id });
  // try {
  //   res.render("admin/products", {
  //     pageTitle: "Admin Products",
  //     prods: products,
  //     path: "/admin/products",
  //     isAuthenticated: req.session.isLoggedIn,
  //   });
  // } catch (err) {
  //   const error = new Error(err);
  //   error.httpStatusCode = 500;
  //   return next(500);
  // }
};
exports.getAddProduct = (req, res) => {
  try {
    res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
};
exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      path: "/admin/add-product",
      pageTitle: "Add Product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage:
        "Attached file is not supported. Please upload in form of .png, .jpg or .jpeg",
      validationErrors: [],
    });
  }
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty() > 0) {
      console.log(errors.array())
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/edit-product",
        editing: false,
        product: {
          title: title,
          image: image,
          price: price,
          description: description,
        },
        isAuthenticated: req.session.isLoggedIn,
        hasError: true,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }
    const imageUrl = image.path;
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
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
};
exports.getEditProduct = async (req, res, next) => {
  try {
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
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
};
exports.postEditProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImage = req.file;
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
    if (updatedImage) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = updatedImage.path;
    }
    await product.save();
    console.log("Edited the product with id", prodId, "successfully");
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(500);
  }
};
exports.deleteProduct = async (req, res,next) => {
  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);
    if(!product){
      return next(new Error("Product not found"))
    }

    fileHelper.deleteFile(product.imageUrl);
    await Product.deleteOne({ _id: prodId, userId: req.user._id });
    
    console.log("Deleted the product with id", prodId, "successfully");
    res.status(200).json({message:"success product deletion"});
  } catch (err) {
    res.status(500).json({message:"deletion failed"});
  }
};
