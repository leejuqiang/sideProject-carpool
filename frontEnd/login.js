var sending = false;

function onLoad() {
    var name = localStorage.getItem("loginName");
    if (name != null) {
        $("#userName").val(name);
    }
}

function onClickLogin() {
    var name = $("#userName").val();
    var nameError = $("#userNameError");
    if (name == "") {
        showError(nameError);
        return;
    }
    localStorage.setItem("loginName", name);
    hideError(nameError);
    var pass = $("#pass").val();
    var passError = $("#passwordError");
    if (pass == "") {
        showError(passError);
        return;
    }
    hideError(passError);
    if (sending) {
        return;
    }
    sending = true;
    $.post("/login", { "userId": name, "password": pass }, function (data, s, xhr) {
        sending = false;
        data = JSON.parse(data);
        if (data.error.code == 0) {
            localStorage.setItem("userId", data.userID);
            localStorage.setItem("session", data.sessionID);
            localStorage.setItem("expire", Date.now() + 3600000);
            localStorage.setItem("name", data.name);
            window.location.href = "/index.html";
        } else {
            var error = $("#error");
            if (data.error.code === 1) {
                error.html("Incorrect user name or password");
                showError(error);
            } else {
                error.html("Connection failed");
                showError(error);
            }
        }
    }).fail(function (xhr, error, s) {
        sending = false;
        var error = $("#error");
        error.html("Connection failed");
        showError(error);
    });
}

function showError(err) {
    err.css({ "visibility": "visible" });
    err.fadeTo(500, 1);
}

function hideError(err) {
    err.css({ "visibility": "hidden", "opacity": 0 })
}