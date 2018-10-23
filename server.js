var moduleHttps = require("https");
var moduleFs = require("fs");
var moduleUrl = require("url");

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

moduleHttps.createServer(options, function (req, res) {
    var param = moduleUrl.parse(req.url, true);
    requestFile(param.pathname, res);
}).listen(8080);