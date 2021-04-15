// Original WR bolder script written by scatter 2018-11
// Updated/Extended by 1UpsForLife 2020-01

// For an ILs sheet cell edit, updates the series for that level – finds best time, bolds it, enforces hyperlink and misformatted colourings
function ILbolder(sheet, cell) {
  var col = cell.getColumn();
  var range = sheet.getRange(4, col, sheet.getLastRow()-3, 1);
  var data = range.getDisplayValues();
  var styles = range.getTextStyles();
  var richtexts = range.getRichTextValues();
  var cellsToBold = [];
  var reverse = isReverseCol(col);
  //Logger.log("col:"+col+" reverse:"+reverse);

  // 1) determine best times to bold
  bestTime = null;
  for (var i = 0; i < data.length; i++) {         // iterate through series of times for one level 
    var time = data[i][0]
    if(!isValidILTime(time)){
      continue;
    }
    var link = richtexts[i][0].getLinkUrl();
    if(link === null){
      continue;
    }
    if(link.split("imgur").length > 1){
      continue;
    }

    //cells to bold list creation, based on links and reverse sort status of column
    cellTime = timeStringToSeconds(data[i][0]);
    if ( (reverse==false) && (bestTime == null || cellTime < bestTime)){
      bestTime = cellTime;
      cellsToBold = [i];
    }
    else if( (reverse==true) && (bestTime == null || cellTime > bestTime) ){
      bestTime = cellTime;
      cellsToBold = [i];
    }
    else if (cellTime == bestTime) {
      cellsToBold.push(i);
    }    
  }
  
  // 2) set cell styles
  for (var i = 0; i < data.length; i++) {
    if (isValidILTime(data[i][0])){
      if(cellsToBold.indexOf(i) != -1){
        //cell should be bolded
        if(styles[i][0].isBold() === false){
          range.getCell(i+1,1).setFontWeight('bold');
          range.getCell(i+1,1).setBorder(
            null,false,true,false,false,false,"#000000",SpreadsheetApp.BorderStyle.SOLID_MEDIUM
          );
        }
      }else{
        //cell should not be bolded
        if(styles[i][0].isBold() === true){
          range.getCell(i+1,1).setFontWeight('normal');
          range.getCell(i+1,1).setBorder(null,false,false,false,false,false);
        }
      }
      
      //text color
      var link = richtexts[i][0].getLinkUrl();
//    if(i==13){ Logger.log(data[i][0]+link); }
      if(link !== null){
        if(styles[i][0].getForegroundColor() !== "#1155cc"){      // hyperlink blue
          range.getCell(i+1,1).setFontColor("#1155cc");
        }
      }
      else if(styles[i][0].getForegroundColor() !== "#000000"){   // black
        range.getCell(i+1,1).setFontColor("#000000");
      }
    }else{
      if(data[i][0] !== "" && styles[i][0].getForegroundColor() !== "#cc0000"){   // red
        range.getCell(i+1,1).setFontColor("#cc0000");
      }
      if(data[i][0] === "" && styles[i][0].getForegroundColor() !== "#000000"){   // black
        range.getCell(i+1,1).setFontColor("#000000");
      }
    }
  }
  
  // 3) update points
  updatePoints();

}