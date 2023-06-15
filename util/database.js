require("dotenv").config();
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.DATABASE_URL, {
  // const client = new MongoClient(
  // "mongodb://root:XayVTOf9JCGa9KBDTQC5u97b@esme.iran.liara.ir:32785/my-app?authSource=admin",
  // {
  authSource: "admin",
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

let dbConnection;
module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      if (err || !db) {
        return callback(err);
      } else {
        dbConnection = db.db("jsmag");
        console.log("Successfully connected to MongoDB");
        dbConnection.collection("posts").createIndex({
          title: "text",
          description: "text",
          tags: "text",
        });
        dbConnection.collection("users").createIndex({
          email: "text",
        });
        return callback();
      }
    });
  },
  getDb: function () {
    return dbConnection;
  },
};
