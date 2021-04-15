function OneTwentyILs(sheet, cell) {
  var col = cell.getColumn();
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(4, col, lastRow-3, 1);
  var data = range.getDisplayValues();
  var cellsToBold = [];
  bestTime = null;
  higherIsBetter = ([11,42,56,57].indexOf(col) != -1);

  for (var i = 0; i < data.length; i++) {
    if (isTimeString(data[i][0])) {
      cellTime = timeStringToSeconds(data[i][0]);
      if ( (higherIsBetter==false) && (bestTime == null || cellTime < bestTime)) {
        bestTime = cellTime;
        cellsToBold = [i];
      }
      else if( (higherIsBetter==true) && (bestTime == null || cellTime > bestTime) ){
        bestTime = cellTime;
        cellsToBold = [i];
      }
      else if (cellTime == bestTime) {
        cellsToBold.push(i);
      }
    }
  }
  
  //setting cell styles
  for (var i = 0; i < data.length; i++) {
    if (cellsToBold.indexOf(i) != -1) {
      range.getCell(i+1,1).setFontWeight('bold');
      range.getCell(i+1,1).setBorder(null,false,true,false,false,false,"#000000",SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    }
    else {
      range.getCell(i+1,1).setFontWeight('normal');
      range.getCell(i+1,1).setBorder(null,false,false,false,false,false);
    }
  }
}
