function onLogin() {
    var usr = $("#userName").val();
    var pass = $("#pass").val();
    var body = { "userName": usr, "password": pass, "isDriver": true };
    $.post("/login", JSON.stringify(body), function (data, status, xhr) {
        console.log(data);
        var dataObj = JSON.parse(data);
        var now = new Date();
        now = now.getTime();
        now += 3600000;
        localStorage.setItem("sessionTime", now.toString());
        localStorage.setItem("sessionID", dataObj.sessionID);
        localStorage.setItem("userName", dataObj.userName);
        window.location.href = "../";
    }).fail(function(xhr, status, error){
        console.log(xhr.statusText);
        loginErrorFunction();
    });
}

function loginErrorFunction() {
    $("#login_error").show()
}

function isLogin() {
    var timeStamp = (new Date()).getTime();
    var sessionTime = localStorage.getItem("sessionTime");
    if (sessionTime != null) {
        sessionTime = parseInt(sessionTime);
        return timeStamp < sessionTime;
    }
    return false;
}

function refreshData() {
    $.post("/refresh", { "sessionID": localStorage.getItem("sessionID"), "userName": localStorage.getItem("userName") }, function (data, s, xhr) {
        userData = JSON.parse(data);
        var refreshMatch = false;
        refreshPostList();
        refreshMatchList();
        setTimeout(refreshData, 10000);
    }).fail(function (xhr, error, s) {
        setTimeout(refreshData, 10000);
    });
}