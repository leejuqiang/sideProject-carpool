var moduleHttps = require("https");
var moduleFs = require("fs");
var moduleUrl = require("url");
var moduleLog = require("log4js");

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

var opMap = {}

const options = { "key": moduleFs.readFileSync("./privatekey.pem"), "cert": moduleFs.readFileSync("cert.pem") };

function requestFile(path, res) {
    if (path === "/") {
        path = "/index.html";
    }
    path = "/frontEnd" + path;
    moduleFs.readFile("." + path, function (error, data) {
        if (error) {
            return exports.respond(res, 404, "404 Not Found");
        }
        return exports.respond(res, 200, data);
    });
}

exports.respond = function (res, code, body) {
    res.writeHead(code, { "Content-Type": "text/html" });
    res.write(body);
    return res.end();
}

require("./database").connect(onConnectDB);

function onConnectDB(error, db) {
    if (error === null) {
        exports.logger.info("connected db, starting server");
        moduleHttps.createServer(options, function (req, res) {
            var param = moduleUrl.parse(req.url, true);
            var op = opMap[param.pathname];
            if (op != undefined) {
                op.onRequest(req, res);
            } else {
                requestFile(param.pathname, res);
            }
        }).listen(8080);
    } else {
        exports.logger.error("can't connect to db, error:" + error);
    }
}

