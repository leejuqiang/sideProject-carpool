
function onClickLogin() {
    var name = $("#userName").val();
    if (name == "") {
        $("#userNameError").fadeTo(500, 1);
        return;
    }
    $("#userNameError").fadeTo(0, 0);
    var pass = $("#pass").val();
    if (pass == "") {
        $("#passwordError").fadeTo(500, 1);
        return;
    }
    $("#passwordError").fadeTo(0, 0);
    $.post("/login", { "userId": name, "password": pass }, function (data, s, xhr) {
        console.log(data);
        data = JSON.parse(data);
        if (data.error.code == 0) {

        } else {
            if (data.error.code === 1) {
                $("#error").html("Incorrect user name or password");
                $("#error").fadeTo(500, 1);
            } else {
                $("#error").html("Connection failed");
                $("#error").fadeTo(500, 1);
            }
        }
    }).fail(function (xhr, error, s) {
        $("#error").html("Connection failed");
        $("#error").fadeTo(500, 1);
    });
}