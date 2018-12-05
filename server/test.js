var server = require("./server");

exports.onRequest = function (req, res) {
    server.database.query("user", { "name": "Li" }, function (error, results) {
        server.respond(res, 200, server.getIdString(results[0]));
    });
}

function testCheckTimeConfliction(collection, func) {
    server.database.query("user", { "name": "Li" }, function (error, results) {
        // server.respond(res, 200, server.getIdString(results[0]));
        var userid = server.getIdString(results[0]);
        console.log("userid:" + userid);
        // server.database.checkAdditionalValidate(userid, 20181225, 16, function(error){
        //     server.respond(res, error);
        // });
        server.database.checkRepeatedValidate(userid, 5, 10, function(error){
            server.respond(res, error);
        })
    });
}


var date = new Date();
var user1 = { "loginName": "li", "name": "Li", "password": "1234", "sessionID": "1234567", "expire": 0 };
var user2 = { "loginName": "zun", "name": "Zun", "password": "1234", "sessionID": "1234567", "expire": 0 };
var drpost1 = { userID: 0, lat: 0, long: 0, availableSeats: { 108: 3, 310: 3 }, maxSeats: 3, semester: "1", type: 0 };
var drpost2 = { userID: 0, lat: 0, long: 0, availableSeats: { 208: 3, 510: 3, 111: 2 }, maxSeats: 3, semester: "1", type: 0 };
var dapost1 = { userID: 0, lat: 0, long: 0, date: 20181208, time:10, maxSeats: 2, availableSeats: 2, type: 0 };
var dapost2 = { userID: 0, lat: 0, long: 0, date: 20181225, time:16, maxSeats: 2, availableSeats: 2, type: 0 };
var repApp1 = { userID: 0, driverPostID: [], day: 1, time: 8, passengerNumber: 1, status: [0] };
var repApp2 = { userID: 0, driverPostID: [], day: 5, time: 10, passengerNumber: 1, status: [0] };
var addApp1 = { userID: 0, driverPostID: [], passengerNumber: 1, status: [0] };
var addApp2 = { userID: 0, driverPostID: [], passengerNumber: 1, status: [0] };

exports.initTestData = function (req, res) {
    var q = require("./syncOps").getQueue();
    q.add(clearCollection, "user", null);
    q.add(clearCollection, "driverrepeatedpost", null);
    q.add(clearCollection, "driveradditionalpost", null);
    // q.add(clearCollection, "drivercanceledpost", null);
    q.add(clearCollection, "repeatedapplication", null);
    q.add(clearCollection, "additionalapplication", null);


    q.add(insert, ["user", user1], function (parameters) {
        drpost1.userID = user1._id.toString();
        dapost1.userID = user1._id.toString();
        repApp2.userID = user1._id.toString();
        addApp2.userID = user1._id.toString();
    });
    q.add(insert, ["user", user2], function (parameters) {
        drpost2.userID = user2._id.toString();
        dapost2.userID = user2._id.toString();
        repApp1.userID = user2._id.toString();
        addApp1.userID = user2._id.toString();
    });
    q.add(insert, ["driverrepeatedpost", drpost1], function (parameters) { repApp1.driverPostID.push(drpost1._id.toString()) });
    q.add(insert, ["driverrepeatedpost", drpost2], function (parameters) { repApp2.driverPostID.push(drpost2._id.toString()) });
    q.add(insert, ["driveradditionalpost", dapost1], function (parameters) { addApp1.driverPostID.push(dapost1._id.toString()) });
    q.add(insert, ["driveradditionalpost", dapost2], function (parameters) { addApp2.driverPostID.push(dapost2._id.toString()) });
    q.add(insert, ["additionalapplication", addApp1], function (parameters) { });
    q.add(insert, ["additionalapplication", addApp2], function (parameters) { });
    q.exe();
}

var parameters = [];
var functions = [];

function clearCollection(collection, func) {
    server.database.clearCollection(collection, func);
}

function insert(parameters, func) {
    server.database.insert(parameters[0], parameters[1], function (error, count) {
        if (error !== null) {
            console.log("insert failed " + data);
        }
        func();
    });
}
