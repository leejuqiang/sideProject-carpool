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

/**
 * Gets the user from userId and session
 * @param userId {string} The user id
 * @param session {string} The session
 * @param func {function} The callback. function(Object user, string error), if error is not null, then user is null
 */
exports.getUser = function (userId, session, func) {
    exports.query("user", { "_id": server.stringToID(userId) }, function (err, result) {
        if (err != null) {
            func(null, "can't find user");
        } else {
            var user = result[0];
            if (user.session != session) {
                func(null, "session not match");
            } else {
                var time = new Date().getTime();
                if (time > user.expire) {
                    func(null, "session expire");
                } else {
                    func(user, null);
                }
            }
        }
    });
}

/**
 * Gets the user's driver calender information
 * @param user {Object} The user got from getUser
 * @param func {function} The callback. function(string error), if error is null, user["post"] will include all the information of the user
 */
exports.getUserDriverInfo = function (user, func) {

}

/**
 * Gets the user's passenger calender information
 * @param user {Object} The user got from getUser
 * @param func {function} The callback. function(string error), if error is null, user["application"] will include all the information of the user
 */
exports.getUserPassengerInfo = function (user, func) {

}