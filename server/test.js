var server = require("./server");

exports.onRequest = function (req, res) {
    server.database.query("user", { "name": "Li" }, function (error, results) {
        server.respond(res, 200, server.getIdString(results[0]));
    });
}