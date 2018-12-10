var runTimeData = {};

function getUser() {
    user = { "expire": 0 };
    user.isLogin = function () {
        return Date.now() < user.expire;
    }
    runTimeData.user = user;
    var expire = localStorage.getItem("expire");
    if (expire != null) {
        user.expire = parseInt(expire);
        user.name = localStorage.getItem("name");
        user.userId = localStorage.getItem("userId");
        user.session = localStorage.getItem("session");
    }
}

function onClickPage(page) {
    var user = runTimeData.user;
    if (!user.isLogin()) {
        window.location.href = "./login.html";
        return;
    }
    page += "?user=" + user.userId + "&session=" + user.session;
    showIframe("/" + page);
}

function refreshData() {
    if (!runTimeData.user.isLogin()) {
        $("#loading").css({ "display": "none" });
        $("#main").css({ "display": "block" });
        return;
    }
    $.post("/refresh", { "sessionID": runTimeData.user.session, "userID": runTimeData.user.userId }, function (data, s, xhr) {
        data = JSON.parse(data);
        if (data.error.code == 0) {
            var user = runTimeData.user;
            user.repeatedPost = data.repeatedPost;
            user.additionalPost = data.additionalPost;
            user.cancellationPost = data.cancellationPost;
            user.repeatedApplication = data.repeatedApplication;
            user.additionalApplication = data.additionalApplication;
            user.repeatApplicationForPost = data.repeatApplicationForPost;
            user.addApplicationForPost = data.addApplicationForPost;
            $("#loading").css({ "display": "none" });
            $("#main").css({ "display": "block" });
        }
        else {
            window.location.href = "/login.html";
        }
    }).fail(function (xhr, error, s) {
        $("#loading").css({ "display": "none" });
        $("#main").css({ "display": "block" });
    });
}

function onLoad() {
    adjust();
    getUser();
    refreshData();
    if (runTimeData.user.isLogin()) {
        onClickPage("driverPanel.html");
    } else {
        showIframe("home.html");
    }
    userStatus(!runTimeData.user.isLogin());
}

function distance(lat1, lat2, long1, long2) {
    var rad = Math.PI / 180;
    lat1 *= rad;
    lat2 *= rad;
    long1 *= rad;
    long2 *= rad;
    var a = lat1 - lat2;
    var b = long1 - long2;
    a = Math.sin(a / 2);
    b = Math.sin(b / 2);
    a = 2 * Math.asin(Math.sqrt(a * a + Math.cos(lat1) * Math.cos(lat2) * b * b));
    return a * 6378.137 * 0.621371192;
}

function statusOperation() {
    if (runTimeData.user.isLogin()) {
        localStorage.removeItem("userId");
        localStorage.removeItem("session");
        localStorage.removeItem("expire");
        localStorage.removeItem("name");
        location.reload();
    } else {
        window.location.href = "/login.html";
    }
}
