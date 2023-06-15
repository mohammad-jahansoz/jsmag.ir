require("dotenv").config();
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.DATABASE_URL, {
  
  authSource: "admin",

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
