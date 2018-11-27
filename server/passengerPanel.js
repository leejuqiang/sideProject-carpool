var server = require("./server");

exports.onRequest = function(req, res){
    console.log(req.body.userName);
    // res.sendFile(__dirname + "/frontEnd" + "/passengerPage.html");
    res.redirect("/passengerPage.html");
}
