var moduleHttps = require("https");
var moduleFs = require("fs");
var moduleUrl = require("url");
var moduleLog = require("log4js");
var l4jLogger;

const options = { "key": moduleFs.readFileSync("./privatekey.pem"), "cert": moduleFs.readFileSync("cert.pem") };

function requestFile(path, res) {
    if (path === "/") {
        path = "/index.html";
    }
    moduleFs.readFile("." + path, function (error, data) {
        if (error) {
            return serverResponse(res, 404, "404 Not Found");
        }
        return serverResponse(res, 200, data);
    });
}

function serverResponse(res, code, body) {
    res.writeHead(code, { "Content-Type": "text/html" });
    res.write(body);
    return res.end();
}

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
l4jLogger = moduleLog.getLogger("default");
exports.logger = l4jLogger;
require("./database").connect(onConnectDB);

function onConnectDB(error, db) {
    if (error === null) {
        exports.logger.info("connected db, starting server");
        moduleHttps.createServer(options, function (req, res) {
            var param = moduleUrl.parse(req.url, true);
            requestFile(param.pathname, res);
        }).listen(8080);
    } else {
        exports.logger.error("can't connect to db, error:" + error);
    }
}

