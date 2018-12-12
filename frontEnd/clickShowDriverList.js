
var lightPanel = document.getElementById("light");
var fadePanel = document.getElementById('fade');;
var tdriverPostList = [];
// var tdriverPostList = [{ "_id" : "5c102d1a81014139f34d93d5", "userID" : "5c102d1a81014139f34d93d1", "lat" : 37.78, "long" : 122.46, "availableSeats" : { "108" : 3, "310" : 3 }, "maxSeats" : 3, "semester" : "1", "type" : 0 }];
var passengerNum;
var day;
var time;
var driverList = [];

function openDialog(postlist, day, time, passengerNum){
    console.log(postlist);
    tdriverPostList = postlist;
    passengerNum = passengerNum;
    day = day;
    time = time;
    console.log("sdfw");
    //send request to server, load driverlist
    lightPanel = document.getElementById("light");
    lightPanel.style.display='block';
    console.log(lightPanel);
    lightPanel.innerHTML = 
    "<button type='button' onclick ='closeDialog()'>close</button>"
    + "<object style='border:0px' type='text/x-scriptlet' data='passengerPageDriverList.html' width='100%' height='100%'></object>"
    + "<button type='button' onclick ='closeDialog()'>Submit</button>";
    fadePanel = document.getElementById('fade');
    fadePanel.style.display='block';
    
}

function closeDialog(){
    lightPanel.style.display='none';
    fadePanel.style.display='none'
}

function initDriverListWindow() {
    console.log("driverlist");
    console.log(tdriverPostList);
    for(i = 0; i < tdriverPostList.length; i++){

        var username = tdriverPostList[i].userName;
        // availableSeats" : { "108" : 3, "310" : 3 }
        var availableSeats = tdriverPostList[i].availableSeats["108"];
        var max = tdriverPostList[i].maxSeats;
        var showdetails = availableSeats + "/" + max;
        var x = document.getElementById("tbl").insertRow();
        var y = x.insertCell(0);
        var z = x.insertCell(1);
        var f = x.insertCell(2);
        y.innerHTML="<input type='checkbox' name='chb[]'/>";
        z.innerHTML=username;
        f.innerHTML=showdetails;
    }
    // console.log("dfwfdwe");
}