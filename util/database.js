const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const uri =
  "mongodb+srv://tushargoel:IWHxXRJ1IX48wFrQ@cluster0.ziucdkc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const mongoConnect = (callback) => {
  MongoClient.connect(uri)
    .then((client) => {
      console.log("Connected to MongoDB");
      callback(client);
    })
    .catch((err) => {
      console.log("Failed to connect", err);
    });
};
module.exports = mongoConnect;
