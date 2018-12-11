
var COLUMNS = 7;
var
    cur_lc, cur_type,
    cur_availableSeats = {};

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
                runTimeData.user.repeatedPost;
                additionalPost;
                cancellationPost;
                repeatApplicationForPost;
                addApplicationForPost;
                for (var rowIndex = 8; rowIndex <= 20; rowIndex++) {
                    for (var colIndex = 1; colIndex <= COLUMNS; colIndex++) {
                        this.rows[rowIndex][colIndex].text = "has";
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
                    rowShowingIndex = getRowShowingIndex(this.selectedRowIndex),
                    colShowingIndex = getColShowingIndex(this.selectedColIndex);

                if (rowShowingIndex < 1 || colShowingIndex < 2) {
                    return;
                }
                if(alterivelychangeColor(rowShowingIndex, colShowingIndex)){
                    console.log("added: " + calculateTimeKey(this.selectedRowIndex, this.selectedColIndex));
                    cur_availableSeats[calculateTimeKey(this.selectedRowIndex, this.selectedColIndex)] = $('.seatNumber').val();
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
        refreshData();
        vm.refresh();
    });

    $('#repeated-post').click(function () {
        cur_lc = getSelectedLocation();
        cur_seatNumber = $(".cur_seatNumber").val();
        for(i = 0; cur_availableSeats.length; i++){
            cur_availableSeats[i] = cur_seatNumber;
        }
        $.post("repeatedDriverList",
            {
                lat: cur_lc.lat,
                long: cur_lc.lng,
                sessionID: runTimeData.user.session,
                userID: runTimeData.user.userId,
                semester: "fall",
                type: cur_type,
                seatNumber: cur_seatNumber
            },
            function (status) {
                $(".status").text(status);
            }
        );
    });

    $('#single-post').click(function () {
        cur_lc = getSelectedLocation();
        cur_seatNumber = $(".cur_seatNumber").val();
        for(i = 0; cur_availableSeats.length; i++){
            cur_availableSeats[i] = cur_seatNumber;
        }
        $.post("additionalDriverPost",
            {
                lat: cur_lc.lat,
                long: cur_lc.lng,
                sessionID: runTimeData.user.session,
                userID: runTimeData.user.userId,
                semester: "fall",
                type: cur_type,
                maxSeats: cur_seatNumber,
                availableSeats: cur_availableSeats
            },
            function (status) {
                $(".status").text(status);
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

function autoRefresh() {
    if(runTimeData.user != null){
        refreshData();
        vm.refresh();
    }
    
    setTimeout(autoRefresh, 10000);
}

function getRowShowingIndex(rawRowIndex){
    return rawRowIndex - 7;
}


function getColShowingIndex(rawColIndex){
    return rawColIndex + 1;
}

function calculateTimeKey(rawRowIndex, rawColIndex){
    return String(rawColIndex * 100 + rawRowIndex);
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


