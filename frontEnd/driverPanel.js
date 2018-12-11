
var COLUMNS = 7;
var
    cur_lc, cur_type = 1, cur_seatNumber = 0,
    cur_availableSeats = {};
    cur_runTimeData = parent.runTimeData;

$(document).ready(function () {
    
    $("#defaultOpen").click();
    var vm = new Vue({
        el: '#sheet',
        data: {
            header: createHeader(),
            rows: createRows(),
            selectedRowIndex: 0,
            selectedColIndex: 0
        },
        methods: {
            refresh: function () {
                var cur_repeatApplicationForPost = cur_runTimeData.user.repeatApplicationForPost;
                for (var rawRowIndex = 1; rawRowIndex <= 12; rawRowIndex++) {
                    for (var colIndex = 1; colIndex <= COLUMNS; colIndex++) {
                        // var
                        // cur_runTimeData.user.repeatApplicationForPost().day;
                        // cur_runTimeData.user.repeatApplicationForPost().time;
                        // cur_runTimeData.user.repeatApplicationForPost().status;
                        // if(colIndex === 2 && rawRowIndex === 2){
                        //     changeColorForWaiting(rawRowIndex, colIndex);
                        // }
                        
                    }
                }
            },
            focus: function (cell) {
                this.selectedRowIndex = cell.row;
                this.selectedColIndex = cell.col;
            },
            change: function (e) {
                var
                    rowIndex = this.selectedRowIndex,
                    colIndex = this.selectedColIndex,
                    text;
                if (rowIndex > 0 && colIndex > 0) {
                    text = e.target.innerText;
                    this.rows[rowIndex - 1][colIndex].text = text;
                }
            },
            click: function (cell) {
                
                this.selectedRowIndex = cell.row;
                this.selectedColIndex = cell.col;
                
                var
                    timeRowIndex = getTimeRowIndex(this.selectedRowIndex),
                    timeColIndex = getTimeColIndex(this.selectedColIndex);

                if (timeRowIndex < 1 || timeColIndex < 2) {
                    return;
                }
                if(alterivelychangeColor(timeRowIndex, timeColIndex)){
                    console.log("added: " + calculateTimeKey(this.selectedRowIndex, this.selectedColIndex));
                    cur_availableSeats[calculateTimeKey(this.selectedRowIndex, this.selectedColIndex)] = $('#repeatedSeatNumber').val();
                }else{
                    console.log("removed: " + calculateTimeKey(this.selectedRowIndex, this.selectedColIndex));
                    delete cur_availableSeats[calculateTimeKey(this.selectedRowIndex, this.selectedColIndex)];
                }
                console.log(cur_availableSeats);
            }
        }
    });
    window.vm = vm;

    


    var setAlign = function (align) {
        var
            rowIndex = vm.selectedRowIndex,
            colIndex = vm.selectedColIndex,
            row, cell;
        if (rowIndex > 0 && colIndex > 0) {
            row = vm.rows[rowIndex - 1];
            cell = row[colIndex];
            cell.align = align;
        }
    };

    
    autoRefresh();
    

    $('.cmd-refresh-btn').click(function () {
        if(parent.runTimeData.user != null){
            parent.refreshData();
            vm.refresh();
            showAppllications();
        }
    });

    $('#single-post').click(function () {
        cur_lc = getSelectedLocation();
        cur_seatNumber = parseInt($("#singleSeatNumber").val());
        
        var 
            cur_date = transferDateStringToInt($('#date_and_day').val()),
            cur_time = transferTimeStringToInt($('#time').val());
        var body = {
            "lat": cur_lc.lat,
            "long": cur_lc.lng,
            "date": cur_date,
            "time": cur_time,
            "sessionID": cur_runTimeData.user.session,
            "userID": cur_runTimeData.user.userId,
            "semester": "fall",
            "type": cur_type,
            "maxSeats": cur_seatNumber,
            "availableSeats": cur_seatNumber
        }
        console.log(body);
        $.post("additionalDriverPost",
            body,
            function (status) {
                $("#SinglePostStatus").text(status);
            }
        ).fail(
            function (status) {
                $("#SinglePostStatus").text(400);
            }
        );
    });

    $('#repeated-post').click(function () {
        cur_lc = getSelectedLocation();
        cur_seatNumber = parseInt($("#repeatedSeatNumber").val());

        for (var key in cur_availableSeats) {
            cur_availableSeats[key] = cur_seatNumber;
        }
        var body = {
            "lat": cur_lc.lat,
            "long": cur_lc.lng,
            "sessionID": cur_runTimeData.user.session,
            "userID": cur_runTimeData.user.userId,
            "semester": "fall",
            "type": cur_type,
            "maxSeats": cur_seatNumber,
            "availableSeats": JSON.stringify(cur_availableSeats)
        }
        console.log(body);
        $.post("repeatedDriverPost",
            body,
            function (status) {
                $("#RepeatedPostStatus").text(status);
            }
        ).fail(
            function (status) {
                $("#RepeatedPostStatus").text(400);
            }
        );
    });

    $('.to_campus').click(function () {
        cur_type = 0;
    });

    $('.from_campus').click(function () {
        cur_type = 1;
    });

    $('#toolbar button').focus(function () {
        $(this).blur();
    });

});

function transferDateStringToInt(dateString) {
    return parseInt(dateString.split("-").join(""));
}
function transferTimeStringToInt(timeString) {
    return parseInt(timeString.split("-")[0]);
}

function openTab(tabEleID, elmnt) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }
    document.getElementById(tabEleID).style.display = "block";
    elmnt.style.backgroundColor = "grey";
}

function alterivelychangeColor(row, column){
    
    var r = $("#sheet tbody tr:nth-child(" + row + ")");
    var c = r.find("td:nth-child(" + column + ")");
    
    if(c.attr("bgColor") == "#F5A735"){
        c.attr("bgColor", "#ffffff");
        return false;
    }else{
        c.attr("bgColor", "#F5A735");
        return true;
    }   
}

function changeColorForComforimation(row, column){
    
    var r = $("#sheet tbody tr:nth-child(" + row + ")");
    var c = r.find("td:nth-child(" + column + ")");
    c.attr("bgColor", "#29EC34");
}

function changeColorForWaiting(row, column){
    var r = $("#sheet tbody tr:nth-child(" + row + ")");
    var c = r.find("td:nth-child(" + column + ")");
    c.attr("bgColor", "#F5A735");
}

function autoRefresh() {
    console.log(parent.runTimeData);
    if(parent.runTimeData.user != null){
        parent.refreshData();
        vm.refresh();
        showAppllications();
    }
    
    setTimeout(autoRefresh, 10000);
}

function getTimeRowIndex(rawRowIndex){
    return rawRowIndex - 7;
}

function getRawIndex(timeRowIndex){
    return timeRowIndex + 7;
}

function getTimeColIndex(rawColIndex){
    return rawColIndex + 1;
}

function getRawIndex(timeColIndex){
    return timeColIndex - 1;
}

function calculateTimeKey(timeRowIndex, timeColIndex){
    return String(timeColIndex * 100 + timeRowIndex);
}

function showAppllications(){
    var showApplicationList="";
    for(var i in cur_runTimeData.user.repeatApplicationForPost){
        showApplicationList += JSON.stringify(cur_runTimeData.user.repeatApplicationForPost[i]) + "<br/>";
    }
    for(var i in cur_runTimeData.user.additionalApplication){
        showApplicationList += JSON.stringify(cur_runTimeData.user.additionalApplication[i]) + "<br/>";
    }
    $("#applicationList").html(showApplicationList);
}










function createHeader() {
    var hdr = [{
        row: 0,
        col: 0,
        text: ''
    }];
    for (var i = 1; i <= COLUMNS; i++) {
        hdr.push({
            row: 0,
            col: i,
            text: 'Day ' + i
        });
    }
    return hdr;
}

function createRow(rIndex) {
    var row = [{
        row: rIndex,
        col: 0,
        contentEditable: true,
        text: '' + rIndex,
        align: 'left'
    }];
    for (var i = 1; i <= COLUMNS; i++) {
        row.push({
            row: rIndex,
            col: i,
            contentEditable: true,
            text: '',
            align: 'left'
        });
    }
    return row;
}

function createRows() {
    var rows = [];
    for (var i = 8; i <= 20; i++) {
        rows.push(createRow(i));
    }
    return rows;
}



