var moduleMongo = require("mongodb").MongoClient;
var server = require("./server");

exports.connect = function (func) {
    moduleMongo.connect("mongodb://127.0.0.1:" + server.config.databasePort + "/carpool", func);
}