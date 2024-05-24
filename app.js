const express = require("express");
const bodyParser = require("body-parser");
const path = require("path")
const adminData = require("./routes/admin")
const shopRoutes = require("./routes/shop")
const app = express();
const errorController = require("./controllers/error")

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

app.use(errorController.pageNotFound)