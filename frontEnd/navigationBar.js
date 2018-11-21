
window.onresize = adjuest;
// adjuest();
function adjuest(){
//    var label = document.getElementById("show");
   var navigation = document.getElementById("navigation");
   var width = window.innerWidth;
   var height = window.innerHeight;
//    label.innerHTML = "width = "+width+";height="+height;
   if(width <= 500){
        navigation.innerHTML = "<header class='header'>"
        + "<div class='nva'>"
        + "<ul class='l1'>" 
        + "<li><img src='navigationIcon.png' width=40px; height=40px/>"
        + "<ul class='l2'>"
                + "<li><a href='driverPanel.html'>DRIVER</a></li>"
                + "<li><a href='passengerPage.html'>PASSANGER</a></li>"
                + "</ul></li>"
        + "<div class='header_right'><a href=''>Logout</a></div>"
        + "</ul>"
        + "</div>"
        + "</header>";
   }
   else{
        navigation.innerHTML = "<header class='header'>"
        + "<div class='nva'>"
        + "<ul class='l1'>" 
        + "<li><a href='driverPanel.html'>DRIVER</a></li>"
        + "<li><a href='passengerPage.html'>PASSANGER</a></li>" 
        + "<div class='header_right'><a href=''>Logout</a></div>"
        + "</ul>"
        + "</div>"
        + "</header> ";
    }
  
}



