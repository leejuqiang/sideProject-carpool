var server = require("./server");

exports.onRequest = function (req, res) {
    server.database.clearCollection("driverrepeatedpost", function (err, user) {
        
    });
}