const express = require("express");
const path = require("path");
const router = express.Router();
const rootDir = require("../util/path")

router.get("/add-product",(req,res)=>{
    res.sendFile(path.join(rootDir,"views","add-product.html"));
});

router.post("/add-product",(req,res)=>{
    console.log(req.body);
    res.send(`The title you added was ${req.body.title}`)
   //res.redirect("/");
});


module.exports = router;