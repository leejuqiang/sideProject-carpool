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
    console.log(rows.length);

    var chbs = document.getElementsByName("chb[]");
    for (var i = 0; i < chbs.length; i++) {
        var chb = chbs[i];
        if(chb.checked == true){0
            for(var j=1;j<rows[i+1].cells.length;j++){
                console.log("row "+(i+1)+", colum"+(j)+": vlaue is "+rows[i+1].cells[j].innerHTML);
            }
        } 
    }
}