function selectAll(){
    var chbs = document.getElementsByName("chb[]");
    for (var i = 0; i < chbs.length; i++) {
        var chb = chbs[i];
        chb.checked = true;   
    }
}
var postIDs = [];


function getValueWhenChecked(){
    
    var tab = document.getElementById("tbl");
    var rows = tab.rows;
    // console.log(rows.length);

    var chbs = document.getElementsByName("chb[]");
    console.log(chbs.length);
    for (var i = 0; i < chbs.length; i++) {
        var chb = chbs[i];
        // console.log(rows[i + 2]);
        if(chb.checked == true){
            console.log("id");
            console.log(tdriverPostList[i]._id);
            postIDs.push(tdriverPostList[i]._id);
        } 
    }
    console.log(postIDs);
    // console.log(parent.document.getElementById("light"));
    // document.getElementById("light").style.display='none';
    // document.getElementById("fade").style.display='none'
    // console.log(array);
    // var passengerNumber = 1;
    // var user = parent.runTimeData.user;
    // console.log(user);

    // var userid = "aldfjaslgadsg"; //user.userId;
    // var session = "sdlf;sagjas"; //user.session;
    // // var day = 1;
    // // var time = 1;
    // $.post("/repeatedApply", {"userID": userid, "sessionID": session, "postIDs": postIDs, "day": day, "time": time, "passengerNumber": passengerNum}, function (data, s, xhr) {
    //     closeDialog();
    // }).fail(function (xhr, error, s) {

    // });
}