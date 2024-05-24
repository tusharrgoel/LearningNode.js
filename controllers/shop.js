const Product = require("../models/product")

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
exports.getOrders = (req,res)=>{
    res.render('shop/orders',{
        path:"/orders",
        pageTitle:"Your orders"
    })
}
exports.GetCheckout = (req,res)=>{
    res.render('/shop/checkout',{
        path:"/checkout",
        pageTitle:"Checkout"
    })
}

