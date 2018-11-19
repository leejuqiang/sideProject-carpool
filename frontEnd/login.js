
function onClickLogin() {
    var name = $("#userName").val();
    var pass = $("#pass").val();
    $.post("/login", { "userId": name, "password": pass }, function (data, s, xhr) {
        data = JSON.parse(data);
        if (data.error.code == 0) {

        } else {

        }
    });
}