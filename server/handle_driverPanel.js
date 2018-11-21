var server = require("./server");

exports.onRequest = function(req, res){
    console.log(req.body.userName);
    res.sendFile("driverPanel.html", { root: './frontEnd' });
}