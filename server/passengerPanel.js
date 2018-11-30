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
            dbPsg.searchRepeatedPostsForCount(req.body.userID, cond.semester, cond.passengerNumber, cond.lat, cond.long, cond.range,function(err, availSeatsCount){
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