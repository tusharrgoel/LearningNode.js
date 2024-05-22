const express = require("express");
const bodyParser = require("body-parser");
const path = require("path")
const adminRoutes = require("./routes/admin")
const shopRoutes = require("./routes/shop")
const app = express();

app.use(bodyParser.urlencoded({extended:false}))
app.use(shopRoutes);
app.use("/admin", adminRoutes);
app.use(express.static(path.join(__dirname, "public")))


const PORT = 3000;
app.listen(PORT,(req,res)=>{
    console.log(`Server is running at PORT ${PORT}`);
});

app.get((req,res)=>{
    res.status(404).send(`<h1>Page not found</h1>`)
})