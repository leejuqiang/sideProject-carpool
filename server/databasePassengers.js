var server = require("./server");


function generateEmptyAvailSeatsCount() {
    var BLOCKS = 12;
    var seatsCount = [[],[],[],[],[],[],[]];//sunday, monday, tuesday, ... Saturday
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
exports.searchRepeatedPostsForCount = function(userID, semester, passengerNumber, lat, long, range, func) {
    var minLat = lat - range;
    var maxLat = lat + range;
    var minLong = long - range;
    var maxLong = long + range;
    var query = { "lat": { "$gt": minLat, "$lt": maxLat }, 
                "long": { "$gt": minLong, "$lt": maxLong },
                "semester":semester,
                "maxSeats":{"$gte": passengerNumber},
                "userID":{ $ne: userID }};//do not get the user's own posts
    server.database.query("driverrepeatedpost", query, function(err, results){
        if(err !== null) {
            func(err, null);
            return;
        }
        var availSeatsCount = generateEmptyAvailSeatsCount();//sunday, monday, tuesday, ... Saturday
        //passengerNumber filter by availableSeats of results
        for(i in results) {
            var repeatedPost = results[i];
            countOnePost(availSeatsCount, repeatedPost, passengerNumber);
        }
        func(null, availSeatsCount);
    });

}

function countOnePost(availSeatsCount, repeatedPost, passengerNumber) {
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
