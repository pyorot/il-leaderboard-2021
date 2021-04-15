// @ts-nocheck
function sortByPoints(sheet,cell) {
  
  var range = sheet.getRange(4, 1, sheet.getLastRow()-3, sheet.getLastColumn());
  
  // Sorts descending by column B
  range.sort({column: 2, ascending: false});
  
}

function updatePoints() {
  Logger.log("updatePoints 0: entry");
  var sheet = SpreadsheetApp.getActiveSheet();
  var numrows = sheet.getLastRow();
  var numcols = sheet.getLastColumn();
  var range1 = sheet.getRange(4, 1, numrows-3, 1);
  var range2 = sheet.getRange(4, 3, numrows-3, numcols-2);
  var names = range1.getDisplayValues();
  var times = range2.getDisplayValues();
  
  var finalPoints = [];
  for(var r = 4; r<=numrows; r++){
    finalPoints.push([]);
  }
  Logger.log("updatePoints 1: setup");

  // calculate points per level (column)
  for(var c = 0; c<numcols-2; c++){
  
    //populate dataset
    var data = [];
    for(var i=0; i<names.length; i++){
      //Logger.log(names[i][0]+":"+times[i][c]+":"+timeInCentiseconds(times[i][c]));
      if(isValidILTime(times[i][c])){
        var t = timeInCentiseconds(times[i][c]);
        data.push({name:names[i][0],time:t,row:i+4,points:0});
      }
      else{
        data.push({name:names[i][0],time:-1,row:i+4,points:0}); // does this need to even be added to data?
      }
    }
    
    //sorting
    if(isReverseCol(c+3)){
      data.sort((a,b) => a.time - b.time);
    }
    else{
      data.sort((a,b) => b.time - a.time);
    }
  
    //point assignment
    var pointsToAdd = 0;
    var tied = [];
    var tiedpoints = 0;
    var prev = {name:"placeholder",time:-2,row:-1,points:0};
    for(var i=0; i<data.length; i++){
      if(data[i].time === -1){
        //this player does not have a time, do not assign points
        //Logger.log("skipping "+data[i].name);
        continue;
      }
      //assign points to the previous player
      if(data[i].time === prev.time){
        if(tied.length === 1){
          tiedpoints = pointsToAdd;
        } 
      }
      else{
        if(tied.length === 1){
          data.find(y => y.name === tied[0].name).points = pointsToAdd;
          //Logger.log(tied[0].name+": added "+pointsToAdd);
        }
        else{
          for(var x=0; x<tied.length; x++){
            data.find(y => y.name === tied[x].name).points = tiedpoints;
            //Logger.log("(TIE) "+tied[x].name+": added "+tiedpoints );
          }
        }
        tiedpoints = 0;
        tied = [];
      }
      tied.push(data[i]);
      pointsToAdd += 1;
      prev = data[i];
      
    }
    if(tied.length === 1){
      data.find(y => y.name === tied[0].name).points = pointsToAdd;
      //Logger.log(tied[0].name+": added "+pointsToAdd);
    }
    else if(tied.length > 1){
      for(var x=0; x<tied.length; x++){
        data.find(y => y.name === tied[x].name).points = tiedpoints;
        //Logger.log("(TIE) "+tied[x].name+": added "+tiedpoints );
      }
    }
    
    for(var z=0; z<data.length; z++){
      finalPoints[data[z].row - 4].push(data[z].points);
    }

    if (c % 20 == 19) {Logger.log("updatePoints 2: 20 columns calculated");}
  
  }
  Logger.log("updatePoints 2: all columns calculated");
  
  //add up points for each row
  // @ts-ignore
  totals = [];
  for(var i=0; i<=numrows-4; i++){
    var total = 0;
    for(var j=0; j<finalPoints[i].length; j++){
      total += finalPoints[i][j];
    }
    totals.push([total]);
    //sheet.getRange(i+4,2).setValue(total);
  }
  Logger.log("updatePoints 3: totals calculated");

  sheet.getRange(4,2,numrows-3,1).setValues(totals);
  Logger.log("updatePoints 4: result published");
}
