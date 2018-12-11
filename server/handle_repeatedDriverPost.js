var server = require("./server");

exports.onRequest = function(req, res){

    
    convertNecessaryValues(req.body);
    console.log(req.body);
    server.database.insert("driverrepeatedpost", req.body, function(){
        if(req.body._id != undefined){
            console.log("id: "+req.body._id);
            server.respond(res, 200, "OK");
        }else{
            server.respond(res, 400, "Insertion Failed");
        }
    });
}

function convertNecessaryValues(targetBody){
    targetBody["maxSeats"] = parseInt(targetBody["maxSeats"]);
    targetBody["type"] = parseInt(targetBody["type"]);
    targetBody["availableSeats"] = JSON.parse(targetBody["availableSeats"]);
    targetBody["lat"] = parseFloat(targetBody["lat"]);
    targetBody["long"] = parseFloat(targetBody["long"]);
}