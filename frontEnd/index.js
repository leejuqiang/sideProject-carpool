var userData = {};
var days = ["Mon.", "Tue.", "Wed.", "Thu.", "Fri."];
var runTimeData = { "days": [false, false, false, false, false], "selectedPost": -1 };

function getUser() {
    user = {"expire": 0};
    user.isLogin = function(){
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

function refreshData() {
    if (!runTimeData.user.isLogin()) {
        return;
    }
    $.post("/refresh", { "sessionID": runTimeData.user.session, "userID": runTimeData.user.userId }, function (data, s, xhr) {
        console.log(data);
        // userData = JSON.parse(data);
        // var refreshMatch = false;
        // refreshPostList();
        // refreshMatchList();
        // setTimeout(refreshData, 10000);
    }).fail(function (xhr, error, s) {
        // setTimeout(refreshData, 10000);
    });
}

function onLoad() {
    getUser();
    var now = new Date();
    $("#driver").prop("checked", true);
    $("#number").val("1");
    onTypeChanged();
    onNumberChanged();
    var login = isLogin();
    $("#login").text(login ? "Logout" : "Login");
    if (login) {
        $("#userLabel").text("Welcome " + localStorage.getItem("userName"));
    }
    appendTimeSelection(now);
    var min = now.toISOString().substr(0, 10);
    now.setMonth(now.getMonth() + 1);
    var max = now.toISOString().substr(0, 10);
    var dl = $("#date");
    dl.val(min);
    dl.prop("min", min);
    dl.prop("max", max);
    // refreshData();
}

function onDayBtn(i) {
    runTimeData.days[i] = !runTimeData.days[i];
}

function refreshPostList() {
    runTimeData.displayPost = [];
    var node = $("#postList");
    node.empty();
    for (p in userData.post) {
        p = userData.post[p];
        if (p.userName == userData.userName) {
            createPostCell(p, node);
        }
    }
    if (runTimeData.selectedPost < 0 && runTimeData.displayPost.length > 0) {
        runTimeData.selectedPost = 0;
    }
    $("#postList :nth-child(" + (runTimeData.selectedPost + 1) + ")").addClass("bg-primary text-white");
}

function onPostBtn() {
    var days = 0;
    for (var i = 0; i < runTimeData.days.length; ++i) {
        if (runTimeData.days[i]) {
            days = days | (1 << i);
        }
    }
    if (days <= 0) {
        alert("Please select a day");
        return;
    }
    var latlng = markers[0].getPosition();
    // alert(latlng.lat());
    // alert(latlng.lng());
    var data = {};
    data.userName = userData.userName;
    data.latitude = latlng.lat();
    data.longitude = latlng.lng();
    data.number = $("#number").val();
    data.available = data.number;
    data.time = $("#time").val();
    data.isDriver = $("#driver").prop("checked");
    data.days = days;
    $.post("/post", data, function (d, s, xhr) {
        data = JSON.parse(d);
        userData.post.push(data.post)
        userData.match[data.post.id] = data.match;
        localStorage.setItem("userData", JSON.stringify(userData));
        refreshPostList();
    }).fail(function (xhr, error, status) {
        console.log(error);
    });
}

function search(id) {
    $.post("/match", { "post": [id] }, function (data, s, xhr) {
        data = JSON.parse(data);
        for (var k in data) {
            userData.match[k] = data[k];
        }
    });
}

function onClickPost(i) {
    if (runTimeData.selectedPost != i) {
        if (runTimeData.selectedPost >= 0) {
            $("#postList :nth-child(" + (runTimeData.selectedPost + 1) + ")").removeClass("bg-primary text-white");
        }
        runTimeData.selectedPost = i;
        $("#postList :nth-child(" + (i + 1) + ")").addClass("bg-primary text-white");
        refreshMatchList();
    }
}

function refreshMatchList() {
    runTimeData.displayMatch = [];
    var node = $("#matchList");
    node.empty();
    if (runTimeData.selectedPost >= 0) {
        var post = runTimeData.displayPost[runTimeData.selectedPost];
        var list = userData.match[post.id];
        locations = [];
        for (var i in list) {
            createSearchCell(post, list[i], node);
            locations.push({ lat: list[i].latitude, lng: list[i].longitude });
        }
        // console.log(locations.length);
        refreshMatchedMarkers();
    }
}

function onClickInvite(index) {
    var toPost = runTimeData.displayMatch[index];
    var sender = runTimeData.displayPost[runTimeData.selectedPost];
    $.post("/invite", { "sender": sender.id, "to": toPost.id }, function (data, s, xhr) {
        userData = JSON.parse(data);
        refreshPostList();
        refreshMatchList();
    }).fail(function (xhr, error, s) {

    });
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

function onClickYes(index) {
    var sender = runTimeData.displayMatch[index];
    var toPost = runTimeData.displayPost[runTimeData.selectedPost];
    $.post("/response", { "sender": sender.id, "to": toPost.id, "accept": true }, function (data, s, xhr) {
        userData = JSON.parse(data);
        refreshPostList();
        refreshMatchList();
    }).fail(function (xhr, error, s) {

    });
}

function onClickNo(index) {
    var sender = runTimeData.displayMatch[index];
    var toPost = runTimeData.displayPost[runTimeData.selectedPost];
    $.post("/response", { "sender": sender.id, "to": toPost.id, "accept": false }, function (data, s, xhr) {
        userData = JSON.parse(data);
        refreshPostList();
        refreshMatchList();
    }).fail(function (xhr, error, s) {

    });
}

function createSearchCell(srcPost, post, node) {
    var index = runTimeData.displayMatch.length;
    runTimeData.displayMatch.push(post);
    var labels = createHtmlCell(post);
    var str = '<div class="list-group-item d-flex justify-content-between align-items-center">' +
        '<span class="badge badge-primary badge-pill">' + (index + 1) + '</span>' +
        labels[0] + '<br/>' +
        labels[1] + '<br/>' +
        labels[2] + "<br/>" +
        distance(srcPost.latitude, post.latitude, srcPost.longitude, post.longitude).toFixed(2) + " mile";

    if (srcPost.matchs.length != 0) {
        for (var k in srcPost.matchs) {
            var inv = srcPost.matchs[k];
            if (inv == post.id) {
                str += '<span class="badge badge-primary badge-pill">Matched</span></div>';
            }
        }
    } else {
        var state = 0;
        for (var k in userData.invites) {
            var inv = userData.invites[k];
            if (inv.receiver == post.id && inv.sender == srcPost.id) {
                state = 1;
                break;
            } else if (inv.sender == post.id && inv.receiver == srcPost.id) {
                state = 2;
                break;
            }
        }
        if (state == 0) {
            str += '<button class="btn btn-primary" onclick="onClickInvite(' + index + ')">Invite</button></div>';
        } else if (state == 1) {
            str += '<span class="badge badge-success badge-lg">Waiting</span></div>';
        } else {
            str += '<div class="btn-group-vertical">\
                <button type="button" class="btn btn-success btn-sm" onclick="onClickYes(' + index + ')">Accept</button>\
                <button type="button" class="btn btn-danger btn-sm" onclick="onClickNo(' + index + ')">Reject</button>\
            </div>';
        }
    }
    node.append(str);
}

function createHtmlCell(post) {
    var driverLabel = post.isDriver ? "Driver: " : "Passenger: ";
    driverLabel += post.userName;
    var dayLabel = "";
    for (var i = 0; i < days.length; ++i) {
        var d = 1 << i;
        if ((post.days & d) > 0) {
            dayLabel += days[i] + " ";
        }
    }
    dayLabel += "  " + post.time;
    var numberLabel = post.isDriver ? " seat" : " passenger";
    numberLabel = post.availableNumber + "/" + post.totalNumber + numberLabel;
    if (post.availableNumber > 1) {
        numberLabel += "s";
    }
    return [driverLabel, dayLabel, numberLabel];
}

function createPostCell(post, node) {
    var index = runTimeData.displayPost.length;
    runTimeData.displayPost.push(post);
    var labels = createHtmlCell(post);
    var str = '<div class="list-group-item d-flex justify-content-between align-items-center" onclick="onClickPost('
        + index + ')">' +
        labels[0] + '<br />' +
        labels[1] + '<br />'
        + labels[2];
    // + '<span class="badge badge-primary badge-pill">1</span></div>';
    node.append(str);
}

function onLogin() {
    if (runTimeData.user.isLogin()) {
        userData = {};
        localStorage.removeItem("userId");
        localStorage.removeItem("session");
        localStorage.removeItem("expire");
        localStorage.removeItem("name");
        location.reload();
    } else {
        window.location.href = "/login.html";
    }
}

function appendTimeSelection(now) {
    var hour = 6;
    var min = 0;
    var sel = $("#time");
    var currentTime = now.getHours() * 60 + now.getMinutes();
    var time = hour * 60 + min;
    var op = null;
    while (hour < 24) {
        let h = hour;
        let str = hour >= 12 ? " pm" : " am";
        str = (min > 0 ? min : "00") + str;
        if (hour > 12) {
            h = hour - 12;
        }
        var label = h + ":" + str;
        sel.append("<option>" + label + "</option>");
        if (op == null && time > currentTime) {
            op = label;
        }
        min += 30;
        time += 30;
        if (min >= 60) {
            ++hour;
            min = 0;
        }
    }
    if (op == null) {
        op = "6:00 am";
    }
    sel.val(op);
}

function onTypeChanged() {
    $("#numberType").text($("#driver").prop("checked") ? "Seat number:" : "Passenger number");
}

function onNumberChanged() {
    $("#numberLabel").text($("#number").val());
}
