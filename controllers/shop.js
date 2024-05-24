const Product = require("../models/product")
const Cart = require("../models/cart")

exports.getProducts = (req,res)=>{
    Product.fetchAll((products)=>{
        res.render('shop/product-list',{
            pageTitle :'All Products',
            prods : products,
            path : "/products",
            hasProducts : products.length > 0
        })
    });
}
exports.getIndex = (req,res)=>{
    Product.fetchAll((products)=>{
        res.render('shop/index',{
            pageTitle :'shop',
            prods : products,
            path : "/index",
        })
    });
}
exports.getCart = (req,res)=>{
    res.render('shop/cart',{
        path:"/cart",
        pageTitle:"Your Cart"
    })
}
exports.postCart = (req,res)=>{
    const prodId = req.body.productId;
    Product.findById(prodId,(product)=>{
        Cart.addProduct(prodId,product.price);
    })
    console.log(prodId);
    res.redirect('/cart')
}
exports.getOrders = (req,res)=>{
    res.render('shop/orders',{
        path:"/orders",
        pageTitle:"Your orders"
    })
}
exports.getCheckout = (req,res)=>{
    res.render('/shop/checkout',{
        path:"/checkout",
        pageTitle:"Checkout"
    })
}

exports.getProductDetail = (req,res)=>{
    const prodId = req.params.productId;
    Product.findById(prodId,product => {
        res.render('shop/product-detail',{
            pageTitle:' Product Details ',
            path:'/products',
            product:product
        });
    });
}