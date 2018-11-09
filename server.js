var moduleHttps = require("https");
var moduleFs = require("fs");
var moduleLog = require("log4js");
var moduleExpress = require("express");
var moduleBodyParser = require("body-parser");
var ObjectID = require("mongodb").ObjectID;

var app = moduleExpress();
app.use(moduleExpress.static("frontEnd"));
app.use(moduleBodyParser.json({ "limit": "2mb" }));
app.use(moduleBodyParser.urlencoded({ "extended": true }));

exports.config = JSON.parse(moduleFs.readFileSync("./config.json"));

moduleLog.configure({
    "appenders": {
        "normal": {
            "type": "file",
            "filename": "log/log.log"
        },
        "console": {
            "type": "console"
        }
    },
    "categories": {
        "default": {
            "appenders": ["normal", "console"],
            "level": "trace"
        }
    }
});
exports.logger = moduleLog.getLogger("default");

const options = { "key": moduleFs.readFileSync("./privatekey.pem"), "cert": moduleFs.readFileSync("cert.pem") };

app.post("/login", require("./login").onRequest);
app.post("/driverResponse", require("./driver_response").onRequest);
app.post("/repeatedDriverPost", require("./driver_response").onRequest);
app.post("/additionalDriverPost", require("./driver_response").onRequest);
app.post("/revertDriverRepeatedPost", require("./driver_response").onRequest);
app.post("/driverCancelRepeatedPost", require("./driver_response").onRequest);
app.post("/revertRepeatedCancellation", require("./driver_response").onRequest);
app.delete("/driverCancelSinglePost", require("./driver_response").onRequest);

app.get("/test", require("./test").onRequest);

/**
 * Call this function to respond to client
 * @param res {Object} The res from onRequest
 * @param code {number} The http response code
 * @param body {string} The response body
 */
exports.respond = function (res, code, body) {
    res.writeHead(code, { "Content-Type": "text/html" });
    res.write(body);
    return res.end();
}

/**
 * Checks if a session is valid
 * @param userId {string} The user id
 * @param session {string} The session
 * @param func {function} The callback, function(bool success)
 */
exports.checkSession = function (userId, session, func) {
    exports.database.query("user", { "_id": exports.stringToID(userId) }, function (err, results) {
        var user = results[0];
        var time = new Date().getTime();
        func(time < user.expire && user.session == session);
    });
}

/**
 * Gets a record's id
 * @param data {Object} A record from database
 * @returns {string} The string of the id of the record
 */
exports.getIdString = function (data) {
    return data["_id"].toString();
}

/**
 * Changes a string to a id in database
 * @param id {string} The id
 * @returns {ObjectID} The id used in mongodb
 */
exports.stringToID = function (id) {
    return ObjectID(id);
}

exports.database = require("./database");
exports.database.connect(onConnectDB);

function onConnectDB(error) {
    if (error === null) {
        exports.logger.info("connected db, starting server");
        moduleHttps.createServer(options, app).listen(exports.config.serverPort);
    } else {
        exports.logger.error("can't connect to db, error:" + error);
    }
}

