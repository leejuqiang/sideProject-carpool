var server = require("./server");
var dbPsg = require("./databasePassengers");

exports.onRequest = function(req, res){
    // console.log(req.body.userName);
    // res.sendFile(__dirname + "/frontEnd" + "/passengerPage.html");
    res.redirect("/passengerPage.html");
}

/**
 * 
 * request provide userID and searchCondition, sessionID in the body
 * searchCondition is like {"semester":?, "passengerNumber":?, "lat":?, "long":?, "range":?, }
 */
exports.onRepeatedPanelRequest = function(req, res) {
    returnBody = { "error": server.errorCode.ok };
    server.database.getUser(req.body.userID, req.body.sessionID, function(user, error) {
        if(error === null) {
            var cond = req.body.searchCondition;
            dbPsg.searchRepeatedPostsForCount(req.body.userID, cond.semester, cond.passengerNumber, cond.lat, cond.long, cond.range, cond.type, function(err, availSeatsCount){
                if(err !== null) {
                    returnBody.error = server.errorCode.databaseError;
                    server.respond(res, returnBody);
                }else {
                    returnBody.availSeatsCount = availSeatsCount;
                    server.respond(res, returnBody);
                }
            });
        }else{
            returnBody.error = server.errorCode.sessionInvalid;
            server.respond(res, returnBody);
        }
    });
}



/**
 * request provide userID and searchCondition, sessionID in the body
 * searchCondition is like {"startDate":?,"endDate":?, "passengerNumber":?, "lat":?, "long":?, "range":?, }
 */
exports.onSinglePanelRequest = function(req, res) {
    returnBody = { "error": server.errorCode.ok };
    server.database.getUser(req.body.userID, req.body.sessionID, function(user, error) {
        if(error === null) {
            var cond = req.body.searchCondition;
            dbPsg.searchSinglePostsForCount(req.body.userID, cond.startDate, cond.endDate, cond.passengerNumber, cond.lat, cond.long, cond.range,cond.type, function(err, availSeatsCount){
                if(err !== null) {
                    returnBody.error = server.errorCode.databaseError;
                    server.respond(res, returnBody);
                }else {
                    returnBody.availSeatsCount = availSeatsCount;
                    server.respond(res, returnBody);
                }
            });
        }else{
            returnBody.error = server.errorCode.sessionInvalid;
            server.respond(res, returnBody);
        }
    });
}


/**
 * 
 * request provide userID and searchCondition, sessionID in the body
 * searchCondition is like {"semester":?, "day":?, "time":?, "passengerNumber":?, "lat":?, "long":?, "range":?, }
 */
exports.onRepeatedDriverList = function(req, res) {
    returnBody = { "error": server.errorCode.ok };
    server.database.getUser(req.body.userID, req.body.sessionID, function(user, error) {
        if(error === null) {
            var cond = req.body.searchCondition;
            dbPsg.searchRepeatedPostsOnTimeBlock(req.body.userID, cond.semester, cond.day, cond.time, cond.passengerNumber, cond.lat, cond.long, cond.range,cond.type, function(err, postsList){
                if(err !== null) {
                    returnBody.error = server.errorCode.databaseError;
                    server.respond(res, returnBody);
                }else {
                    returnBody.postsList = postsList;
                    server.respond(res, returnBody);
                }
            });
        }else{
            returnBody.error = server.errorCode.sessionInvalid;
            server.respond(res, returnBody);
        }
    });
}


/**
 * request provide userID and searchCondition, sessionID in the body
 * searchCondition is like {"date":?,"time":?, "passengerNumber":?, "lat":?, "long":?, "range":?, }
 */
exports.onSingleDriverList = function(req, res) {
    returnBody = { "error": server.errorCode.ok };
    server.database.getUser(req.body.userID, req.body.sessionID, function(user, error) {
        if(error === null) {
            var cond = req.body.searchCondition;
            //userID, date, time, passengerNumber, lat, long, range, func
            dbPsg.searchSinglePostsOnTimeBlock(req.body.userID, cond.date, cond.time, cond.passengerNumber, cond.lat, cond.long, cond.range,function(err, singlePostsList){
                if(err !== null) {
                    returnBody.error = server.errorCode.databaseError;
                    server.respond(res, returnBody);
                }else {
                    returnBody.singlePostsList = singlePostsList;
                    server.respond(res, returnBody);
                }
            });
        }else{
            returnBody.error = server.errorCode.sessionInvalid;
            server.respond(res, returnBody);
        }
    });
}



exports.onRepeatedApplication = function(req, res) {
    returnBody = { "error": server.errorCode.ok };
    server.database.getUser(req.body.userID, req.body.sessionID, function(user, error) {
        if(error === null) {
            dbPsg.repeatedApply(req.body.userID, req.body.postIDs, req.body.day, req.body.time, req.body.passengerNumber, function(err, insertId, postIDs, status){
                if(err !== null) {
                    returnBody.error = server.errorCode.databaseError;
                    server.respond(res, returnBody);
                }else {
                    returnBody.applicationID = insertId;
                    returnBody.postIDs = postIDs;
                    returnBody.status = status;
                    server.respond(res, returnBody);
                }
            });
        }else{
            returnBody.error = server.errorCode.sessionInvalid;
            server.respond(res, returnBody);
        }
    });
}


exports.onSingleApplication = function(req, res) {
    returnBody = { "error": server.errorCode.ok };
    server.database.getUser(req.body.userID, req.body.sessionID, function(user, error) {
        if(error === null) {
            dbPsg.singleApply(req.body.userID, req.body.postIDs, req.body.passengerNumber, function(err, insertId, postIDs, status){
                if(err !== null) {
                    returnBody.error = server.errorCode.databaseError;
                    server.respond(res, returnBody);
                }else {
                    returnBody.applicationID = insertId;
                    returnBody.postIDs = postIDs;
                    returnBody.status = status;
                    server.respond(res, returnBody);
                }
            });
        }else{
            returnBody.error = server.errorCode.sessionInvalid;
            server.respond(res, returnBody);
        }
    });
}