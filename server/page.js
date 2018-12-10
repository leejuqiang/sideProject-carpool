var server = require("./server");

exports.onPage = function (req, res) {
    server.database.validUser(req.query.user, req.query.session, function (err, user) {
        var head = { "Content-Type": "text/html" };
        var html = "";
        if (err === null) {
            html = server.readHtml("./frontEnd/check" + req.path);
        }
        else {
            head["Location"] = "login.html";
        }
        res.writeHead(200, head);
        res.write(html);
        return res.end();
    });
}