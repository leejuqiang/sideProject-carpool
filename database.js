var moduleMongo = require("mongodb").MongoClient;
var server = require("./server");
var dbCarpool;

exports.connect = function (func) {
    moduleMongo.connect("mongodb://127.0.0.1:" + server.config.databasePort + "/carpool", function (err, db) {
        if (err == null) {
            dbCarpool = db.db("carpool");
        }
        func(err);
    });
}

/**
 * Queries data from a collection
 * @param collectionName {string} The name of the collection
 * @param query {Object} The query object for mongodb
 * @param func {function} The callback. function(error, array results)
 */
exports.query = function (collectionName, query, func) {
    dbCarpool.collection(collectionName).find(query).toArray(func);
}