
window.onresize = adjust;
// adjust();
function adjust(){
//    var label = document.getElementById("show");
   var navigation = document.getElementById("navigation");
   var width = window.innerWidth;
   var height = window.innerHeight;
//    label.innerHTML = "width = "+width+";height="+height;
   if(width <= 500){
        navigation.innerHTML = ""
        + "<div class='nva'>"
        + "<ul class='l1'>" 
        + "<li><img src='navigationIcon.png' class='menuIcon'/>"
        + "<ul class='l2'>"
                + "<li><a href='javascript:void(0)' class='navLink' onclick='showIframe(\"driverPanel.html\")'</a>DRIVER</li>"
                + "<li><a href='javascript:void(0)' class='navLink' onclick='showIframe(\"passengerPage.html\")'>PASSANGER</a></li>"
                + "</ul></li>"
        + "<div class='header_right'><a href='' class='navLink'>Logout</a></div>"
        + "</ul>"
        + "</div>";
   }
   else{
        navigation.innerHTML = ""
        + "<div class='nva'>"
        + "<ul class='l1'>" 
        + "<li><a href='javascript:void(0)' class='navLink' onclick='showIframe(\"driverPanel.html\")'>DRIVER</a></li>"
        + "<li><a href='javascript:void(0)' class='navLink' onclick='showIframe(\"passengerPage.html\")'>PASSANGER</a></li>" 
        + "<div class='header_right'><a href='' class='navLink'>Logout</a></div>"
        + "</ul>"
        + "</div>";
    }
  
}

function showIframe(page){
        // $(window.parent.document).find("#iframe").attr("src", "passengerPage.html");
        $('#frame').attr('src',page);
        var bHeight = document.getElementById("frame").contentWindow.document.body.scrollHeight;
        var dHeight =  document.getElementById("frame").contentWindow.document.documentElement.scrollHeight;
        var height = Math.max(bHeight,dHeight);
        $('#frame').height(height);
        console.log(height);
        
}


