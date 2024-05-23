const express = require("express");
const path = require("path");
const router = express.Router();
const adminData = require('./admin');
const rootDir = require("../util/path")

router.get("/",(req,res)=>{
    console.log(adminData.products);
    const products =  adminData.products;
    res.render('shop',{
        pageTitle :'shop',
        prods : products,
        path : "/"
    })
});
router.get("/",(req,res)=>{
   res.render('shop',{path: "/"})
});


module.exports = router;