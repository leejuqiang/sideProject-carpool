function openDialog(){
    console.log("sdfw");
    //send request to server, load driverlist
    document.getElementById('light').style.display='block';
    document.getElementById("light").innerHTML = 
    "<button type='button' onclick ='closeDialog()'>close</button>"
    + "<object style='border:0px' type='text/x-scriptlet' data='passengerPageDriverList.html' width='100%' height='100%'></object>";
    document.getElementById('fade').style.display='block';
}
function closeDialog(){
    document.getElementById('light').style.display='none';
    document.getElementById('fade').style.display='none'
}