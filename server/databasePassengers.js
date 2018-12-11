var server = require("./server");


function generateEmptyAvailSeatsCount() {
    var BLOCKS = 13;
    var seatsCount = [[],[],[],[],[],[],[]];//monday, tuesday, ... Saturday,Sunday
    var day;
    for (day = 0; day<=6; day++) {
        var t;
        for (t = 0; t< BLOCKS; t++) {
            seatsCount[day].push(0);
        }
    }
    return seatsCount;
}

/**
 * search in table driverrepeatedPost for posts that qualifies the serach conditions
 * do not return posts which belongs to the user represented by the userID
 */
exports.searchRepeatedPostsForCount = function(userID, semester, passengerNumber, lat, long, range, type, func) {
    var semester =  semester + "";
    var range =  parseFloat(range);
    var passengerNumber =  parseInt(passengerNumber);
    var type =  parseInt(type);
    
    console.log(semester+ " " +range + " "+passengerNumber + " " +type);

    var minLat = lat - range;
    var maxLat = lat + range;
    var minLong = long - range;
    var maxLong = long + range;
    var query = { "lat": { "$gt": minLat, "$lt": maxLat }, 
                "long": { "$gt": minLong, "$lt": maxLong },
                "semester":semester,
                "maxSeats":{"$gte": passengerNumber},
                "userID":{ $ne: userID },
                "type": type};//do not get the user's own posts
    server.database.query("driverrepeatedpost", query, function(err, results){
        if(err !== null) {
            func(err, null);
            return;
        }
        var availSeatsCount = generateEmptyAvailSeatsCount();//monday, tuesday, ... Saturday,Sunday
        //passengerNumber filter by availableSeats of results
        for(i in results) {
            var repeatedPost = results[i];
            countOneRepPost(availSeatsCount, repeatedPost, passengerNumber);
        }
        func(null, availSeatsCount);
    });
}

/**
 * update availSeatsCount for each post result
 * @param {*} availSeatsCount 
 * @param {*} repeatedPost 
 * @param {*} passengerNumber 
 */
function countOneRepPost(availSeatsCount, repeatedPost, passengerNumber) {
    for(tStr in repeatedPost.availableSeats) {
        var t = parseInt(tStr);
        var day = Math.round(t / 100);//which weekday range[1,7]
        var time = Math.round(t % 100); //depart time range[8,20] indicating from 8 am to 8pm
        if(day < 1 || day > 7 || time < 8 || time > 20) {
            return;
        }
        if(repeatedPost.availableSeats[tStr] >= passengerNumber) {
            availSeatsCount[day-1][time-8] += 1;
        }
    }
    return availSeatsCount;
}


/**
 * user click on a time block, then search repeated post
 */
exports.searchRepeatedPostsOnTimeBlock = function(userID, semester, day, time, passengerNumber, lat, long, range, type, func) {
    var semester =  semester + "";
    var range =  parseFloat(range);
    var passengerNumber =  parseInt(passengerNumber);
    var type =  parseInt(type);

    var minLat = lat - range;
    
    var maxLat = lat + range;
    console.log(maxLat + "fdsfdsfdfsdfs");
    var minLong = long - range;
    var maxLong = long + range;
    // var query = { "lat": { "$gt": minLat, "$lt": maxLat }, 
    //             "long": { "$gt": minLong, "$lt": maxLong },
    //             "type": type};//do not get the user's own posts
    
    var query = { 
                "lat": { "$gt": minLat, "$lt": maxLat }, 
                "long": { "$gt": minLong, "$lt": maxLong },
                "semester":"1",
                "maxSeats":{"$gte": passengerNumber},
                "userID":{ $ne: userID },
                "type": type};//do not get the user's own posts
    server.database.query("driverrepeatedpost", query, function(err, results){
        console.log(results.length);
        if(err !== null) {
            func(err, null);
            return;
        }
        var postsList = [];
        for(i in results) {
            var repeatedPost = results[i];
            collectRepeatedDriverResult(postsList, day,time, repeatedPost, passengerNumber);
        }
        console.log(postsList.length);
        func(null, postsList);
    });
}

/**
 * update postsList for each result
 * @param {*} postsList 
 * @param {*} day 
 * @param {*} time 
 * @param {*} repeatedPost 
 * @param {*} passengerNumber 
 */
function collectRepeatedDriverResult(postsList, day, time, repeatedPost, passengerNumber) {
    for(tStr in repeatedPost.availableSeats) {
        var t = parseInt(tStr);
        var resday = Math.round(t / 100);//which weekday range[1,7]
        var restime = Math.round(t % 100); //depart time range[8,20] indicating from 8 am to 8pm
        if(resday < 1 || resday > 7 || restime < 8 || restime > 20) {
            return;
        }
        if(resday === day && restime === time) {
            if(repeatedPost.availableSeats[tStr] >= passengerNumber) {
                postsList.push(repeatedPost);
            }
            break;
        }
    }
    return postsList;
}

/**
 * search in table driveradditionalPost for posts that qualifies the serach conditions
 * do not return posts which belongs to the user represented by the userID
 */
exports.searchSinglePostsForCount = function(userID, startDate, endDate, passengerNumber, lat, long, range, type, func) {
    var minLat = lat - range;
    var maxLat = lat + range;
    var minLong = long - range;
    var maxLong = long + range;
    var todayDate = getTodayDate();
    if(startDate < todayDate) {
        startDate = todayDate;
    }
    if(endDate > todayDate + 6) {
        endDate = todayDate + 6;
    }
    var query = { "lat": { "$gt": minLat, "$lt": maxLat }, 
                "long": { "$gt": minLong, "$lt": maxLong },
                "date": { "gte": startDate, "$lte": endDate},
                "maxSeats":{"$gte": passengerNumber},
                "userID":{ $ne: userID },
                "type":type};//do not get the user's own posts
    server.database.query("driveradditionalpost", query, function(err, results){
        if(err !== null) {
            func(err, null);
            return;
        }
        var availSeatsCount = generateEmptyAvailSeatsCount();//monday, tuesday, ... Saturday,Sunday
        //passengerNumber filter by availableSeats of results
        for(i in results) {
            var singlePost = results[i];
            countOneSinglePost(availSeatsCount, singlePost, passengerNumber);
        }
        func(null, availSeatsCount);
    });
}



/**
 * 
 * @param {*} availSeatsCount 
 * @param {*} singlePost 
 * @param {*} passengerNumber 
 */
function countOneSinglePost(availSeatsCount, singlePost, passengerNumber) {
    var singlePostDay = toWeekDay(singlePost.date);//get which weekday the post is in
    if(singlePost.availableSeats >= passengerNumber) {
        var time = singlePost.time;
        availSeatsCount[singlePostDay-1][time-8] += 1;
    }
    return availSeatsCount;
}


/**
 * user click on a time block, then search for single posts
 */
exports.searchSinglePostsOnTimeBlock = function(userID, date, time, passengerNumber, lat, long, range, type, func) {
    var minLat = lat - range;
    var maxLat = lat + range;
    var minLong = long - range;
    var maxLong = long + range;
    var query = { "lat": { "$gt": minLat, "$lt": maxLat }, 
                "long": { "$gt": minLong, "$lt": maxLong },
                "date":date,
                "time":time,
                "maxSeats":{"$gte": passengerNumber},
                "userID":{ $ne: userID },
                "type": type };//do not get the user's own posts
    server.database.query("driveradditionalpost", query, function(err, results){
        if(err !== null) {
            func(err, null);
            return;
        }
        func(null, results);
    });
}


//{ userID: 0, driverPostID: [], day: 1, time: 8, passengerNumber: 1, status: [0] };
exports.repeatedApply = function(userID, postIDs, day, time, passengerNumber, func){
    var status = [];
    var i;
    for (i = 0; i < postIDs.length; i++) {
        status.push(0);
    }
    var data = {"userID":userID, "driverPostID":postIDs, "day":day, "time":time, "passengerNumber":passengerNumber, "status":status };
    server.database.insertReturnId("repeatedapplication", data, function(err, insertId){
        func(err, insertId, postIDs, status);
    });
}


exports.singleApply = function(userID, postIDs, passengerNumber, func){
    var status = [];
    var i;
    for (i = 0; i < postIDs.length; i++) {
        status.push(0);
    }
    var data = {"userID":userID, "driverPostID":postIDs, "passengerNumber":passengerNumber, "status":status };
    server.database.insertReturnId("additionalapplication", data, function(err, insertId){
        func(err, insertId, postIDs, status);
    });
}


/**
 * a number representing a date transformed to yyyy-MM-dd format
 * @param {*} date 
 */
function dateStr(date){
    var year = Math.floor(date / 10000);
    var month = Math.floor((date - year*10000) / 100);
    var day = (date - year*10000- month*100);
    return year + "-" + month +"-" + day;
}



/**
 * a method to calculate how many days are there between date1 and date2
 * @param {*} date1 
 * @param {*} date2 
 */
function DateDiff(date1, date2) {
    var oDate1, oDate2;
    oDate1 = new Date(dateStr(date1)); 
    oDate2 = new Date(dateStr(date2));
    // diff = parseInt(Math.abs(oDate2 - oDate1) / 1000 / 60 / 60 / 24); //milliseconds tranlate to days
    diff = Math.round(Math.abs(oDate2 - oDate1) / 1000 / 60 / 60 / 24); //milliseconds tranlate to days
    return diff;  //return diff
}

/**
 * 
 * @param {*} timestamp 
 */
function toWeekDay(date) {
    var gap = DateDiff(20181203, date);
    var weekday = 1 + gap;// 2018-12-03 is Monday. Monday is 1, Sunday is 7
    weekday =  (weekday - 1) % 7 + 1;
    return weekday;
}

/**
 * convert to a 8-digit number indicating date. eg "20181202"
 * @param {*} timestamp  Number
 */
function toDate(timestamp) {
    var time = new Date(timestamp);
    var y = time.getFullYear();
    var m = time.getMonth()+1;
    var d = time.getDate();
    return y*10000+m*100+d;
    // var h = time.getHours();
    // var mm = time.getMinutes();
    // var s = time.getSeconds();
}



function getTodayDate() {
    return toDate(Date.now());
}