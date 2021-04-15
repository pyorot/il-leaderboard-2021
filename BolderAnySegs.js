// Original WR bolder script written by scatter 2018-11
// Updated/Extended by 1UpsForLife 2020-01-09, 2020-02-16, 2020-02-26, 2020-02-29

function AnypBolder(sheet, cell) { 
  var col = cell.getColumn();
  var row = cell.getRow();
  var lastRow = sheet.getLastRow();
  var levelRange = sheet.getRange(5, col, lastRow-4, 1);
  var versionRange = sheet.getRange(5, 2, lastRow-4, 1);
  var data = levelRange.getDisplayValues();
  var versions = versionRange.getDisplayValues();
  var cellsToBold = [];
  bestTime = null;
  
  if(col >= 3 && col <= 48){
    var version = versions[row-5][0];
    
    //time comparisons
    for (var i = 0; i < data.length; i++) { 
      var currentVer = versions[i];
      
      if (currentVer == version){
        if (isTimeString(data[i][0])) {
          cellTime = timeStringToSeconds(data[i][0]);
          if (bestTime == null || cellTime < bestTime) {
            bestTime = cellTime;
            cellsToBold = [i];
          }
          else if (cellTime == bestTime) {
            cellsToBold.push(i);
          }
        }
      }
    }
    
    //check if there is a new wr
    //TODO: this makes it not update the combined sob if a wr holder updates their wr, because their cell is already bolded.
//    var newRecord = false;
//    for(var i=0; i<cellsToBold.length; i++){
//      if(levelRange.getCell(cellsToBold[i]+1,1).getTextStyle().isBold() === false){
//        if(cellsToBold[i]+1 === 
//        newRecord = true;
//      }
//    }
//    if(newRecord === false){
//      return;
//    }

    //setting cell styles
    for (var i = 0; i < data.length; i++) {
      var currentVer = versions[i];
      var currentCell = levelRange.getCell(i+1,1);
      
      if (version == currentVer){
        if (cellsToBold.indexOf(i) != -1) {
          var color = "#000000";
          var copyRow = 2;
          if(version == "NTSC-U") {
            color = "#38761d";
            copyRow = 4;
          }
          else if(version == "NTSC-J") {
            color = "#990000";
            copyRow = 2;
          }
          else if(version == "PAL") {
            color = "#1155cc";
            copyRow = 3;
          }
          
          if(col >= 4 && col <= 47){
            sheet.getRange(copyRow,col).setValue(sheet.getRange(i+5,col).getValue());
          }
          currentCell.setFontWeight('bold');
          currentCell.setFontColor(color);
          currentCell.setBorder(null,false,true,false,false,false,color,SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
        }
        else {
          currentCell.setBorder(null,false,false,false,false,false);
          currentCell.setFontColor("#000000");
          currentCell.setFontWeight('normal');
          
          var formula = currentCell.getFormula();
          if (formula.length > 0){
            if(formula.substring(0,10) == "=HYPERLINK"){
              currentCell.setFontColor("#1155cc");
              currentCell.setFontLine("underline");
            }
          }
        }
      }
      
    }
      
    //recalculate combined global best
    var globalSobRange;
    var versionRow=0;
    if(version=="NTSC-J") versionRow=2;
    else if(version=="PAL") versionRow=3;
    else if(version=="NTSC-U") versionRow=4;
    else return;
    var globalSobRange = sheet.getRange(versionRow, 4, 1, 43);
    var globalBests = globalSobRange.getDisplayValues();
    
    var globalSobTotal = 0;
    for(var i=0; i<43; i++){
      var timeString = globalBests[0][i];
      var ms = Number(timeString.split(".")[1]);
      if(timeString.split(".")[1].length == 1){
        ms *= 10;
      }
      var min = timeString.split(".")[0].split(":");
      if(min.length == 1){
        ms = ms + Number(min[0])*100;
      }
      else{
        var tmp = Number(min[0])*60;
        tmp = tmp + Number(min[1]);
        ms = ms + tmp*100;
      }
      globalSobTotal += ms;
    }
    var centiseconds = globalSobTotal%100;
    var sec = Math.floor(globalSobTotal/100);
    var seconds = sec%60;
    var min = Math.floor(sec/60);
    var minutes = min%60;
    var hr = Math.floor(min/60);
    
    minutes = ("00" + minutes).slice(-2);
    seconds = ("00" + seconds).slice(-2);
    centiseconds = ("00" + centiseconds).slice(-2);
    var globalSobString = hr + ":" + minutes + ":" + seconds + "." + centiseconds;
    sheet.getRange(versionRow,3).setValue(globalSobString);
    
  }
  
  
  
}