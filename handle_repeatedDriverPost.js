var server = require("./server");

exports.onRequest = function(req, res){
    console.log(req.body.userName);
    server.respond(res, 200, "your_string");
}