const express = require("express");
const path = require("path");
const router = express.Router();
const rootDir = require("../util/path")
const products = [];

router.get("/add-product",(req,res)=>{
    res.render('add-product',{pageTitle:'Add Product'})
});

router.post("/add-product",(req,res)=>{
    //console.log(req.body);
    products.push({title:req.body.title});
    //res.sendFile(path.join(rootDir,"views","shop.html"));
    res.redirect("/");
});


exports.routes = router;
exports.products = products;