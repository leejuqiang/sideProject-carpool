var server = require("./server");

exports.onRequest = function (req, res) {
    // server.database.query("user", { "name": "Li" }, function (error, results) {
    //     server.respond(res, 200, server.getIdString(results[0]));
    // });
    testDeleteRepeatedApplication(req, res);

}


/**
 * Test Delete Repeated Application
 * return delete lines
 * @param {*} req 
 * @param {*} res 
 */
function testDeleteRepeatedApplication(req, res) {
    server.database.query("user", { "name": "Zun" }, function (error, results) {
        var userid = server.getIdString(results[0]);
        console.log("userid:" + userid);
        server.database.deleteRepeatedApplication(userid, 1, 8, function (error) {
            server.respond(res, error);
        });
    });
}

/**
 * Test Delete Additional Post
 * return delete lines
 * @param {*} req 
 * @param {*} res 
 */
function testDeleteAdditionalPost(req, res) {
    server.database.query("user", { "name": "Zun" }, function (error, results) {
        var userid = server.getIdString(results[0]);
        console.log("userid:" + userid);
        server.database.deleteAdditionalPost(userid, 20181225, 16, function (error) {
            server.respond(res, error);
        });
    });
}


/**
 * Test check the time confliction 
 * Whether repeated post/application is valid
 * @param {*} req 
 * @param {*} res 
 */
function testCheckRepeatedValidate(req, res) {
    server.database.query("user", { "name": "Li" }, function (error, results) {
        var userid = server.getIdString(results[0]);
        console.log("userid:" + userid);
        server.database.checkRepeatedValidate(userid, 1, 8, function (error) {
            server.respond(res, error);
        });
    });
}


/**
 * Test check the time confliction 
 * Whether additional post/application is valid
 * @param {*} req 
 * @param {*} res 
 */
function testCheckAdditionalValidate(req, res) {
    server.database.query("user", { "name": "Li" }, function (error, results) {
        var userid = server.getIdString(results[0]);
        console.log("userid:" + userid);
        server.database.checkAdditionalValidate(userid, 20181225, 16, function (error) {
            server.respond(res, error);
        });
    });
}



var date = new Date();
var user1 = { "loginName": "li", "name": "Li", "password": "1234", "sessionID": "1234567", "expire": 0 };
var user2 = { "loginName": "zun", "name": "Zun", "password": "1234", "sessionID": "1234567", "expire": 0 };
var user3 = { "loginName": "tuo", "name": "Tuo", "password": "1234", "sessionID": "1234567", "expire": 0 };
var user4 = { "loginName": "shao", "name": "Shao", "password": "1234", "sessionID": "1234567", "expire": 0 };
var drpost1 = { userID: 0, lat: 37.78, long: 122.46, availableSeats: { "108": 3, "310": 3 }, maxSeats: 3, semester: "1", type: 0 };
var drpost2 = { userID: 0, lat: 38.90, long: 120.70, availableSeats: { "208": 3, "510": 3, "111": 2 }, maxSeats: 3, semester: "1", type: 0 };
var drpost3 = { userID: 0, lat: 39.00, long: 123.00, availableSeats: { "308": 3, "310": 3 }, maxSeats: 3, semester: "1", type: 0 };
var drpost4 = { userID: 0, lat: 35.90, long: 122.00, availableSeats: { "410": 3, "419": 3 }, maxSeats: 3, semester: "1", type: 0 };
var dapost1 = { userID: 0, lat: 38.00, long: 120.00, date: 20181208, time: 10, maxSeats: 2, availableSeats: 2, type: 0 };
var dapost2 = { userID: 0, lat: 40.00, long: 121.00, date: 20181225, time: 16, maxSeats: 2, availableSeats: 2, type: 0 };
var dapost3 = { userID: 0, lat: 36.00, long: 121.00, date: 20181225, time: 16, maxSeats: 2, availableSeats: 2, type: 0 };
var dapost4 = { userID: 0, lat: 41.00, long: 122.70, date: 20181225, time: 16, maxSeats: 2, availableSeats: 2, type: 0 };
var repApp1 = { userID: 0, driverPostID: [], day: 5, time: 10, passengerNumber: 1, status: [0] };
var repApp2 = { userID: 0, driverPostID: [], day: 1, time: 8, passengerNumber: 1, status: [0] };
var repApp3 = { userID: 0, driverPostID: [], day: 4, time: 10, passengerNumber: 1, status: [0] };
var repApp4 = { userID: 0, driverPostID: [], day: 3, time: 08, passengerNumber: 1, status: [0] };
var addApp1 = { userID: 0, driverPostID: [], passengerNumber: 1, status: [0] };
var addApp2 = { userID: 0, driverPostID: [], passengerNumber: 1, status: [0] };
var addApp3 = { userID: 0, driverPostID: [], passengerNumber: 1, status: [0] };
var addApp4 = { userID: 0, driverPostID: [], passengerNumber: 1, status: [0] };

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
        repApp1.userID = user1._id.toString();
        addApp1.userID = user1._id.toString();
    });
    q.add(insert, ["user", user2], function (parameters) {
        drpost2.userID = user2._id.toString();
        dapost2.userID = user2._id.toString();
        repApp2.userID = user2._id.toString();
        addApp2.userID = user2._id.toString();
    });
    q.add(insert, ["user", user3], function (parameters) {
        drpost3.userID = user3._id.toString();
        dapost3.userID = user3._id.toString();
        repApp3.userID = user3._id.toString();
        addApp3.userID = user3._id.toString();
    });
    q.add(insert, ["user", user4], function (parameters) {
        drpost4.userID = user4._id.toString();
        dapost4.userID = user4._id.toString();
        repApp4.userID = user4._id.toString();
        addApp4.userID = user4._id.toString();
    });
    q.add(insert, ["driverrepeatedpost", drpost1], function (parameters) { repApp1.driverPostID.push(drpost1._id.toString()) });
    q.add(insert, ["driverrepeatedpost", drpost2], function (parameters) { repApp2.driverPostID.push(drpost2._id.toString()) });
    q.add(insert, ["driveradditionalpost", dapost1], function (parameters) { addApp1.driverPostID.push(dapost1._id.toString()) });
    q.add(insert, ["driveradditionalpost", dapost2], function (parameters) { addApp2.driverPostID.push(dapost2._id.toString()) });
    q.add(insert, ["driverrepeatedpost", drpost3], function (parameters) { repApp4.driverPostID.push(drpost1._id.toString()) });
    q.add(insert, ["driverrepeatedpost", drpost4], function (parameters) { repApp3.driverPostID.push(drpost2._id.toString()) });
    q.add(insert, ["driveradditionalpost", dapost3], function (parameters) { addApp4.driverPostID.push(dapost1._id.toString()) });
    q.add(insert, ["driveradditionalpost", dapost4], function (parameters) { addApp3.driverPostID.push(dapost2._id.toString()) });
    q.add(insert, ["additionalapplication", addApp1], function (parameters) { });
    q.add(insert, ["additionalapplication", addApp2], function (parameters) { });
    q.add(insert, ["repeatedapplication", repApp1], function (parameters) { });
    q.add(insert, ["repeatedapplication", repApp2], function (parameters) { });
    q.add(insert, ["additionalapplication", addApp3], function (parameters) { });
    q.add(insert, ["additionalapplication", addApp4], function (parameters) { });
    q.add(insert, ["repeatedapplication", repApp4], function (parameters) { });
    q.add(insert, ["repeatedapplication", repApp3], function (parameters) { });
    q.exe();
}

var parameters = [];
var functions = [];

/**
 * delete all data from conllection in database
 * @param {*} collection 
 * @param {*} func 
 */
function clearCollection(collection, func) {
    server.database.clearCollection(collection, func);
}

/**
 * insert data with parameters
 * @param {*} parameters 
 * @param {*} func 
 */
function insert(parameters, func) {
    server.database.insert(parameters[0], parameters[1], function (error, count) {
        if (error !== null) {
            console.log("insert failed " + data);
        }
        func();
    });
}
