var server = require("./server");

exports.onRequest = function(req, res){
    server.respond(res, 200, "dflakjlkg");
}