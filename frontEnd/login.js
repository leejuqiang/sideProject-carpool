function onLogin() {
    var usr = $("#userName").val();
    var pass = $("#pass").val();
    $.post("/login", { "userName": usr, "password": pass, "isDriver": true }, function (data, status, xhr) {
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