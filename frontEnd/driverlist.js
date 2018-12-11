function selectAll(){
    var chbs = document.getElementsByName("chb[]");
    for (var i = 0; i < chbs.length; i++) {
        var chb = chbs[i];
        chb.checked = true;   
    }
}

function getValueWhenChecked(){
    
    var tab = document.getElementById("tbl");
    var rows = tab.rows;
    // console.log(rows.length);

    var chbs = document.getElementsByName("chb[]");
    console.log(chbs.length);
    // for (var i = 1; i < rows.length; i++) {
    //     if(rows[i].cells[0].checked == true){
    //         for(var j=1;j<rows[i].cells.length;j++){
    //             console.log("row "+(i)+", colum"+(j)+": vlaue is "+rows[i].cells[j].innerHTML);
    //         }
    //     }
    // }
    for (var i = 0; i < chbs.length; i++) {
        var chb = chbs[i];
        // console.log(rows[i + 2]);
        if(chb.checked == true){
            
            // for(var j=1;j<rows[i+2].cells.length;j++){
            //     console.log("row "+(i+1)+", colum"+(j)+": vlaue is "+rows[i+2].cells[j].innerHTML);
            // }
        } 
    }

    // var array = [{day:day, time: time, postID:[if empty, select all]}, {}];
    // $.post("/repeatedApply", {"sessionID": string, "userID": string, "application": array}, function (data, s, xhr) {
    //     server.database.
    // }).fail(function (xhr, error, s) {

    // });
}