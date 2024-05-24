const Product = require("../models/product")

exports.getAddProduct = (req,res)=>{
    res.render('admin/edit-product',{
        pageTitle:'Add Product',
        path : '/admin/add-product',
        editing:false
    })
}
exports.postAddProduct = (req,res)=>{
    const title = req.body.title;
    const imageUrl =req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(null,title,imageUrl,description,price);
    product.save();
    res.redirect("/");
}
exports.getEditProduct = (req,res)=>{
     const editMode = req.query.edit; //returns a string
     if(!editMode){
       return res.redirect("/")
     }
    const prodId = req.params.productId;
    Product.findById(prodId,product =>{
        if(!product){
            return res.redirect("/")
        }
        res.render('admin/edit-product',{
        pageTitle:'Edit Product',
        path : '/admin/edit-product',
        editing:editMode,
        product,
        })
    })
}
exports.getProducts =  (req,res) =>{
Product.fetchAll((products)=>{
    res.render('admin/products',{
        pageTitle :'Admin Products',
        prods : products,
        path : "/admin/products",
    })
})
}
exports.postEditProduct = (req,res) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl =req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const updatedProduct = new Product(prodId,updatedTitle,updatedDescription,updatedImageUrl,updatedPrice);
    updatedProduct.save();
    res.redirect("/admin/products")
}