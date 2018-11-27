
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
                + "<li><a href='driverPanel.html' class='navLink'>DRIVER</a></li>"
                + "<li><a href='passengerPage.html' class='navLink'>PASSANGER</a></li>"
                + "</ul></li>"
        + "<div class='header_right'><a href='' class='navLink'>Logout</a></div>"
        + "</ul>"
        + "</div>";
   }
   else{
        navigation.innerHTML = ""
        + "<div class='nva'>"
        + "<ul class='l1'>" 
        + "<li><a href='driverPanel.html' class='navLink'>DRIVER</a></li>"
        + "<li><a href='passengerPage.html' class='navLink'>PASSANGER</a></li>" 
        + "<div class='header_right'><a href='' class='navLink'>Logout</a></div>"
        + "</ul>"
        + "</div>";
    }
  
}



