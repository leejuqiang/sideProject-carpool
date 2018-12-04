function alterivelychangeColor(row, column){
    
    var r = $("#sheet tbody tr:nth-child(" + row + ")");
    var c = r.find("td:nth-child(" + column + ")");
    
    if(c.attr("bgColor") == "#F5A735"){
        c.attr("bgColor", "#ffffff");
    }else{
        c.attr("bgColor", "#F5A735");
    }   
}

function changeColorForComforimation(row, column){
    
    var r = $("#sheet tbody tr:nth-child(" + row + ")");
    var c = r.find("td:nth-child(" + column + ")");
    
    c.attr("bgColor", "#29EC34");
}

function refreshData() {
    $.post("/refresh", { "sessionID": localStorage.getItem("sessionID"), "userName": localStorage.getItem("userName") }, function (data, s, xhr) {
        userData = JSON.parse(data);
        var refreshMatch = false;
        refreshPostList();
        refreshMatchList();
        setTimeout(refreshData, 10000);
    }).fail(function (xhr, error, s) {
        setTimeout(refreshData, 10000);
    });
}

function getRowIndex(rawRowIndex){
    return rawRowIndex - 7;
}

function getColIndex(rawColIndex){
    return rawColIndex + 1;
}