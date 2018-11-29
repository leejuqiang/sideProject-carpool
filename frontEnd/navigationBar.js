
window.onresize = adjust;
// adjust();
function adjust() {
        //    var label = document.getElementById("show");
        var navigation = document.getElementById("navigation");
        var width = window.innerWidth;
        var height = window.innerHeight;
        //    label.innerHTML = "width = "+width+";height="+height;
        if (width <= 500) {
                navigation.innerHTML = ""
                        + "<div class='nva'>"
                        + "<ul class='l1'>"
                        + "<li><img src='navigationIcon.png' class='menuIcon'/>"
                        + "<ul class='l2'>"
                        + "<li><a href='javascript:void(0)' class='navLink' onclick='showIframe(\"driverPanel.html\")'</a>DRIVER</li>"
                        + "<li><a href='javascript:void(0)' class='navLink' onclick='showIframe(\"passengerPage.html\")'>PASSANGER</a></li>"
                        + "</ul></li>"
                        + "<div class='header_right'><a id='statusinfo' href='javascript:void(0)' onclick='statusOpreation()' class='navLink'></a></div>"
                        + "</ul>"
                        + "</div>";
        }
        else {
                navigation.innerHTML = ""
                        + "<div class='nva'>"
                        + "<ul class='l1'>"
                        + "<li><a href='javascript:void(0)' class='navLink' onclick='showIframe(\"driverPanel.html\")'>DRIVER</a></li>"
                        + "<li><a href='javascript:void(0)' class='navLink' onclick='showIframe(\"passengerPage.html\")'>PASSANGER</a></li>"
                        + "<div class='header_right'><a id='statusinfo' href='javascript:void(0)' onclick='statusOpreation()' class='navLink'></a></div>"
                        + "</ul>"
                        + "</div>";
        }
        var iframe = document.getElementById("frame");
                var bHeight = iframe.contentWindow.document.body.scrollHeight;
                var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
                var height = Math.max(bHeight, dHeight);
                iframe.height = height;
                console.log(height);
        
}

function showIframe(page) {
        // $(window.parent.document).find("#iframe").attr("src", "passengerPage.html");
        var iframe = document.getElementById("frame");
        iframe.onload = function () {
                var bHeight = iframe.contentWindow.document.body.scrollHeight;
                var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
                var height = Math.max(bHeight, dHeight);
                iframe.height = height;
                console.log(height);
        }
        iframe.src = page;
}


function userStatus(status){
        var statusInfo = document.getElementById("statusinfo");
        
        if(status){
                statusInfo.innerHTML = "Login";
                // status.href = "login.html";
        }
        else{
                statusInfo.innerHTML = "Logout";
                // status.href = "home.html";
        }
        
}
