// Original WR bolder script written by scatter 2018-11
// Updated/Extended by 1UpsForLife 2020-01-09, 2020-05-31

function OneTwentyBolder(sheet, cell) {
  var col = cell.getColumn();
  var range = sheet.getRange(3, col, sheet.getLastRow()-2, 1);
  var data = range.getDisplayValues();
  var cellsToBold = [];
  bestTime = null;
  
  for (var i = 0; i < data.length; i++) {
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
  
  for (var i = 0; i < data.length; i++) {
    if (cellsToBold.indexOf(i) != -1) {
      range.getCell(i+1,1).setFontWeight('bold');
      range.getCell(i+1,1).setBorder(null,false,true,false,false,false,"#000000",SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      sheet.getRange(2,col).setValue(sheet.getRange(i+3,col).getValue());
    }
    else {
      range.getCell(i+1,1).setFontWeight('normal');
      range.getCell(i+1,1).setBorder(null,false,false,false,false,false);
    }
  }
  
      
  //recalculate combined global best
  var globalSobRange = sheet.getRange(2, 4, 1, 111);
  var globalBests = globalSobRange.getDisplayValues();
  var globalSobTotal = 0;
  for(var i=0; i<111; i++){
    if(isTimeString(globalBests[0][i])){
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
  sheet.getRange(2,2).setValue(globalSobString);
  
  
  
}
