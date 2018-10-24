var moduleMongo = require("mongodb").MongoClient;

exports.connect = function (func) {
    moduleMongo.connect("mongodb://127.0.0.1:12701/carpool", func);
}