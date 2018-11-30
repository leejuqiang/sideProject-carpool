var moduleHttps = require("https");
var moduleFs = require("fs");
var moduleLog = require("log4js");
var moduleExpress = require("express");
var moduleBodyParser = require("body-parser");
var ObjectID = require("mongodb").ObjectID;

var app = moduleExpress();
app.use(moduleExpress.static("./frontEnd"));
app.use(moduleBodyParser.json({ "limit": "2mb" }));
app.use(moduleBodyParser.urlencoded({ "extended": true }));

exports.config = JSON.parse(moduleFs.readFileSync("./config.json"));
exports.errorCode = require("./errorCode");

moduleLog.configure({
    "appenders": {
        "normal": {
            "type": "file",
            "filename": "./log/log.log"
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

const options = { "key": moduleFs.readFileSync("./privatekey.pem"), "cert": moduleFs.readFileSync("./cert.pem") };

app.post("/login", require("./login").onRequest);

//driver part
app.get("/driverPanel", require("./handle_driverPanel").onRequest);
app.post("/driverResponse", require("./handle_driverResponse").onRequest);
app.post("/repeatedDriverPost", require("./handle_repeatedDriverPost").onRequest);
app.post("/additionalDriverPost", require("./handle_additionalDriverPost").onRequest);
app.post("/revertDriverRepeatedPost", require("./handle_revertDriverRepeatedPost").onRequest);
app.post("/driverCancelRepeatedPost", require("./handle_driverCancelRepeatedPost").onRequest);
app.post("/revertRepeatedCancellation", require("./handle_revertRepeatedCancellation").onRequest);
app.delete("/driverCancelSinglePost", require("./handle_driverCancelSinglePost").onRequest);

//passenger part
app.get("/passengerPanel", require("./passengerPanel").onRequest);
app.post("/passengerPanel",require("./passengerPanel").onRepeatedPanelRequest);

app.post("/refresh", require("./refreshData").onRequest);

app.get("/test", require("./test").onRequest);

/**
 * Call this function to respond to client with a http code
 * @param res {Object} The res from onRequest
 * @param code {number} The http response code
 * @param body {string} The response body
 */
exports.respondWithCode = function (res, code, body) {
    res.writeHead(code, { "Content-Type": "text/html" });
    res.write(body);
    return res.end();
}

/**
 * Call this function to respond to client with http code 200
 * @param res {Object} The res from onRequest
 * @param body {Object} The response json object
 */
exports.respond = function (res, body) {
    return exports.respondWithCode(res, 200, JSON.stringify(body));
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

