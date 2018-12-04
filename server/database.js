var moduleMongo = require("mongodb").MongoClient;
var server = require("./server");
var mongoDB;

exports.connect = function (func) {
    moduleMongo.connect("mongodb://127.0.0.1:" + server.config.databasePort + "/carpool", { "poolSize": server.config.databasePoolSize }, function (err, db) {
        if (err === null) {
            mongoDB = db;
            func(null);
        } else {
            server.logger.error("connect to db error: " + err);
            func(server.errorCode.databaseError);
        }
    });
}

/**
 * Gets a connection to database
 * @returns The db object
 */
function getDB() {
    return mongoDB.db("carpool");
}

/**
 * Insets a record to database
 * @param collectionName {string} The name of the collection
 * @param data {Object} The record, if successfully inserted, the _id will be added to the data
 * @param func {function} Callback. function(errorCode err)
 */
exports.insert = function (collectionName, data, func) {
    getDB().collection(collectionName).insertOne(data, function (err, res) {
        if (err === null) {
            data._id = res.insertedId;
            server.logger.info("insert into collection " + collectionName + " with id " + data._id.toString());
            func(null);
        } else {
            server.logger.error("insert to db error: " + err);
            func(server.errorCode.databaseError);
        }
    });
}

/**
 * Insets some records to database
 * @param collectionName {string} The name of the collection
 * @param data {array} The records
 * @param func {function} Callback. function(errorCode err, int insertedCount)
 */
exports.insertMany = function (collectionName, data, func) {
    getDB().collection(collectionName).insertMany(data, function (err, res) {
        if (err === null) {
            func(null, res.insertedCount);
        } else {
            server.logger.error("insert many to db error: " + err);
            func(server.err.databaseError, 0);
        }
    });
}

/**
 * Queries data from a collection
 * @param collectionName {string} The name of the collection
 * @param query {Object} The query object for mongodb
 * @param func {function} The callback. function(errorCode error, array results)
 */
exports.query = function (collectionName, query, func) {
    getDB().collection(collectionName).find(query).toArray(function (err, results) {
        if (err === null) {
            func(null, results);
        } else {
            server.logger.error("query db error: " + err);
            func(server.errorCode.databaseError, null);
        }
    });
}

exports.clearCollection = function (collectionName, func) {
    getDB().collection(collectionName).deleteMany({}, function (err, result) {
        if (err === null) {
            console.log("delete " + result.result.n + " records");
        }
        func();
    });
}

/**
 * Logins a user
 * @param loginName {string} The loginName
 * @param password {string} The password
 * @param func {function} The callback. function(errorCode error, Object user). The session id will be append to user.sessionId
 */
exports.loginUser = function (loginName, password, func) {
    exports.query("user", { "loginName": loginName, "password": password }, function (err, results) {
        if (err !== null) {
            func(err, null);
        } else {
            if (results.length <= 0) {
                func(server.errorCode.noSuchUser, null);
            } else {
                var user = results[0];
                var userId = server.getIdString(user);
                var t = server.timeStamp();
                var sess = userId + t;
                t += 3600000;
                exports.update("user", { "_id": user._id }, { $set: { "sessionID": sess, "expire": t } }, function (err, res) {
                    if (err === null) {
                        user.sessionId = sess;
                        func(null, user);
                    } else {
                        func(err, null);
                    }
                });
            }
        }
    });
}

/**
 * Updates a record
 * @param collectionName {string} The name of the collection
 * @param query {Object} The query filter
 * @param set {Object} The update filter
 * @param func {function} The callback. function(errorCode error, int updateNumber)
 */
exports.update = function (collectionName, query, set, func) {
    getDB().collection(collectionName).updateOne(query, set, function (err, res) {
        if (err !== null) {
            server.logger.error("update fail: " + err);
            func(server.errorCode.databaseError, 0);
        } else {
            func(null, res.result.nModified);
        }
    });
}

/**
 * Gets the user from userId and session
 * @param userId {string} The user id
 * @param session {string} The session
 * @param func {function} The callback. function(Object user, errorCode error), if error is not null, then user is null
 */
exports.getUser = function (userId, session, func) {
    exports.query("user", { "_id": server.stringToID(userId) }, function (err, result) {
        if (err !== null) {
            func(null, err);
        } else {
            if (result.length <= 0) {
                func(null, server.errorCode.noSuchUser);
                return;
            }
            var user = result[0];
            if (session != null && user.sessionID != session) {
                func(null, server.errorCode.sessionInvalid);
            } else {
                var time = Date.now();
                if (time > user.expire) {
                    func(null, server.errorCode.sessionInvalid);
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
 * @param func {function} The callback. function(errorCode error), if error is null, user["post"] will include all the information of the user,
 * User.post: {repeatedPost: [], addPost: [], cancel: []}
 */
exports.getUserDriverInfo = function (user, func) {
    var id = server.getIdString(user);
    exports.query("driverrepeatedpost", { "userID": id }, function (err, posts) {
        if (err !== null) {
            func(err);
            return;
        }
        user["post"] = {};
        user.post["repeatedPost"] = posts;
        exports.query("driveradditionalpost", { "userID": id }, function (err, adPosts) {
            if (err !== null) {
                func(err);
                return;
            }
            user.post["addPost"] = adPosts;
            exports.query("drivercanceledpost", { "userID": id }, function (err, cancels) {
                if (err !== null) {
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
 * Gets the applications for the post of this user
 * @param user {Object} The user
 * @param postIds {array} The repeated post ids
 * @param addPostIds {array} The addational post ids
 * @param func {function} The callback. function(errorCode err), user.repeatAppForPost and user.addAppForPost will be attached to the user
 */
exports.getApplicationForUser = function (user, postIds, addPostIds, func) {
    exports.query("repeatedapplication", { "driverPostID": { $in: postIds } }, function (err, results) {
        if (err != null) {
            func(err);
        } else {
            user["repeatAppForPost"] = results;
            exports.query("additionalapplication", { "driverPostID": { $in: addPostIds } }, function (err, results) {
                if (err != null) {
                    func(err);
                } else {
                    user["addAppForPost"] = results;
                    func(null);
                }
            })
        }
    });
}

/**
 * Gets the user's passenger calender information
 * @param user {Object} The user got from getUser
 * @param func {function} The callback. function(errorCode error), if error is null, user["application"] will include all the information of the user
 * user.application: {apps: [], addApps: []}
 */
exports.getUserPassengerInfo = function (user, func) {
    var id = server.getIdString(user);
    exports.query("repeatedapplication", { "userID": id }, function (err, apps) {
        if (err !== null) {
            func(err);
            return;
        }
        user["application"] = {};
        user.application["apps"] = apps;
        exports.query("additionalapplication", { "userID": id }, function (err, adApps) {
            if (err !== null) {
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
 * @param func {function} The callback. function(errorCode error, array result)
 */
exports.getPostInRange = function (collectionName, lat, long, range, func) {
    var minLat = lat - range;
    var maxLat = lat + range;
    var minLong = long - range;
    var maxLong = long + range;
    var query = { "lat": { "$gt": minLat, "$lt": maxLat }, "long": { "$gt": minLong, "$lt": maxLong } };
    exports.query(collectionName, query, func);
}


/**
 * Check time confliction （whether driver/passanger additional is valid）
 * @param userID {number} The id of user
 * @param date {number} The date (eg. 20180810)
 * @param time {number} The time (from 8 to 20)
 * @param func {function} The callback. function(errorCode error)
 */
exports.checkAdditionalValidate = function(userID, date, time, func){
    // var id = server.getIdString(user);
    exports.query("driveradditionalpost", { "userID": userID, "date": date, "time": time }, function (err, adPosts) {
        if (err !== null) {
            func(err);
            return;
        }
        if(adPosts != null){
            func(server.errorCode.timeConflict);
        }
        else{
            //status is 1(accept)
            exports.query("additionalapplication", { "userID": id, "status": 1}, function (err, adApplication) {
                if (err !== null) {
                    func(err);
                    return;
                }
                var i;
                for (i = 0; i < adApplication.length; i++) { 
                    var driverPostID = adApplication[i][driverPostID];
                    exports.query("driveradditionalpost", { "userID": driverPostID, "date": date, "time": time }, function (err, adPostResult) {
                        if (err !== null) {
                            func(err);
                            return;
                        }
                        if(adPostResult != null){
                            func(server.errorCode.timeConflict);
                            return;
                        }
                    });  
                }
                func(null);
            });
        }      
    });  
}
/**
 * Check time confliction（whether driver/passanger repeated is valid）
 * @param userID {number} The id of user
 * @param day {number} The day (Monday to Sunday: 1 to 7)
 * @param time {number} The time (from 08 to 20)
 * @param func {function} The callback. function(errorCode error)
 */
exports.checkRepeatedValidate = function(userID, day, time, func){
    // var id = server.getIdString(user);
    //day: 1 2 3 4 5 6 7
    //time: 08 ~ 20
    var key = "availableSeats." + 100 * day + time;
    //cursor = db.inventory.find({"size.uom": "cm"})
    //# 查询所有文档中，没有item字段的记录
    //cursor = db.inventory.find({"item": {"$exists": False}})
    exports.query("driverrepeatedpost", { "userID": userID, key : {"$exists": true} }, function (err, rpPosts) {
        if (err !== null) {
            func(err);
            return;
        }
        if(rpPosts != null){
            func(server.errorCode.timeConflict);
        }
        else{
            exports.query("repeatedapplication", { "userID": id, "day": day, "time": time }, function (err, rpApplications) {
                if (err !== null) {
                    func(err);
                    return;
                }
                if(rpApplications != null){
                    func(server.errorCode.timeConflict);
                }
                func(null);
            });
        }
    });
}