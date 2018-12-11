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
 * Inserts a record to database
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
 * Inserts some records to database
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

/**
 * Delete the all data form a table
 * @param collectionName {string} The name of the collection
 * @param func {Function} The callback. Function(errorCode error)
 */
exports.clearCollection = function (collectionName, func) {
    getDB().collection(collectionName).deleteMany({}, function (err, result) {
        if (err === null) {
            console.log("delete " + result.result.n + " records");
        }
        func();
    });
}

/**
 * Delete the one data form a table
 * @param collectionName {string} The name of the collection
 * @param query {Object} The query object for mongodb
 * @param func {Function} The callback. Function(errorCode error, int deleteCount)
 */
exports.delete = function (collectionName, query, func) {
    getDB().collection(collectionName).deleteOne(query, function (err, result) {
        if (err === null) {
            console.log("delete " + result.result.n + " records");
            func(null, result.result.n);
        }
        else{
            func(server.errorCode.databaseError, 0);
        }
        
    });
}


/**
 * Checks if the user is valid
 * @param userId {string} The user's id
 * @param session {string} The user's session
 * @param func {Function} The callback. Function(errorCode error, Object user)
 */
exports.validUser = function (userId, session, func) {
    var id = server.stringToID(userId);
    if (id === null) {
        func(server.errorCode.invalidId, null);
        return;
    }
    exports.query("user", { "_id": id, "sessionID": session }, function (err, results) {
        if (err !== null) {
            func(err, null);
        } else if (results.length <= 0) {
            func(server.errorCode.noSuchUser, null);
        } else {
            var user = results[0];
            var t = server.timeStamp();
            if (t > user.expire) {
                func(server.errorCode.sessionInvalid, null);
            } else {
                func(null, user);
            }
        }
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
    var id = server.stringToID(userId);
    if (id === null) {
        func(null, server.errorCode.invalidId);
        return;
    }
    exports.query("user", { "_id": id }, function (err, result) {
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
exports.checkAdditionalValidate = function (userID, date, time, func) {
    // var id = server.getIdString(user);
    exports.query("driveradditionalpost", { "userID": userID, "date": date, "time": time }, function (err, adPosts) {
        if (err != null) {
            func(err);
            return;
        }
        if (adPosts.length != 0) {
            console.log("post: " + adPostResult);
            console.log(adPosts);
            func(server.errorCode.timeConflict);
        }
        else {
            //status is 1(accept)
            exports.query("additionalapplication", { "userID": userID, "status": 0 }, function (err, adApplication) {
                if (err !== null) {
                    func(err);
                    return;
                }
                var i;
                console.log("adApplication: " + adApplication);

                var ids = [];
                for (i = 0; i < adApplication.length; i++) {
                    ids.push(server.stringToID(adApplication[i].driverPostID[0]));
                }
                exports.query("driveradditionalpost", { "_id": { $in: ids }, "date": date, "time": time }, function (err, adPostResult) {
                    if (adPostResult.length == 0) {
                        func(null);
                    }
                    else {
                        func(server.errorCode.timeConflict);
                    }
                });

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
exports.checkRepeatedValidate = function (userID, day, time, func) {
    // var id = server.getIdString(user);
    //day: 1 2 3 4 5 6 7
    //time: 08 ~ 20
    var t = 100 * day + time;
    var key = "availableSeats." + t;
    console.log("key:" + key);

    //mongodb is ok, but can not find by using this code
    //> db.driverrepeatedpost.find({"availableSeats.108": {"$exists": true},"userID":"5c0f0319244cf10ab296aa84"})
    var dict = { "userID": userID};
    dict[key] = { "$exists": true };
    console.log(dict);
    exports.query("driverrepeatedpost", dict, function (err, rpPosts) {
        if (err !== null) {
            func(err);
            return;
        }
        console.log("rpPosts.length:" + rpPosts.length);
        if (rpPosts.length != 0) {
            func(server.errorCode.timeConflict);
        }
        else {
            //can not find any records in table repeatedapplication now, fix latter
            exports.query("repeatedapplication", { "userID": userID, "day": day, "time": time }, function (err, rpApplications) {
                if (err !== null) {
                    func(err);
                    return;
                }
                console.log("rpApplications:" + rpApplications);
                if (rpApplications.length != 0) {
                    func(server.errorCode.timeConflict);
                    return;
                }
                func(null);
            });
        }
    });
}


/**
 * Delete data from driveradditionalpost
 * @param userID {number} The id of user
 * @param date {number} The date (eg. 20180810)
 * @param time {number} The time (from 8 to 20)
 * @param func {Function} The callback. Function(int deleteLine)
 */
exports.deleteAdditionalPost = function (postID, func) {
    exports.delete("driveradditionalpost", { "_id": postID}, function(err, result){
        if (err != null) {
            func();
                
        }
    });
    //search { "driverPostID": { $in: postIds } }
    exports.query("additionalapplication", { "driverPostID": { $in: postID }}, function (err, addApps) {
        if (err != null) {
            func();
            return;
        }
        //exsits
        if(additionalapplication.length != 0){
            //update
            var n = addApps.postID.length;
            for(i = 0; i < n; i++){
                if (addApps.postID[i] = postID) {
                    ddApps.postID[i] = addApps.postID[n-1];
                    addApps.status[i] = addApps.status[n-1];
                    n--;
                }
            } 
        exports.update("additionalapplication", {}, set, func); 
        }
        //not exists
        else{
            func(result);
        }
    });
}


/**
 * Delete data from driverrepeatedpost
 * @param userID {number} The id of user
 * @param day {number} The day (from 1 to 7)
 * @param time {number} The time (from 8 to 20)
 * @param func {Function} The callback. Function(int deleteLine)
 */
exports.deleteRepeatedPost = function (postID, func) {
    
    exports.delete("driverrepeatedpost", {"_id": postID}, function(err, result){
        if (err != null) {
            func();
        }
        else{
            func(result);
        }
    });
    //search { "driverPostID": { $in: postIds } }
    exports.query("additionalapplication", { "driverPostID": { $in: postID }}, function (err, addApps) {
        if (err != null) {
            func();
            return;
        }
        //exsits
        if(additionalapplication.length != 0){
            //update
            var n = addApps.postID.length;
            for(i = 0; i < n; i++){
                if (addApps.postID[i] = postID) {
                    ddApps.postID[i] = addApps.postID[n-1];
                    addApps.status[i] = addApps.status[n-1];
                    n--;
                }
            } 
        exports.update("additionalapplication", {}, set, func); 
        }
        //not exists
        else{
            func(result);
        }
    });
    
}

/**
 * Delete data from repeatedapplication
 * @param userID {number} The id of user
 * @param day {number} The day (from 1 to 7)
 * @param time {number} The time (from 8 to 20)
 * @param func {Function} The callback. Function(int deleteLine)
 */
exports.deleteRepeatedApplication = function (appID, func) {
    exports.query("repeatedapplication", { "_id": appID}, function (err, rpApps) {
        if (err !== null) {
            func();
            return;
        }

        if(rpApps.length != 0){
            var num = rpApps.passengerNumber;
            exports.delete("repeatedapplication", { "_id": appID}, function(err, result){
                if (err != null) {
                    func();
                    return;
                }
                else{
                    func(result);
                }
            });
            var ids = [];
            var n = rpApps.status.length;
            for(i = 0; i < n; i++){
                if(rpApps.status[i] == 1){
                    ids.push(server.stringToID(rpApps.driverPostID[i]));
                }
            }

            //availableSeats: {"110":4, "310":4} value + num
            exports.update("driverrepeatedpost", { "_id": { $in: ids} }, num, function(err, result){
                if (err != null) {
                    func();
                    return;
                }
            });
        }
        else{
            func(0);
            return; 
        }
    });    
      
}


/**
 * Delete data from repeatedapplication
 * @param userID {number} The id of user
 * @param day {number} The day (from 1 to 7)
 * @param time {number} The time (from 8 to 20)
 * @param func {Function} The callback. Function(int deleteLine)
 */
exports.deleteAdditionalApplication = function (appID, func) {
    exports.query("additionalapplication", { "_id": appID}, function (err, addApps) {
        if (err !== null) {
            func();
            return;
        }

        if(addApps.length != 0){
            var num = addApps.passengerNumber;
            exports.delete("repeatedapplication", { "_id": appID}, function(err, result){
                if (err != null) {
                    func();
                    return;
                }
                else{
                    func(result);
                }
            });
            var ids = [];
            var n = addApps.status.length;
            for(i = 0; i < n; i++){
                if(addApps.status[i] == 1){
                    ids.push(server.stringToID(rpPosts.driverPostID[i]));
                }
            }

            //availableSeats: {"110":4, "310":4} value + num
            exports.update("driverrepeatedpost", { "_id": { $in: ids} }, num, function(err, result){
                if (err != null) {
                    func();
                    return;
                }
            });
        }
        else{
            func(0);
            return; 
        }
    });    
      
}