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
 * Insets a record to database
 * @param collectionName {string} The name of the collection
 * @param data {Object} The record
 * @param func {function} Callback. function(err, int insertedCount)
 */
exports.insert = function (collectionName, data, func) {
    dbCarpool.collection(collectionName).insert(data, function (err, res) {
        func(err, res.insertedCount);
    });
}

/**
 * Insets some records to database
 * @param collectionName {string} The name of the collection
 * @param data {array} The records
 * @param func {function} Callback. function(err, int insertedCount)
 */
exports.insertMany = function (collectionName, data, func) {
    dbCarpool.collection(collectionName).insertMany(data, function (err, res) {
        func(err, res.insertedCount);
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
 * @param func {function} The callback. function(string error), if error is null, user["post"] will include all the information of the user,
 * User.post: {repeatedPost: [], addPost: [], cancel: []}
 */
exports.getUserDriverInfo = function (user, func) {
    var id = server.getIdString(user);
    exports.query("driverrepeatedpost", { "userID": id }, function (err, posts) {
        if (err != null) {
            func(err);
            return;
        }
        user["post"] = {};
        user.post["repeatedPost"] = posts;
        exports.query("driveradditionalpost", { "userID": id }, function (err, adPosts) {
            if (err != null) {
                func(err);
                return;
            }
            user.post["addPost"] = adPosts;
            exports.query("drivercanceledpost", { "userID": id }, function (err, cancels) {
                if (err != null) {
                    func(err);
                    return;
                }
                user.post["cancel"] = cancels;
                func(null);
            });
        });
    });
}

/**
 * Gets the user's passenger calender information
 * @param user {Object} The user got from getUser
 * @param func {function} The callback. function(string error), if error is null, user["application"] will include all the information of the user
 * user.application: {apps: [], addApps: []}
 */
exports.getUserPassengerInfo = function (user, func) {
    var id = server.getIdString(user);
    exports.query("repeatedapplication", { "userID": id }, function (err, apps) {
        if (err != null) {
            func(err);
            return;
        }
        user["application"] = {};
        user.application["apps"] = apps;
        exports.query("additionalapplication", { "userID": id }, function (err, adApps) {
            if (err != null) {
                func(err);
                return;
            }
            user.application["addApps"] = adApps;
            func(null);
        });
    });
}

/**
 * Searchs all post within a range
 * @param collectionName {string} The collection name
 * @param lat {number} The latitude
 * @param long {number} The longitude
 * @param range {number} The range
 * @param func {function} The callback. function(error, array result)
 */
exports.getPostInRange = function (collectionName, lat, long, range, func) {
    var minLat = lat - range;
    var maxLat = lat + range;
    var minLong = long - range;
    var maxLong = long + range;
    var query = { "lat": { "$gt": minLat, "$lt": maxLat }, "long": { "$gt": minLong, "$lt": maxLong } };
    exports.query(collectionName, query, func);
}