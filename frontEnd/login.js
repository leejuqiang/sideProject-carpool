
function onClickLogin() {
    var name = $("#userName").val();
    var pass = $("#pass").val();
    $.post("/login", { "userId": name, "password": pass }, function (data, s, xhr) {
        console.log(data);
    });
}