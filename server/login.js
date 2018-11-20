var server = require("./server");

exports.onRequest = function (req, res) {
    server.database.loginUser(req.body.userId, req.body.password, function (err, user) {
        ret = {};
        if (err != null) {
            ret["error"] = err;
        }
        else {
            ret["error"] = server.errorCode.ok;
            ret["userID"] = server.getIdString(user);
            ret["name"] = user["name"];
            ret["sessionID"] = user["sessionId"];
        }
        server.respond(res, ret);
    });
}