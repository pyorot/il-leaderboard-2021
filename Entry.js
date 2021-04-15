// Entrypoint of the script; picks which algorithm to run

function ILScriptEntry(e) {
  var lock = LockService.getScriptLock()  // strict one-execution-at-a-time-lock
  lock.waitLock(150000)                   // lock acquire timeout 150s
  sheet = SpreadsheetApp.getActiveSheet()
  sheetName = sheet.getSheetName()
  var range = e.range
  console.log('edit trigger: sheet',sheetName,', range',e.range,', row/col',e.range.getRow(),e.range.getColumn())

  // uses IL algorithms from 2021
  if (['ILs', '120 ILs', 'RTA Strat ILs', 'Bingo ILs'].includes(sheetName)) {
    // 1. set script parameters depending on sheet (see About.gs for what they are and their values)
    setGlobals(sheetName)

    // 2. pick and run update method
    if(range.getColumn() == 1 && range.getRow() == 1 && e.value == '*') {   // one-off complete resyncs (3m+)
      initSheet()
    }
    else if(e.value === undefined && e.oldValue === undefined
            && (e.range.getNumColumns()>1 || e.range.getNumRows()>1)) { // mods swap rows (15s)
      // the double-undefined check here is a workaround of https://issuetracker.google.com/issues/181805601
      // value and oldValue are both undefined if a cell/range is moved/copied and not in most other cases.
      // we assume at least 2 cells are in the range to avoid player edits from triggering this function
      updateSheet()
    }
    else if(toL(range) >= 0 && toP(range) >= 0){ // player edits of single cells (4s)
      updateLevel(range)
    }
  }

  // uses mostly self-contained scripts from 2018 (Bolder120Segs and BolderAnySegs)
  else {
    switch (sheetName) {
      case 'Any% Best Segments':
        if(range.getColumn() > 2){
          AnypBolder(sheet, range);
        }
        break;
      case '120 Best Segments':
        if(range.getColumn() > 1){
          OneTwentyBolder(sheet, range);
        }
        break;
    }  
  }

  lock.releaseLock()
}
