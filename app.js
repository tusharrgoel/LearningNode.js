const express = require("express");
const bodyParser = require("body-parser");
const path = require("path")
const adminData = require("./routes/admin")
const shopRoutes = require("./routes/shop")
const app = express();

app.set("view engine", 'ejs');
app.set('views','views')
app.use(bodyParser.urlencoded({extended:false}))
app.use(shopRoutes);
app.use("/admin", adminData.routes);
app.use(express.static(path.join(__dirname, "public")))


const PORT = 3000;
app.listen(PORT,(req,res)=>{
    console.log(`Server is running at PORT ${PORT}`);
});

app.use((req,res)=>{
    res.status(404).render('404',{pageTitle: "Page Not Found",path:"/404"})
})