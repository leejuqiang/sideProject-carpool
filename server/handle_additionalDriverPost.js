var server = require("./server");

exports.onRequest = function(req, res){
    
    
    convertNecessaryValues(req.body);
    console.log(req.body);
    server.database.insert("driveradditionalpost", req.body, function(){
        if(req.body._id != undefined){
            server.respond(res, 200, "OK");
        }else{
            server.respond(res, 400, "Insertion Failed");
        }
    });
    
}

function convertNecessaryValues(targetBody){
    targetBody["maxSeats"] = parseInt(targetBody["maxSeats"]);
    targetBody["availableSeats"] = parseInt(targetBody["availableSeats"]);
    targetBody["date"] = parseInt(targetBody["date"]);
    targetBody["time"] = parseInt(targetBody["time"]);
    targetBody["type"] = parseInt(targetBody["type"]);
    targetBody["lat"] = parseFloat(targetBody["lat"]);
    targetBody["long"] = parseFloat(targetBody["long"]);
}