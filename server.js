var moduleHttps = require("https");
var moduleFs = require("fs");
var moduleLog = require("log4js");
var moduleExpress = require("express");
var moduleBodyParser = require("body-parser");

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

exports.respond = function (res, code, body) {
    res.writeHead(code, { "Content-Type": "text/html" });
    res.write(body);
    return res.end();
}

require("./database").connect(onConnectDB);

function onConnectDB(error, db) {
    if (error === null) {
        exports.logger.info("connected db, starting server");
        moduleHttps.createServer(options, app).listen(exports.config.serverPort);
    } else {
        exports.logger.error("can't connect to db, error:" + error);
    }
}

